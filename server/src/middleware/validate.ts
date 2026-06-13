import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    if (source === "body") req.body = result.data;
    else Object.assign(req[source] as object, result.data);
    next();
  };

export type Validated<T extends AnyZodObject> = T["_output"];
