// MIT © 2018 azu
"use strict";
import { TxtNode, TxtNodeType, TxtParentNode } from "@textlint/ast-node-types";
import RuleHelper from "./textlint-rule-helper";

export interface wrapOptions {
    ignoreNodeTypes: TxtNodeType[]
}

type Handlers = {
    [P in TxtNodeType]: (node: TxtNode | TxtParentNode) => any;
}

/**
 * @param {{ignoreNodeTypes:ASTNodeTypes[]}} options
 * @param {object} nodeHandlers
 */
export function wrap(options: wrapOptions, nodeHandlers: Handlers = {}) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    const ruleHelper = new RuleHelper({});
    Object.keys(nodeHandlers).forEach(nodeType => {
        const nodeHandler = nodeHandlers[nodeType];
        const wrappedNodeHandler = (node: TxtNode | TxtParentNode) => {
            if (ruleHelper.isChildNode(node, ignoreNodeTypes)) {
                return;
            }
            return nodeHandler(node);
        };
        nodeHandlers[nodeType] = wrappedNodeHandler
    });
    return nodeHandlers;
}
