import { Request, Response, NextFunction } from "express";
import { traceSymbol } from "./trace-symbol";
import traverse from "traverse";

const walk = <T extends object>(object: T, checker: (object: T) => void) => {
    traverse(object).forEach(function(child) {
        // Avoid stack overflow
        if (this.circular) {
            return;
        }
        checker(child);
    });
};

export const traceExpressMiddleware = <T extends unknown>(options?: { handler?: (doc: T) => void }) => {
    const defaultHandler = (doc: any) => {
        console.warn("This doc is raw document from mongodb", doc);
    };
    return (_req: Request, res: Response, next: NextFunction) => {
        const handler = options && typeof options.handler === "function"
            ? options.handler
            : defaultHandler;
        const oldJson = res.json;
        const oldJsonp = res.jsonp;
        const checkMark = (doc: any) => {
            if (doc !== null && typeof doc === "object" && doc[traceSymbol]) {
                handler(doc);
            }
        };
        // @ts-ignore
        res.json = function(data) {
            walk(data, (value) => checkMark(value));
            // @ts-ignore
            oldJson.apply(res, arguments);
        };
        // @ts-ignore
        res.jsonp = function(data) {
            walk(data, (value) => checkMark(value));
            // @ts-ignore
            oldJsonp.apply(res, arguments);
        };
        next();
    };
};
