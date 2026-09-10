// 分货工作台 · 主演示页（AgentChat 对话流 + 故事线总览）
import React from 'react';
import { Row, Col, Tag, Card, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import AgentChat from '../components/AgentChat.jsx';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import TermTooltip from '../components/TermTooltip.jsx';
import { glossary } from '../data/appData.js';

const termMap = Object.fromEntries(glossary.map((g) => [g.term, g.define]));

export default function WorkbenchPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={10}>
          <Card size="small" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>分货方案助理 · 会话</span>
                <Space size={6}>
                  <AgentStatusBadge status="idle" label="就绪" />
                </Space>
              </div>
              <div style={{ fontSize: 11.5, color: '#8a94ab', marginTop: 4 }}>
                术语速记：
                <TermTooltip term="可发量" define={termMap['可发量']}>可发量</TermTooltip>
                {' · '}
                <TermTooltip term="DOS" define={termMap['库存天数(DOS)']}>DOS</TermTooltip>
                {' · '}
                <TermTooltip term="生产备货率" define={termMap['生产备货率']}>生产备货率</TermTooltip>
                {' · '}
                <TermTooltip term="订单完成率" define={termMap['订单完成率']}>订单完成率</TermTooltip>
                （悬停查看）
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card size="small">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>4 条演示故事线（点击侧边栏直达）</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { n: '故事线 1', t: '缺口识别', d: '供需全景 + 红黄蓝分级', r: '/supply', c: 'red' },
                  { n: '故事线 2', t: '方案编制', d: '多约束求解 + HITL 确认', r: '/allocation', c: 'gold' },
                  { n: '故事线 3', t: '异常备选', d: '3 套备选 + 错误态降级', r: '/exception', c: 'volcano' },
                  { n: '故事线 4', t: '下发复盘', d: '撤销 Toast + 执行跟踪', r: '/replenish', c: 'blue' },
                ].map((s) => (
                  <div
                    key={s.n}
                    onClick={() => navigate(s.r)}
                    style={{
                      border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                      transition: 'all 0.15s ease-out', background: '#fff',
                    }}
                    className="story-tile"
                  >
                    <Tag color={s.c} style={{ fontSize: 10.5, marginBottom: 4 }}>{s.n}</Tag>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.t}</div>
                    <div style={{ fontSize: 11, color: '#8a94ab', marginTop: 2 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        styles={{ body: { padding: '8px 16px 16px' } }}
        style={{ height: 'calc(100vh - 210px)' }}
      >
        <AgentChat onOpenPage={(r) => navigate(r)} />
      </Card>

      <style>{`
        .story-tile:hover { border-color: #5db2e2; box-shadow: 0 4px 14px rgba(93,178,226,0.18); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
