// @vitest-environment node

import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import { verifySourceIdentity } from './source-identity';

const exec = promisify(execFile);
const EXPECTED = 'b8594f81a89752241442f2ce267d6f66f96704ee';
const temporaryRoots: string[] = [];

async function temporarySource() {
  const root = await mkdtemp(join(tmpdir(), 'poem-source-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('poetry source identity', () => {
  it('accepts only the exact codeload commit marker', async () => {
    const root = await temporarySource();
    await writeFile(join(root, '.source-commit'), EXPECTED + '\n', 'utf8');
    await expect(verifySourceIdentity(root, EXPECTED)).resolves.toBe('codeload-marker');
  });

  it('rejects a missing codeload commit marker', async () => {
    const root = await temporarySource();
    await expect(verifySourceIdentity(root, EXPECTED)).rejects.toThrow('Missing source identity');
  });

  it('rejects a mismatched codeload commit marker', async () => {
    const root = await temporarySource();
    await writeFile(join(root, '.source-commit'), 'wrong-commit\n', 'utf8');
    await expect(verifySourceIdentity(root, EXPECTED)).rejects.toThrow('Unexpected source commit');
  });

  it('accepts an actual git checkout only at its exact HEAD', async () => {
    const root = await temporarySource();
    await exec('git', ['init'], { cwd: root });
    await writeFile(join(root, 'README.md'), 'fixture\n', 'utf8');
    await exec('git', ['add', 'README.md'], { cwd: root });
    await exec('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-m', 'fixture'], { cwd: root });
    const { stdout } = await exec('git', ['rev-parse', 'HEAD'], { cwd: root });
    const head = stdout.trim();
    await expect(verifySourceIdentity(root, head)).resolves.toBe('git');
    await expect(verifySourceIdentity(root, EXPECTED)).rejects.toThrow('Unexpected source commit');
  });
});
