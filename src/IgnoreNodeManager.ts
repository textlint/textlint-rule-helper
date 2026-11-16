// LICENSE : MIT
"use strict";
import { TxtNode, TxtNodeRange, TxtNodeType, TxtParentNode } from "@textlint/ast-node-types"

/**
 * Ignore node manager that manager ignored ranges.
 *
 */
export default class IgnoreNodeManager {
    private _ignoredRangeList: TxtNodeRange[];

    constructor() {
        /**
         * @type {[number,number][]}
         * @private
         */
        this._ignoredRangeList = []
    }

    /**
     * @returns {(number)[][]}
     */
    get ignoredRanges() {
        return this._ignoredRangeList;
    }

    /**
     * |.......|
     * ^       ^
     * Ignored Range
     *
     *    |........|
     *    ^
     *  index
     * @param {number} index
     * @returns {boolean}
     */
    isIgnoredIndex(index: number) {
        const ranges = this._ignoredRangeList;
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            if (range[0] <= index && index < range[1]) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {[number, number]} aRange
     * @returns {boolean}
     * @deprecated This method will be removed
     */
    isIgnoredRange(aRange: TxtNodeRange) {
        return this.isIgnoredIndex(aRange[0]) || this.isIgnoredIndex(aRange[1]);
    }

    /**
     * @param {Object} node
     * @returns {boolean}
     */
    isIgnored(node: TxtNode | TxtParentNode) {
        return this.isIgnoredRange(node.range);
    }

    /**
     * add node to ignore range list
     * @param {TxtNode} node
     */
    ignore(node: TxtNode | TxtParentNode) {
        this.ignoreRange(node.range);
    }

    /**
     * add range to ignore range list
     * @param {[number, number]} range
     */
    ignoreRange(range: TxtNodeRange) {
        this._ignoredRangeList.push(range);
    }

    /**
     * ignore children node of `node`,
     * if the children node has the type that is included in `ignoredNodeTypes`.
     * @param {TxtNode} targetNode
     * @param {string[]} ignoredNodeTypes
     */
    ignoreChildrenByTypes(targetNode: TxtNode | TxtParentNode, ignoredNodeTypes: TxtNodeType[]) {
        // Visit `targetNode` and all its descendants in pre-order, like unist-util-visit
        const visit = (visitedNode: TxtNode | TxtParentNode): void => {
            if (ignoredNodeTypes.includes(visitedNode.type)) {
                this.ignore(visitedNode);
            }
            const children = (visitedNode as TxtParentNode).children;
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    visit(children[i]);
                }
            }
        };
        visit(targetNode);
    }
}
