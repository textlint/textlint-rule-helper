# textlint-rule-helper

This is helper library for creating [textlint](https://github.com/azu/textlint "textlint") rule.

## Installation

```
npm install textlint-rule-helper
```

## Usage - API

{{optionSet "heading-depth" 3 ~}}
{{#module name="textlint-rule-helper"}}
  {{>docs~}}
{{/module}}


## Example

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