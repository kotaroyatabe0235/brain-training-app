import { Router } from 'express'
import { scoreController } from '../controllers/score.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, scoreController.submitScore)
router.get('/me', authenticate, scoreController.getUserScores)
router.get('/me/:gameId', authenticate, scoreController.getUserScoresByGame)
router.get('/best', authenticate, scoreController.getBestScores)
router.get('/ranking/:gameId', scoreController.getRanking)
router.get('/stats', authenticate, scoreController.getStats)

export default router
