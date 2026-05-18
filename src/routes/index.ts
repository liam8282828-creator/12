import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import whatsappRouter from "./whatsapp.js";
import botRouter from "./bot.js";
import keysRouter from "./keys.js";
import commandsRouter from "./commands.js";
import musicRouter from "./music.js";

const router: IRouter = Router();
router.use(healthRouter);
router.use(whatsappRouter);
router.use(botRouter);
router.use(keysRouter);
router.use(commandsRouter);
router.use(musicRouter);
export default router;
