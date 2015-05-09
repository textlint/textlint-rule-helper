// LICENSE : MIT
"use strict";
import support from 'source-map-support'
support.install();

import {parse,Syntax} from "markdown-to-ast"
import {traverse} from "txt-ast-traverse"
import assert from 'power-assert'
import {RuleHelper} from "../src/textlint-rule-helper";
import {textlint} from "textlint"
describe("textlint-rule-helper-test", function () {
    afterEach(function () {
        textlint.resetRules();
    });
    describe("#getParents()", ()=> {
        context("on Document", ()=> {
            it("should return []", () => {
                var text = "# Header";
                var parents = [];
                textlint.setupRules({
                    "rule-key": function (context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Document](node) {
                                parents = helper.getParents(node)
                            }
                        }
                    }
                });
                textlint.lintMarkdown(text);
                assert(parents.length === 0);
            });

        });
        it("should return parents", () => {
            var text = "# Header";
            var parents = [];
            textlint.setupRules({
                "rule-key": function (context) {
                    var helper = new RuleHelper(context);
                    return {
                        [context.Syntax.Str](node) {
                            parents = helper.getParents(node)
                        }
                    }
                }
            });
            textlint.lintMarkdown(text);
            assert(parents.length === 2);
        });
    });
    describe("#isChildNode(node, parentTypes)", ()=> {
        context("when the parent node is Paragraph, the child node is Str", ()=> {
            it("should be true", () => {
                var text = "text";
                var result;
                textlint.setupRules({
                    "rule-key": function (context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Str](node) {
                                result = helper.isChildNode(node, [context.Syntax.Paragraph])
                            }
                        }
                    }
                });
                textlint.lintMarkdown(text);
                assert.ok(result);
            });
        });
        context("when the parent node is Str, the child node is Paragraph", ()=> {
            it("should be false", () => {
                var text = "text";
                var result;
                textlint.setupRules({
                    "rule-key": function (context) {
                        var helper = new RuleHelper(context);
                        return {
                            [context.Syntax.Paragraph](node) {
                                result = helper.isChildNode(node, [context.Syntax.Str])
                            }
                        }
                    }
                });
                textlint.lintMarkdown(text);
                assert.ok(!result);
            });
        });
    });
});
