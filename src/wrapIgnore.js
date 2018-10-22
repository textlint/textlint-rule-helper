// MIT © 2018 azu
"use strict";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import RuleHelper from "./textlint-rule-helper.js";

/**
 * @param {{ignoreNodeTypes:ASTNodeTypes[]}} options
 * @param {object} nodeHandlers
 */
export function wrap(options, nodeHandlers = {}) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    const ruleHelper = new RuleHelper({});
    Object.keys(nodeHandlers).forEach(nodeType => {
        const nodeHandler = nodeHandlers[nodeType];
        const wrappedNodeHandler = (node) => {
            if (ruleHelper.isChildNode(node, ignoreNodeTypes)) {
                return;
            }
            return nodeHandler(node);
        };
        nodeHandlers[nodeType] = wrappedNodeHandler
    });
    return nodeHandlers;
}
