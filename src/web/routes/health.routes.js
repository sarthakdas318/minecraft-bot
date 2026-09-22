import { Router } from "express";

export const healthRouter = Router();

healthRouter.head("/health", (_, res) => res.sendStatus(200));
healthRouter.get("/health", (_, res) => res.sendStatus(200));
