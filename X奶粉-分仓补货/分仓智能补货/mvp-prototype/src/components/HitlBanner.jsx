// #5 HITL 拦截横幅（人工确认 / 修改 / 换方案）
import React, { useState } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import { SafetyCertificateOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export default function HitlBanner({ banner, detail, onConfirm, onAlternative, onModify }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const act = async (fn, label) => {
    setBusy(true);
    try {
      const r = await fn(label);
      setResult(r?.summary || r?.message || '已确认');
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="hitl-banner" style={{ borderLeftColor: '#1a8f5c' }}>
        <div className="hitl-avatar" style={{ background: '#e7f6ee', color: '#1a8f5c' }}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#10213e', marginBottom: 2 }}>人工确认已完成</div>
          <div style={{ fontSize: 12.5, color: '#55617a' }}>{result}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hitl-banner">
      <div className="hitl-avatar"><SafetyCertificateOutlined /></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, fontSize: 12.5, color: '#b45309' }}>HITL · 等待人工确认</span>
          <Popover
            content={
              <div style={{ maxWidth: 340, fontSize: 12.5, lineHeight: 1.7, color: '#55617a' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#10213e' }}>为什么需要你确认？</div>
                {detail}
                <div style={{ marginTop: 6, fontSize: 11, color: '#8a94ab' }}>
                  规则来源：SRP 知识资产「分配量调整经验」——分配量偏离京慧建议量时写入前必停。
                </div>
              </div>
            }
            trigger="hover"
          >
            <QuestionCircleOutlined style={{ color: '#8a94ab', cursor: 'help' }} />
          </Popover>
        </div>
        <div style={{ fontSize: 13, color: '#10213e', lineHeight: 1.6 }}>{banner}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" size="small" loading={busy} onClick={() => act(onConfirm, '确认并写入分配量')}>
            确认并写入分配量
          </Button>
          <Button size="small" loading={busy} onClick={() => act(onAlternative, '改用方案B（优先版）')}>
            改用方案B
          </Button>
          <Button size="small" loading={busy} onClick={() => act(onModify, '修改后重新校验')}>
            修改后重新校验
          </Button>
        </div>
      </div>
    </div>
  );
}
