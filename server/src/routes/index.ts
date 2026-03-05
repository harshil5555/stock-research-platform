import { Router } from "express";
import authRoutes from "./auth";
import todosRoutes from "./todos";
import sourcesRoutes from "./sources";
import stocksRoutes from "./stocks";
import attachmentsRoutes from "./attachments";
import analysesRoutes from "./analyses";
import decisionsRoutes from "./decisions";
import commentsRoutes from "./comments";
import dashboardRoutes from "./dashboard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/todos", todosRoutes);
router.use("/sources", sourcesRoutes);
router.use("/stocks", stocksRoutes);
// Attachments are nested under sources but also have standalone endpoints
router.use("/", attachmentsRoutes);
// Analyses and decisions are nested under stocks
router.use("/stocks", analysesRoutes);
router.use("/stocks", decisionsRoutes);
router.use("/comments", commentsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
