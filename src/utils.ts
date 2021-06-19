import dns from 'dns'

import { getLogger } from './logger'

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => setTimeout(r, ms))
}

export function checkConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const log = getLogger('checkConnection')
    // TODO: https://github.com/microsoft/vscode/issues/73094
    dns.lookup(
      'www.cloudflare.com', // or better; 1.1.1.1
      {
        family: 4,
      },
      (error) => {
        if (error && error.code === 'ENOTFOUND') {
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
