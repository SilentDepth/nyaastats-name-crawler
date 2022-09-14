import { resolve as resolvePath } from 'node:path'
import fs from 'node:fs'
import minimist from 'minimist'

import runner from './runner'

const argv = minimist(process.argv.slice(2))
const range = argv.range ? argv.range.split(',').map((it: string) => Number(it)) : []
const target = resolvePath(process.cwd(), argv._[0])
if (!fs.existsSync(target)) {
  console.error('File not found:', target)
  process.exit(1)
}
const players = JSON.parse(fs.readFileSync(target, 'utf-8')).slice(...range)
const playersCount = players.length
console.log(`Updating ${target} (${playersCount} players)`)
const ips = argv._.length > 1 ? argv._.slice(1) : [undefined]
console.log(`Tasks dispatched to ${ips.length} ${ips.length === 1 ? 'address' : 'addresses'}`)
console.log('-'.repeat(40))

void async function main () {
  const startTime = Date.now()
  const updatedCounts = await Promise.all(
    ips.map((ip, idx) => runner(players.filter((_: never, pIdx: number) => pIdx % ips.length === idx), ip))
  )
  const updated = updatedCounts.reduce((result, num) => result + num)
  console.log('-'.repeat(40))
  console.log('Average rate:', playersCount / (Date.now() - startTime) * 1000, 'req/sec')
  console.log('Updated players:', updated)
  if (updated > 0) {
    fs.writeFileSync(target, JSON.stringify(players), 'utf-8')
  }
  console.log('Done')
}()
