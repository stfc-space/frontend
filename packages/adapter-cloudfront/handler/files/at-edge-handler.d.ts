declare module 'SERVER' {
    import { Server } from '@sveltejs/kit';
    export { Server };
}


declare module 'MANIFEST' {
    import { SSRManifest } from '@sveltejs/kit';

    export const manifest: SSRManifest;
    export const prerendered: Set<string>;
}

declare module '*' {
    export interface Headers {
        raw(): Record<string, string | string[]>;
    }
}