// LICENSE : MIT
"use strict";
import assert from 'power-assert'
import IgnoreNodeManager from "../src/IgnoreNodeManager";
import {textlint} from "textlint"
describe("IgnoreNodeManager", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    describe("#ignoreChildrenByTypes()", ()=> {
        context("when the parent node is Paragraph, the child node is Str", ()=> {
            it("should ignore range by index", () => {
                var text = "text`code`text";
                var isIgnored = false;
                const ignoreManager = new IgnoreNodeManager();
                textlint.setupRules({
                    "rule-key": function (context) {
                        const {Syntax, RuleError, report, getSource} = context;
                        return {
                            [Syntax.Paragraph](node) {
                                ignoreManager.ignoreChildrenByTypes(node, [context.Syntax.Code]);
                                const text = getSource(node);
                                const codeIndex = text.search("code");
                                isIgnored = ignoreManager.isIgnoredIndex(codeIndex);
                            }
                        }
                    }
                });
                return textlint.lintMarkdown(text).then(()=> {
                    assert.ok(isIgnored);
                    assert.deepEqual(ignoreManager["_ignoredRangeList"], [[4, 10]]);

                });
            });
        });
    });
});
