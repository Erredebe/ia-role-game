import { Router } from 'express';
import { getGameState, handlePlayerAction, resetGame } from '../controllers/game.controller.js';

const router = Router();

router.get('/state', getGameState);
router.post('/action', handlePlayerAction);
router.post('/reset', resetGame);

export default router;
