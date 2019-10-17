import { Schema, Document } from "mongoose";
import { traceSymbol } from "./trace-symbol";

export const traceMongoosePlugin = () => {
    return (schema: Schema) => {
        const mark = (doc: Document) => {
            (doc as any)[traceSymbol] = true;
        };
        schema.post("find", function(docs) {
            if (!Array.isArray(docs)) {
                return;
            }
            for (const doc of docs) {
                mark(doc);
            }

        });
        schema.post("findOne", function(doc) {
            mark(doc);
        });
    };
};
