# trace-database-response

assert a response of express if the response is raw mongodb raw object.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install trace-database-response

## Usage

```js
import mongoose from "mongoose";
import express from "express";
import { traceExpressMiddleware, traceMongoosePlugin } from "trace-database-response";
const app = express();
// Enable tracing on development 
if(process.env.NODE_ENV !== "production"){
    // Express middleware
    app.use(traceExpressMiddleware());
    // mongoose plugin
    mongoose.plugin(traceMongoosePlugin());
}
```

## Example

NG: Respond mongo model directly

```js
import mongoose from "mongoose";
import express from "express";
import { traceExpressMiddleware, traceMongoosePlugin } from "trace-database-response";
// mongoose plugin
mongoose.plugin(traceMongoosePlugin());
const app = express();
app.use(express.json());
// express middleware
app.use(traceExpressMiddleware(options));
// connect to Mongo daemon
mongoose
    .connect(
        "mongodb://mongo:27017/express-mongo",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .catch((err) => console.log(err));
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

const Item = mongoose.model("item", ItemSchema);
app.get("/item", (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.status(400).send("name query not defined");
    }
    return Item.findOne({
        name
    }, (error, doc) => {
        if (error) {
            res.status(400).send(error.message);
        } else if (!doc) {
            res.status(404).send("No document that match the query: " + name);
        } else {
            res.status(200).json(doc); // <= the response includes all data of mongo model
        }
    });
});
```

OK: allow-list 

```js
import mongoose from "mongoose";
import express from "express";
import { traceExpressMiddleware, traceMongoosePlugin } from "trace-database-response";
// mongoose plugin
mongoose.plugin(traceMongoosePlugin());
const app = express();
app.use(express.json());
// express middleware
app.use(traceExpressMiddleware(options));
// connect to Mongo daemon
mongoose
    .connect(
        "mongodb://mongo:27017/express-mongo",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .catch((err) => console.log(err));
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

const Item = mongoose.model("item", ItemSchema);
app.get("/item", (req, res) => {
    const name = req.query.name;
    const responseStrategy = req.query.responseStrategy;
    if (!name) {
        return res.status(400).send("name query not defined");
    }
    return Item.findOne({
        name
    }, (error, doc) => {
        if (error) {
            res.status(400).send(error.message);
        } else if (!doc) {
            res.status(404).send("No document that match the query: " + name);
        } else {
            // The response only includes specific data
            res.status(200).json({
                name: doc.name
            }); 
        }
    });
});
```

## Test

    make up
    make test

## Changelog

See [Releases page](https://github.com/azu/trace-database-response/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/trace-database-response/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
