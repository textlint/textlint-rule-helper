// LICENSE : MIT
import assert from 'assert'
import { textlint } from "textlint"
import { IgnoreNodeManager } from "../src/";
import { TxtNodeType, TxtParentNode } from "@textlint/ast-node-types";

describe("IgnoreNodeManager", function () {
    afterEach(function () {
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
                "rule-key": function (context: any) {
                    const { Syntax } = context;
                    return {
                        [Syntax.Paragraph](node: any) {
                            const ignoredNodeTypes: TxtNodeType[] = [context.Syntax.Code, context.Syntax.Strong];
                            ignoreManager.ignoreChildrenByTypes(node, ignoredNodeTypes);
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
            const expectedList: { name: string; ignored: boolean; actual?: boolean }[] = [
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
                "rule-key": function (context: any) {
                    const { Syntax, getSource } = context;
                    return {
                        [Syntax.Paragraph](node: TxtParentNode) {
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
