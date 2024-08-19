 const { spawn } = require('node:child_process')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const command = spawn('npx', [
  'contentful',
  'space',
  'export',
  '--management-token',
  `${process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN}`,
  '--space-id',
  `${process.env.CONTENTFUL_SPACE_ID}`,
  '--environment-id',
  `${process.env.CONTENTFUL_ENVIRONMENT}`,
  '--export-dir',
  'contentful/export',
  '--content-file',
  'data.json'
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
