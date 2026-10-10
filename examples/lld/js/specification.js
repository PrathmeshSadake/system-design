// A rule is an object. Rules can be combined: old enough, and a member.

export class AtLeast {
  constructor(years) { this.years = years; }
  ok(person) { return person.years >= this.years; }
}

export class Member {
  ok(person) { return person.member === true; }
}

export class And {
  constructor(left, right) { this.left = left; this.right = right; }
  ok(person) { return this.left.ok(person) && this.right.ok(person); }
}

export function demo() {
  const rule = new And(new AtLeast(10), new Member());
  if (!rule.ok({ years: 12, member: true })) throw new Error("allowed");
  if (rule.ok({ years: 12, member: false })) throw new Error("not a member");
  if (rule.ok({ years: 8, member: true })) throw new Error("too young");
}

if (import.meta.main) demo();
