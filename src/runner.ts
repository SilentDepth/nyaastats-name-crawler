import { Agent } from 'node:https'
import axios from 'axios'

interface MCProfile {
  id: string
  name: string
  legacy?: true
  properties: [
    {
      name: 'textures'
      value: string
      signature?: string
    }
  ]
}

const CODE_429 = Symbol()
const UNKNOWN_ERROR = Symbol()
type FetchProfileResult = MCProfile | null | typeof CODE_429 | typeof UNKNOWN_ERROR

function fetchProfile (uuid: string, localAddress?: string): Promise<FetchProfileResult> {
  return axios.get<FetchProfileResult>(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, {
    httpsAgent: localAddress ? new Agent({ localAddress }) : undefined,
  }).then(
    // onFulfilled
    res => res.status === 204 ? null : res.data,
    // onError
    err => err.response?.status >= 400 && err.response.status < 500 ? CODE_429 : UNKNOWN_ERROR,
  )
}

function pause (time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time))
}

export default async function (queue: any[], ip?: string): Promise<number> {
  const total = queue.length
  const retries = {} as Record<string, number>
  let exceeded = false
  let running = 0
  let updated = 0

  while (true) {
    const p = queue.shift()
    if (p) {
      const pNum = total - queue.length
      const { uuid } = p
      console.log([
        ip ? ip.padEnd(15, ' ') : null,
        String(pNum).padStart(String(total).length, ' ') + '/' + total,
        uuid,
        retries[uuid] || null,
      ].filter(it => it != null).join(' '))

      running++
      fetchProfile(uuid, ip).then(data => {
        switch (data) {
          case CODE_429:
            if (!exceeded) {
              setTimeout(() => exceeded = false, 10000)
            }
            exceeded = true
          case UNKNOWN_ERROR:
            queue.unshift(p)
            retries[uuid] = (retries[uuid] || 0) + 1
            break
          case null:
            break
          default:
            if (p.playername !== data.name) {
              p.playername = data.name
              p.names.unshift({ name: data.name, detectedAt: Date.now() })
              updated++
            }
        }
        running--
      })
    }

    if (queue.length || running) {
      await pause(exceeded ? 1000 : 50)
    } else {
      break
    }
  }

  return updated
}
