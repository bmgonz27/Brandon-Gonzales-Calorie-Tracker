// main.jsx — the very first JavaScript that runs in the browser.
// It finds <div id="root"> in index.html and tells React to draw <App /> inside it.
// After this, React controls everything inside that div.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode is a development helper that warns about common mistakes.
  // (Side effect: in dev, effects run twice on purpose. That's normal!)
  <StrictMode>
    <App />
  </StrictMode>,
)
