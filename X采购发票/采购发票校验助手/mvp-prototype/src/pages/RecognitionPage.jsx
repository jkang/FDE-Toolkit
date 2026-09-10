import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Tag, Typography, Input, Alert, Divider } from 'antd';
import {
  ScanOutlined, ArrowRightOutlined, CheckCircleFilled, SafetyCertificateOutlined,
  FileSearchOutlined, CloudUploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { AgentConsole, StatusTag, HitlCard, CitationPopover, TermHint, MetricCard } from '../components/AgentKit.jsx';
import { useAgentRun } from '../hooks/useAgentRun.js';
import { RECOGNITION } from '../data/invoiceData.js';

const { Text, Paragraph } = Typography;

function ConfidenceChip({ value }) {
  const ok = value >= 95;
  return <Tag color={ok ? 'success' : 'error'} className="conf-chip">{ok ? <CheckCircleFilled /> : '⚠'} {value}%</Tag>;
}

export default function RecognitionPage() {
  const navigate = useNavigate();
  const { status, events, running, run, push, reset } = useAgentRun();
  const [done, setDone] = useState(false);
  const [resolved, setResolved] = useState({});
  const [manual, setManual] = useState({});

  const onRecognize = async () => {
    reset();
    setDone(false);
    const seq = [
      { type: 'stream', text: '正在识别票面关键字段（IF010）：发票号 / 金额 / 税额 / 供应商税号 / 开票日期…' },
      { type: 'tool', name: '票面字段结构化识别', system: 'OCR/AI 识别', input: '46 张数电票 XML/PDF/OFD', output: '5 个目标字段 + 置信度' },
      { type: 'stream', text: '识别完成：45 张字段置信度 ≥95%' },
      { type: 'stream', text: '⚠️ 发票 INV-2026-0618-005 票面金额字段模糊，识别置信度 82%（低于 95% 阈值），已标红转识别复核', tone: 'warn' },
      { type: 'tool', name: '校验发票真伪与购方抬头', system: '规则引擎', input: '供应商/税号/科目映射字典（SAP 主数据）', output: '真伪通过；抬头 45 张通过、1 张不符' },
      { type: 'stream', text: '真伪校验通过；抬头校验 45 张通过、1 张抬头/税号不符，已标记进入异常队列', tone: 'warn' },
      { type: 'tool', name: '确认发票用途', system: '乐企平台', input: '46 张用途确认信息', output: '本批 46 张用途已确认' },
      { type: 'stream', text: '本批 46 张用途已确认', tone: 'ok' },
    ];
    await run(seq);
    try {
      const data = await api.recognizeInvoices({});
      push({ type: 'result', data });
    } catch (e) {
      push({ type: 'stream', text: '识别接口异常：' + String(e?.message || e), tone: 'warn' });
    }
    setDone(true);
  };

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">P2 · 用途确认与识别校验</h1>
        <p className="page-desc">票面字段与截图左右对照、低置信标红（阈值 95%）；真伪与购方抬头校验；隐性经验知识化，术语口径不再依赖个人记忆。</p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<ScanOutlined />} loading={running} onClick={onRecognize}>识别并校验票面关键字段</Button>
          <Button icon={<CloudUploadOutlined />}>上传纸质票影像补录</Button>
          <Button type="link" onClick={() => navigate('/matching')}>进入三单匹配 <ArrowRightOutlined /></Button>
          <Text type="secondary" style={{ fontSize: 12 }}>识别准确率目标 ≥95%；字段缺失/模糊票/新版式 → 标红进入识别复核点转人工</Text>
        </Space>
      </Card>

      <AgentConsole
        status={status}
        events={events}
        title="识别与校验执行过程"
        emptyHint="点击「识别并校验票面关键字段」，Agent 将流式回报 OCR 识别、真伪/抬头校验与用途确认结果。"
        renderResult={(data) => (
          <Alert type={data.lowConfidence ? 'warning' : 'success'} showIcon message={`识别完成：${data.titlePass} 张通过，${data.lowConfidence} 张低置信转人工`} description={data.summary} />
        )}
      />

      {done && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={12} md={6}><MetricCard label="识别字段通过" value={45} suffix="/46" tone="ok" /></Col>
          <Col xs={12} md={6}><MetricCard label="低置信转人工" value={1} suffix=" 张" tone="warn" hint="金额字段 82% < 95%" /></Col>
          <Col xs={12} md={6}><MetricCard label="真伪校验" value="通过" tone="ok" /></Col>
          <Col xs={12} md={6}><MetricCard label="抬头/税号不符" value={1} suffix=" 张" tone="danger" hint="已进入异常队列" /></Col>
        </Row>
      )}

      <div style={{ marginTop: 16 }}>
        {RECOGNITION.map((rec) => {
          const lowField = rec.fields.find((f) => f.low);
          const isResolved = resolved[rec.invoiceNo];
          return (
            <Card
              key={rec.invoiceNo}
              style={{ marginBottom: 16 }}
              title={<span><FileSearchOutlined /> 识别复核卡片 · {rec.invoiceNo}</span>}
              extra={
                <Space>
                  <TermHint term="供应商标准名" def={`${rec.supplier} = 供应商代码 100XXX（SAP）`} context="校验发票真伪与购方抬头" >
                    <Tag color="processing">{rec.supplier}</Tag>
                  </TermHint>
                  <StatusTag status={isResolved || !lowField ? '匹配通过' : '待确认'} />
                </Space>
              }
            >
              <Row gutter={16}>
                <Col xs={24} lg={9}>
                  <div className="invoice-shot">
                    <div className="shot-title">电子发票（数电票）</div>
                    <div className="shot-line"><span>发票号码</span><span>25312000000012345678</span></div>
                    <div className="shot-line"><span>开票日期</span><span>2026-06-18</span></div>
                    <div className="shot-line"><span>购买方</span><span>X（半导体制造）</span></div>
                    <div className="shot-line"><span>销售方</span><span>{rec.supplier}</span></div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="shot-line"><span>项目名称</span><span>二级RO膜 东丽 TM720D 400 × 42 支</span></div>
                    <div className="shot-line">
                      <span>金额（不含税）</span>
                      <span className={lowField ? 'shot-hl' : ''}>{lowField ? '¥7?,700.00（模糊）' : '¥77,700.00'}</span>
                    </div>
                    <div className="shot-line"><span>税额</span><span>¥10,101.00</span></div>
                    <div className="shot-total">价税合计（大写）：捌万柒仟捌佰零壹圆整</div>
                    <div className="shot-total">¥87,801.00</div>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{rec.shotHint}</Text>
                </Col>
                <Col xs={24} lg={15}>
                  <div className="mb12">
                    <Text strong>结构化识别字段（与票面截图对照）</Text>
                  </div>
                  {rec.fields.map((f) => (
                    <div className="field-row" key={f.key}>
                      <span className="field-label">{f.label}</span>
                      <span className={`field-value ${f.low ? 'low-conf' : ''}`}>{f.value}</span>
                      <ConfidenceChip value={f.confidence} />
                      <CitationPopover
                        citations={[
                          { label: '票面位置', value: f.location },
                          { label: '规则依据', value: '发票票面关键字段提取要点（置信度阈值 95%）' },
                          { label: '识别来源', value: 'OCR/AI 识别服务 · IF010' },
                        ]}
                      >
                        <Button type="link" size="small">查看依据</Button>
                      </CitationPopover>
                    </div>
                  ))}

                  <Card size="small" style={{ marginTop: 12, background: '#fbfcfe' }} title="真伪与购方抬头校验">
                    <Space wrap>
                      <Tag color="success" icon={<CheckCircleFilled />}>真伪校验：通过（发票号有效、非重复）</Tag>
                      <Tag color={rec.verify.titlePass ? 'success' : 'error'} icon={rec.verify.titlePass ? <CheckCircleFilled /> : <SafetyCertificateOutlined />}>
                        抬头校验：{rec.verify.titlePass ? '通过' : '不符'}
                      </Tag>
                      <Tag color="processing">供应商对照：{rec.supplier} = {rec.verify.supplierCode}</Tag>
                    </Space>
                  </Card>

                  {lowField && !isResolved && (
                    <div style={{ marginTop: 12 }}>
                      <HitlCard
                        title="识别置信度不足（<95%）"
                        desc={`${rec.invoiceNo} 票面「${lowField.label}」识别置信度 ${lowField.confidence}%（低于 95% 阈值），字段模糊。请对照票面截图补录后继续。`}
                        basis="SKP 关键信息提取要点 · 异常情况处理（字段缺失、模糊票、新版式 → 识别复核点转人工）"
                        actions={
                          <Space wrap>
                            <Input
                              style={{ width: 220 }}
                              placeholder="补录金额，如 77,700.00"
                              value={manual[rec.invoiceNo] || ''}
                              onChange={(e) => setManual((m) => ({ ...m, [rec.invoiceNo]: e.target.value }))}
                            />
                            <Button type="primary" size="small" onClick={() => setResolved((r) => ({ ...r, [rec.invoiceNo]: true }))}>补录后继续校验</Button>
                            <Button size="small">转人工处理</Button>
                          </Space>
                        }
                      />
                    </div>
                  )}
                  {lowField && isResolved && (
                    <div style={{ marginTop: 12 }}>
                      <Alert type="success" showIcon message="已人工补录并继续" description={`金额字段已补录为 ${manual[rec.invoiceNo] || '77,700.00'}，置信度门禁通过，发票继续进入三单匹配。`} />
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
