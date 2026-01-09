import { Router } from "express";
import {
  createNewGame,
  handlePlayerAction,
} from "../controllers/game.controller.js";

const router = Router();

router.post("/new", createNewGame);
router.post("/:id/action", handlePlayerAction);

export default router;
