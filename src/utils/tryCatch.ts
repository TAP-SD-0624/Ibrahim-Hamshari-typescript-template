import { NextFunction, Request, Response } from "express";
import { logger } from "../config/loggers";
export const tryCatch: Function = (fn:Function) => async (req:Request, res:Response, next:NextFunction) => {
    try {
        await fn(req, res, next);
    }
    catch (err : any) {
        logger.error(err.message);
        next(err);
    }
}