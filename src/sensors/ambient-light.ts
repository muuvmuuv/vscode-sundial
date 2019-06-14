import { window } from 'vscode'

// https://github.com/Exelord/dark-mode/blob/ce9e9a80c46caa619dbd641018a2c3ce561375ef/lib/sensors/ambient-light.js

async function AmbientLight() {
  const sensor = new (window as any).AmbientLightSensor()
  sensor.onreading = ({ value }) => {
    console.log(value)
  }
  sensor.onerror = (event: any) => {
    console.log(event)
  }
  sensor.start()
}

export default AmbientLight
