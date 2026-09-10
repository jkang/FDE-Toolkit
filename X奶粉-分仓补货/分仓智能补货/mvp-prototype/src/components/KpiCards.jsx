// 指标卡（KPI 卡 · 供应链四提高口径）
import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function KpiCards({ items = [], cols = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
      {items.map((it, i) => {
        const up = String(it.trend || '').startsWith('+');
        return (
          <div key={i} className="ui-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                background: `linear-gradient(135deg, ${it.color || '#5db2e2'}, transparent 70%)`,
              }}
            />
            <div style={{ padding: '14px 16px', position: 'relative' }}>
              <div style={{ fontSize: 12, color: '#55617a', fontWeight: 600 }}>{it.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 2px', color: '#10213e', fontVariantNumeric: 'tabular-nums' }}>
                {it.value}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#55617a', marginLeft: 2 }}>{it.suffix}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                <span style={{ color: '#8a94ab' }}>{it.sub}</span>
                {it.trend && (
                  <span className={up ? 'delta-up' : 'delta-down'}>
                    {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {it.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
