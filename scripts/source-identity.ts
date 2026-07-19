import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function verifySourceIdentity(sourceRoot: string, expectedCommit: string) {
  if (await exists(join(sourceRoot, '.git'))) {
    let actualCommit: string;
    try {
      const { stdout } = await exec('git', ['-C', sourceRoot, 'rev-parse', 'HEAD']);
      actualCommit = stdout.trim();
    } catch {
      throw new Error('Unable to verify git source identity');
    }
    if (actualCommit !== expectedCommit) throw new Error('Unexpected source commit: ' + actualCommit);
    return 'git' as const;
  }

  let marker: string;
  try {
    marker = await readFile(join(sourceRoot, '.source-commit'), 'utf8');
  } catch {
    throw new Error('Missing source identity: expected .git or .source-commit');
  }
  const actualCommit = marker.trim();
  if (actualCommit !== expectedCommit) throw new Error('Unexpected source commit: ' + actualCommit);
  return 'codeload-marker' as const;
}
