# textlint-rule-helper

This is helper library for creating [textlint](https://github.com/azu/textlint "textlint") rule.

## Installation

```
npm install textlint-rule-helper
```

## Usage - API


  **Example**  
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

* [textlint-rule-helper](#module_textlint-rule-helper)
  * [.RuleHelper](#module_textlint-rule-helper.RuleHelper) → <code>RuleHelper</code>
  * [class: ~RuleHelper](#module_textlint-rule-helper..RuleHelper)
    * [new RuleHelper()](#new_module_textlint-rule-helper..RuleHelper_new)
    * [ruleHelper.getParents(node)](#module_textlint-rule-helper..RuleHelper#getParents) ⇒ <code>[Array.&lt;TxtNode&gt;](https://github.com/azu/textlint)</code>
    * [ruleHelper.isChildNode(node, types)](#module_textlint-rule-helper..RuleHelper#isChildNode) ⇒ <code>boolean</code>

<a name="module_textlint-rule-helper.RuleHelper"></a>
####textlint-rule-helper.RuleHelper → <code>RuleHelper</code>
Exposes the RuleHelper class

<a name="module_textlint-rule-helper..RuleHelper"></a>
####class: textlint-rule-helper~RuleHelper

* [class: ~RuleHelper](#module_textlint-rule-helper..RuleHelper)
  * [new RuleHelper()](#new_module_textlint-rule-helper..RuleHelper_new)
  * [ruleHelper.getParents(node)](#module_textlint-rule-helper..RuleHelper#getParents) ⇒ <code>[Array.&lt;TxtNode&gt;](https://github.com/azu/textlint)</code>
  * [ruleHelper.isChildNode(node, types)](#module_textlint-rule-helper..RuleHelper#isChildNode) ⇒ <code>boolean</code>

<a name="new_module_textlint-rule-helper..RuleHelper_new"></a>
#####new RuleHelper()
RuleHelper is helper class for textlint.

<a name="module_textlint-rule-helper..RuleHelper#getParents"></a>
#####ruleHelper.getParents(node) ⇒ <code>[Array.&lt;TxtNode&gt;](https://github.com/azu/textlint)</code>
Get parents of node.
The parent nodes are returned in order from the closest parent to the outer ones.
[node](node) is not contained in the results.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>[TxtNode](https://github.com/azu/textlint)</code> | the node is start point. |

<a name="module_textlint-rule-helper..RuleHelper#isChildNode"></a>
#####ruleHelper.isChildNode(node, types) ⇒ <code>boolean</code>
Return true if `node` is wrapped any one of node [types](types).

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>[TxtNode](https://github.com/azu/textlint)</code> | is target node |
| types | <code>Array.&lt;string&gt;</code> | are wrapped target node |




## Development

```
# watch
npm run watch
# build
npm run build
# test
npm run test
# Generate README from tempalte
npm run docs
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT