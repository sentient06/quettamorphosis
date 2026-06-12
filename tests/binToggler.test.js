import { describe, it, expect, beforeEach } from "vitest";
import { BinaryToggler, getRulesSindarinV } from "../src/binToggler.js";

describe('Binary toggler', () => {
  let rules, toggler;

  beforeEach(() => {
    rules = getRulesSindarinV(1, 0, 0);
    toggler = new BinaryToggler(rules);
  });

  it('should get all rules from v1.0.0', () => {
    expect(toggler.getAllRules().length).toEqual(204);
  });

  it('should get a single rule code', () => {
    expect(toggler.getRuleCode(2)).toEqual('1056240093');
  });

  it('should get rule state', () => {
    expect(toggler.getRuleState('1056240093')).toEqual(false);
  });

  it('should set rule state', () => {
    expect(toggler.getRuleState('1056240093')).toEqual(false);
    toggler.toggleRuleState('1056240093');
    expect(toggler.getRuleState('1056240093')).toEqual(true);
  });

  it('should get rule state code with all rules turned off', () => {
    expect(toggler.getRulesCode()).toEqual('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
  });

  it('should get rule state code with all rules turned on', () => {
    toggler.toggleRuleStateIndex(0,  203);
    expect(toggler.getRulesCode()).toEqual('/////////////////////////////////w8=');
  });

  it('should get rule state code with arbitrary rules turned on', () => {
    toggler.toggleRuleState('1056240093');
    toggler.toggleRuleState('1942165347');
    toggler.toggleRuleState('5800000118');
    const code = toggler.getRulesCode();
    // Round-trip: decode what we just encoded and verify the same rules are set
    const toggler2 = new BinaryToggler(rules);
    toggler2.setRulesFromCode(code);
    expect(toggler2.getRuleState('1056240093')).toEqual(true);
    expect(toggler2.getRuleState('1942165347')).toEqual(true);
    expect(toggler2.getRuleState('5800000118')).toEqual(true);
  });

  it('should recover the rules from code', () => {
    toggler.toggleRuleState('1056240093');
    toggler.toggleRuleState('1942165347');
    toggler.toggleRuleState('5800000118');
    const code = toggler.getRulesCode();
    const toggler2 = new BinaryToggler(rules);
    toggler2.setRulesFromCode(code);
    expect(toggler2.getRuleState('1056240093')).toEqual(true);
    expect(toggler2.getRuleState('1942165347')).toEqual(true);
    expect(toggler2.getRuleState('5800000118')).toEqual(true);
  });
});