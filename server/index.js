// index.js — the entry point of our backend. `npm run dev` starts this file.

// 1. Load variables from .env into process.env BEFORE anything else uses them.
import 'dotenv/config';

import express from 'express';
import { query } from './db.js';
import authRoutes from './routes/auth.js';

// 2. Create the Express app. Think of `app` as our web server.
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware: code that runs on EVERY request before it reaches a route.
//    express.json() reads a JSON request body and puts it on req.body.
//    (We need this later, e.g. when the login form POSTs { email, password }.)
app.use(express.json());

// 4. Routes: "when a request comes in for METHOD + PATH, run this function."
//    req = the incoming request, res = the response we send back.

// Health check: is the server itself running?
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Calorie Tracker API is running' });
});

// DB check: can the server talk to PostgreSQL?
// `async` + `await` lets us wait for the database without freezing the server.
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await query('SELECT NOW() AS server_time');
    res.json({ status: 'ok', databaseTime: result.rows[0].server_time });
  } catch (err) {
    // Connection errors put their detail in err.code (e.g. ECONNREFUSED = nothing listening).
    console.error('Database check failed:', err.code || err.message);
    // 500 = "Internal Server Error". Status codes tell the client what happened.
    res.status(500).json({ status: 'error', message: 'Could not reach the database' });
  }
});

// Account routes live in their own file. "Mounting" at /api/auth means
// router.post('/register') in that file becomes POST /api/auth/register.
app.use('/api/auth', authRoutes);

// 5. Start listening for requests.
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
