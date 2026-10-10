export class Workflow {
  constructor(steps) {
    this.steps = steps.map((step) => ({ ...step, status: "pending", tries: 0 }));
  }
  ready() {
    return this.steps.filter((step) => step.status === "pending" && step.needs.every((id) => this.by(id).status === "done"));
  }
  run(id) {
    const step = this.by(id);
    if (!this.ready().includes(step)) throw new Error("blocked");
    step.tries += 1;
    try {
      step.work();
      step.status = "done";
    } catch (error) {
      step.status = "failed";
      step.error = error.message;
    }
    return step.status;
  }
  retry(id) {
    const step = this.by(id);
    if (step.status !== "failed") throw new Error("not failed");
    step.status = "pending";
  }
  by(id) {
    const step = this.steps.find((row) => row.id === id);
    if (!step) throw new Error("missing");
    return step;
  }
}

export function demo() {
  let pay = 0;
  const flow = new Workflow([
    { id: "reserve", needs: [], work() {} },
    { id: "pay", needs: ["reserve"], work() { pay += 1; if (pay < 2) throw new Error("bank"); } },
    { id: "ship", needs: ["pay"], work() {} },
  ]);
  if (flow.ready().map((step) => step.id).join(",") !== "reserve") throw new Error("deps");
  flow.run("reserve");
  if (flow.run("pay") !== "failed") throw new Error("first pay fails");
  let blocked = false;
  try { flow.run("ship"); } catch { blocked = true; }
  if (!blocked) throw new Error("ship waits");
  flow.retry("pay");
  if (flow.run("pay") !== "done" || flow.run("ship") !== "done") throw new Error("recovered");
}

if (import.meta.main) demo();
