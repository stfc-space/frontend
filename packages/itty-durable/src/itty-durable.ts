
import { Router } from "itty-router";

import {
    error,
    json,
    withParams,
    withContent,
    StatusError
} from "./extras";

import { proxyDurable } from './proxy-durable';

export interface IttyDurableOptions {
    persistOnChange?: boolean;
    alwaysReturnThis?: boolean;
    onError?: (err: Error & { status?: number }) => Response
}

const isDurable = (binding: unknown): binding is DurableObjectNamespace => typeof (binding as any).idFromName === 'function';

export const createIttyDurable = (options: IttyDurableOptions = {}) => {
    const {
        persistOnChange = true,
        alwaysReturnThis = true,
        onError = err => error(err.status ?? 500, err.message),
    } = options

    return class IttyDurableBase {
        state: DurableObjectState & { defaultState?: string; isDirty?: boolean } & { [key: string]: unknown };
        storage: DurableObjectStorage;
        router: Router;

        constructor(state: DurableObjectState, env = {}) {
            this.state = {
                defaultState: undefined,
                ...env,
                ...state,
            }

            this.storage = state.storage

            // embed bindings into this.env
            for (const [key, binding] of Object.entries(env)) {
                this.state[key] = isDurable(binding)
                    ? proxyDurable(binding, { name: key, parse: true })
                    : binding
            }

            // embed a throwable router into
            this.router = Router()

            const proxied: IttyDurableBase & Record<string, unknown> = new Proxy(this as IttyDurableBase & Record<string | symbol, unknown>, {
                get: (obj, prop, receiver) => typeof obj[prop] === 'function'
                    ? (obj[prop] as () => void).bind(receiver)
                    : obj[prop],

                // track isDirty
                set: (obj, prop, value) => {
                    if (obj[prop] !== value) {
                        this.state.isDirty = true
                    }
                    obj[prop] = value

                    return true
                }
            })

            // one router to rule them all
            this.router
                .post('/:action/:target', withParams, withContent,
                    async (request: { action: string, target: string, content: unknown[] }) => {
                        const { action, target, content = [] } = request

                        if (action === 'call') {
                            const isFunction = (this as Record<string | symbol, unknown>)[target];
                            if (typeof isFunction !== 'function') {
                                throw new StatusError(500, `Durable Object ${this.constructor.name} does not contain method ${target}()`)
                            }
                            const proxyCallable = (proxied[target] as (...args: unknown[]) => Promise<object>);
                            const response = await proxyCallable(...content)

                            // return early if response detected
                            if (response !== undefined) {
                                return response instanceof Response
                                    ? response
                                    : json(response)
                            }
                        } else if (action === 'set') {
                            proxied[target] = content
                        } else if (action === 'get-prop') {
                            return json(await (proxied[target] as Promise<object>))
                        }
                    },
                    proxied.optionallyPersist,
                    proxied.optionallyReturnThis,
                )

            return proxied
        }

        // gets persistable state (defaults to all but itty data)
        getPersistable() {
            const { state, storage, router, ...persistable } = this

            return persistable
        }

        // persists to storage, override to control
        async persist() {
            if (this.state.isDirty) {
                await this.storage.put('data', this.getPersistable())
            }
        }

        async loadFromStorage() {
            const stored = await this.storage.get('data') || {}

            Object.assign(this, stored)

            this.state.isDirty = false
        }

        // initializes from storage, override to control
        async initialize() {
            // INITIALIZATION
            if (!this.state.initializePromise) {
                // save default state before loading from storage
                this.state.defaultState = JSON.stringify(this.getPersistable())

                this.state.initializePromise = this.loadFromStorage().catch(err => {
                    this.state.initializePromise = undefined
                    throw err
                })
            }
            await this.state.initializePromise
        }

        async fetch(request: Request, ...args: unknown[]) {
            // INITIALIZATION
            await this.initialize()
            this.state.isDirty = false

            // we pass off the request to the internal router
            const response = await this.router
                .handle(request, ...args)
                .catch(onError)

            // then return the response
            return response || error(400, 'Bad request to durable object')
        }

        async optionallyPersist(request: unknown, env = {}, ctx: { waitUntil?: (promise: Promise<any>) => void; } = {}) {
            if (persistOnChange) {
                if (ctx.waitUntil) {
                    ctx.waitUntil(this.persist())
                } else {
                    await this.persist()
                }
            }
        }

        reset() {
            for (const key in this.getPersistable()) {
                Reflect.deleteProperty(this, key)
            }

            // reset to defaults from constructor
            if (this.state.defaultState)
                Object.assign(this, JSON.parse(this.state.defaultState))
        }

        // purge storage, and optionally reset internal memory state
        async destroy(options: { reset?: boolean } = {}) {
            const { reset = false } = options

            await this.storage.deleteAll()

            if (reset) {
                this.reset()
            }
        }

        optionallyReturnThis() {
            if (alwaysReturnThis) {
                return json(this.toJSON
                    ? this.toJSON()
                    : this)
            }
        }

        toJSON() {
            console.log("Calling toJSON");
            return this.getPersistable()
        }
    }
}

export const IttyDurable = createIttyDurable() // we accept sane defaults
