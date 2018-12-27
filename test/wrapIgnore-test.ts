// LICENSE : MIT
import assert from 'assert'
import { textlint } from "textlint"
import { wrap } from "../src/wrapIgnore";

describe("wrap", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    describe("ignoreNodeTypes", () => {
        it("should ignore multiple nodes", () => {
            let isCalled = false;
            textlint.setupRules({
                "rule-key": function (context: any) {
                    return wrap({
                        ignoreNodeTypes: [context.Syntax.BlockQuote]
                    }, {
                        [context.Syntax.Str]() {
                            isCalled = true
                        }
                    })
                }
            });
            const text = `> This should be ignored.`;
            return textlint.lintText(text, ".md").then(() => {
                assert.ok(isCalled === false, "Str node handler should not be called");
            });
        });
    });
});
