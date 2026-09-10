// #2 工具调用可视化（卡片 · running / done / error）
import React from 'react';
import { LoadingOutlined, CheckCircleFilled, CloseCircleFilled, ApiOutlined } from '@ant-design/icons';

export default function ToolCallCard({ tool, style }) {
  const { name, system, target, status = 'done', latency, detail, error } = tool;
  return (
    <div className={`tool-card ${status}`} style={{ ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {status === 'running' ? (
          <LoadingOutlined style={{ color: '#5db2e2' }} />
        ) : status === 'error' ? (
          <CloseCircleFilled style={{ color: '#ef4444' }} />
        ) : (
          <CheckCircleFilled style={{ color: '#1a8f5c' }} />
        )}
        <ApiOutlined style={{ color: '#8a94ab', fontSize: 12 }} />
        <span style={{ fontWeight: 700, fontSize: 12.5, flex: 1 }}>{name}</span>
        <span className="mono" style={{ color: '#8a94ab' }}>{system}</span>
        {latency != null && <span style={{ fontSize: 11, color: '#8a94ab' }}>{latency}ms</span>}
      </div>
      <div style={{ fontSize: 11.5, color: '#55617a', marginTop: 4, paddingLeft: 26 }}>
        {status === 'error' ? (
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{error}</span>
        ) : (
          <span>{target}{detail ? ` · ${detail}` : ''}</span>
        )}
      </div>
    </div>
  );
}
