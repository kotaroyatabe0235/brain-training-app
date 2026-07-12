import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import gameRoutes from './routes/game.routes.js'
import scoreRoutes from './routes/score.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/scores', scoreRoutes)

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'サーバーエラーが発生しました' })
})

export default app
