# textlint-rule-helper

- [ ] Write a project description

## Installation

```
npm install
# watch
npm run watch
# build
npm run build
# test
npm run test
```

## Usage


  <a name="RuleHelper"></a>
####class: RuleHelper
**Members**

* [class: RuleHelper](#RuleHelper)
  * [new RuleHelper()](#new_RuleHelper)
  * [ruleHelper.getParents(node)](#RuleHelper#getParents)
  * [ruleHelper.isChildNode(node, types)](#RuleHelper#isChildNode)

<a name="new_RuleHelper"></a>
#####new RuleHelper()
RuleHelper is helper class for textlint.

<a name="RuleHelper#getParents"></a>
#####ruleHelper.getParents(node)
Get parents of node.
The parent nodes are returned in order from the closest parent to the outer ones.
`node` is not contained in the results.

**Params**

- node `TxtNode` - the node is start point.  

**Returns**: `Array.<TxtNode>`  
<a name="RuleHelper#isChildNode"></a>
#####ruleHelper.isChildNode(node, types)
Return true if `node` is wrapped any one of node `types`.

**Params**

- node `TxtNode` - is target node  
- types `Array.<string>` - are wrapped target node  

**Returns**: `boolean`  

  <a name="RuleHelper#getParents"></a>
####ruleHelper.getParents(node)
Get parents of node.
The parent nodes are returned in order from the closest parent to the outer ones.
`node` is not contained in the results.

**Params**

- node `TxtNode` - the node is start point.  

**Returns**: `Array.<TxtNode>`  

  <a name="RuleHelper#isChildNode"></a>
####ruleHelper.isChildNode(node, types)
Return true if `node` is wrapped any one of node `types`.

**Params**

- node `TxtNode` - is target node  
- types `Array.<string>` - are wrapped target node  

**Returns**: `boolean`  


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT