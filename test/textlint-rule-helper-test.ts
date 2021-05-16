// LICENSE : MIT
import assert from 'assert'
import { RuleHelper } from "../src/";
import { textlint } from "textlint"
import { TxtNode, TxtParentNode } from "@textlint/ast-node-types"

describe("textlint-rule-helper-test", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    describe("#getParents()", () => {
        context("on Document", () => {
            it("should return []", () => {
                const text = "# Header";
                let parents = [];
                textlint.setupRules({
                    "rule-key": function (context: any) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Document](node: TxtParentNode) {
                                parents = helper.getParents(node)
                            }
                        }
                    }
                });
                return textlint.lintMarkdown(text).then(() => {
                    assert.strictEqual(parents.length, 0);
                });
            });

        });
        it("should return parents", () => {
            const text = "# Header";
            let parents = [];
            textlint.setupRules({
                "rule-key": function (context: any) {
                    var helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node: TxtNode) {
                            parents = helper.getParents(node)
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                assert.strictEqual(parents.length, 2);
            });
        });
    });
    describe("#isChildNode(node, parentTypes)", () => {
        context("when the parent node is Paragraph, the child node is Str", () => {
            it("should be true", () => {
                const text = "text";
                let result: boolean;
                textlint.setupRules({
                    "rule-key": function (context: any) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Str](node: TxtNode) {
                                result = helper.isChildNode(node, [context.Syntax.Paragraph])
                            }
                        }
                    }
                });
                return textlint.lintMarkdown(text).then(() => {
                    assert.ok(result);
                });
            });
        });
        context("when the parent node is Str, the child node is Paragraph", () => {
            it("should be false", () => {
                const text = "text";
                let result: boolean;
                textlint.setupRules({
                    "rule-key": function (context: any) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Paragraph](node: TxtParentNode) {
                                result = helper.isChildNode(node, [context.Syntax.Str])
                            }
                        }
                    }
                });
                return textlint.lintMarkdown(text).then(() => {
                    assert.ok(!result);
                });
            });
        });
    });
    describe("#isPlainStrNode(node)", () => {
        it("should return true if the node is under the paragraph", () => {
            const text = "text";
            let result: boolean;
            textlint.setupRules({
                "rule-key": function (context: any) {
                    const helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node: TxtNode) {
                            result = helper.isPlainStrNode(node)
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                assert.ok(result);
            });
        });
        it("should return true if the node is under the paragraph in list", () => {
            const text = "- text";
            let result: boolean;
            textlint.setupRules({
                "rule-key": function (context: any) {
                    const helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node: TxtNode) {
                            result = helper.isPlainStrNode(node)
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                assert.ok(result);
            });
        });
        it("should return false if the node is under the Img, Link, Header, Strong", () => {
            const text = `# text
![text](https://example.com/img)[text](https://example.com/img)**strong**__strong__`;
            const results: boolean[] = [];
            textlint.setupRules({
                "rule-key": function (context: any) {
                    const helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node: TxtNode) {
                            results.push(helper.isPlainStrNode(node))
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                results.forEach(result => assert(!result))
            });
        })
        it("should return false if the node is under the blockquote ", () => {
            const text = "> text";
            let result: boolean;
            textlint.setupRules({
                "rule-key": function (context: any) {
                    const helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node: TxtNode) {
                            result = helper.isPlainStrNode(node)
                        }
                    }
                }
            });
            return textlint.lintMarkdown(text).then(() => {
                assert.ok(!result);
            });
        })
    })
});
