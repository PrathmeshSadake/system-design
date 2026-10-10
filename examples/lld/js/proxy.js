// A stand-in checks the badge before it lets you open the real door.

export class Vault {
  open() { return "jewels"; }
}

export class Guard {
  constructor(vault, allowed) {
    this.vault = vault;
    this.allowed = allowed;
  }
  open(badge) {
    if (!this.allowed.has(badge)) throw new Error("no entry");
    return this.vault.open();
  }
}

export function demo() {
  const guard = new Guard(new Vault(), new Set(["gold"]));
  if (guard.open("gold") !== "jewels") throw new Error("allowed");
  let blocked = false;
  try { guard.open("tin"); } catch { blocked = true; }
  if (!blocked) throw new Error("stranger must be stopped");
}

if (import.meta.main) demo();
