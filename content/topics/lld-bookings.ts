import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-bookings",
  kind: "lld",
  title: "Bookings",
  short: "A thing that can be held by only one person during one stretch of time.",
  bigIdea:
    "Libraries, movie seats, meeting rooms, hotel rooms, and restaurant tables are the same shape. Something scarce, a stretch of time or a due date, and a rule that two people cannot have it at once. The differences are the words on the ticket, not a new kind of program.",
  sections: [
    {
      id: "library",
      name: "Library Management",
      simple: "One copy of a book leaves the shelf, and it is due two weeks later",
      figure: "date-book",
      example: "library",
      body: [
        "A book has a number of copies and a count of how many are out. A loan remembers the member, the day it left, and the due day (that day plus 14). borrow fails when out would pass copies. giveBack frees a copy and says whether the return day is after the due day.",
        "The key for a loan is member plus book, which matches 'this person has this title'. If one member may borrow two copies, the key needs a loan id instead. Say the assumption.",
        "Fines can be a pure function of days late. Do not bury them in the map. The demo checks the second borrow is refused, the late flag, and that the copy can leave again.",
      ],
      useWhen: ["The scarce thing is a copy, and time is a due date rather than a double booking."],
      skipWhen: ["They want a public catalog search across branches. The loan rule is still the core. Search is a method on a list."],
      questions: [
        "What is the invariant? out is never above copies, and every loan points at a book that exists.",
        "Pitfall: decrementing out on a return you cannot find, so the count goes negative and the book becomes infinite.",
      ],
      remember: "Copies on the shelf are copies minus loans. A return computes late, then frees one.",
    },
    {
      id: "movie-booking",
      name: "Movie Ticket Booking",
      simple: "A seat is free, then held, then sold. Sold does not go backward",
      example: "movie-booking",
      body: [
        "A show owns seats. Each seat is free, held, or sold. lock moves free to held for a user until now plus a ttl. confirm moves that user's hold to sold. Anyone else is refused while the hold is fresh.",
        "The clock is injected. The demo sets time to the deadline and shows the next lock succeeds. That is the expiry test, and it does not sleep.",
        "Payment sits beside this, not inside the seat. confirm is where a paid order would call in. If payment fails, you release instead of confirm.",
      ],
      useWhen: ["People pick seats and two of them might pick the same one."],
      skipWhen: ["General admission with a count, no seats. A single integer plus a hold is enough."],
      questions: [
        "What are the states? Free, held, sold. Draw them before the class.",
        "Pitfall: confirming a seat that expired back to free, and selling it twice.",
      ],
      remember: "Held is not sold. Sold is the end. The clock decides when a hold dies.",
    },
    {
      id: "movie-seat-lock",
      name: "Movie Booking Seat Locking and Expiry",
      simple: "You may put your hand on the chair, but only for a little while",
      body: [
        "Expiry runs at the start of lock and confirm, not on a background thread. If until is less than or equal to now, the seat becomes free before you decide. That keeps the rule in one place.",
        "The same user may refresh their own hold. A different user may not. Sold never expires.",
        "In a real service the lock would be a row or a distributed lock with the same deadline. The object model does not change. The place the deadline is stored does.",
      ],
      useWhen: ["They mention a timer, a hold, or 'the seat should open up if they do not pay'."],
      skipWhen: ["They want an instant purchase with no hold. free to sold in one method is honest and smaller."],
      questions: [
        "Who notices expiry? The next command, using the injected clock. A sweeper is optional.",
        "Pitfall: less-than instead of less-than-or-equal, so a hold at exactly ttl still blocks.",
      ],
      remember: "On each command, if the hold's deadline has arrived, the seat is free again.",
    },
    {
      id: "meeting-room",
      name: "Meeting Room Booking",
      simple: "The room can host one meeting at a time. Touching at the edge is allowed",
      example: "meeting-room",
      body: [
        "A booking is a room, a start, an end, and a title. book refuses a room that does not exist, an end that is not after start, and any existing booking of that room that overlaps.",
        "Overlap is start < otherEnd and otherStart < end. A meeting that ends at 10 and one that starts at 10 do not overlap. That half-open rule is the one to say out loud.",
        "cancel removes by id so the slot can be booked again. The demo overlaps 9 to 11 against 9 to 10, allows 10 to 11, then cancels and rebooks.",
      ],
      useWhen: ["The scarce thing is a room over a clock range."],
      skipWhen: ["They want calendar sync and time zones across offices. Store instants, and keep the overlap rule. Time zones are a formatting problem."],
      questions: [
        "Is the end inclusive? No. [start, end) so back-to-back meetings fit.",
        "Pitfall: checking only start < otherStart, and missing a long meeting that covers a short one.",
      ],
      remember: "Two ranges conflict when each starts before the other ends.",
    },
    {
      id: "meeting-conflicts",
      name: "Meeting Room Conflict Detection",
      simple: "Look at the other names already written in that hour before you write yours",
      body: [
        "Conflict detection is a scan of that room's bookings. For a handful of rooms this is fine. If they ask about thousands of bookings, say you would keep them sorted by start and stop at the first one that begins after your end.",
        "Do not detect conflicts across rooms unless the meeting needs both. A booking in oak does not block a booking in pine.",
        "The same function answers 'can I book' and 'what is on the calendar'. One definition of overlap, used everywhere.",
      ],
      useWhen: ["They ask what happens if two people request the same hour."],
      skipWhen: ["The room is first-come and they do not care about a friendly error. Still use the check. A silent double book is the bug."],
      questions: [
        "How would you speed the scan up? Sort by start, or an interval tree if they push. Do not start with the tree.",
        "Pitfall: a conflict check that ignores the room id and blocks the whole building.",
      ],
      remember: "Same room, ranges overlap, refuse. Different room, allow.",
    },
    {
      id: "hotel",
      name: "Hotel Reservation",
      simple: "A room type, a check-in day, a check-out day, and no two guests in the same bed",
      example: "hotel",
      body: [
        "Rooms have a type. reserve finds the first room of that type that is free for [checkIn, checkOut), using the same overlap test as the meeting room. If none is free, it says sold out.",
        "cancel drops the stay so the nights open up. The demo books night 1 to 3, refuses 2 to 4, allows 3 to 4, then cancels and allows 1 to 2.",
        "Price per night can sit on the room type later. The hard part is the inventory of nights, not the money. If they ask for money, add a rate and multiply nights. Do not start there.",
      ],
      useWhen: ["Guests stay over a range of dates, and rooms have types."],
      skipWhen: ["One room, one night. It collapses to the meeting-room model with different field names."],
      questions: [
        "Does checkout day count as occupied? No, if the range is half-open. A guest can arrive the morning another leaves.",
        "Pitfall: assigning a room of the wrong type because you scanned all rooms and forgot the filter.",
      ],
      remember: "Find a room of the right type with no overlapping stay. Checkout morning is free.",
    },
    {
      id: "restaurant",
      name: "Restaurant Table Reservation",
      simple: "A party sits at the smallest table that is free and big enough",
      example: "restaurant",
      body: [
        "Tables have seats. A reservation has a party size, a start, and a duration. The end is start plus minutes. The first table with enough seats and no overlap wins, so a pair does not take the four-top while a two-top is free.",
        "The demo seats Ada at the two-top, Bo at the four-top because the two-top is still in its 90 minutes, and refuses a party of four while the four-top is busy.",
        "Turn time is the duration. If they want the table held only until the party no-shows, add a status. The overlap rule stays.",
      ],
      useWhen: ["Capacity is 'seats', not 'this exact resource', and parties have a size."],
      skipWhen: ["Assigned seating like a movie. Then each table is a seat with a name, and size does not matter."],
      questions: [
        "Which table do you pick? The first that fits, in the order you added them, smallest first if you inserted them that way.",
        "Pitfall: allowing two parties on one table because you compared party size and forgot the clock.",
      ],
      remember: "Big enough, and free for the whole sitting. Prefer the first fit.",
    },
  ],
  recap: [
    "A hold is either a copy with a due date or a range on a resource.",
    "Overlap is half-open: touching at the endpoint is allowed.",
    "Seat locks expire when the injected clock passes the deadline, and only the holder can confirm.",
  ],
  words: [
    { term: "Half-open range", meaning: "The start counts and the end does not, so back-to-back bookings fit." },
    { term: "Hold", meaning: "A temporary claim, such as a seat lock, that is not a final sale." },
    { term: "Copy", meaning: "One physical book. The title can have many copies." },
  ],
};
