// LICENSE : MIT
import assert from 'assert'
import { RuleHelper } from "../src/";
import { textlint } from "textlint"

describe("textlint-rule-helper-test", function() {
    afterEach(function() {
        textlint.resetRules();
    });
    describe("#getParents()", () => {
        context("on Document", () => {
            it("should return []", () => {
                const text = "# Header";
                let parents = [];
                textlint.setupRules({
                    "rule-key": function(context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Document](node) {
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
                "rule-key": function(context) {
                    var helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node) {
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
                let result;
                textlint.setupRules({
                    "rule-key": function(context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Str](node) {
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
                let result;
                textlint.setupRules({
                    "rule-key": function(context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Paragraph](node) {
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
});
