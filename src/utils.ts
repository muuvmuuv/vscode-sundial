import os from 'os'

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise(r => setTimeout(r, ms))
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin'
}
