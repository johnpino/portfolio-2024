const { spawn } = require('node:child_process')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const command = spawn('npx', [
  'cf-content-types-generator',
  'contentful/export/data.json',
  '-o',
  'contentful/types',
  '--v10'
])

command.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})

command.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`)
})

command.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
