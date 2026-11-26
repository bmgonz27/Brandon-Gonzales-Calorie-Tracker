// RegisterForm.jsx — a sign-up form that sends data TO the server.
//
// New React ideas here:
//   • CONTROLLED INPUTS: React state holds what's typed in each box.
//   • EVENT HANDLERS: functions that run when the user does something (types, submits).
//   • POST with fetch: sending data, not just receiving it.

import { useState } from 'react';

function RegisterForm() {
  // One piece of state per thing that can change on screen.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);     // { type: 'success' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  // Runs when the form is submitted (button click OR pressing Enter).
  async function handleSubmit(event) {
    // By default, submitting a form RELOADS THE WHOLE PAGE (old-school HTML behavior).
    // That would wipe out React. preventDefault() says "don't do that, I'll handle it."
    event.preventDefault();

    setSubmitting(true);
    setMessage(null);

    try {
      // Same fetch() as the health check, but with options:
      const res = await fetch('/api/auth/register', {
        method: 'POST',                                   // we're SENDING data
        headers: { 'Content-Type': 'application/json' },  // "the body is JSON"
        body: JSON.stringify({ email, password }),        // object → JSON text
      });
      const data = await res.json();

      // res.ok is true for status codes 200–299 (like 201 Created).
      if (res.ok) {
        setMessage({ type: 'success', text: `Account created for ${data.user.email}!` });
        setEmail('');
        setPassword('');
      } else {
        // 400 / 409 / 500: the server sent { error: '...' } explaining why.
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      // `finally` runs whether it worked or not.
      setSubmitting(false);
    }
  }

  return (
    // onSubmit connects the form to our function. Note: we pass the function
    // itself (handleSubmit), we don't call it (handleSubmit()).
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Create an account</h2>

      <label>
        Email
        {/* CONTROLLED INPUT:
              value={email}  → the box always shows what's in state
              onChange       → every keystroke updates state
            So React state is the "single source of truth" for the box. */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password <small>(at least 8 characters)</small>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      {/* Disable the button while waiting, so it can't be double-clicked. */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Sign up'}
      </button>

      {/* `&&` is a JSX shortcut: "only show this if message isn't null". */}
      {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
    </form>
  );
}

export default RegisterForm;
