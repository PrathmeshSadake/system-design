import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-commerce",
  kind: "lld",
  title: "Cart, inventory, orders, and coupons",
  short: "Hold the mug, then pay, then ship. A coupon is a rule, not a scattered discount.",
  bigIdea:
    "A shop is four small machines. Inventory remembers what is on the shelf and what is promised. The cart remembers what the shopper picked and the price they saw. The order remembers how far the purchase has gone. The coupon engine decides which discounts may stack. Mix them into one class and every rule becomes a special case.",
  sections: [
    {
      id: "inventory",
      name: "Inventory Management",
      simple: "Two mugs on the shelf. If both are promised, the shelf looks empty even though they are still there",
      example: "inventory",
      body: [
        "A row has onHand and held. available is onHand minus held. reserve increases held if the quantity fits and the hold id is new. commit turns a hold into a real sale: held and onHand both drop. release drops held only, so the mugs return to the shelf.",
        "The demo reserves both mugs, refuses a second hold, releases, reserves one, commits, and expects one available. That is the whole consistency story.",
        "onHand is the warehouse. held is promises. If you only decrement onHand at reserve, a cancelled order has to guess how to put stock back, and a crash loses the reason.",
      ],
      useWhen: ["Two shoppers can want the last item, or an order can be abandoned."],
      skipWhen: ["Stock never races and orders never cancel. A single integer is enough, and you can name held as the upgrade."],
      questions: [
        "What is the invariant? held is never above onHand, and available is never negative.",
        "Pitfall: committing without a hold, which sells a mug nobody reserved and races the person who did.",
      ],
      remember: "available = onHand - held. Commit removes both. Release removes only the promise.",
    },
    {
      id: "inventory-reservations",
      name: "Inventory Reservations and Stock Consistency",
      simple: "A name tag on the mug means nobody else may take it, until you buy it or put the tag back",
      body: [
        "The hold id is the order's id. Reserving twice with the same id throws, so a retry does not double-hold. That is a small idempotency rule. A fuller one would return the existing hold.",
        "Nothing here is a database transaction. The methods mutate one row only after the checks. If you later split rows across services, this method is the boundary you wrap in a transaction or a conditional update.",
        "Say what you did not build: expiry of holds. It is the movie-seat clock applied to held. A sweeper would release holds older than a deadline.",
      ],
      useWhen: ["They ask how two checkouts cannot sell the last mug."],
      skipWhen: ["They want a distributed lock lecture. The numbers on the row are the design. The lock is one way to protect them."],
      questions: [
        "Why both onHand and held? So you can tell 'sold' from 'promised' and undo a promise without inventing stock.",
        "Pitfall: available computed from a cache that forgot a hold.",
      ],
      remember: "A hold id spends availability. Commit spends stock. Release gives availability back.",
    },
    {
      id: "shopping-cart",
      name: "E-Commerce Shopping Cart",
      simple: "A basket that remembers the price written on the shelf when you put the thing in",
      figure: "shopping-basket",
      example: "shopping-cart",
      body: [
        "A line is a sku, a price in cents, and a quantity. add increases quantity. If the same sku arrives with a different price, the cart refuses, because silently changing the price under a shopper is a bug you should show.",
        "setQty to zero removes the line. total is the sum of price times quantity. The demo adds two mugs and a tea, checks 1300 cents, removes the tea, and checks 1000.",
        "The cart does not know about stock. It can be optimistic. Inventory is asked at reserve time. That split keeps the basket usable while the shopper is still deciding.",
      ],
      useWhen: ["The shopper collects lines before anyone pays."],
      skipWhen: ["Buy-now with one item. You can still use one line, but do not design wish lists."],
      questions: [
        "Whose price is on the line? The price at add time. Repricing is an explicit action.",
        "Pitfall: storing a float dollar amount and summing it.",
      ],
      remember: "Lines hold a price snapshot. Total is integer cents. Stock is not the cart's job.",
    },
    {
      id: "order-management",
      name: "Order Management",
      simple: "The basket becomes a ticket that can be paid, shipped, and delivered",
      example: "order-management",
      body: [
        "checkout copies the cart's lines and total into an order in the placed state. The order then follows a table: placed to paid or cancelled, paid to shipped or cancelled, shipped to delivered. Delivered and cancelled stop.",
        "Copy the lines. If the shopper edits the cart later, the order must not change. The demo pays, ships, refuses cancel, then delivers.",
        "Inventory commit belongs next to paid, or next to placed, depending on the business. Say when you decrement. A common choice is reserve at checkout and commit at paid.",
      ],
      useWhen: ["A purchase has a life after the cart: pay, ship, cancel."],
      skipWhen: ["They only wanted the cart total. An order class with no transitions is an extra noun."],
      questions: [
        "Why copy lines? The cart is a draft. The order is a fact.",
        "Pitfall: cancelling after ship because the table and the story disagreed.",
      ],
      remember: "Checkout freezes the lines. Status moves only along the table.",
    },
    {
      id: "coupon-engine",
      name: "Coupon and Discount Engine",
      simple: "Stickers with rules. Some stickers only work if you spent enough, or if you are new",
      example: "coupon",
      body: [
        "A rule has a code, a kind (percent or flat), the numbers, and an eligible function of facts such as the subtotal and whether the customer is new. price walks the codes the shopper typed, keeps the eligible ones, and applies them in a fixed order.",
        "Percent is applied to the running total with integer floor division. Flat cents are subtracted after, and the total never goes below zero.",
        "The demo's TEN needs 1000 cents, FIVE is always eligible, SAVE2 needs a new customer. On a 2000 cent basket the result is TEN and SAVE2.",
      ],
      useWhen: ["Discounts have conditions and more than one kind."],
      skipWhen: ["One sale price. Multiply by a constant. A rules engine for a single sticker is noise."],
      questions: [
        "What is a fact? The data a rule may see. Pass a small object, not the whole cart class, so rules stay pure.",
        "Pitfall: percent of a float, then adding flats, then rounding once at the end and drifting a cent.",
      ],
      remember: "Rules are data plus a predicate. Money stays in integer cents.",
    },
    {
      id: "coupon-stacking",
      name: "Coupon Stacking and Eligibility",
      simple: "You may use the best percent sticker and the flat stickers. Two percent stickers do not pile up",
      body: [
        "Eligibility runs first. A code that fails its predicate is ignored, not an error, in this model. You could collect reasons instead if the screen must explain the rejection.",
        "Among percent rules, keep the highest percent. Keep every eligible flat rule. That is the stacking policy. Another shop might allow one coupon total. The policy is the class you would swap.",
        "Order of application matters. Percent first, then flats, matches '10 percent off, then 200 cents off'. The demo expects 1600 cents from 2000.",
      ],
      useWhen: ["They ask whether codes combine."],
      skipWhen: ["One code. Skip the stacker and apply that rule if it is eligible."],
      questions: [
        "Which percent wins? The larger one. Say it. First-one-wins is a different policy.",
        "Pitfall: applying two percents because you forgot to collapse them, and discounting 10 then 5 on the remainder.",
      ],
      remember: "Drop ineligible codes. Keep one percent, the best. Then subtract flats.",
    },
  ],
  recap: [
    "Inventory separates stock from promises.",
    "The cart snapshots prices. The order freezes lines and moves through states.",
    "Coupons are eligible or not, and only one percent stacks with flats.",
  ],
  words: [
    { term: "Hold", meaning: "A reservation that reduces availability without reducing on-hand stock." },
    { term: "Snapshot", meaning: "The price and quantity copied onto a line so later edits do not rewrite history." },
    { term: "Stacking", meaning: "The rule for which discounts may apply together." },
  ],
};
