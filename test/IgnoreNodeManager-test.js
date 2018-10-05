// LICENSE : MIT
import assert from 'assert'
import IgnoreNodeManager from "../src/IgnoreNodeManager";
import {textlint} from "textlint"
describe("IgnoreNodeManager", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    describe("#ignoreChildrenByTypes()", ()=> {
        context("when the parent node is Paragraph, the child node is Str", ()=> {
            it("should ignore range by index", () => {
                const text = "text`code`text";
                let isIgnored = false;
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
                    assert.deepStrictEqual(ignoreManager["_ignoredRangeList"], [[4, 10]]);
                });
            });
        });
    });
});
