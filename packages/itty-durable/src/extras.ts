import { Request as IttyRequest } from "itty-router";

export class StatusError extends Error {
    constructor(public status = 500, message = 'Internal Error.') {
        super(message)
        this.name = 'StatusError'
        this.status = status
    }
}

export const withContent = async (request: any) => {
    let contentType = request.headers.get('content-type')
    request.content = undefined

    try {
        if (contentType) {
            if (contentType.includes('application/json')) {
                request.content = await request.json()
            }
        }
    } catch (err) { } // silently fail on error
}

export const withParams = (request: Record<string | number | symbol, any>) => {
    const r = request as any;
    if (!r.params) {
        return;
    }
    for (const param in r.params || {}) {
        r[param] = r.params[param]
    }
}

const createResponseType = (format = 'text/plain; charset=utf-8') =>
    (body: BodyInit | null | undefined | object, options: ResponseInit = {}) => {
        const { headers = {}, ...rest
        } = options

        if (typeof body === 'object') {
            return new Response(JSON.stringify(body), {
                headers: {
                    'Content-Type': format,
                    ...headers,
                },
                ...rest,
            })
        }

        return new Response(body, options)
    }

export const json = createResponseType('application/json; charset=utf-8');

export const error = (
    status = 500,
    content = 'Internal Server Error.',
) => json({
    ...(typeof content === 'object'
        ? content
        : {
            status,
            error: content,
        }),
}, { status })