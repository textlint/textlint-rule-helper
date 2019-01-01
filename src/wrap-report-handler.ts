// MIT © 2018 azu
"use strict";
import { TxtNode, TxtNodeType, TxtParentNode, AnyTxtNode } from "@textlint/ast-node-types";
import { TextlintRuleError, TextlintRuleReportHandler } from "@textlint/types";
import RuleHelper from "./textlint-rule-helper";
import IgnoreNodeManager from "./IgnoreNodeManager";
import { SourceLocation } from "./SourceLocation";

export interface RuleErrorPadding {
    line?: number;
    column?: number;
    index?: number;
}

export interface wrapOptions {
    ignoreNodeTypes: TxtNodeType[]
}

export function wrapReportHandler<T extends Function, R extends TextlintRuleReportHandler>(
    options: wrapOptions,
    context: T,
    handler: (
        report: (node: AnyTxtNode, ruleError: TextlintRuleError) => R
    ) => R
) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    const ignoreNodeManager = new IgnoreNodeManager();
    const ruleHelper = new RuleHelper(context);
    const text = (context as any).getSource();
    const sourceLocation = new SourceLocation(text);
    const reportIfUnignored = function reportIfUnignored(...args: any[]): any | Promise<any> {
            const node: TxtNode | TxtParentNode = args[0];
            const ruleError: RuleErrorPadding = args[1];
            const index = sourceLocation.toAbsoluteLocation(node, ruleError);
            if (ignoreNodeManager.isIgnoredIndex(index)) {
                return;
            }
            return (context as any).report(...args);
        }
    ;

    const handlers = handler(reportIfUnignored);
    Object.keys(handlers).forEach(nodeType => {
        const nodeHandler = handlers[nodeType];
        const wrappedNodeHandler = (node: AnyTxtNode) => {
            // child nodes
            ignoreNodeManager.ignoreChildrenByTypes(node, ignoreNodeTypes);
            // parent node
            if (ruleHelper.isChildNode(node, ignoreNodeTypes)) {
                return;
            }
            if (!nodeHandler) {
                return;
            }
            return nodeHandler(node);
        };
        handlers[nodeType] = wrappedNodeHandler
    });
    return handlers;
}
