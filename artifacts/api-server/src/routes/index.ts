import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import fitnessRouter from "./fitness";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(fitnessRouter);

export default router;
