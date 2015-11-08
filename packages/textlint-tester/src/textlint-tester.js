// LICENSE : MIT
"use strict";
import {testValid, testInvalid} from "./test-util";
import {TextLintCore} from "textlint";
const describe = (typeof global.describe === "function") ? global.describe : function (text, method) {
    return method.apply(this);
};

const it = (typeof global.it === "function") ? global.it : function (text, method) {
    return method.apply(this);
};

export default class TextLintTester {
    testValidPattern(ruleName, rule, valid) {
        let text = valid.text || valid;
        let options = valid.options || {};
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            testValid(textlint, text);
        });
    }

    testInvalidPattern(ruleName, rule, invalid) {
        let text = invalid.text;
        let options = invalid.options || {};
        let errors = invalid.errors;
        var textlint = new TextLintCore();
        textlint.setupRules({
            [ruleName]: rule
        }, {
            [ruleName]: options
        });
        it(text, ()=> {
            testInvalid(textlint, text, errors);
        });
    }

    testState(ruleName, rule, valid, invliad) {
        let validListNoOptions = valid.filter(state => {
            return state.options === undefined;
        });
        let invalidListNoOptions = invliad.filter(state => {
            return state.options === undefined;
        });
        if (validListNoOptions.length === 0 || invalidListNoOptions.length === 0) {
            return;
        }
        it(`should reset state each time`, function () {
            // invalid -> valid using same textlint instance
            // it test that finish invalid test and should reset rule stat
            var textlint = new TextLintCore();
            textlint.setupRules({
                [ruleName]: rule
            }, {
                [ruleName]: true
            });
            invalidListNoOptions.forEach(state => {
                let text = state.text   ;
                testInvalid(textlint, text, state.errors)
            });
            validListNoOptions.forEach(state => {
                let text = state.text || state;
                testValid(textlint, text);
            });
        });
    }

    /**
     * run test for textlint rule.
     * @param {string} ruleName ruleName is name of thee rule
     * @param {Function} rule rule is the function of rule
     * @param {string[]|object[]} valid
     * @param {object[]} invalid
     */
    run(ruleName, rule, {valid=[], invalid=[]}) {
        describe(ruleName, ()=> {
            invalid.forEach(state => {
                this.testInvalidPattern(ruleName, rule, state);
            });
            valid.forEach(state => {
                this.testValidPattern(ruleName, rule, state);
            });
            this.testState(ruleName, rule, valid, invalid);
        });
    }
}