
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
    autoPersist?: boolean;
    autoReturn?: boolean;
    onError?: (err: Error & { status?: number }) => Response
}

const isDurable = (binding: unknown): binding is DurableObjectNamespace => typeof (binding as any).idFromName === 'function';

export const createIttyDurable = (options: IttyDurableOptions = {}) => {
    const {
        autoPersist = false,
        autoReturn = false,
        onError = err => error(err.status || 500, err.message),
    } = options

    return class IttyDurableBase {
        state: DurableObjectState & { defaultState?: string; isDirty?: boolean, router: Router } & { [key: string]: unknown };

        constructor(state: DurableObjectState, env = {}) {
            this.state = {
                defaultState: undefined,
                initialized: false,
                router: Router(),
                ...env,
                ...state,
            }

            // embed bindings into this.env
            for (const [key, binding] of Object.entries(env)) {
                this.state[key] = isDurable(binding)
                    ? proxyDurable(binding, { name: key, parse: true })
                    : binding
            }

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
            this.state.router
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
                    proxied.optionallyReturnThis,
                )

            return proxied
        }


        // purge storage, and optionally reset internal memory state
        async destroy(options: { reset?: boolean } = {}) {
            const { reset = false } = options

            await this.state.storage.deleteAll()

            if (reset) {
                this.reset()
            }
        }

        async fetch(request: Request, ...args: unknown[]) {
            // save default state for reset
            if (!this.state.initialized) {
                this.state.defaultState = JSON.stringify(this.getPersistable())
            }

            await this.loadFromStorage()

            // we pass off the request to the internal router
            const response = await this.state.router
                .handle(request, ...args)
                .catch(onError)

            // if persistOnChange is true, we persist on every response
            if (autoPersist) {
                this.persist()
            }

            // then return the response
            return response || error(400, 'Bad request to durable object')
        }


        // gets persistable state (defaults to all but itty data)
        getPersistable() {
            const { state, ...persistable } = this

            return persistable
        }

        async loadFromStorage() {
            if (!this.state.initialized) {
                const stored = await this.state.storage.get('data') || {}

                Object.assign(this, stored)
                this.state.initialized = true
            }
        }

        // returns self from methods that fail to return if autoReturn flag is enabled
        optionallyReturnThis() {
            if (autoReturn) {
                return json(this.toJSON
                    ? this.toJSON()
                    : this)
            }
        }

        // persists to storage, override to control
        async persist() {
            const persistable = this.getPersistable()
            await this.state.storage.put('data', persistable)
        }

        // resets object to preserved default state
        async reset() {
            for (const key in this.getPersistable()) {
                Reflect.deleteProperty(this, key)
            }

            // reset to defaults from constructor
            Object.assign(this, JSON.parse(this.state.defaultState ?? "{}"))
        }

        // defaults to returning all content
        toJSON() {
            const { state, ...other } = this
            return other
        }
    }
}

export const IttyDurable = createIttyDurable() // we accept sane defaults
