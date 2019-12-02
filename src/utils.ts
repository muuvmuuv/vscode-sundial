import os from 'os'
import dns from 'dns'
import { logger } from './logger'

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => setTimeout(r, ms))
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin'
}

export function checkConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const log = logger.getLogger('checkConnection')
    // TODO: waiting for a better solution: https://github.com/microsoft/vscode/issues/73094
    dns.lookup(
      'www.cloudflare.com', // or better; 1.1.1.1
      {
        family: 4,
      },
      function onLookup(err) {
        if (err && err.code === 'ENOTFOUND') {
          log.debug('OFFLINE')
          resolve(false)
        } else {
          log.debug('ONLINE')
          resolve(true)
        }
      }
    )
  })
}
