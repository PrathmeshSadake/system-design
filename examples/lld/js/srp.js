// One class adds the bill. Another prints it. Two reasons to change, two classes.

export class Bill {
  constructor(lines) {
    this.lines = lines;
  }
  total() {
    return this.lines.reduce((sum, line) => sum + line.cents, 0);
  }
}

export class ReceiptPrinter {
  print(bill) {
    const rows = bill.lines.map((line) => `${line.name} ${line.cents}`);
    return [...rows, `total ${bill.total()}`].join("\n");
  }
}

export function demo() {
  const bill = new Bill([{ name: "milk", cents: 80 }, { name: "bread", cents: 50 }]);
  const text = new ReceiptPrinter().print(bill);
  if (bill.total() !== 130 || !text.includes("total 130")) throw new Error(text);
}

if (import.meta.main) demo();
