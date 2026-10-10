export class CouponEngine {
  constructor(rules) {
    this.rules = rules;
  }
  price(cents, codes, facts) {
    const eligible = [];
    for (const code of codes) {
      const rule = this.rules.get(code);
      if (rule && rule.eligible(facts)) eligible.push(rule);
    }
    const percents = eligible.filter((rule) => rule.kind === "percent").sort((a, b) => b.percent - a.percent);
    const chosen = [...(percents[0] ? [percents[0]] : []), ...eligible.filter((rule) => rule.kind === "flat")];
    let total = cents;
    for (const rule of chosen.filter((rule) => rule.kind === "percent")) {
      total = Math.floor(total * (100 - rule.percent) / 100);
    }
    for (const rule of chosen.filter((rule) => rule.kind === "flat")) {
      total = Math.max(0, total - rule.cents);
    }
    return { total, applied: chosen.map((rule) => rule.code) };
  }
}

export function demo() {
  const engine = new CouponEngine(new Map([
    ["TEN", { code: "TEN", kind: "percent", percent: 10, eligible: (facts) => facts.cents >= 1000 }],
    ["FIVE", { code: "FIVE", kind: "percent", percent: 5, eligible: () => true }],
    ["SAVE2", { code: "SAVE2", kind: "flat", cents: 200, eligible: (facts) => facts.newCustomer }],
  ]));
  const deal = engine.price(2000, ["FIVE", "TEN", "SAVE2"], { cents: 2000, newCustomer: true });
  if (deal.total !== 1600 || deal.applied.join(",") !== "TEN,SAVE2") throw new Error(JSON.stringify(deal));
  const small = engine.price(500, ["TEN"], { cents: 500, newCustomer: false });
  if (small.total !== 500) throw new Error("not eligible");
}

if (import.meta.main) demo();
