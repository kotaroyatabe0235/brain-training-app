import { Router } from 'express'
import { gameController } from '../controllers/game.controller.js'

const router = Router()

router.get('/', gameController.getAllGames)
router.get('/:id', gameController.getGameById)
router.get('/category/:category', gameController.getGamesByCategory)

export default router
