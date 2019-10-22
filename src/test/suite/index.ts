import path from 'path'
import Mocha from 'mocha'
import glob from 'glob'

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    useColors: true,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((resolve, reject) => {
    glob('**/**.spec.ts', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err)
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`))
          } else {
            resolve()
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  })
}
