import os from 'os'
import dns from 'dns'
import { logger } from './logger'
import dayjs from 'dayjs'

let lastOnlineCheck = dayjs()
let lastOnlienStatus = false // true => connected

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => setTimeout(r, ms))
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin'
}

export function checkConnection(): Promise<boolean> {
  const log = logger.getLogger('checkConnection')
  // TODO: waiting for a better solution: https://github.com/microsoft/vscode/issues/73094
  return new Promise((resolve) => {
    // check every 30 seconds
    const diff = lastOnlineCheck.diff(dayjs(), 'second')
    if (diff <= -30) {
      log.debug(`Check connection again after ${diff} seconds`)
      lastOnlineCheck = dayjs()
    } else {
      log.debug('Too early, return last online status')
      return resolve(lastOnlienStatus)
    }
    dns.lookup('google.com', { verbatim: true }, (err) => {
      if (err && err.code === 'ENOTFOUND') {
        // No connection
        log.debug('OFFLINE')
        lastOnlienStatus = false
        resolve(false)
      } else {
        // Connected
        log.debug('ONLINE')
        lastOnlienStatus = true
        resolve(true)
      }
    })
  })
}
