export class Notifier {
  constructor(channels) {
    this.channels = channels;
  }
  async send(message, names) {
    const attempts = [];
    for (const name of names) {
      const channel = this.channels[name];
      try {
        attempts.push({ name, ok: true, detail: await channel(message) });
        return { status: "sent", via: name, attempts };
      } catch (error) {
        attempts.push({ name, ok: false, detail: error.message });
      }
    }
    return { status: "failed", attempts };
  }
}

export async function demo() {
  let sms = 0;
  const notifier = new Notifier({
    email: async () => { throw new Error("down"); },
    sms: async () => {
      sms += 1;
      if (sms < 2) throw new Error("busy");
      return "sms-id";
    },
    push: async () => "push-id",
  });
  const failed = await notifier.send("hi", ["email"]);
  if (failed.status !== "failed") throw new Error("no fallback");
  const sent = await notifier.send("hi", ["email", "sms", "sms", "push"]);
  if (sent.via !== "sms" || sent.attempts.length !== 3) throw new Error("retry then success");
}

if (import.meta.main) await demo();
