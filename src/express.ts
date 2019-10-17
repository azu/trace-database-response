import { Request, Response, NextFunction } from "express";
import { traceSymbol } from "./trace-symbol";

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

        const iterate = (obj: any, callback: (doc: any) => void) => {
            if (obj === null || typeof obj !== "object") {
                return callback(obj);
            }
            // object-self
            callback(obj);
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                callback(value);
                if (typeof value === "object") {
                    iterate(value, callback);
                }
            });
        };
        // @ts-ignore
        res.json = function(data) {
            iterate(data, (value) => checkMark(value));
            // @ts-ignore
            oldJson.apply(res, arguments);
        };
        // @ts-ignore
        res.jsonp = function(data) {
            iterate(data, (value) => checkMark(value));
            // @ts-ignore
            oldJsonp.apply(res, arguments);
        };
        next();
    };
};
