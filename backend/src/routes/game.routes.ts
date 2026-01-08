import { Router } from 'express';
import { 
    createNewGame, 
    getGamesList, 
    getGameState, 
    handlePlayerAction, 
    restoreGame,
    resetGame 
} from '../controllers/game.controller.js';

const router = Router();

router.get('/list', getGamesList);
router.post('/new', createNewGame);
router.post('/restore', restoreGame);
router.get('/:id/state', getGameState);
router.post('/:id/action', handlePlayerAction);
router.post('/:id/reset', resetGame);

export default router;
