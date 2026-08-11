import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const packageLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))

test('Rollup 的跨平台可选依赖都写入锁文件', () => {
  const rollup = packageLock.packages['node_modules/rollup']
  const missing = Object.keys(rollup.optionalDependencies)
    .filter(name => name.startsWith('@rollup/'))
    .filter(name => !packageLock.packages[`node_modules/${name}`])

  assert.deepEqual(missing, [])
})
