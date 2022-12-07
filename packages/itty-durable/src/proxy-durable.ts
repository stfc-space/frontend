import { StatusError } from './extras';
import { WithDurablesOptions } from './with-durables';

// helper function to parse response
const transformResponse = (response: Response) => {
    try {
        return response.json()
    } catch (err) { }

    try {
        return response.text()
    } catch (err) { }

    return response
}

export interface ProxyDurableMiddlewareOptions {
    name?: string;
    parse?: boolean;
    class?: new () => { [key: string | symbol]: unknown };
}


export interface DurableObjectProxy<T> {
    get: (id: string) => T;
}

// takes the durable (e.g. env.Counter) and returns an object with { get(id) } to fetch the proxied stub
export function proxyDurable<TDurable>(durable: TDurable & DurableObjectNamespace, middlewareOptions: ProxyDurableMiddlewareOptions = {}) {
    if (!durable || !durable.idFromName) {
        throw new StatusError(500, `${middlewareOptions.name || 'That'} is not a valid Durable Object binding.`)
    }

    return {
        get: (id: string | DurableObjectId, options: ProxyDurableMiddlewareOptions & WithDurablesOptions = {}) => {
            options = { ...middlewareOptions, ...options }

            try {
                if (typeof id === 'string') {
                    id = durable.idFromName(id)
                }

                const stub = durable.get(id)
                const mock = typeof options.class === 'function' && new options.class()
                const isValidMethod = (prop: string | symbol) => prop !== 'fetch' && (!mock || typeof mock[prop] === 'function')

                const buildRequest = (type: string, prop: string | symbol, content?: unknown) => new Request(`https://itty-durable/${type}/${String(prop)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(content)
                })

                const stubFetch = (obj: DurableObject, type: string, prop: string | symbol, content?: unknown) => {
                    const theFetch = obj.fetch(buildRequest(type, prop, content))

                    return options.parse
                        ? Promise.resolve(theFetch).then(transformResponse)
                        : theFetch
                }

                return new Proxy(stub, {
                    get: (obj, prop: string | symbol) => isValidMethod(prop)
                        ? (...args: unknown[]) => stubFetch(obj, 'call', prop, args)
                        : stubFetch(obj, 'get-prop', prop)
                    ,
                    set: (obj, prop, value) => (stubFetch(obj, 'set', prop, value), true),
                })
            } catch (error) {
                let message = 'Unknown Error'
                if (error instanceof Error) message = error.message
                throw new StatusError(500, message)
            }
        }
    }
}