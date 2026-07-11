import { env } from './config/env.js'
import { prisma } from './config/prisma.js'
import app from './app.js'

async function start() {
  try {
    await prisma.$connect()
    console.log('Database connected')

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
