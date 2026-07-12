#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

const threshold = parseInt(process.argv[3], 10) || 80
const dir = process.argv[2]

console.log(`\nRunning mutation tests in ${dir}...`)

try {
  const output = execSync('npx stryker run', {
    cwd: path.resolve(dir),
    encoding: 'utf-8',
    timeout: 600000,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  const match = output.match(/All files\s*\|\s*([\d.]+)\s*\|/)

  if (!match) {
    console.error('Could not parse mutation score from output')
    console.error('Last 50 lines of output:')
    const lines = output.trim().split('\n')
    console.error(lines.slice(-50).join('\n'))
    process.exit(1)
  }

  const score = parseFloat(match[1])

  console.log(`\nMutation Score: ${score}%`)
  console.log(`Threshold: ${threshold}%`)

  if (score < threshold) {
    console.error(`\n✗ Mutation score ${score}% is below threshold ${threshold}%`)
    process.exit(1)
  }

  console.log(`\n✓ Mutation score ${score}% meets threshold ${threshold}%`)
  process.exit(0)
} catch (error) {
  if (error.stdout) {
    const match = error.stdout.match(/All files\s*\|\s*([\d.]+)\s*\|/)
    if (match) {
      const score = parseFloat(match[1])
      console.log(`\nMutation Score: ${score}%`)
      console.log(`Threshold: ${threshold}%`)

      if (score < threshold) {
        console.error(`\n✗ Mutation score ${score}% is below threshold ${threshold}%`)
        process.exit(1)
      }

      console.log(`\n✓ Mutation score ${score}% meets threshold ${threshold}%`)
      process.exit(0)
    }
  }
  console.error('Error running mutation tests:', error.message)
  process.exit(1)
}
