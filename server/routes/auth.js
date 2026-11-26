// routes/auth.js — everything about accounts lives here.
// For now: just registering (signing up). Login comes later.
//
// A ROUTER is a mini-app that holds a group of related routes.
// index.js "mounts" it at /api/auth, so the route below that says '/register'
// is really reached at:  POST /api/auth/register

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const router = Router();

// POST = "here is some data, please create something with it."
// (GET only asks for data; POST sends data.)
router.post('/register', async (req, res) => {
  // 1. READ what the browser sent.
  //    express.json() (in index.js) already turned the JSON body into req.body.
  //    `?.` means "if req.body doesn't exist, stop and give undefined" (instead of crashing).
  //    `?? ''` means "if it's missing, use an empty string" so .trim() won't crash.
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  // 2. VALIDATE. Never trust the browser: anyone can send anything to an API,
  //    even if our React form checks it first. The server must check again.
  //    400 = "Bad Request": the client sent something wrong.
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    // 3. HASH the password. A hash is a one-way scramble:
    //      "mypassword123"  →  "$2b$10$Xk3...long random-looking text"
    //    You can't turn the hash back into the password. To check a login later,
    //    we hash what they type and compare. So even if someone steals our
    //    database, they don't get anyone's real password.
    //    The 10 is the "cost": how much work hashing takes. Slower = harder to crack.
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. SAVE to the database. $1 and $2 are filled in safely by Postgres.
    //    RETURNING sends back the new row's columns (but NOT the hash; we never send that out).
    const result = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );

    // 5. RESPOND. 201 = "Created": the standard reply when something new was made.
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    // Our users table says email is UNIQUE. If the email is taken, Postgres
    // refuses the INSERT with error code 23505 ("unique violation").
    // 409 = "Conflict": that thing already exists.
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    console.error('Register failed:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
