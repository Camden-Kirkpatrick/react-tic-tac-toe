// useState is a React "hook" - it lets a component remember a value between renders.
// Without it, every re-render would start from scratch and the board would always be empty.
import { useState } from "react";


// ---------- Square: a single clickable cell ----------
// Square is a "presentational" / "dumb" component:
//   - It owns no state.
//   - It just displays whatever `value` it's given ("X", "O", or null).
//   - When clicked, it reports the click upward by calling onSquareClick().
// `{ value, onSquareClick }` is object destructuring - it pulls those two
// named props out of the single props object React passes in.
function Square({ value, onSquareClick })
{
  return (
    // onClick={onSquareClick} hands the parent's callback to the DOM button.
    // {value} switches from JSX-mode into JS-mode to print the variable's contents.
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}


// ---------- Board: renders the 3x3 grid for ONE snapshot of the game ----------
// Board is also "controlled" - it owns no state of its own. It receives:
//   - xIsNext: whose turn it is (used to decide what symbol to place + status text)
//   - squares: the current 9-element array to render
//   - onPlay:  a callback to tell the parent (Game) "the user just played a move"
function Board({ xIsNext, squares, onPlay })
{
  // Runs when the user clicks square index `i`.
  // Note this does NOT update state directly - it just builds the next board
  // and hands it to onPlay(). Game decides what to do with it.
  function handleClick(i)
  {
    // Guard 1: ignore the click if this square is already filled.
    //   squares[i] is truthy ("X" or "O") only after someone played here.
    // Guard 2: ignore the click if the game already has a winner.
    if (squares[i] || calculateWinner(squares))
      return;

    // Copy the array before mutating - React detects state changes by comparing
    // array references (===), so we must give it a brand-new array, not the
    // same one with edited contents. .slice() with no args = shallow copy.
    const nextSquares = squares.slice();

    // Place the correct symbol for whoever's turn it is.
    if (xIsNext)
      nextSquares[i] = "X";
    else
      nextSquares[i] = "O";

    // Report the new board to Game (Game's handlePlay runs).
    onPlay(nextSquares);
  }

  // ----- Compute the status text on every render -----
  // calculateWinner is a pure function (no state, no side effects), so it's
  // safe to call on every render. No need to store the winner in state.
  const winner = calculateWinner(squares);
  let status;
  if (winner)
    status = "Winner: " + winner;
  else
    // Ternary: condition ? valueIfTrue : valueIfFalse
    status = "Next player: " + (xIsNext ? "X" : "O");

  // ----- JSX returned to React -----
  // <>...</> is a "Fragment": groups multiple elements without adding an extra
  // wrapping <div> to the DOM. A component must return ONE root element, and
  // a Fragment satisfies that without polluting the markup.
  return (
    <>
      <div className="status">{status}</div>

      {/* Each Square gets:
            - value: what to display (from the squares array)
            - onSquareClick: a NEW arrow function that calls handleClick with
              the correct index. We need the arrow wrapper so that handleClick
              is only called when the click happens - if we wrote
              onSquareClick={handleClick(0)} it would run immediately during
              render and cause an infinite loop. */}
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>

      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>

      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}


// ---------- Game: the top-level component that owns ALL state ----------
// `export default` makes this the main thing imported elsewhere (index.js).
// Game owns the data so that BOTH the board and the move-history list can
// see it. If state lived in Board, the history list couldn't read it.
export default function Game()
{
  // ----- State -----
  // useState returns [currentValue, setterFunction].
  //   - On the FIRST render, the value is the argument passed in.
  //   - On later renders, useState returns whatever the setter most recently set.
  // The setter is the ONLY way to change the value - never mutate it directly.

  // history is an ARRAY OF BOARDS - a snapshot for every move ever played.
  // Starts as [emptyBoard] (a one-element array containing one empty board).
  // After N moves it has length N+1 (the start + every move).
  const [history, setHistory] = useState([Array(9).fill(null)]);

  // currentMove is the INDEX into history that we are currently showing.
  // Starts at 0 (the empty board at the start of the game).
  // "Jumping back in time" just means setting this to a smaller number.
  const [currentMove, setCurrentMove] = useState(0);

  // Derived values: computed from state, NOT stored in state.
  //   Rule of thumb: if B can be calculated from A, don't store B - keeping
  //   two pieces of state in sync is a bug factory.

  // X plays on even moves (0, 2, 4, ...), O on odd moves.
  // If you jump back to move 1, xIsNext becomes false automatically - no
  // separate flag to remember to flip.
  const xIsNext = currentMove % 2 === 0;

  // The board to render right now is whichever snapshot currentMove points to.
  const currentSquares = history[currentMove];

  // ----- handlePlay: called by Board when the user plays a new move -----
  // nextSquares is the new 9-element board that Board built for us.
  function handlePlay(nextSquares)
  {
    // Build the new history array:
    //   1. slice(0, currentMove + 1) keeps every board UP TO AND INCLUDING the
    //      one we're currently looking at. The +1 is because slice's end index
    //      is exclusive (slice(0, 3) gives indices 0,1,2 - three elements).
    //   2. The spread `...` unpacks those kept boards into the new array.
    //   3. Then we append nextSquares as the final element.
    //
    // If we previously jumped back in time, any boards AFTER currentMove are
    // thrown away (that "future" no longer exists - we just branched).
    // If we didn't jump, slice copies the whole history and nothing is lost.
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];

    setHistory(nextHistory);
    // Point at the newly-added board (the last element of nextHistory).
    setCurrentMove(nextHistory.length - 1);
  }

  // ----- jumpTo: called by the history buttons to time-travel -----
  // Just moves the pointer. We don't undo anything - all the old boards are
  // still sitting in history, untouched. The next render reads history[nextMove]
  // and the UI shows that snapshot.
  function jumpTo(nextMove)
  {
    setCurrentMove(nextMove);
  }

  // ----- Build the history list (the <ol> of "Go to move #N" buttons) -----
  // .map runs the callback once per element of history and collects the
  // returned JSX into a new array.
  //   - First parameter (squares) is the element - the board at that index.
  //     We don't use it here; we only need the index.
  //   - Second parameter (move) is the index, supplied automatically by .map.
  // Think of it like Python's `for move, squares in enumerate(history):`.
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0)
      description = "Go to move #" + move;
    else
      description = "Go to game start";

    // key={move} gives React a stable ID per <li>. When the list re-renders,
    // React uses keys to match new items to old ones for efficient diffing.
    // Index is a fine key here because the list only grows at the end.
    return (
      <li key={move}>
        {/* Arrow wrapper again - we want jumpTo to fire on click, not now. */}
        <button onClick={() => jumpTo(move)}>
          {description}
        </button>
      </li>
    );
  });

  // ----- Final layout -----
  // .game is flexbox (see styles.css) so the board sits beside the history list.
  // Embedding {moves} (an array of <li> elements) inside the <ol> tells React
  // to render each item in order.
  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}


// ---------- calculateWinner: pure helper, not a component ----------
// Takes a 9-element array, returns "X" or "O" if someone has won, otherwise null.
// "Pure" means: same input always gives the same output, with no side effects -
// safe to call on every render without worrying about performance or bugs.
function calculateWinner(squares)
{
  // Every possible 3-in-a-row, expressed as the three board indices that form it.
  // Board layout:
  //    0 | 1 | 2
  //   -----------
  //    3 | 4 | 5
  //   -----------
  //    6 | 7 | 8
  const lines = [
    [0, 1, 2],  // top row
    [3, 4, 5],  // middle row
    [6, 7, 8],  // bottom row
    [0, 3, 6],  // left column
    [1, 4, 7],  // middle column
    [2, 5, 8],  // right column
    [0, 4, 8],  // diagonal top-left -> bottom-right
    [2, 4, 6]   // diagonal top-right -> bottom-left
  ];

  // Check each winning line in turn.
  for (let i = 0; i < lines.length; i++)
  {
    // Array destructuring: pull the three indices into a, b, c.
    // Equivalent to: const a = lines[i][0]; const b = lines[i][1]; const c = lines[i][2];
    const [a, b, c] = lines[i];

    // Three conditions, all must be true (&& short-circuits):
    //   1. squares[a] is truthy - skips the case where all three cells are
    //      null (otherwise "three empty cells in a row" would count as a win).
    //   2. cell a equals cell b.
    //   3. cell a equals cell c.
    // If all three pass, cells a, b, c hold the same non-null symbol.
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return squares[a];   // return the winning symbol ("X" or "O")
  }

  // No winning line found - nobody has won yet.
  return null;
}
