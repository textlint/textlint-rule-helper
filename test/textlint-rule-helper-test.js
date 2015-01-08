// LICENSE : MIT
"use strict";
import support from 'source-map-support'
support.install();

import assert from 'power-assert'
import {RuleHelper} from "../lib/textlint-rule-helper.js";
describe("textlint-rule-helper-test", function () {
    it("test", ()=> {
        var helper = new RuleHelper();
        assert.equal(helper.add(1, 2), 1);
    });
});