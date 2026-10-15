import { Router, type IRouter } from "express";
import healthRouter from "./health";
import duoSpaceRouter from "./duospace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(duoSpaceRouter);

export default router;
