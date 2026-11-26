// App.jsx — our top-level React component.
//
// A COMPONENT is just a JavaScript function that returns JSX (HTML-like syntax).
// React calls this function and turns what it returns into real page elements.

import { useEffect, useState } from 'react';
import StatusCard from './components/StatusCard.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import './App.css';

function App() {
  // STATE: data that, when it changes, makes React re-draw the component.
  // useState returns [currentValue, functionToChangeIt].
  // We start with null, meaning "haven't heard back yet".
  const [health, setHealth] = useState(null);
  const [dbCheck, setDbCheck] = useState(null);

  // EFFECT: code that runs AFTER the component appears on screen.
  // The empty array [] at the end means "run this only once, on first load".
  // Fetching data is the classic use for useEffect.
  useEffect(() => {
    // fetch() sends an HTTP request. '/api/health' goes to Vite, and the proxy
    // forwards it to Express on port 3000.
    fetch('/api/health')
      .then((res) => res.json())          // turn the response body into a JS object
      .then((data) => setHealth(data))    // save it in state, so React re-renders
      .catch(() => setHealth({ status: 'error', message: 'Server is not running' }));

    fetch('/api/db-check')
      .then((res) => res.json())
      .then((data) => setDbCheck(data))
      .catch(() => setDbCheck({ status: 'error', message: 'Server is not running' }));
  }, []);

  // JSX: looks like HTML, but note `className` instead of `class`
  // (because `class` is a reserved word in JavaScript).
  return (
    <main className="app">
      <h1>Calorie Tracker</h1>
      <p className="subtitle">Phase 1: checking that every piece is connected</p>

      {/* PROPS: we pass data INTO a component like HTML attributes. */}
      <StatusCard title="React (frontend)" result={{ status: 'ok', message: 'You are looking at it!' }} />
      <StatusCard title="Express (backend API)" result={health} />
      <StatusCard
        title="PostgreSQL (database)"
        result={dbCheck && dbCheck.status === 'ok'
          ? { status: 'ok', message: `Database time: ${new Date(dbCheck.databaseTime).toLocaleString()}` }
          : dbCheck}
      />

      <RegisterForm />
    </main>
  );
}

export default App;
