import os from 'os'
import dns from 'dns'
import { logger } from './logger'

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise(r => setTimeout(r, ms))
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin'
}

export function checkConnection(): Promise<boolean> {
  const log = logger.getLogger('checkConnection')
  // TODO: waiting for a better solution: https://github.com/microsoft/vscode/issues/73094
  return new Promise(resolve => {
    dns.lookup('unpkg.com', { verbatim: true }, (err: any) => {
      if (err) {
        // No connection
        log.debug(err)
        resolve(false)
      } else {
        // Connected
        resolve(true)
      }
    })
  })
}
