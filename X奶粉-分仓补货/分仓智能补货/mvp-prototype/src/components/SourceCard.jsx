// #7 出处引用（决策依据可追溯 · 悬浮卡）
import React from 'react';
import { Popover, Tag } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';

const TRUST_COLOR = { 高: 'success', 中: 'warning', 低: 'error' };

export default function SourceCard({ sources = [], compact }) {
  const content = (
    <div style={{ width: compact ? 260 : 320 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#10213e', marginBottom: 8 }}>
        决策出处 · 数据与知识来源
      </div>
      {sources.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: 8, padding: '7px 0',
            borderTop: i === 0 ? 'none' : '1px solid #eef1f6',
          }}
        >
          <DatabaseOutlined style={{ color: '#5db2e2', marginTop: 3 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</span>
              <Tag color={TRUST_COLOR[s.trust?.[0]] || 'default'} style={{ fontSize: 10.5, margin: 0, lineHeight: '16px' }}>
                {s.trust}
              </Tag>
            </div>
            <div style={{ fontSize: 11, color: '#55617a', marginTop: 1 }}>{s.system}</div>
            <div style={{ fontSize: 11, color: '#8a94ab', marginTop: 1 }}>{s.desc}</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 10.5, color: '#8a94ab', marginTop: 8, borderTop: '1px dashed #e2e8f0', paddingTop: 6 }}>
        概念原型 · 字段与来源为脱敏演示口径
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="hover" placement="bottom" styles={{ body: { borderRadius: 10 } }}>
      <span
        style={{
          cursor: 'pointer', fontSize: 11.5, color: '#2b5db8',
          background: '#eef2fd', borderRadius: 6, padding: '2px 8px',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontWeight: 600, whiteSpace: 'nowrap',
        }}
      >
        <DatabaseOutlined style={{ fontSize: 10.5 }} />
        {compact ? '出处' : `出处 ${sources.length} 项`}
      </span>
    </Popover>
  );
}
