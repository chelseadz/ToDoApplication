import React, { useMemo } from 'react';

function msBetween(a, b) {
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  return t2 - t1; // milliseconds
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0s';

  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  // Choose the scale and show up to two largest units for readability
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY);
    const h = Math.floor((ms % DAY) / HOUR);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  }
  if (ms >= HOUR) {
    const h = Math.floor(ms / HOUR);
    const m = Math.floor((ms % HOUR) / MIN);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (ms >= MIN) {
    const m = Math.floor(ms / MIN);
    const s = Math.floor((ms % MIN) / SEC);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const s = Math.floor(ms / SEC);
  return `${s}s`;
}

export default function TodoMetrics({ data }) {
  const { avgAll, avgBy } = useMemo(() => {
    let totalMs = 0, count = 0;
    const bucket = {
      LOW: { s: 0, c: 0 },
      MEDIUM: { s: 0, c: 0 },
      HIGH: { s: 0, c: 0 },
      CRITICAL: { s: 0, c: 0 }
    };

    for (const t of data || []) {
      if (t.doneDate && t.createdAt) {
        const dms = msBetween(t.createdAt, t.doneDate);
        if (Number.isFinite(dms) && dms > 0) {
          totalMs += dms; count++;
          if (bucket[t.priority]) { bucket[t.priority].s += dms; bucket[t.priority].c++; }
        }
      }
    }

    const avgAll = count ? totalMs / count : 0;
    const avgBy = Object.fromEntries(
      Object.entries(bucket).map(([k, v]) => [k, v.c ? v.s / v.c : 0])
    );

    return { avgAll, avgBy };
  }, [data]);

  return (
    <div className="average-time-container">
      <div className="average-time-section">
        <p>Average time to finish tasks:</p>
        <strong>{formatDuration(avgAll)}</strong>
      </div>
      <div className="priority-time-section">
        <p>Average time to finish tasks by priority:</p>
        <ul>
          <li>Low: {formatDuration(avgBy.LOW)}</li>
          <li>Medium: {formatDuration(avgBy.MEDIUM)}</li>
          <li>High: {formatDuration(avgBy.HIGH)}</li>
          <li>Critical: {formatDuration(avgBy.CRITICAL)}</li>
        </ul>
      </div>
    </div>
  );
}
