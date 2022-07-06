import { GitProcess } from 'dugite';
import { exec } from 'child_process';

async function getBranchName() {
  const args = ['rev-parse', '--abbrev-ref', 'HEAD'];
  const result = await GitProcess.exec(args, process.cwd());
  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw result.gitError;
  }

  return result.stdout.split('\n')[0];
}

async function getTagName() {
  const args = ['tag', '--points-at', 'HEAD'];
  const result = await GitProcess.exec(args, process.cwd());
  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw result.gitError;
  }

  return result.stdout.split('\n')[0];
}

let mode = process.argv[2];
let branch = process.env.VERCEL_GIT_COMMIT_REF;
let tag = await getTagName();
if (!branch) {
  branch = process.env.GITHUB_REF_NAME;
}
if (!branch) {
  try {
    branch = await getBranchName();
  } catch {
    // Intentionally left empty
  }
}

if (!mode) {
  switch (branch) {
    case 'main':
      mode = 'production';
      break;
    case 'dev':
      mode = 'staging';
      break;
    case 'staging':
      mode = 'staging';
      break;
    case 'svelte':
      mode = 'next';
      break;
    case 'next':
      mode = 'next';
      break;
    default:
      mode = 'production';
      break;
  }
  if (tag) {
    mode = 'production';
  }
}

console.log('Building', mode);

const build_command = exec('pnpm --filter="stfc.space" run build-kit', {
  env: { ...process.env, 'GIT_BRANCH': branch, 'MODE': mode }
});

build_command.stdout.pipe(process.stdout);
build_command.stderr.pipe(process.stderr);

await build_command;
