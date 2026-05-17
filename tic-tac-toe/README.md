# Tic-Tac-Toe

A tic-tac-toe game built in React, with move history and the ability to jump back to any previous turn.

I made this following the [official React tutorial](https://react.dev/learn/tutorial-tic-tac-toe) as my first React project. It was a huge help in getting comfortable with the basics like components, props, state, hooks, and how React actually re-renders things.

## Running it

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## What's in here

- `src/App.js` has all the game code (`Square`, `Board`, `Game`, and a `calculateWinner` helper), with lots of comments since this was a learning exercise
- `src/styles.css` handles the board styling and centering

## Stuff I learned

- How JSX works and the `{}` escape into JavaScript
- Passing props down and callbacks up (one-way data flow)
- `useState` and why you can't just mutate state directly
- Lifting state up to a common parent
- Why immutability matters, and how it makes the time-travel feature basically free
- Rendering lists with `.map` (and what `key` is for)
- Closures, and how every `() => handleClick(i)` in the code is one
- The difference between re-rendering (cheap, in JS) and repainting (only the changed DOM)

Built with React 19 and Create React App. Starter code from [react.dev](https://react.dev/learn/tutorial-tic-tac-toe).
