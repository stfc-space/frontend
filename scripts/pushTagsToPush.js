import { GitProcess } from 'dugite';

export async function fetchTagsToPush() {
  const args = ['push', 'origin', '--follow-tags', '--dry-run', '--no-verify', '--porcelain'];

  const result = await GitProcess.exec(args, process.cwd());
  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw result.gitError;
  }

  const lines = result.stdout.split('\n');
  let currentLine = 1;
  const unpushedTags = [];

  // the last line of this porcelain command is always 'Done'
  while (currentLine < lines.length && lines[currentLine] !== 'Done') {
    const line = lines[currentLine];
    const parts = line.split('\t');

    if (parts[0] === '*' && parts[2] === '[new tag]') {
      const [tagName] = parts[1].split(':');

      if (tagName !== undefined) {
        unpushedTags.push(tagName.replace(/^refs\/tags\//, ''));
      }
    }

    currentLine++;
  }

  return unpushedTags;
}

try {
  const tags = await fetchTagsToPush();

  for (const tag of tags) {
    const args = ['push', 'origin', tag];
    const result = await GitProcess.exec(args, process.cwd());
    if (result.exitCode !== 0 && result.exitCode !== 1) {
      throw result.gitError;
    }
  }
} catch (e) {
  console.error(e);
  throw e;
}
