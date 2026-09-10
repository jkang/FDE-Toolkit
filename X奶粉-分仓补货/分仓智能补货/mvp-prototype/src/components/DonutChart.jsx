// 环形图（CSS conic-gradient · DOS 分布 / 达成率）
import React from 'react';

export default function DonutChart({ segments = [], size = 128, thickness = 14, centerTitle, centerValue }) {
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = acc;
      acc += s.value;
      const to = acc;
      return `${s.color} ${from}% ${to}%`;
    })
    .join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div
        style={{
          width: size, height: size, borderRadius: '50%', flex: 'none',
          background: `conic-gradient(${stops})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: size - thickness * 2, height: size - thickness * 2,
            borderRadius: '50%', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: '#10213e', fontVariantNumeric: 'tabular-nums' }}>{centerValue}</div>
          <div style={{ fontSize: 10.5, color: '#8a94ab' }}>{centerTitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
            <span className={`dot ${s.cls}`} style={{ background: s.color }} />
            <span style={{ color: '#55617a' }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: '#10213e', fontVariantNumeric: 'tabular-nums' }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
