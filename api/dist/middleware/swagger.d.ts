/**
 * Swagger/OpenAPI Documentation Middleware for Cognivo AI
 * Professional API documentation with interactive testing
 */
/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
declare const specs: object;
export declare const swaggerMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const swaggerUiMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export default specs;
//# sourceMappingURL=swagger.d.ts.map