import { Request, Response, NextFunction } from "express";
import { traceSymbol } from "./trace-symbol";
import crawl from "tree-crawl";

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
            crawl(data, (value) => checkMark(value), { order: "pre" });
            // @ts-ignore
            oldJson.apply(res, arguments);
        };
        // @ts-ignore
        res.jsonp = function(data) {
            crawl(data, (value) => checkMark(value), { order: "pre" });
            // @ts-ignore
            oldJsonp.apply(res, arguments);
        };
        next();
    };
};
