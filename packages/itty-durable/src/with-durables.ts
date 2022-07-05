import { proxyDurable } from "./proxy-durable";
import { StatusError } from "./extras";

// returns true if binding appears to be a durable binding
const isDurable = (binding: unknown): binding is DurableObjectNamespace => typeof (binding as any).idFromName === 'function';

export interface WithDurablesOptions {
    parse?: boolean;
    classes?: { [key: string]: new () => { [key: string | symbol]: unknown } }
}

type RequestExt = { durables?: { [key: string]: unknown } } & { [key: string]: unknown };

export function withDurables<TRequest = Request>(options: WithDurablesOptions = {}): (request: TRequest & RequestExt, env: any) => void {

    const {
        classes = {},
    } = options;

    const fn = (request: RequestExt, env: { [key: string | symbol]: unknown }): void => {
        request.durables = request.durables || {}

        for (const [key, binding] of Object.entries(env)) {
            if (isDurable(binding)) {
                const proxied = proxyDurable(binding, {
                    name: key,
                    class: classes[key], // pass in class key by default
                })

                try {
                    request[key] = request.durables[key] = proxied
                } catch (err) {
                    throw new StatusError(500, `Could not set Durable binding "${key}" on Request`)
                }
            }
        }
    }
    return fn;
}
