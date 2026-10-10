// Each consumer group gets one copy. Inside a group, consumers take turns.

export class Broker {
  constructor() {
    this.groups = new Map();
  }
  subscribe(topic, group, consumer, handler) {
    const key = `${topic}:${group}`;
    if (!this.groups.has(key)) this.groups.set(key, { cursor: 0, members: [] });
    this.groups.get(key).members.push({ consumer, handler });
  }
  publish(topic, message) {
    const delivered = [];
    for (const [key, group] of this.groups) {
      if (!key.startsWith(`${topic}:`)) continue;
      if (group.members.length === 0) continue;
      const member = group.members[group.cursor % group.members.length];
      group.cursor += 1;
      delivered.push(member.handler(message));
    }
    return delivered;
  }
}

export function demo() {
  const broker = new Broker();
  const seen = [];
  broker.subscribe("news", "email", "a", (message) => seen.push(`a ${message}`));
  broker.subscribe("news", "email", "b", (message) => seen.push(`b ${message}`));
  broker.subscribe("news", "audit", "c", (message) => seen.push(`c ${message}`));
  broker.publish("news", "one");
  broker.publish("news", "two");
  if (seen.join(",") !== "a one,c one,b two,c two") throw new Error(seen.join(","));
}

if (import.meta.main) demo();
