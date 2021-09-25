import { lookup } from 'dns'

import { getLogger } from './logger'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms)
  })
}

export function checkConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const log = getLogger('checkConnection')
    // TODO: https://github.com/microsoft/vscode/issues/73094
    lookup(
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
