// MIT © 2018 azu
"use strict";
import { AnyTxtNode, TxtNodeType } from "@textlint/ast-node-types";
import { TextlintRuleContext, TextlintRuleError, TextlintRuleReportHandler } from "@textlint/types";
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

export function wrapReportHandler<T extends TextlintRuleContext, R extends TextlintRuleReportHandler>(
    options: wrapOptions,
    context: T,
    handler: (
        report: (node: AnyTxtNode, ruleError: TextlintRuleError) => void
    ) => R
) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    const ignoreNodeManager = new IgnoreNodeManager();
    const ruleHelper = new RuleHelper(context);
    const text = context.getSource();
    const sourceLocation = new SourceLocation(text);
    const reportIfUnignored = function reportIfUnignored(node: AnyTxtNode, ruleError: TextlintRuleError): void | Promise<any> {
        const index = sourceLocation.toAbsoluteLocation(node, ruleError);
        if (ignoreNodeManager.isIgnoredIndex(index)) {
            return;
        }
        return context.report(node, ruleError);
    };

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
