// A client that waits for the limiter, then retries with exponential backoff.

export class ApiClient {
  constructor({ limiter, request, maxAttempts = 3, baseDelay = 10, sleep = async () => {} }) {
    this.limiter = limiter;
    this.request = request;
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.sleep = sleep;
    this.now = 0;
  }
  async call(key, input) {
    let attempt = 0;
    let last;
    while (attempt < this.maxAttempts) {
      attempt += 1;
      if (!this.limiter.allow(key, this.now)) {
        last = new Error("limited");
      } else {
        try {
          return await this.request(input);
        } catch (err) {
          last = err;
        }
      }
      const delay = this.baseDelay * 2 ** (attempt - 1);
      this.now += delay;
      await this.sleep(delay);
    }
    throw last;
  }
}

export function demo() {
  let calls = 0;
  const client = new ApiClient({
    limiter: { allow: () => true },
    request: async () => {
      calls += 1;
      if (calls < 3) throw new Error("flaky");
      return "ok";
    },
  });
  return client.call("user", "ping").then((result) => {
    if (result !== "ok" || calls !== 3) throw new Error(`${result} ${calls}`);
  });
}

if (import.meta.main) demo();
