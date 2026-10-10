import type { Topic } from "@/lib/types";

export const topic: Topic = {
  slug: "lld-games",
  kind: "lld",
  title: "Board and card games",
  short: "Pieces that only move by the rules, and a deck that does not deal the same card twice.",
  bigIdea:
    "Games are rule engines with a tiny bit of storage. Chess asks whether a move leaves your king safe. Snakes and ladders asks whether the square you landed on is really a different square. Tic-tac-toe asks whether a line is full. A deck asks whether the next card is still in the pile. Write the rule in one place and make an illegal move throw.",
  sections: [
    {
      id: "chess",
      name: "Chess",
      simple: "Each piece has a way it is allowed to step, and the king is not allowed to be left in danger",
      figure: "checker-board",
      example: "chess",
      body: [
        "The board is eight strings, or a grid of characters. White is uppercase and starts at the bottom, so row 6 is the white pawns. A piece method lists candidate squares. movesFrom then drops any move that leaves your own king in check.",
        "Pawns move forward one, or two from the start rank, and capture diagonally. Knights jump. Kings step one. Rooks, bishops, and queens slide until they hit a piece. You may capture an enemy and you may not land on a friend.",
        "Castling and en passant are not in this model. Say that in the interview. They are extra rules on top of the same 'generate, then filter checks' loop. The demo checks the white pawn on e2 and a small checkmate.",
      ],
      useWhen: ["They want piece moves, not a chess AI."],
      skipWhen: ["They want a game tree and evaluation. The board and the legal-move function are the foundation. Search comes after."],
      questions: [
        "How do you test check? After the pretend move, see if any enemy attack hits your king.",
        "Pitfall: using the filtered move list to decide attacks, so a pinned piece stops attacking and check disappears.",
      ],
      remember: "Generate raw steps. Drop the ones that leave your king in check. Name the rules you skipped.",
    },
    {
      id: "chess-check",
      name: "Chess Move Validation and Check/Checkmate",
      simple: "If every door out of the room still leaves you in trouble, the game is over",
      body: [
        "inCheck asks whether the king square is attacked. Attacks for a pawn are the diagonal capture squares, not the forward step. For every other piece, attacks are the moves you would generate if you ignored your own king safety. A probe board with that filter turned off does this without a second copy of the geometry.",
        "legal lists every friendly move that survives the filter. checkmate means you are in check and legal is empty. Stalemate, if they ask, is the same emptiness while not in check. The demo's mate is a black king on a8, a white queen on a7, and a white king on b7.",
        "Always copy the board before you simulate a move. If you move and undo wrong, later tests lie.",
      ],
      useWhen: ["They ask 'how do you know it is mate', not only 'how does a knight move'."],
      skipWhen: ["Time is gone after pawn and rook moves. Say check is a filter you have not wired, rather than claiming mate you cannot show."],
      questions: [
        "Why can a pawn not use its forward move as an attack? Because the rules say it captures on the diagonal. The attack map and the move map differ only for pawns.",
        "Pitfall: calling checkmate when the king is safe but has no moves. That is stalemate.",
      ],
      remember: "Check is 'king is attacked'. Mate is 'in check, and no legal move exists'.",
    },
    {
      id: "snake-ladder",
      name: "Snake and Ladder",
      simple: "You land on a square, and sometimes the square is a slide or a ladder to somewhere else",
      example: "snake-ladder",
      body: [
        "Players have a position from 0 to 100. A roll adds to the position. If the sum would pass 100, you stay put. If the square is the mouth of a snake or the foot of a ladder, you jump to the other end. Exact 100 wins.",
        "Snakes and ladders are one map from square to square. The board does not care which is which at runtime. You care when you build the map, so a ladder does not point downward by mistake.",
        "The dice is an injected function. The demo rolls 4 and stays on 4 (the ladder is on 3), then in a second game rolls 3 to climb to 51 and 48 to slide from 99 to 10.",
      ],
      useWhen: ["The board is a path with teleports, and turns rotate."],
      skipWhen: ["They want graphics. The positions and the jump map are the design."],
      questions: [
        "What if a jump lands on another jump? This model jumps once. Say so. A loop would need a cap so a bad map cannot spin forever.",
        "Pitfall: moving past 100 instead of waiting for an exact roll.",
      ],
      remember: "Add the roll if it fits. Then follow one jump. 100 wins.",
    },
    {
      id: "tic-tac-toe",
      name: "Tic-Tac-Toe",
      simple: "Take turns writing your mark. Three in a line ends it",
      example: "tic-tac-toe",
      body: [
        "The board is a grid, default 3. play writes the current mark if the cell is empty and nobody has won. It then looks for a full row, column, or diagonal. If the board is full and nobody won, the winner is draw. Otherwise the turn flips.",
        "A play after a winner throws. That is the whole guard. The demo fills the top row for X while O plays the first column, then refuses another mark.",
        "An n-in-a-row variant is the same class with a size argument, as long as the line check uses size and not the number 3.",
      ],
      useWhen: ["They want a tiny rules engine you can finish."],
      skipWhen: ["They want an AI. The board and play come first. Minimax can call play's rules if there is time."],
      questions: [
        "Where is the win check? After the mark is written, in one method, for rows, columns, and both diagonals.",
        "Pitfall: flipping the turn even when the game already ended, so a later bug looks like a legal move.",
      ],
      remember: "Empty cell, current mark, then win, draw, or swap turns.",
    },
    {
      id: "deck",
      name: "Deck of Cards",
      simple: "Fifty-two cards, shuffled by a dice you can fake, dealt from the top",
      example: "deck",
      body: [
        "A card is a rank and a suit. The deck builds 13 ranks times 4 suits. shuffle is Fisher-Yates: from the end, swap with a random index at or before i. deal takes n from the front and refuses if you ask for more than remain.",
        "The random function is injected. The demo's fake random is deterministic, so the shuffle is repeatable, and the hand has five unique cards with 47 left.",
        "A hand, a discard pile, and a shoe are extra decks or lists. Do not subclass Card for every game. The game holds cards. The card does not know poker.",
      ],
      useWhen: ["Any card game where 'build a deck' is the start of the interview."],
      skipWhen: ["They already handed you a list and want the game rules. Do not spend the round on suits."],
      questions: [
        "Why Fisher-Yates? Each permutation is equally likely if random is fair. Sorting by random keys is a common weaker habit.",
        "Pitfall: dealing by copying without removing, so the same card exists in two places.",
      ],
      remember: "Build 52, shuffle with an injected random, deal by removing.",
    },
  ],
  recap: [
    "Chess generates moves, then drops any move that leaves the mover in check.",
    "Mate is check plus no legal move. Castling and en passant are named gaps.",
    "Path games use a jump map. Grid games use a line check. Decks use Fisher-Yates and removal.",
  ],
  words: [
    { term: "Legal move", meaning: "A step the piece can make that does not leave its own king in check." },
    { term: "Checkmate", meaning: "The side to move is in check and has no legal move." },
    { term: "Fisher-Yates", meaning: "An in-place shuffle that swaps each index with a random earlier or equal index." },
  ],
};
