import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Tag, Typography, Alert, Select, Input, App, Divider, Badge } from 'antd';
import {
  WarningOutlined, ArrowRightOutlined, ThunderboltOutlined, MessageOutlined,
  UndoOutlined, CheckCircleFilled, SafetyCertificateOutlined, ReloadOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { AgentConsole, StatusTag, HitlCard, CitationPopover, MetricCard } from '../components/AgentKit.jsx';
import { useAgentRun } from '../hooks/useAgentRun.js';
import { EXCEPTIONS } from '../data/invoiceData.js';

const { Text, Paragraph } = Typography;

const TYPE_LEVEL = { '数量超差': 'error', '抬头/税号不符': 'error', '单价不符': 'error', '金额超尾差': 'warning', '跨期发票': 'warning' };

export default function ExceptionsPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { status, events, running, run, push, reset } = useAgentRun();
  const [generated, setGenerated] = useState(false);
  const [tickets, setTickets] = useState(EXCEPTIONS);
  const [openForm, setOpenForm] = useState(null);
  const [form, setForm] = useState({});

  const onJudge = async () => {
    reset();
    setGenerated(false);
    const seq = [
      { type: 'tool', name: '判定异常类型并生成处理建议', system: '规则引擎', input: '匹配差异清单（5 张）', output: '异常类型 + 差异明细 + 处理建议' },
      { type: 'stream', text: '正在按差异容忍与异常判定经验判定异常类型…' },
      { type: 'stream', text: '异常队列：5 张按类型分组——数量超差 ×1、金额超尾差 ×1、抬头/税号不符 ×1、单价不符 ×1、跨期发票 ×1', tone: 'warn' },
      { type: 'tool', name: '生成沟通对象与升级路径建议', system: '规则引擎', input: '异常类型 + PO 权限 + 历史异常记录', output: '沟通对象 + 升级路径 + 时限' },
      { type: 'stream', text: '建议样例：与供应商 XX环保科技（脱敏）确认少送 20 件 → 走补单流程；沟通对象：采购员李强；2 个工作日未响应升级财务负责人', tone: 'warn' },
      { type: 'stream', text: '异常类型清单为领域专家假设值，待访谈回填', tone: 'warn' },
    ];
    await run(seq);
    try {
      const data = await api.judgeException({});
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '异常判定接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setGenerated(true);
  };

  const register = (t) => {
    const f = form[t.id] || {};
    const nextStatus = f.method === '换票' ? '换票中' : f.method === '补单' ? '补单中' : t.status;
    const prev = tickets;
    setTickets((list) => list.map((x) => (x.id === t.id ? { ...x, status: nextStatus, registered: true, method: f.method || '补单', eta: f.eta || '2026-06-25' } : x)));
    setOpenForm(null);
    message.success({
      content: (
        <span>
          已登记沟通结果：{t.type} · {f.method || '补单'}，预计 {f.eta || '2026-06-25'} 完成，该票已挂起并设置提醒。
          <Button type="link" size="small" icon={<UndoOutlined />} onClick={() => setTickets(prev)}>撤销</Button>
        </span>
      ),
      duration: 6,
    });
  };

  const pending = tickets.filter((t) => t.status === '待确认').length;

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">P4 · 异常凭证队列</h1>
        <p className="page-desc">异常按类型分组，每张带差异明细、处理建议、沟通对象与升级路径；把隐性经验「异常沟通与升级路径」知识化。</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<WarningOutlined />} loading={running} onClick={onJudge}>生成异常类型与处理建议</Button>
          <Button icon={<ReloadOutlined />}>返回三单匹配重跑</Button>
          <Button type="link" onClick={() => navigate('/ledger')}>进入入账与归档 <ArrowRightOutlined /></Button>
          <Text type="secondary" style={{ fontSize: 12 }}>异常类型清单为领域专家假设值 · 待访谈回填</Text>
        </Space>
      </Card>

      <AgentConsole
        status={status}
        events={events}
        title="异常判定执行过程"
        emptyHint="点击「生成异常类型与处理建议」，Agent 将按类型分组并生成沟通对象与升级路径。"
        renderResult={(data) => (
          <Alert type="warning" showIcon message={`异常判定完成：${data.groups} 组`} description={data.summary} />
        )}
      />

      {generated && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={12} md={6}><MetricCard label="异常总数" value={tickets.length} suffix=" 张" tone="warn" /></Col>
          <Col xs={12} md={6}><MetricCard label="待确认" value={pending} suffix=" 张" tone="danger" /></Col>
          <Col xs={12} md={6}><MetricCard label="数量超差" value={1} suffix=" 张" tone="danger" hint="必拉人（无容忍区间）" /></Col>
          <Col xs={12} md={6}><MetricCard label="金额尾差容忍" value={1} suffix=" 张" tone="ok" hint="自动放行，仅留痕" /></Col>
        </Row>
      )}

      <div style={{ marginTop: 16 }}>
        {tickets.map((t) => (
          <Card
            key={t.id}
            style={{ marginBottom: 16, borderLeft: `4px solid ${t.level === 'error' ? '#b91c1c' : '#b45309'}` }}
            title={<span><WarningOutlined style={{ color: t.level === 'error' ? '#b91c1c' : '#b45309' }} /> {t.type} · {t.invoiceNo}</span>}
            extra={<StatusTag status={t.status} />}
          >
            <Row gutter={16}>
              <Col xs={24} lg={14}>
                <div className="mb12">
                  <Text strong>差异明细</Text>
                  <Paragraph style={{ margin: '4px 0 0' }}>{t.detail}</Paragraph>
                </div>
                <Card size="small" className="mb12" style={{ background: '#fbfcfe', borderLeft: '3px solid #4a9fd8' }}>
                  <Space size={6}><ThunderboltOutlined style={{ color: '#0e7490' }} /><Text strong>处理建议（内联卡）</Text></Space>
                  <Paragraph style={{ margin: '6px 0 0' }}>{t.suggestion}</Paragraph>
                </Card>
                <Space wrap>
                  <Tag icon={<UserOutlined />} color="processing">沟通对象：{t.owner}</Tag>
                  <Tag color="warning" icon={<SafetyCertificateOutlined />}>升级路径：{t.escalate}</Tag>
                </Space>
                <div className="mt8">
                  <CitationPopover citations={[{ label: '规则依据', value: t.basis }, { label: '来源', value: 'SKP 决策模型类 · 差异容忍与异常判定经验' }, { label: '记录口径', value: '差异记录记入匹配关系表，不覆盖原始单据' }]}>
                    <Button type="link" size="small">查看判定依据</Button>
                  </CitationPopover>
                </div>
              </Col>
              <Col xs={24} lg={10}>
                {t.hitl && t.status === '待确认' && (
                  <HitlCard
                    title={`${t.type} · 需人工确认`}
                    desc={`${t.invoiceNo} 判定为「${t.type}」，需人工确认后分流。`}
                    basis={t.basis}
                    actions={
                      <Space wrap>
                        <Button type="primary" size="small" icon={<MessageOutlined />} onClick={() => setOpenForm(openForm === t.id ? null : t.id)}>采纳建议并登记沟通</Button>
                        <Button size="small">转人工线下处理</Button>
                      </Space>
                    }
                  />
                )}
                {(t.registered || t.status !== '待确认') && (
                  <Alert
                    type={t.status === '已放行' ? 'success' : 'info'}
                    showIcon
                    icon={t.status === '已放行' ? <CheckCircleFilled /> : <MessageOutlined />}
                    message={t.status === '已放行' ? '容忍区间内自动放行' : `已登记沟通结果（${t.method || '—'}）`}
                    description={t.status === '已放行' ? '仅留痕备查，超容忍则必拉人。' : `预计 ${t.eta || '2026-06-25'} 完成；补单到货后自动重跑三单匹配。窗口期内可撤销登记。`}
                  />
                )}
              </Col>
            </Row>

            {openForm === t.id && (
              <div className="mt12">
                <Divider style={{ margin: '8px 0 12px' }} />
                <Space wrap>
                  <span>处理方式：</span>
                  <Select
                    style={{ width: 150 }}
                    placeholder="补单 / 换票 / 冲红 / 退票"
                    value={form[t.id]?.method}
                    onChange={(v) => setForm((f) => ({ ...f, [t.id]: { ...(f[t.id] || {}), method: v } }))}
                    options={[{ value: '补单' }, { value: '换票' }, { value: '冲红' }, { value: '退票' }]}
                  />
                  <span>预计完成：</span>
                  <Input
                    style={{ width: 170 }}
                    placeholder="如 2026-06-25"
                    value={form[t.id]?.eta}
                    onChange={(e) => setForm((f) => ({ ...f, [t.id]: { ...(f[t.id] || {}), eta: e.target.value } }))}
                  />
                  <Button type="primary" onClick={() => register(t)}>提交沟通登记</Button>
                  <Button onClick={() => setOpenForm(null)}>取消</Button>
                </Space>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
