import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Tag, Typography, Alert, App, Popover, Divider, Checkbox } from 'antd';
import {
  AuditOutlined, CheckCircleFilled, CloseCircleFilled, SyncOutlined, PrinterOutlined,
  FileProtectOutlined, CloudSyncOutlined, ThunderboltOutlined, SafetyCertificateOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { api } from '../api/client.js';
import { AgentConsole, StatusTag, ErrorHint, MetricCard, EmptyHint } from '../components/AgentKit.jsx';
import { useAgentRun } from '../hooks/useAgentRun.js';
import { LEDGER, PREBOOK_GATES, formatMoney } from '../data/invoiceData.js';

const { Text, Paragraph } = Typography;

const pad4 = (n) => String(n).padStart(4, '0');

export default function LedgerPage() {
  const { message, modal } = App.useApp();
  const { status, events, running, run, push, reset } = useAgentRun();
  const [rows, setRows] = useState(LEDGER);
  const [prebookDone, setPrebookDone] = useState(false);
  const [postDone, setPostDone] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const prebooked = rows.filter((r) => r.prebookStatus === '预制成功');
  const failed = rows.filter((r) => r.prebookStatus === '预制失败');
  const posted = rows.filter((r) => r.postStatus === '已过账');

  const onPrebook = async () => {
    reset();
    setPrebookDone(false); setPostDone(false); setSyncDone(false);
    setRows(LEDGER);
    const seq = [
      { type: 'tool', name: '预制硬门禁检查', system: '规则引擎', input: '41 张匹配通过票 · 6 项前置', output: '39 张全绿；2 张成本中心缺失' },
      { type: 'stream', text: '逐票检查预制硬门禁：已识别 ✓ 匹配关系 ✓ 差异说明 ✓ 信息完整 ✓ 校验通过 ✓ 预制权限 ✓' },
      { type: 'tool', name: '提交 ERP 预制发票', system: 'SAP ERP', input: 'IF005 · 39 张', output: '39 张预制凭证号' },
      { type: 'stream', text: '39 张预制成功取得 ERP 预制凭证号', tone: 'ok' },
      { type: 'stream', text: '⚠️ 2 张因「成本中心缺失」预制失败，进入待补队列（降级建议：补齐成本中心后重试 / 转人工）', tone: 'warn' },
    ];
    await run(seq);
    try {
      const data = await api.batchPrebook({});
      setRows((list) => list.map((r) => (r.gateOk ? { ...r, prebookStatus: '预制成功' } : { ...r, prebookStatus: '预制失败' })));
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '预制接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setPrebookDone(true);
  };

  const doPost = async () => {
    reset();
    setPostDone(false);
    const seq = [
      { type: 'tool', name: '过账硬门禁检查', system: '规则引擎', input: '39 张已预制 · ERP 预制状态有效 · 财务过账权限', output: '全部满足' },
      { type: 'tool', name: '调用 ERP 过账', system: 'SAP ERP', input: 'IF006 · 会计期间 2026-06', output: '39 张凭证号逐票返回' },
      { type: 'stream', text: '39 张凭证号逐票返回，会计期间 2026-06，过账状态「已过账」', tone: 'ok' },
    ];
    await run(seq);
    try {
      const data = await api.batchPost({});
      setRows((list) => list.map((r, i) => (r.prebookStatus === '预制成功' ? { ...r, postStatus: '已过账', voucherNo: `51000026${90 + i}` } : r)));
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '过账接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setPostDone(true);
  };

  const onPost = () => {
    modal.confirm({
      title: '确认批量过账并同步乐企？',
      icon: <SafetyCertificateOutlined style={{ color: '#b45309' }} />,
      content: '过账前必须财务负责人确认（HITL 硬门禁）。确认后将对 39 张预制发票执行 ERP 过账（IF006），回写凭证号，并准备同步乐企入账标识（IF002）。',
      okText: '确认过账',
      cancelText: '取消',
      onOk: doPost,
    });
  };

  const onSync = async () => {
    reset();
    setSyncDone(false);
    const seq = [
      { type: 'tool', name: '回写乐企入账标识', system: '乐企平台', input: 'IF002 · 发票号 + ERP 凭证号', output: '39 张入账状态已更新' },
      { type: 'tool', name: '更新发票台账与归档索引', system: '文件服务', input: '凭证号 + 入账状态', output: '台账已更新；归档索引按发票编号生成' },
      { type: 'stream', text: '台账刷新：凭证号、入账状态「已更新」、归档索引按发票编号生成', tone: 'ok' },
      { type: 'tool', name: '打印归档资料', system: '打印服务', input: 'IF013 · 发票 / 送货单 / 匹配结果 / ERP 凭证', output: '归档文件可预览打印' },
      { type: 'stream', text: '乐企状态：入账标识已更新（过渡期提示财务人工确认并记录）', tone: 'ok' },
    ];
    await run(seq);
    try {
      const data = await api.syncLeqi({});
      setRows((list) => list.map((r, i) => (r.postStatus === '已过账' ? { ...r, leqiStatus: '已更新', archiveIndex: `ARCH-202606-${pad4(i + 1)}` } : r)));
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '乐企同步接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setSyncDone(true);
  };

  const gateCell = (r) => (
    r.gateOk ? (
      <Popover
        title="预制硬门禁（6 项前置）"
        content={<div className="gate-list">{PREBOOK_GATES.map((g) => <span key={g} className="gate-ok"><CheckCircleFilled /> {g}</span>)}</div>}
      >
        <Tag color="success" icon={<CheckCircleFilled />} className="clickable">全绿</Tag>
      </Popover>
    ) : (
      <Popover
        title="预制硬门禁未满足"
        content={<div><div className="gate-fail"><CloseCircleFilled /> {r.gateCheck}（成本中心 CC-3021 缺失）</div><div className="mt8 muted">降级建议：{r.advice}</div></div>}
      >
        <Tag color="error" icon={<CloseCircleFilled />} className="clickable">成本中心缺失</Tag>
      </Popover>
    )
  );

  const columns = [
    { key: 'invoiceNo', dataIndex: 'invoiceNo', title: '发票号', width: 172, render: (v) => <Text style={{ fontSize: 12.5 }}>{v}</Text> },
    { key: 'supplier', dataIndex: 'supplier', title: '供应商', width: 150 },
    { key: 'amountExTax', dataIndex: 'amountExTax', title: '不含税金额', width: 110, align: 'right', render: (v) => `¥${formatMoney(v)}` },
    { key: 'gateCheck', title: '预制门禁检查', width: 130, render: (_, r) => gateCell(r) },
    { key: 'prebookStatus', dataIndex: 'prebookStatus', title: '预制状态', width: 104, render: (v) => <StatusTag status={v} /> },
    { key: 'voucherNo', dataIndex: 'voucherNo', title: 'ERP 凭证号', width: 110, render: (v) => <span className="archive-index">{v}</span> },
    { key: 'postStatus', dataIndex: 'postStatus', title: '过账状态', width: 100, render: (v) => <StatusTag status={v} /> },
    { key: 'leqiStatus', dataIndex: 'leqiStatus', title: '乐企状态', width: 100, render: (v) => <StatusTag status={v} /> },
    { key: 'archiveIndex', dataIndex: 'archiveIndex', title: '归档索引', width: 150, render: (v) => <span className="archive-index">{v}</span> },
  ];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">P5 · 入账与归档台账</h1>
        <p className="page-desc">批量预制与过账：预制/过账/乐企三类硬门禁前置条件全绿才放行，过账前必停财务负责人确认；台账、乐企状态、归档索引一次到位。</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<FileProtectOutlined />} loading={running} onClick={onPrebook}>批量预制（检查硬门禁）</Button>
          <Button icon={<AuditOutlined />} onClick={onPost} disabled={!prebookDone || prebooked.length === 0}>批量过账（财务负责人确认）</Button>
          <Button icon={<CloudSyncOutlined />} onClick={onSync} disabled={!postDone}>同步乐企并更新台账</Button>
          <Button icon={<PrinterOutlined />} disabled={!syncDone}>预览 / 打印归档资料</Button>
        </Space>
      </Card>

      <AgentConsole
        status={status}
        events={events}
        title="入账与归档执行过程"
        emptyHint="点击「批量预制」，Agent 将逐票检查硬门禁并展示预制 / 过账 / 乐企回写全过程。"
        renderResult={(data) => <Alert type="success" showIcon message={data.summary} description={<Text type="secondary">硬门禁前置条件全绿才放行；过账前必停财务负责人确认。</Text>} />}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}><MetricCard label="匹配通过（可预制）" value={41} suffix=" 张" /></Col>
        <Col xs={12} md={6}><MetricCard label="预制成功" value={prebooked.length || 0} suffix=" 张" tone="ok" /></Col>
        <Col xs={12} md={6}><MetricCard label="预制失败（待补）" value={failed.length || 0} suffix=" 张" tone="danger" hint="成本中心缺失" /></Col>
        <Col xs={12} md={6}><MetricCard label="已过账 / 乐企已更新" value={`${posted.length || 0} / ${rows.filter((r) => r.leqiStatus === '已更新').length || 0}`} suffix=" 张" tone={postDone ? 'ok' : undefined} /></Col>
      </Row>

      {failed.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <ErrorHint
            title={`预制失败：${failed.length} 张（成本中心缺失）`}
            desc="失败原因：成本中心（CC-3021）缺失，无法生成预制凭证。降级建议：补齐成本中心后重试，或转人工线下处理（该票保留全部已识别上下文）。"
            actions={
              <Space>
                <Button size="small" icon={<ReloadOutlined />} onClick={onPrebook}>补齐成本中心后重试</Button>
                <Button size="small">转人工线下处理</Button>
                <Button size="small">导出待处理清单</Button>
              </Space>
            }
          />
        </Card>
      )}

      <Card
        style={{ marginTop: 16 }}
        title={<span><AuditOutlined /> 入账与归档台账</span>}
        extra={
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>过账前必停财务负责人确认 · 已过账凭证不可在产品内撤销（走 ERP 冲销）</Text>
          </Space>
        }
      >
        {!prebookDone ? (
          <EmptyHint
            description="台账初始为空态"
            hint="点击「批量预制」后，台账将按发票逐行填充：预制门禁、预制状态、凭证号、过账状态、乐企状态与归档索引。"
            cta={<Button type="primary" onClick={onPrebook}>批量预制（检查硬门禁）</Button>}
          />
        ) : (
          <Table rowKey="id" size="small" columns={columns} dataSource={rows} pagination={{ pageSize: 12, size: 'small' }} scroll={{ x: 1180 }} />
        )}
      </Card>

      {syncDone && (
        <Card style={{ marginTop: 16 }} title="台账与归档状态总览">
          <Space wrap>
            <Tag color="success" icon={<CheckCircleFilled />}>台账已更新：凭证号 / 入账状态 / 归档索引</Tag>
            <Tag color="success" icon={<CloudSyncOutlined />}>乐企入账标识已更新（IF002）</Tag>
            <Tag color="processing" icon={<PrinterOutlined />}>归档索引按发票编号生成，可预览打印（IF013）</Tag>
            <Tag color="warning" icon={<SyncOutlined />}>过渡期提示：财务人工确认乐企入账标识并记录</Tag>
          </Space>
          <Divider style={{ margin: '12px 0' }} />
          <Paragraph style={{ margin: 0 }} type="secondary">
            归档规则：发票、送货单直接打印；入库单、匹配结果、ERP 凭证按确认样式打印；归档按发票编号索引。差异记录记入匹配关系表，不覆盖原始单据。
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
