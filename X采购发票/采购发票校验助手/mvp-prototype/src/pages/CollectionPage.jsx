import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Tag, Typography, Alert, Badge } from 'antd';
import { InboxOutlined, ReloadOutlined, ArrowRightOutlined, CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { AgentConsole, MetricCard, StatusTag, EmptyHint } from '../components/AgentKit.jsx';
import { useAgentRun } from '../hooks/useAgentRun.js';
import { CHANNELS, channelCounts, formatMoney } from '../data/invoiceData.js';

const { Text } = Typography;

export default function CollectionPage() {
  const navigate = useNavigate();
  const { status, events, running, run, push, reset } = useAgentRun();
  const [collected, setCollected] = useState(false);
  const [result, setResult] = useState(null);

  const channels = channelCounts();
  const total = channels.reduce((a, c) => a + c.items.length, 0);
  const dupCount = channels.reduce((a, c) => a + c.items.filter((r) => r.dup).length, 0);

  const onCollect = async () => {
    reset();
    setCollected(false);
    setResult(null);
    const seq = [
      { type: 'stream', text: '开始今日归集：范围 = 本批 2026-06 月结发票（乐企 / 供应商上传 / 采购补录）' },
      { type: 'tool', name: '同步乐企发票池', system: '乐企平台', input: 'IF001 · 期间 2026-06', output: '拉取 38 张数电发票' },
      { type: 'stream', text: '正在同步乐企发票池（IF001）…已拉取 38 张' },
      { type: 'tool', name: '归集供应商上传发票', system: '文件服务', input: 'IF009 · 供应商上传目录', output: '新增 6 张' },
      { type: 'stream', text: '正在归集供应商上传区…新增 6 张' },
      { type: 'tool', name: '归集采购补录发票', system: '文件服务', input: '补录登记 2 条（纸质票影像）', output: '归集 2 张' },
      { type: 'stream', text: '检测到采购补录 2 张纸质票，已存入文件服务（IF009）' },
      { type: 'tool', name: '核验发票归集完整性', system: '规则引擎', input: '46 张发票号去重 + 与历史批次比对', output: '无重复；1 张与昨日批次重复' },
      { type: 'stream', text: '共 46 张，无重复；发现 1 张发票号与昨日批次重复，已黄色标记', tone: 'warn' },
    ];
    await run(seq);
    try {
      const data = await api.collectInvoices({});
      setResult(data);
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '归集接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setCollected(true);
  };

  const columns = [
    { key: 'invoiceNo', dataIndex: 'invoiceNo', title: '发票号', width: 190, render: (v, r) => (
      <Space size={4}>
        <Text style={{ fontSize: 12.5 }}>{v}</Text>
        {r.dup && <Tag color="warning" icon={<WarningFilled />}>重复</Tag>}
      </Space>
    ) },
    { key: 'supplier', dataIndex: 'supplier', title: '供应商', width: 150 },
    { key: 'amountExTax', dataIndex: 'amountExTax', title: '不含税金额', width: 110, align: 'right', render: (v) => `¥${formatMoney(v)}` },
    { key: 'taxAmount', dataIndex: 'taxAmount', title: '税额', width: 96, align: 'right', render: (v) => `¥${formatMoney(v)}` },
    { key: 'invoiceDate', dataIndex: 'invoiceDate', title: '开票日期', width: 100 },
  ];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">P1 · 发票归集看板</h1>
        <p className="page-desc">发票多源采集归集：乐企 / 供应商上传 / 采购补录三渠道分栏，自动查重查漏，系统孤岛在界面上消失。</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<InboxOutlined />} loading={running} onClick={onCollect}>开始今日归集（三渠道）</Button>
          <Button icon={<ReloadOutlined />} onClick={onCollect} disabled={running}>核验归集完整性</Button>
          <Button type="link" onClick={() => navigate('/recognition')}>进入识别校验 <ArrowRightOutlined /></Button>
          <Text type="secondary" style={{ fontSize: 12 }}>采集归集覆盖率目标 100%（电子税务局/乐企/供应商上传/采购补录全渠道）</Text>
        </Space>
      </Card>

      <AgentConsole
        status={status}
        events={events}
        title="归集执行过程"
        emptyHint="点击「开始今日归集」，Agent 将按渠道流式回报归集进度与完整性校验结果。"
        renderResult={(data) => (
          <Alert
            type={data.duplicate ? 'warning' : 'success'}
            showIcon
            message={data.duplicate ? `归集完成：共 ${data.total} 张，发现 ${data.duplicate} 张重复` : `归集完成：共 ${data.total} 张，无重复`}
            description={data.summary}
          />
        )}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}><MetricCard label="本批归集总数" value={collected ? total : 0} suffix=" 张" tone={collected ? 'primary' : undefined} /></Col>
        <Col xs={12} md={6}><MetricCard label="乐企同步" value={collected ? 38 : 0} suffix=" 张" /></Col>
        <Col xs={12} md={6}><MetricCard label="供应商上传" value={collected ? 6 : 0} suffix=" 张" /></Col>
        <Col xs={12} md={6}><MetricCard label="重复 / 漏票" value={collected ? `${dupCount} / 0` : '0 / 0'} tone={dupCount ? 'warn' : 'ok'} hint="重复票黄色标记，漏票提示无缺失渠道" /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {!collected ? (
          <Col span={24}>
            <Card>
              <EmptyHint
                description="归集看板为空态"
                hint="点击「开始今日归集」后，三渠道发票将分栏入池；重复票会黄色标记，漏票渠道会主动提示。"
                cta={<Button type="primary" onClick={onCollect}>开始今日归集</Button>}
              />
            </Card>
          </Col>
        ) : (
          channels.map((c) => (
            <Col xs={24} lg={8} key={c.key}>
              <Card
                className="channel-col"
                title={
                  <div className="channel-head" style={{ width: '100%' }}>
                    <span className="channel-name" style={{ color: c.color }}>{c.icon} {c.label}</span>
                    <Badge count={c.items.length} style={{ backgroundColor: c.color }} />
                  </div>
                }
                extra={<Text type="secondary" style={{ fontSize: 11 }}>{c.system}</Text>}
              >
                <Table
                  rowKey="invoiceNo"
                  size="small"
                  columns={columns}
                  dataSource={c.items}
                  pagination={false}
                  scroll={{ y: 280 }}
                  rowClassName={(r) => (r.dup ? 'diff-warn-row' : '')}
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {collected && (
        <Card style={{ marginTop: 16 }} title="归集完整性核对">
          <Space wrap>
            <Tag color="success" icon={<CheckCircleFilled />}>共 {total} 张，无重复</Tag>
            <Tag color="warning" icon={<WarningFilled />}>{dupCount} 张发票号与昨日批次重复，已标记</Tag>
            <Tag color="processing">漏票提示：无缺失渠道</Tag>
            <Tag color="default">纸质补录 2 张待人工确认抬头</Tag>
          </Space>
          <div className="mt8"><Text type="secondary" style={{ fontSize: 12 }}>重复/漏票转人工确认（SKP 深度任务 · 采集渠道确认点）；为后续三单匹配提供干净的发票池，降低高频错误。</Text></div>
        </Card>
      )}
    </div>
  );
}
