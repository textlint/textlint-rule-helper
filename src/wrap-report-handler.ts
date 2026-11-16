// MIT © 2018 azu
"use strict";
import { AnyTxtNode, TxtNodeType } from "@textlint/ast-node-types";
import type { TextlintRuleContext, TextlintRuleError, TextlintRuleReportHandler } from "@textlint/types";
import RuleHelper from "./textlint-rule-helper";
import { SourceLocation } from "./SourceLocation";
import { includesType } from "./includes-type";
import { SortedRanges } from "./SortedRanges";

export interface wrapReportHandlerOptions {
    /**
     * Define ignore node's type.
     * It the node.type is matched, report error that is related with the location of node.
     * You also should use `report` function that is passed as wrapReportHandler 3rd argument.
     */
    ignoreNodeTypes: TxtNodeType[]
}

/**
 *
 * @param context
 * @param options
 * @param handler
 */
export function wrapReportHandler<T extends Readonly<TextlintRuleContext>, R extends TextlintRuleReportHandler>(
    context: T,
    options: wrapReportHandlerOptions,
    handler: (report: (node: AnyTxtNode, ruleError: TextlintRuleError) => void) => R
) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    // Ranges of the ignored nodes
    const ignoredRanges = new SortedRanges();
    const ruleHelper = new RuleHelper(context);
    const text = context.getSource();
    const sourceLocation = new SourceLocation(text);
    const reportIfUnignored = function reportIfUnignored(node: AnyTxtNode, ruleError: TextlintRuleError): void | Promise<any> {
        const index = sourceLocation.toAbsoluteLocation(node, ruleError);
        if (ignoredRanges.has(index)) {
            return;
        }
        return context.report(node, ruleError);
    };

    // Roots of the subtrees that have already been searched for `ignoreNodeTypes`.
    // The AST does not change while linting, so searching the same subtree again adds nothing.
    // Without this, every handler call walks the whole subtree of the node.
    const searchedRoots = new WeakSet<object>();
    const isSearched = (node: AnyTxtNode): boolean => {
        let current: AnyTxtNode | undefined = node;
        while (current != null) {
            if (searchedRoots.has(current)) {
                return true;
            }
            current = current.parent;
        }
        return false;
    };
    const search = (node: AnyTxtNode): void => {
        if (includesType(ignoreNodeTypes, node.type)) {
            ignoredRanges.add(node.range[0], node.range[1]);
        }
        const children = (node as { children?: AnyTxtNode[] }).children;
        if (children) {
            for (let i = 0; i < children.length; i++) {
                search(children[i]);
            }
        }
    };
    const ignoreChildrenByTypes = (node: AnyTxtNode): void => {
        if (isSearched(node)) {
            return;
        }
        searchedRoots.add(node);
        search(node);
    };
    const handlers = handler(reportIfUnignored);
    Object.keys(handlers).forEach(nodeType => {
        const nodeHandler = handlers[nodeType];
        const wrappedNodeHandler = (node: AnyTxtNode) => {
            if (ignoreNodeTypes.length > 0) {
                // child nodes
                ignoreChildrenByTypes(node);
                // parent node
                if (ruleHelper.isChildNode(node, ignoreNodeTypes)) {
                    return;
                }
            }
            if (!nodeHandler) {
                return;
            }
            return nodeHandler(node);
        };
        // @ts-expect-error: ignore
        handlers[nodeType] = wrappedNodeHandler
    });
    return handlers;
}
