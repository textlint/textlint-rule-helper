// LICENSE : MIT
import assert from 'assert'
import { textlint } from "textlint"
import IgnoreNodeManager from "../src/IgnoreNodeManager";

describe("IgnoreNodeManager", function() {
    afterEach(function() {
        textlint.resetRules();
    });
    describe("#ignoreChildrenByTypes()", () => {
        it("should ignore multiple nodes", () => {
            const text = `
- This is \`ignored\`
- This is not ignored

This is **ignored**.
`;
            const ignoreManager = new IgnoreNodeManager();
            textlint.setupRules({
                "rule-key": function(context) {
                    const { Syntax, RuleError, report, getSource } = context;
                    return {
                        [Syntax.Paragraph](node) {
                            ignoreManager.ignoreChildrenByTypes(node, [context.Syntax.Code, context.Syntax.Strong]);
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                assert.deepStrictEqual(ignoreManager.ignoredRanges, [
                    [11, 20],
                    [
                        52,
                        63
                    ]
                ]);
            });
        });
        it("should ignore range by index", () => {
            const text = "123`456`789";
            const expectedList = [
                {
                    name: "1",
                    ignored: false
                },
                {
                    name: "2",
                    ignored: false
                },
                {
                    name: "3",
                    ignored: false
                },
                {
                    name: "4",
                    ignored: true
                },
                {
                    name: "5",
                    ignored: true
                },
                {
                    name: "6",
                    ignored: true
                },
                {
                    name: "7",
                    ignored: false
                },
                {
                    name: "8",
                    ignored: false
                },
                {
                    name: "9",
                    ignored: false
                },
            ];
            const ignoreManager = new IgnoreNodeManager();
            textlint.setupRules({
                "rule-key": function(context) {
                    const { Syntax, RuleError, report, getSource } = context;
                    return {
                        [Syntax.Paragraph](node) {
                            ignoreManager.ignoreChildrenByTypes(node, [context.Syntax.Code]);
                            const text = getSource(node);
                            expectedList.forEach(item => {
                                const index = text.search(item.name);
                                item["actual"] = ignoreManager.isIgnoredIndex(index);
                            })
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                expectedList.forEach(item => {
                    assert.strictEqual(item.actual, item.ignored, `${item.name} should be ${item.ignored ? "ignored"
                                                                                                         : "includes"}`);
                });
                assert.deepStrictEqual(ignoreManager.ignoredRanges, [[3, 8]]);
            });
        });
    });
});
