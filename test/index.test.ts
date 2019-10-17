import { down, up } from "./express-app";
import fetch from "node-fetch";
import * as assert from "assert";

describe("index", function() {
    const expressMiddlewareOptions = {
        handler: (doc: any) => {
            console.log("DEFAULT HANDLER", doc);
        }
    };
    before(() => {
        // Pass to object reference for replace in each test case
        return up(expressMiddlewareOptions);
    });
    after(() => {
        return down();
    });
    it("should not be checked because response is copy from mongo-doc", async () => {
        let called = false;
        expressMiddlewareOptions.handler = (_doc: any) => {
            called = true;
        };
        await fetch("http://localhost:3000/item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                name: "test"
            })
        });
        await fetch("http://localhost:3000/item?name=test&responseStrategy=copy-from-mongo-doc").then(res => {
            if (res.ok) {
                return res.json();
            }
            return {};
        });
        assert.strictEqual(called, false, "This response should be copy from mongo document");
    });
    it("should be checked because response is reference to mongo-doc", async () => {
        let called = false;
        expressMiddlewareOptions.handler = (_doc: any) => {
            called = true;
        };
        await fetch("http://localhost:3000/item", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                name: "test"
            })
        });
        await fetch("http://localhost:3000/item?name=test&responseStrategy=reference-mongo-doc").then(res => {
            if (res.ok) {
                return res.json();
            }
            return {};
        });
        assert.ok(called, "This response should be reference to mongo document");
    });

});
