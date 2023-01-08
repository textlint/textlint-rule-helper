// LICENSE : MIT
import assert from 'assert'
import { IgnoreNodeManager } from "../src/index";
import { TxtNodeType, TxtParentNode } from "@textlint/ast-node-types";
import { TextlintKernel, TextlintRuleModule } from "@textlint/kernel"
import { builtInPlugins } from "./textlint-helper";

describe("IgnoreNodeManager", function () {
    describe("#isIgnoredRange()", () => {
        it("should ignore multiple nodes", () => {
            const ignoreManager = new IgnoreNodeManager();
            // 0 1 2 3 4 5 6 7 8 9
            //     ^ ^ ^
            // 5(endIndex) is not included
            ignoreManager.ignoreRange([2, 5]);
            // Should ignore:
            assert.ok(ignoreManager.isIgnoredRange([0, 1]) === false, "[0, 1]");
            assert.ok(ignoreManager.isIgnoredRange([0, 10]) == false, "[0, 10]");
            assert.ok(ignoreManager.isIgnoredRange([0, 2]), "[0, 2]");
            assert.ok(ignoreManager.isIgnoredRange([2, 5]), "[2, 5]");
            assert.ok(ignoreManager.isIgnoredRange([4, 5]), "[4, 5]");
            assert.ok(ignoreManager.isIgnoredRange([5, 6]) === false, "[5, 6]");
            assert.ok(ignoreManager.isIgnoredRange([6, 10]) === false, "[5, 6]");
        });
    });
    describe("#ignoreChildrenByTypes()", () => {
        it("should ignore multiple nodes", () => {
            const text = `
- This is \`ignored\`
- This is not ignored

This is **ignored**.
`;
            const ignoreManager = new IgnoreNodeManager();
            const textlint = new TextlintKernel();
            const rule: TextlintRuleModule = function (context: any) {
                const { Syntax } = context;
                return {
                    [Syntax.Paragraph](node: any) {
                        const ignoredNodeTypes: TxtNodeType[] = [context.Syntax.Code, context.Syntax.Strong];
                        ignoreManager.ignoreChildrenByTypes(node, ignoredNodeTypes);
                    }
                }
            }
            return textlint.lintText(text, {
                ext: ".md",
                rules: [{
                    ruleId: "test",
                    rule: rule
                }],
                plugins: builtInPlugins
            }).then(() => {
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
            const textlint = new TextlintKernel();
            const rule: TextlintRuleModule = function (context: any) {
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
            return textlint.lintText(text, {
                ext: ".md",
                rules: [{
                    ruleId: "test",
                    rule: rule
                }],
                plugins: builtInPlugins
            }).then(() => {
                expectedList.forEach(item => {
                    assert.strictEqual(item.actual, item.ignored, `${item.name} should be ${item.ignored ? "ignored"
                        : "includes"}`);
                });
                assert.deepStrictEqual(ignoreManager.ignoredRanges, [[3, 8]]);
            });
        });
    });
});
