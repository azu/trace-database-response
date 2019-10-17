import { traceExpressMiddleware, traceMongoosePlugin } from "../src";
import mongoose, { Model } from "mongoose";
import express from "express";
import * as http from "http";

export interface Item extends mongoose.Document {
    name: string;
    date: Date
}

let server: http.Server | null = null;
let Item: Model<Item>;
export const up = (options: { handler: (doc: any) => void }) => {
    // mongoose plugin
    mongoose.plugin(traceMongoosePlugin());

    const app = express();
    app.use(express.json());
    // trace express response
    app.use(traceExpressMiddleware(options));
    // connect to Mongo daemon
    mongoose
        .connect(
            "mongodb://mongo:27017/express-mongo",
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        .catch((err: Error) => console.log(err));
    // DB schema
    const ItemSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    });

    Item = mongoose.model("item", ItemSchema);
    app.get("/item", (req, res) => {
        const name = req.query.name;
        const responseStrategy = req.query.responseStrategy;
        if (!name) {
            return res.status(400).send("name query not defined");
        }
        return Item.findOne({
            name
        }, (error, doc: Item) => {
            if (error) {
                res.status(400).send(error.message);
            } else if (!doc) {
                res.status(404).send("No document that match the query: " + name);
            } else {
                if (responseStrategy === "copy-from-mongo-doc") {
                    // copy manually
                    res.status(200).json({
                        name: doc.name
                    });
                } else if (responseStrategy === "reference-mongo-doc") {
                    res.status(200).json(doc);
                } else {
                    throw new Error("Unknown responseStrategy:" + responseStrategy);
                }
            }
        });
    });
    // Post route
    app.post("/item", (req, res) => {
        const newItem = new Item({
            name: req.body.name
        });
        newItem.save().then(_item => {
            res.status(200).json({ status: "ok" });
        });
    });

    app.post("/clear", (_req, res) => {
        Item.collection.drop().then(() => {
            res.status(200).json({ status: "ok" });
        });
    });
    return new Promise((resolve) => {
        const port = 3000;
        server = app.listen(port, () => {
            resolve();
        });
    });
};
export const down = () => {
    return new Promise((resolve) => {
        const mongoosePromise = new Promise((resolve) => {
            Item.collection.drop().then(() => {
                mongoose.disconnect(() => {
                    resolve();
                });
            });
        });
        const serverPromise = new Promise(resolve => {
            if (server) {
                server.close(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
        return Promise.all([mongoosePromise, serverPromise]).then(() => resolve());
    });
};
