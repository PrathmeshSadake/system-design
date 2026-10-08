import { Arrow, Box, Diagram, Group, Label, Line, Traveler, path, tones, type Tone } from "./primitives";

type Entry = { account: string; amount: string; tone: Tone };

function EntryTable({ x, title, entries }: { x: number; title: string; entries: Entry[] }) {
  const rowY = (i: number) => 80 + i * 56;
  return (
    <g>
      <Group x={x} y={40} w={380} h={300} label={title} tone="slate" />
      {entries.map((e, i) => (
        <g key={e.account}>
          <Box x={x + 20} y={rowY(i)} w={180} h={46} label={e.account} tone="white" />
          <Box x={x + 210} y={rowY(i)} w={150} h={46} label={e.amount} tone={e.tone} />
        </g>
      ))}
      <Line d={path([x + 20, 254], [x + 360, 254])} color={tones.slate.stroke} width={2} />
      <Box x={x + 20} y={270} w={180} h={46} label="Adds up to" tone="slate" />
      <g className="blink">
        <Box x={x + 210} y={270} w={150} h={46} label="0" tone="slate" />
      </g>
    </g>
  );
}

function PaymentsDoubleEntry() {
  return (
    <Diagram
      id="payments-double-entry"
      width={860}
      height={410}
      title="Double-entry ledger entries always add up to zero"
      description="Transaction one: Sam's wallet goes down 500 cents and Ana's wallet goes up 500 cents, which adds up to zero. Transaction two: Kim's wallet goes down 2,000 cents, the book shop goes up 1,940 cents and our fees go up 60 cents, which also adds up to zero."
      caption="Amounts are whole cents. Money only moves between accounts, so every transaction sums to zero."
    >
      <EntryTable
        x={36}
        title="T1: Sam gives Ana 5 dollars"
        entries={[
          { account: "Sam's wallet", amount: "-500 cents", tone: "rose" },
          { account: "Ana's wallet", amount: "+500 cents", tone: "mint" },
        ]}
      />
      <EntryTable
        x={444}
        title="T2: Kim buys a 20 dollar book"
        entries={[
          { account: "Kim's wallet", amount: "-2,000 cents", tone: "rose" },
          { account: "Book shop", amount: "+1,940 cents", tone: "mint" },
          { account: "Our fees", amount: "+60 cents", tone: "mint" },
        ]}
      />
      <Label x={430} y={372} text="If any transaction does not add up to zero, something is broken." size={14} />
    </Diagram>
  );
}

function PaymentsIdempotency() {
  const a1 = path([260, 115], [350, 115]);
  const a2 = path([550, 115], [640, 115]);
  const lost = path([740, 150], [740, 185], [160, 185], [160, 150]);
  const b1 = path([260, 341], [350, 341]);
  const saved = path([450, 376], [450, 410], [160, 410], [160, 376]);
  return (
    <Diagram
      id="payments-idempotency"
      width={900}
      height={490}
      title="A retry with the same key returns the saved answer"
      description="First try: the phone sends pay 20 dollars with key A7. The server sees a new key, charges the card and saves the key with the result in the same transaction, but the reply is lost. Retry: the phone sends the same request with key A7 again. The server finds key A7, skips the charge and returns the saved result."
      caption="The key and the result are saved in the same transaction as the charge, so a retry can never charge twice."
    >
      <Group x={36} y={36} w={828} h={200} label="First try" tone="sky" />
      <Box x={60} y={80} w={200} h={70} label="Phone app" note={["pay 20 dollars", "key A7"]} tone="sun" />
      <Box x={350} y={80} w={200} h={70} label="Server" note={["key A7 is new,", "so do the work"]} tone="sky" />
      <Box x={640} y={80} w={200} h={70} label="Charge card" note={["save key A7 and", "result together"]} tone="mint" />
      <Arrow d={a1} tone="slate" />
      <Arrow d={a2} tone="slate" />
      <Arrow d={lost} tone="rose" dashed />
      <Label x={450} y={207} text="reply lost when the wifi drops" size={14} weight={600} color={tones.rose.text} />

      <Group x={36} y={262} w={828} h={190} label="Retry with the same key" tone="sky" />
      <Box x={60} y={306} w={200} h={70} label="Phone app" note={["pay 20 dollars", "key A7 again"]} tone="sun" />
      <Box x={350} y={306} w={200} h={70} label="Server" note={["seen key A7,", "load saved result"]} tone="sky" />
      <Box x={640} y={306} w={200} h={70} label="Charge card" note="skipped" tone="slate" dashed />
      <Arrow d={b1} tone="slate" />
      <Arrow d={saved} tone="mint" />
      <Label x={305} y={431} text="paid once, same receipt" size={14} weight={600} color={tones.mint.text} />

      <Traveler d={a1} dur={1.4} tone="sun" r={5} />
      <Traveler d={a2} dur={1.4} delay={0.7} tone="sun" r={5} />
      <Traveler d={lost} dur={3} delay={1.4} tone="rose" r={5} />
      <Traveler d={b1} dur={1.4} tone="sun" r={5} />
      <Traveler d={saved} dur={2.4} delay={0.7} tone="mint" r={5} />
    </Diagram>
  );
}

function PaymentsSaga() {
  const stepX = [60, 222, 384, 546, 708];
  const steps = [
    { label: "Fraud check", note: "looks safe", tone: "sky" as const, dashed: false },
    { label: "Authorize", note: "hold the money", tone: "sky" as const, dashed: false },
    { label: "Ledger", note: "write entries", tone: "sky" as const, dashed: false },
    { label: "Capture", note: ["take the money", "and it fails"], tone: "rose" as const, dashed: false },
    { label: "Notify", note: "never reached", tone: "slate" as const, dashed: true },
  ];
  const forward = [0, 1, 2].map((i) => path([stepX[i] + 132, 128], [stepX[i + 1], 128]));
  const toNotify = path([stepX[3] + 132, 128], [stepX[4], 128]);
  const undo1 = path([612, 166], [612, 342], [516, 342]);
  const undo2 = path([384, 342], [354, 342]);
  const undo3 = path([222, 342], [192, 342]);
  return (
    <Diagram
      id="payments-saga"
      width={900}
      height={440}
      title="A payment saga with an undo path"
      description="The orchestrator runs five steps in order: fraud check, authorize, write ledger entries, capture and notify, saving its progress after each one. Capture fails, so notify is never reached. The orchestrator then runs compensations in reverse order: reverse the ledger entries with new entries, void the hold on the money, and tell the customer the payment failed."
      caption="Every finished step has a matching undo step. The undo steps run in reverse order, newest first."
    >
      <Group x={36} y={36} w={828} h={156} label="Orchestrator: run each step in order and save progress" tone="sky" />
      {steps.map((s, i) => (
        <Box key={s.label} x={stepX[i]} y={90} w={132} h={76} label={s.label} note={s.note} tone={s.tone} dashed={s.dashed} />
      ))}
      {forward.map((d) => (
        <Arrow key={d} d={d} tone="sky" />
      ))}
      <Arrow d={toNotify} tone="slate" dashed />

      <Group x={36} y={250} w={828} h={150} label="Compensations: undo finished steps, newest first, then tell the customer" tone="rose" />
      <Box x={60} y={304} w={132} h={76} label={["Tell the", "customer"]} note="payment failed" tone="slate" />
      <Box x={222} y={304} w={132} h={76} label="Void" note={["release", "the hold"]} tone="rose" />
      <Box x={384} y={304} w={132} h={76} label="Reverse" note={["new entries", "cancel it"]} tone="rose" />
      <Arrow d={undo1} tone="rose" dashed />
      <Arrow d={undo2} tone="rose" dashed />
      <Arrow d={undo3} tone="rose" dashed />
      <Label x={624} y={222} text="on failure" anchor="start" size={14} weight={600} color={tones.rose.text} />

      {forward.map((d, i) => (
        <Traveler key={d} d={d} dur={1.2} delay={i * 0.6} tone="sky" r={5} />
      ))}
      <Traveler d={undo1} dur={2.4} tone="rose" r={5} />
      <Traveler d={undo2} dur={1} delay={0.4} tone="rose" r={5} />
      <Traveler d={undo3} dur={1} delay={0.8} tone="rose" r={5} />
    </Diagram>
  );
}

function PaymentsReconciliation() {
  const rows = [
    { id: "Payment 101", ours: "2,000 cents", bank: "2,000 cents", result: "Match", tone: "mint" as const },
    { id: "Payment 102", ours: "500 cents", bank: "500 cents", result: "Match", tone: "mint" as const },
    { id: "Payment 103", ours: "1,250 cents", bank: null, result: "Missing at bank", tone: "rose" as const },
    { id: "Payment 104", ours: "900 cents", bank: "990 cents", result: "Amounts differ", tone: "sun" as const },
  ];
  const rowY = (i: number) => 84 + i * 70;
  return (
    <Diagram
      id="payments-reconciliation"
      width={860}
      height={420}
      title="Reconciling our ledger with the bank's file"
      description="Four payments in our ledger are compared with the bank's settlement file. Payments 101 and 102 match. Payment 103 is missing from the bank file. Payment 104 shows 900 cents in our ledger but 990 cents at the bank, so the amounts differ."
      caption="Mismatches are looked into and fixed with new ledger entries, never by editing old ones."
    >
      <Label x={150} y={50} text="Our ledger" size={15} weight={700} color={tones.slate.text} />
      <Label x={430} y={50} text="Result" size={15} weight={700} color={tones.slate.text} />
      <Label x={710} y={50} text="Bank settlement file" size={15} weight={700} color={tones.slate.text} />
      {rows.map((r, i) => {
        const y = rowY(i);
        const left = path([260, y + 25], [340, y + 25]);
        const right = path([600, y + 25], [520, y + 25]);
        return (
          <g key={r.id}>
            <Box x={40} y={y} w={220} h={50} label={r.id} note={r.ours} tone="white" />
            {r.bank ? (
              <Box x={600} y={y} w={220} h={50} label={r.id} note={r.bank} tone="white" />
            ) : (
              <Box x={600} y={y} w={220} h={50} label="Not listed" note="no such payment" tone="slate" dashed />
            )}
            <g className={r.tone === "mint" ? undefined : "blink"}>
              <Box x={340} y={y} w={180} h={50} label={r.result} tone={r.tone} />
            </g>
            <Arrow d={left} tone="slate" />
            <Arrow d={right} tone="slate" />
          </g>
        );
      })}
      <Label x={430} y={384} text="This runs every day, so small problems are caught early." size={14} />
    </Diagram>
  );
}

export const paymentsDiagrams = {
  "payments-double-entry": PaymentsDoubleEntry,
  "payments-idempotency": PaymentsIdempotency,
  "payments-saga": PaymentsSaga,
  "payments-reconciliation": PaymentsReconciliation,
};
