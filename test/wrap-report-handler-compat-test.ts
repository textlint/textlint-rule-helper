// LICENSE : MIT
import assert from "assert";
import { StructuredSource } from "structured-source";
import { AnyTxtNode, ASTNodeTypes, TxtNodeType } from "@textlint/ast-node-types";
import type { TextlintRuleContext, TextlintRuleError } from "@textlint/types";
import { TextlintKernel, TextlintRuleModule } from "@textlint/kernel";
import { IgnoreNodeManager, RuleHelper, wrapReportHandler } from "../src";
import { builtInPlugins } from "./textlint-helper";

/**
 * wrapReportHandler of textlint-rule-helper 2.5.0.
 * It is the reference to check that the current implementation does not change the results.
 */
function wrapReportHandler_2_5_0(
    context: Readonly<TextlintRuleContext>,
    options: { ignoreNodeTypes: TxtNodeType[] },
    handler: (report: (node: AnyTxtNode, ruleError: TextlintRuleError) => void) => any
) {
    const ignoreNodeTypes = options.ignoreNodeTypes || [];
    const ignoreNodeManager = new IgnoreNodeManager();
    const ruleHelper = new RuleHelper(context);
    const source = new StructuredSource(context.getSource());
    const toAbsoluteLocation = (node: AnyTxtNode, padding: any) => {
        const line = node.loc.start.line;
        const column = node.loc.start.column;
        if (padding.index !== undefined) {
            return node.range[0] + padding.index;
        }
        if (padding.line !== undefined && padding.column !== undefined) {
            return source.positionToIndex({
                line: line + padding.line,
                column: padding.column > 0 ? padding.column : column
            });
        }
        if (padding.line !== undefined && padding.line > 0) {
            return source.positionToIndex({ line: line + padding.line, column });
        }
        return node.range[0];
    };
    const reportIfUnignored = (node: AnyTxtNode, ruleError: TextlintRuleError) => {
        if (ignoreNodeManager.isIgnoredIndex(toAbsoluteLocation(node, ruleError))) {
            return;
        }
        return context.report(node, ruleError);
    };
    const handlers = handler(reportIfUnignored);
    Object.keys(handlers).forEach(nodeType => {
        const nodeHandler = handlers[nodeType];
        handlers[nodeType] = (node: AnyTxtNode) => {
            ignoreNodeManager.ignoreChildrenByTypes(node, ignoreNodeTypes);
            const parentsTypes = ruleHelper.getParents(node).map(parent => parent.type);
            if (ignoreNodeTypes.some(type => parentsTypes.some(parentType => parentType === type))) {
                return;
            }
            if (!nodeHandler) {
                return;
            }
            return nodeHandler(node);
        };
    });
    return handlers;
}

const text = `# Header with \`code\` and [link](https://example.com)

This is **strong \`code\` text** and *emphasis*. Another \`code\` here.
Second line with [link **strong**](https://example.com) and \`x\`.

> BlockQuote with \`code\`
> - list in quote

- item \`a\`
    - nested **b** item
- item [c](https://example.com)

| table | \`cell\` |
| --- | --- |
| **x** | y |

\`\`\`js
code block
\`\`\`

![img](https://example.com/img.png) text after image.

[^1]: footnote with \`code\`
`;

type Wrap = typeof wrapReportHandler_2_5_0;
// Report errors with various paddings from every node, on enter and on exit
const createRule = (wrap: Wrap, ignoreNodeTypes: TxtNodeType[]): TextlintRuleModule => {
    return (context) => {
        const { RuleError } = context;
        return wrap(context, { ignoreNodeTypes }, (report) => {
            const reportAll = (node: AnyTxtNode, phase: string) => {
                const length = node.range[1] - node.range[0];
                for (let index = 0; index < length; index += 3) {
                    report(node, new RuleError(`${phase}:${node.type}:index:${index}`, { index }));
                }
                report(node, new RuleError(`${phase}:${node.type}:none`));
                report(node, new RuleError(`${phase}:${node.type}:line`, { line: 1 }));
                report(node, new RuleError(`${phase}:${node.type}:line-column`, { line: 0, column: 4 }));
            };
            const handlers: Record<string, (node: AnyTxtNode) => void> = {};
            Object.keys(ASTNodeTypes).forEach((type) => {
                if (type.endsWith("Exit")) {
                    return;
                }
                handlers[type] = (node) => reportAll(node, "enter");
                handlers[`${type}:exit`] = (node) => reportAll(node, "exit");
            });
            return handlers;
        });
    };
};

const lint = async (wrap: Wrap, ignoreNodeTypes: TxtNodeType[]) => {
    const result = await new TextlintKernel().lintText(text, {
        ext: ".md",
        rules: [{ ruleId: "test", rule: createRule(wrap, ignoreNodeTypes) }],
        plugins: builtInPlugins
    });
    return result.messages.map((message) => `${message.range[0]}:${message.message}`);
};

describe("wrapReportHandler compatibility with 2.5.0", () => {
    const cases: TxtNodeType[][] = [
        [],
        [ASTNodeTypes.Code],
        [ASTNodeTypes.Code, ASTNodeTypes.Link],
        [ASTNodeTypes.Strong, ASTNodeTypes.BlockQuote],
        [ASTNodeTypes.ListItem, ASTNodeTypes.Image, ASTNodeTypes.CodeBlock],
        [ASTNodeTypes.Paragraph],
        [ASTNodeTypes.Document]
    ];
    cases.forEach((ignoreNodeTypes) => {
        it(`should report the same errors with ignoreNodeTypes: ${JSON.stringify(ignoreNodeTypes)}`, async () => {
            const expected = await lint(wrapReportHandler_2_5_0, ignoreNodeTypes);
            const actual = await lint(wrapReportHandler as Wrap, ignoreNodeTypes);
            assert.ok(expected.length > 0 || ignoreNodeTypes.includes(ASTNodeTypes.Document));
            assert.deepStrictEqual(actual, expected);
        });
    });
});
