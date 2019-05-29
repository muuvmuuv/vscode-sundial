import { window } from 'vscode'
import throttle from 'lodash/fp/throttle'

// https://github.com/Exelord/dark-mode/blob/ce9e9a80c46caa619dbd641018a2c3ce561375ef/lib/sensors/ambient-light.js

async function AmbientLight() {
  const sensor = new (window as any).AmbientLightSensor()
  sensor.onreading = throttle(({ value }) => {
    console.log(value)
  }, 3000)
  sensor.onerror = event => {
    console.log(event)
  }
  sensor.start()
}

export default AmbientLight
