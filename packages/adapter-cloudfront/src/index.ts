import type { Adapter } from '@sveltejs/kit';
import * as path from 'path';
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath, URL } from 'url';

export interface AwsServerlessAdapterParams {
  /**
   * Location of CDK project. Required for automatic deploy.
   */
  cdkProjectPath?: string;
  /**
   * Path to store sveltekit artifacts.
   *
   * @default ${cdkProjectPath}/sveltekit
   */
  artifactPath?: string;
  /**
   * Stack to deploy after producing artifact.
   */
  stackName?: string;
}

export function AwsServerlessAdapter({
  cdkProjectPath,
  artifactPath,
  stackName
}: AwsServerlessAdapterParams): Adapter {
  if (!cdkProjectPath && !artifactPath) {
    throw new Error('at least one of cdkProjectPath or artifactPath is required');
  }
  if (!cdkProjectPath && stackName) {
    throw new Error('when stackName is specified, cdkProjectPaths is mandatory');
  }
  return {
    name: 'sveltekit-cdk-adapter',
    async adapt(builder): Promise<void> {
      const files = fileURLToPath(new URL('./files', import.meta.url));
      const dest = builder.getBuildDirectory('cloudfront/static');
      const lambdaDest = builder.getBuildDirectory('cloudfront/lambda');
      const tmp = builder.getBuildDirectory('cloudfront-tmp');

      builder.rimraf(dest);
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      builder.writeServer(dest);
      builder.writeClient(dest);
      builder.writePrerendered(dest);

      const relativePath = path.relative(tmp, builder.getServerDirectory());

      writeFileSync(
        `${tmp}/manifest.js`,
        `export const manifest = ${builder.generateManifest({
          relativePath
        })};\n\nexport const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});\n`
      );

      console.error(files);
      builder.copy(`${files}/at-edge-handler.ts`, `${tmp}/lambda.ts`, {
        replace: {
          SERVER: `${relativePath}/index.js`,
          MANIFEST: './manifest.js'
        }
      });
      builder.copy(`${files}/util.ts`, `${tmp}/util.ts`);

      await esbuild.build({
        platform: 'node',
        entryPoints: [`${tmp}/lambda.ts`],
        outfile: `${lambdaDest}/handler.js`,
        allowOverwrite: true,
        format: 'cjs',
        bundle: true,
        inject: [path.join(files, 'shims.js')]
      });
      builder.copy(`${files}/viewer-request.js`, `${lambdaDest}/viewer-request.js`);

      // await build({
      //     entryPoints: ['.svelte-kit/cdk/at-edge-handler.ts'],
      //     outfile: path.join(dirs.lambda, 'at-edge/handler.js'),
      //     bundle: true,
      //     platform: 'node',
      //     inject: [path.join(files, 'shims.js')]
      // })
    }
  };
}
