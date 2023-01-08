// LICENSE : MIT
import assert from 'assert'
import { TextlintKernel, TextlintRuleModule } from "@textlint/kernel"
import markdown from "@textlint/textlint-plugin-markdown"
import { StructuredSource } from "structured-source"
import { wrapReportHandler } from "../src";
import { AnyTxtNode, ASTNodeTypes } from "@textlint/ast-node-types";

const builtInPlugins = [{
    pluginId: "markdown",
    plugin: markdown
}];

describe("wrapReportHandler", function () {
    describe("ignoreNodeTypes", () => {
        it("should just ignore node", () => {
            const textlint = new TextlintKernel()
            const rule: TextlintRuleModule = function (context) {
                const { RuleError } = context;
                return wrapReportHandler(context, {
                    ignoreNodeTypes: Object.keys(ASTNodeTypes).concat("my-type")
                }, report => {
                    return {
                        ...(Object.keys(ASTNodeTypes).reduce((object, key) => {
                            object[key] = (node: AnyTxtNode) => {
                                report(node, new RuleError(node.type));
                            };
                            return object;
                        }, {} as any)),
                        ...{
                            "my-type"(node) {
                                report(node, new RuleError(node.type));
                            }
                        }
                    };
                });
            }
            const text = `# Header

**This** *is* \`code\`.

- item
    - item __str__

[link](https://example.com)
![img](https://example.com)

\`\`\`
code
\`\`\`

----

    code

[1][]

[1]: "1"

`;
            return textlint.lintText(text, {
                ext: ".md",
                rules: [
                    {
                        ruleId: "test",
                        rule: rule,
                    }
                ],
                plugins: builtInPlugins
            }).then((result) => {
                assert.strictEqual(result.messages.length, 0, "Should ignore all nodes");
            });
        });
        it("should ignore parent node by types", () => {
            let isCalled = false;
            const textlint = new TextlintKernel()
            const rule: TextlintRuleModule = function (context: any) {
                return wrapReportHandler(context, {
                    ignoreNodeTypes: [context.Syntax.BlockQuote, context.Syntax.Code]
                }, _report => {
                    return {
                        [context.Syntax.Paragraph]() {
                            isCalled = true
                        },
                        [context.Syntax.Str]() {
                            isCalled = true
                        }
                    }
                });
            }
            const text = `> This should be ignored.`;
            return textlint.lintText(text, {
                ext: ".md",
                rules: [{
                    ruleId: "test",
                    rule
                }],
                plugins: builtInPlugins
            }).then(() => {
                assert.strictEqual(isCalled, false, "Str node handler should not be called");
            });
        });
        it("should ignore child node by types", () => {
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
            const textlint = new TextlintKernel();
            const rule: TextlintRuleModule = function (context) {
                const { Syntax, getSource } = context;
                return wrapReportHandler(context, {
                    ignoreNodeTypes: [context.Syntax.Code]
                }, report => {
                    return {
                        [Syntax.Paragraph](node) {
                            const text = getSource(node);
                            expectedList.forEach(item => {
                                const index = text.search(item.name);
                                report(node, new context.RuleError(item.name, {
                                    index
                                }))
                            });
                        }
                    }
                });
            };
            const text = "123`456`789";
            return textlint.lintText(text, {
                ext: ".md",
                rules: [{
                    ruleId: "test",
                    rule
                }],
                plugins: builtInPlugins
            }).then((result) => {
                const messages = result.messages;
                messages.forEach(message => {
                    const matchItem = expectedList.find(item => item.name === message.message);
                    if (!matchItem) {
                        throw new Error(`Not found match item:${message}`);
                    }
                    assert.strictEqual(matchItem.ignored, false, `Should ignore item: ${JSON.stringify(matchItem)}`);
                })
            });
        });
        it("should support line,column nodes", () => {
            const text = "> Line 1\n"
                + "> This is `code`.";
            const textlint = new TextlintKernel();
            const rule: TextlintRuleModule = function (context) {
                const { Syntax, RuleError } = context;
                return wrapReportHandler(context, {
                    ignoreNodeTypes: [context.Syntax.Code]
                }, report => {
                    return {
                        [Syntax.Paragraph](node) {
                            const text = context.getSource(node);
                            const source = new StructuredSource(text);
                            const indexOfCode = text.search("code");
                            if (indexOfCode === -1) {
                                return;
                            }
                            const loc = source.indexToPosition(indexOfCode);
                            report(node, new RuleError(text, {
                                line: loc.line - 1,
                                column: loc.column
                            }));
                        }
                    }
                });
            }
            return textlint.lintText(text, {
                ext: ".md",
                rules: [{
                    ruleId: "test",
                    rule
                }],
                plugins: builtInPlugins
            }).then((result) => {
                const messages = result.messages;
                assert.strictEqual(messages.length, 0);
            });
        })
    });
});
