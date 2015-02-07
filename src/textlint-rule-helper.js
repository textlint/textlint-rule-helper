// LICENSE : MIT
"use strict";
/**
@module textlint-rule-helper
@example
A rule for [textlint](https://github.com/azu/textlint "textlint").

```js
var RuleHelper = require("textlint-rule-helper").RuleHelper;
module.exports = function (context) {
    var helper = new RuleHelper(context);
    var exports = {}
    exports[context.Syntax.Str] = function(node){
        // parent nodes is any one Link or Image.
        if(helper.isChildNode(node, [context.Syntax.Link, context.Syntax.Image]){
            return;
        }
        // get Parents
        var parents = helper.getParents(node);
        
    }
    return exports;
}
```
*/

/**
 * RuleHelper is helper class for textlint.
 * @class RuleHelper
 */
export class RuleHelper {
    /**
     * Initialize RuleHelper with RuleContext object.
     * @param {RuleContext} ruleContext the ruleContext is context object of the rule.
     */
    constructor(ruleContext) {
        this.ruleContext = ruleContext;
    }

    /**
     * Get parents of node.
     * The parent nodes are returned in order from the closest parent to the outer ones.
     * {@link node} is not contained in the results.
     * @param {external:TxtNode} node the node is start point.
     * @returns {external:TxtNode[]}
     */
    getParents(node) {
        var result = [];
        var parent = node.parent;
        while (parent != null) {
            result.push(parent);
            parent = parent.parent;
        }
        return result;
    }

    /**
     * Return true if `node` is wrapped any one of node {@link types}.
     * @param {external:TxtNode} node is target node
     * @param {string[]} types are wrapped target node
     * @returns {boolean}
     */
    isChildNode(node, types) {
        var parents = this.getParents(node);
        var parentsTypes = parents.map(function (parent) {
            return parent.type;
        });
        return types.some(function (type) {
            return parentsTypes.some(function (parentType) {
                return parentType === type;
            });
        });
    }
}

/**
@external TxtNode
@see https://github.com/azu/textlint
*/
