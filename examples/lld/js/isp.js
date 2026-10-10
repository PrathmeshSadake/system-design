// A plain printer should not be forced to scan.

export class PlainPrinter {
  print(text) {
    return `printed ${text}`;
  }
}

export class Copier {
  constructor(printer) {
    this.printer = printer;
  }
  print(text) {
    return this.printer.print(text);
  }
  scan() {
    return "scanned";
  }
}

export function demo() {
  const printer = new PlainPrinter();
  if (printer.print("note") !== "printed note") throw new Error("print");
  if (typeof printer.scan === "function") throw new Error("plain printer must not scan");
  if (new Copier(printer).scan() !== "scanned") throw new Error("scan");
}

if (import.meta.main) demo();
