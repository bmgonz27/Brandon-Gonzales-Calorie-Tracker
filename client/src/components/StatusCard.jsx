// StatusCard.jsx — a small REUSABLE component.
// App.jsx uses it three times with different PROPS (inputs).
//
// Props arrive as one object. `{ title, result }` "destructures" that object,
// pulling out the two values we care about.

function StatusCard({ title, result }) {
  // CONDITIONAL RENDERING: show different things depending on the data.
  let icon = '⏳';
  let text = 'Checking...';
  let statusClass = 'pending';

  if (result) {
    const ok = result.status === 'ok';
    icon = ok ? '✅' : '❌';
    text = result.message;
    statusClass = ok ? 'ok' : 'error';
  }

  return (
    <div className={`status-card ${statusClass}`}>
      <span className="icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        {/* Curly braces {} drop JavaScript values into JSX. */}
        <p>{text}</p>
      </div>
    </div>
  );
}

export default StatusCard;
