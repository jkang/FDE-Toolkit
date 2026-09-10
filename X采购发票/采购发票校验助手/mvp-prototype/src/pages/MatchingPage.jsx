import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Table, Tag, Typography, Alert, Divider, Popover, Descriptions } from 'antd';
import {
  ApartmentOutlined, ArrowRightOutlined, SaveOutlined, ThunderboltOutlined,
  CheckCircleFilled, CloseCircleFilled, InfoCircleOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { AgentConsole, StatusTag, HitlCard, CitationPopover, MetricCard } from '../components/AgentKit.jsx';
import { useAgentRun } from '../hooks/useAgentRun.js';
import { MATCH_ROWS, FOUR_QTY_ROWS, RULE_KEYS } from '../data/invoiceData.js';

const { Text, Paragraph } = Typography;

const qtyCell = (row, field) => {
  const bad = field === 'invoiceQty' && row.diffQty > 0;
  return <span className={bad ? 'diff-bad' : ''}>{row[field]}</span>;
};

export default function MatchingPage() {
  const navigate = useNavigate();
  const { status, events, running, run, push, reset } = useAgentRun();
  const [matched, setMatched] = useState(false);
  const [hitlResolved, setHitlResolved] = useState(false);

  const onMatch = async () => {
    reset();
    setMatched(false);
    setHitlResolved(false);
    const seq = [
      { type: 'tool', name: '获取采购订单信息', system: 'SAP ERP', input: 'IF003 · PO 6300002695 等', output: 'PO 主信息 + PO 行' },
      { type: 'tool', name: '获取入库单信息', system: 'SAP ERP', input: 'IF004 · 入库单 NJ-2026061801 等', output: '入库行（数量）' },
      { type: 'tool', name: '获取送货单信息', system: '公共网盘', input: 'IF008 · 20260618170457663.pdf', output: '送货单行（数量）' },
      { type: 'stream', text: '正在获取 PO / 入库单 / 送货单（IF003/IF004/IF008）…' },
      { type: 'tool', name: '以发票行为主线汇入三单行信息', system: '规则引擎', input: '发票行 + PO 行 + 入库行 + 送货行', output: '三单行级匹配工作集（一对一/一对多/多对多）' },
      { type: 'stream', text: '以发票行为主线汇入三单行，执行三层匹配（发票行↔送货/入库行、入库单↔PO 行、发票行↔PO 行）' },
      { type: 'tool', name: '行级核对数量并扣减', system: '规则引擎', input: '发票数量扣减入库/送货数量', output: '四数量对照报表 + 差异数量' },
      { type: 'stream', text: '行级数量扣减完成：44 行差异为 0；1 行数量超差（发票 500 > 入库 480），超容忍必拉人', tone: 'warn' },
      { type: 'tool', name: '行级核对金额与差异', system: 'SAP ERP', input: 'ERP 模拟校验接口（IF003–IF007）· 不含税基准', output: '1 张尾差容忍、1 张单价不符超容忍' },
      { type: 'stream', text: '金额比对完成：INV-2026-0618-003 尾差 ¥0.80 自动容忍；INV-2026-0618-004 单价不符超容忍', tone: 'warn' },
      { type: 'think', title: '查看匹配推理链（数量扣减 → 金额比对 → 差异判定）', lines: [
        '① 三层匹配：发票行 ↔ 送货/入库行（L1）；入库单 ↔ PO 行（L2）；发票行 ↔ PO 行（L3）。',
        '② 数量扣减：以发票数量扣减入库/送货数量（不校验入库单与送货单一致性）。',
        '③ 金额比对：以不含税金额为基准，经 ERP 模拟校验接口判定，本平台仅感知通过/差异结果。',
        '④ 差异判定：数量无容忍区间；金额尾差 ≤1 元且 ≤0.5% 自动容忍；任一超容忍必拉人。',
      ] },
      { type: 'stream', text: '41 张三单匹配通过，5 张按差异类型自动分流', tone: 'ok' },
      { type: 'hitl', title: '数量超差必拉人', desc: '发票 INV-2026-0618-002 行 2：发票 500 件 > 入库 480 件，超容忍（数量无容忍区间 · 领域专家假设值），按规则必拉人。' },
    ];
    await run(seq);
    try {
      const data = await api.runThreeWayMatch({});
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '匹配接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setMatched(true);
  };

  const rulesCol = (row) => (
    <Space size={4} wrap>
      {RULE_KEYS.map((r) => {
        const ok = row.rules[r.key];
        return <Tag key={r.key} className={`rule-chip ${ok ? 'ok' : 'bad'}`}>{ok ? '✓' : '✕'} {r.label}</Tag>;
      })}
    </Space>
  );

  const columns = [
    { key: 'invoiceNo', dataIndex: 'invoiceNo', title: '发票号', width: 168, fixed: 'left', render: (v) => <Text style={{ fontSize: 12.5 }}>{v}</Text> },
    { key: 'material', dataIndex: 'material', title: '物料 / 规格', width: 190, render: (v, r) => <div><div style={{ fontSize: 12.5 }}>{v}</div><Text type="secondary" style={{ fontSize: 11 }}>{r.spec} · PO {r.poNo}</Text></div> },
    { key: 'layers', title: '三层匹配', width: 132, render: (_, r) => (
      <Space size={3}>
        <Tag color={r.layer1 ? 'success' : 'error'}>L1</Tag>
        <Tag color={r.layer2 ? 'success' : 'error'}>L2</Tag>
        <Tag color={r.layer3 ? 'success' : 'error'}>L3</Tag>
      </Space>
    ) },
    { key: 'rules', title: '6 条匹配规则', width: 340, render: (_, r) => rulesCol(r) },
    { key: 'poQty', title: 'PO', width: 58, align: 'right', render: (_, r) => r.poQty },
    { key: 'deliveryQty', title: '送货', width: 58, align: 'right', render: (_, r) => r.deliveryQty },
    { key: 'receiptQty', title: '入库', width: 58, align: 'right', render: (_, r) => r.receiptQty },
    { key: 'invoiceQty', title: '发票', width: 58, align: 'right', render: (_, r) => qtyCell(r, 'invoiceQty') },
    { key: 'diffQty', dataIndex: 'diffQty', title: '差异数', width: 68, align: 'right', render: (v) => <span className={v > 0 ? 'diff-bad' : 'diff-ok'}>{v > 0 ? `+${v}` : '0'}</span> },
    { key: 'amountDiff', dataIndex: 'amountDiff', title: '金额差', width: 96, align: 'right', render: (v, r) => {
      if (v === 0) return <span className="diff-ok">¥0.00</span>;
      const tolerated = Math.abs(v) <= 1 && Math.abs(r.diffRate) <= 0.5;
      return (
        <CitationPopover citations={[
          { label: '规则依据', value: '金额比对规则（ERP 模拟校验接口承载）+ 差异容忍与异常判定经验（假设值）' },
          { label: '票面位置', value: '金额（右下角总计，大小写并存以大写为准）' },
          { label: 'ERP 返回', value: tolerated ? '模拟校验通过（尾差容忍）' : '模拟校验差异（超容忍）' },
        ]}>
          <span className={tolerated ? 'diff-warn clickable' : 'diff-bad clickable'}>¥{v.toFixed(2)}</span>
        </CitationPopover>
      );
    } },
    { key: 'status', dataIndex: 'status', title: '匹配结论', width: 116, fixed: 'right', render: (v) => <StatusTag status={v} /> },
  ];

  const fourQtyCols = [
    { key: 'material', dataIndex: 'material', title: '物料', width: 200 },
    { key: 'poQty', dataIndex: 'poQty', title: '采购订单数量', width: 110, align: 'right' },
    { key: 'deliveryQty', dataIndex: 'deliveryQty', title: '送货单数量', width: 110, align: 'right' },
    { key: 'receiptQty', dataIndex: 'receiptQty', title: '入库数量', width: 100, align: 'right' },
    { key: 'invoiceQty', dataIndex: 'invoiceQty', title: '发票校验数量', width: 110, align: 'right', render: (v, r) => <span className={r.diffQty > 0 ? 'diff-bad' : ''}>{v}</span> },
    { key: 'diffQty', dataIndex: 'diffQty', title: '差异数量', width: 96, align: 'right', render: (v) => <span className={v > 0 ? 'diff-bad' : 'diff-ok'}>{v > 0 ? `+${v}` : '0'}</span> },
    { key: 'status', dataIndex: 'status', title: '结论', width: 116, render: (v) => <StatusTag status={v} /> },
  ];

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">P3 · 三单匹配工作台</h1>
        <p className="page-desc">核心交付载体：以发票行为主线做行级三单匹配（三层匹配 + 6 条匹配规则），四数量并列定位差异来源，超容忍必拉人。</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<ApartmentOutlined />} loading={running} onClick={onMatch}>开始三单匹配（本批 46 张）</Button>
          <Button icon={<SaveOutlined />}>保存匹配结果（不覆盖原始单据）</Button>
          <Button type="link" onClick={() => navigate('/exceptions')}>查看异常队列 <ArrowRightOutlined /></Button>
          <Text type="secondary" style={{ fontSize: 12 }}>数量无容忍区间、金额尾差 ≤1 元且 ≤0.5% 自动容忍（假设值 · 待访谈回填）</Text>
        </Space>
      </Card>

      <AgentConsole
        status={status}
        events={events}
        title="三单匹配执行过程"
        emptyHint="点击「开始三单匹配」，Agent 将展示工具调用（获取 PO/入库/送货、行级扣减、金额比对）与匹配推理链。"
        renderResult={(data) => (
          <Alert
            type="warning"
            showIcon
            message={`匹配完成：${data.passed} 张通过，${data.exception} 张异常自动分流`}
            description={<div>{data.summary}<div style={{ marginTop: 6 }}><Text strong>HITL：</Text>{data.hitl}</div></div>}
          />
        )}
      />

      {matched && (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={12} md={6}><MetricCard label="匹配通过" value={41} suffix=" 张" tone="ok" /></Col>
            <Col xs={12} md={6}><MetricCard label="异常分流" value={5} suffix=" 张" tone="warn" hint="数量超差/金额超尾差/抬头税号不符/单价不符/跨期发票" /></Col>
            <Col xs={12} md={6}><MetricCard label="数量超差" value={1} suffix=" 张" tone="danger" hint="发票 500 > 入库 480" /></Col>
            <Col xs={12} md={6}><MetricCard label="金额尾差容忍" value={1} suffix=" 张" tone="warn" hint="尾差 ¥0.80（≤1 元且 ≤0.5%）" /></Col>
          </Row>

          {!hitlResolved && (
            <div style={{ marginTop: 16 }}>
              <HitlCard
                title="数量超差必拉人"
                desc="发票 INV-2026-0618-002 行 2 数量超差：发票 500 件 > 入库 480 件，超容忍（数量无容忍区间 · 领域专家假设值），按规则必拉人。请确认异常并转采购跟进，或返回调整匹配关系。"
                basis="SKP 决策模型类 · 差异容忍与异常判定经验（逻辑分支表 · 必拉人异常）· HITL 触发：匹配差异确认点"
                actions={
                  <Space wrap>
                    <Button type="primary" size="small" onClick={() => setHitlResolved(true)}>确认异常并转采购</Button>
                    <Button size="small" onClick={() => setHitlResolved(true)}>返回调整匹配关系</Button>
                    <Button size="small">查看四数量对照</Button>
                  </Space>
                }
              />
            </div>
          )}
          {hitlResolved && (
            <div style={{ marginTop: 16 }}>
              <Alert type="success" showIcon message="数量超差票已确认并转入异常队列" description="已生成沟通对象与升级路径建议：采购员李强跟进；2 个工作日未响应升级财务负责人。差异记录记入匹配关系表、不覆盖原始单据。" />
            </div>
          )}
        </>
      )}

      <Card
        style={{ marginTop: 16 }}
        title={<span><ThunderboltOutlined /> 三单匹配工作集（发票行 ↔ 送货/入库行 ↔ PO 行）</span>}
        extra={<Text type="secondary" style={{ fontSize: 12 }}>差异高亮 · 匹配关系表不覆盖原始单据</Text>}
      >
        {!matched ? (
          <Alert type="info" showIcon message="尚未执行匹配" description="点击「开始三单匹配」后，将展示行级匹配工作集（三层匹配结构 + 6 条匹配规则结果 + 差异高亮）。" />
        ) : (
          <Table rowKey="id" size="small" columns={columns} dataSource={MATCH_ROWS} pagination={false} scroll={{ x: 1500, y: 360 }} />
        )}
      </Card>

      <Card style={{ marginTop: 16 }} title="四数量对照报表（PO / 送货 / 入库 / 发票）">
        {!matched ? (
          <Alert type="info" showIcon message="尚未执行匹配" description="四数量并列用于人工逐项比对定位差异来源；不校验入库单与送货单一致性。" />
        ) : (
          <Table rowKey="id" size="small" columns={fourQtyCols} dataSource={FOUR_QTY_ROWS} pagination={false} />
        )}
      </Card>

      {matched && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="匹配判定卡 · INV-2026-0618-003（金额尾差）" extra={<StatusTag status="金额超尾差" />}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="判定结论">发票不含税 ¥77,700.80 vs PO ¥77,700.00，尾差 ¥0.80，差异率 0.0010%（≤1 元且 ≤0.5%）→ <Text strong style={{ color: '#15803d' }}>自动容忍放行</Text></Descriptions.Item>
                <Descriptions.Item label="决策因子确定性">高（金额比对由 ERP 模拟校验接口承载）</Descriptions.Item>
                <Descriptions.Item label="后续动作">进入批量预制</Descriptions.Item>
              </Descriptions>
              <Space style={{ marginTop: 10 }}>
                <CitationPopover citations={[
                  { label: '规则依据', value: '差异容忍与异常判定经验（金额尾差容忍假设值）' },
                  { label: '票面位置', value: '金额（右下角总计，大小写并存以大写为准）' },
                  { label: 'ERP 返回', value: '模拟校验通过' },
                ]}>
                  <Button type="link" icon={<InfoCircleOutlined />}>查看依据</Button>
                </CitationPopover>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="匹配判定卡 · INV-2026-0618-004（单价不符）" extra={<StatusTag status="单价不符" />}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="判定结论">行金额一致性不通过，发票单价高于 PO 约定单价 → <Text strong style={{ color: '#b91c1c' }}>超容忍，必拉人</Text></Descriptions.Item>
                <Descriptions.Item label="决策因子确定性"><Tag color="warning" icon={<SafetyCertificateOutlined />}>中（待访谈回填）</Tag></Descriptions.Item>
                <Descriptions.Item label="建议">转异常确认，与采购确认单价差异</Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 10 }}>
                <Popover
                  title="匹配推理链（默认折叠）"
                  content={
                    <ol className="think-lines" style={{ maxWidth: 420 }}>
                      <li>三层匹配：L1 发票行↔送货/入库行（通过）；L2 入库单↔PO 行（通过）；L3 发票行↔PO 行（金额不一致）。</li>
                      <li>数量扣减：发票 30 = 入库 30，数量一致。</li>
                      <li>金额比对：发票不含税 ¥36,000.00，PO 单价 × 数量低于发票行金额 → 判定单价不符。</li>
                      <li>差异判定：单价不符不属于尾差容忍范围 → 超容忍，转异常确认。</li>
                    </ol>
                  }
                >
                  <Button type="link">展开思考过程</Button>
                </Popover>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
