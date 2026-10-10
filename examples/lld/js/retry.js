export async function retry(work, attempts, delayFor) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await work(attempt);
    } catch (error) {
      last = error;
      if (attempt < attempts) await delayFor(attempt);
    }
  }
  throw last;
}

export async function demo() {
  const waits = [];
  let calls = 0;
  const value = await retry(
    (attempt) => {
      calls += 1;
      if (attempt < 3) throw new Error("no");
      return "yes";
    },
    3,
    async (attempt) => { waits.push(10 * 2 ** (attempt - 1)); },
  );
  if (value !== "yes" || calls !== 3 || waits.join(",") !== "10,20") throw new Error("backoff");
}

if (import.meta.main) await demo();
