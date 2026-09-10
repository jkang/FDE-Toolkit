import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Tag, Typography, Input, Badge, Divider } from 'antd';
import {
  DashboardOutlined, SendOutlined, RobotOutlined, ArrowRightOutlined,
  InboxOutlined, ScanOutlined, ApartmentOutlined, WarningOutlined, AuditOutlined,
  ThunderboltOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { MetricCard, StatusTag } from '../components/AgentKit.jsx';
import { STAGES, TODO_ITEMS, SCENARIO_META } from '../data/invoiceData.js';

const { Text, Paragraph } = Typography;

const STAGE_ICON = {
  P1: <InboxOutlined />, P2: <ScanOutlined />, P3: <ApartmentOutlined />,
  P4: <WarningOutlined />, P5: <AuditOutlined />,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: '我是你的发票校验搭档。每天早上我可以先把乐企、供应商上传和补录的发票收齐查重，逐张识别、验真、跑三单匹配；对得上的直接给你过目，拿不准的我整理好差异和建议再请你定。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const q = (text || input || '').trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const data = await api.chatAssistant({ message: q });
      setMessages((m) => [...m, { role: 'ai', text: data.reply, suggestions: data.suggestions }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: '调用失败：' + String(e?.message || e) }]);
    } finally {
      setLoading(false);
    }
  };

  const lastAi = [...messages].reverse().find((m) => m.role === 'ai' && m.suggestions);
  const suggestions = lastAi?.suggestions || ['本批 46 张校验进度', '今天有哪些异常待处理', '三单匹配口径是什么'];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">校验工作台总览</h1>
        <p className="page-desc">{SCENARIO_META.company} · {SCENARIO_META.valueStream} · {SCENARIO_META.priority}</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><MetricCard label="票面识别准确率（目标）" value="≥95" suffix="%" hint="票面关键字段置信度阈值口径" tone="ok" /></Col>
        <Col xs={12} md={6}><MetricCard label="采集归集覆盖率（目标）" value="100" suffix="%" hint="乐企 / 供应商上传 / 采购补录全渠道" /></Col>
        <Col xs={12} md={6}><MetricCard label="入账自动化覆盖率（目标）" value="100" suffix="%" hint="预制 / 过账 / 乐企标识回写全链" /></Col>
        <Col xs={12} md={6}><MetricCard label={SCENARIO_META.batchLabel} value="46" suffix=" 张" hint="乐企 38 + 供应商 6 + 补录 2" /></Col>
      </Row>

      <Card title={<span><ThunderboltOutlined /> 五阶段主流程</span>} style={{ marginBottom: 16 }}>
        <div className="stage-banner">
          {STAGES.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="stage-pill clickable" onClick={() => navigate(s.route)}>
                {STAGE_ICON[s.key]} {s.key} · {s.name}
              </div>
              {i < STAGES.length - 1 && <ArrowRightOutlined className="muted" />}
            </React.Fragment>
          ))}
        </div>
        <Divider style={{ margin: '14px 0' }} />
        <Space wrap>
          <Button type="primary" icon={<InboxOutlined />} onClick={() => navigate('/collection')}>开始今日归集</Button>
          <Button icon={<ApartmentOutlined />} onClick={() => navigate('/matching')}>进入三单匹配</Button>
          <Button icon={<AuditOutlined />} onClick={() => navigate('/ledger')}>批量预制与过账</Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span><RobotOutlined /> AI 校验搭档</span>}
            extra={<Tag color="processing" icon={<SafetyCertificateOutlined />}>工具可核查</Tag>}
            style={{ height: '100%' }}
          >
            <div className="chat-thread">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
              ))}
            </div>
            <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
              <Input.Search
                placeholder="例如：本批 46 张现在到哪一步了？还有哪些异常没处理？"
                enterButton="发送"
                value={input}
                loading={loading}
                onChange={(e) => setInput(e.target.value)}
                onSearch={(v) => send(v)}
              />
              <Space wrap>
                <span className="muted" style={{ fontSize: 12 }}>推荐指令：</span>
                {suggestions.map((s) => (
                  <Tag key={s} color="processing" className="chat-suggestion" onClick={() => send(s)}>{s}</Tag>
                ))}
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span><Badge count={TODO_ITEMS.reduce((a, t) => a + t.count, 0)} offset={[6, 0]}> <span>待办与通知中心</span></Badge></span>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>异常 / 复核 / 待补 / 待审</Text>}
            style={{ height: '100%' }}
          >
            {TODO_ITEMS.map((t) => (
              <div key={t.id} className="todo-item" onClick={() => navigate(t.route)}>
                <div>
                  <div className="todo-type">{t.type} <StatusTag status={t.type === '过账待审' ? '待过账' : t.type === '预制失败待补' ? '待补' : t.type === '识别复核待办' ? '待确认' : '数量超差'} /></div>
                  <div className="todo-desc">{t.desc}</div>
                </div>
                <Space>
                  <Badge count={t.count} style={{ backgroundColor: t.level === 'error' ? '#b91c1c' : t.level === 'warning' ? '#b45309' : '#1e3a8a' }} />
                  <ArrowRightOutlined className="muted" />
                </Space>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} title="场景定位与边界说明">
        <Paragraph style={{ marginBottom: 6 }}>
          <Text strong>价值主张：</Text>释放应付会计三单匹配工时、降低匹配错误率、缩短发票到过账周期。
        </Paragraph>
        <Paragraph style={{ marginBottom: 6 }}>
          <Text strong>硬口径：</Text>以发票行为主线（非整张发票粒度）、一对一/一对多/多对多、三层匹配 + 6 条匹配规则、数量以发票数量扣减入库/送货数量（不校验入库单与送货单一致性）、以不含税金额为基准。
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          <Text strong>假设值 · 待访谈回填：</Text>差异容忍阈值（数量无容忍区间、金额尾差 ≤1 元且 ≤0.5% 自动容忍、任一超容忍必拉人）与异常类型清单均为领域专家假设值。
        </Paragraph>
      </Card>
    </div>
  );
}
