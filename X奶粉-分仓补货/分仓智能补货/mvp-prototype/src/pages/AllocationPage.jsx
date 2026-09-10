// 故事线2 · 多约束分货方案生成与人工确认（HITL 拦截 · 方案对比 · 分配量可编辑 · 修改原因留痕）
import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Button, InputNumber, Select, Space, Tag, Alert, message, Popover } from 'antd';
import { CheckOutlined, ReloadOutlined, SafetyCertificateOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import SourceCard from '../components/SourceCard.jsx';
import TermTooltip from '../components/TermTooltip.jsx';
import { api } from '../api/client.js';
import { glossary } from '../data/appData.js';

const termMap = Object.fromEntries(glossary.map((g) => [g.term, g.define]));
const REASON_OPTIONS = ['促销放量', '周转较快压量', '在途延误补充', '大日期消化', '可发量不足压缩', '其他'];

export default function AllocationPage() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [plan, setPlan] = useState(null);          // 当前方案数据（A/B 双版）
  const [activeTab, setActiveTab] = useState('A');
  const [rows, setRows] = useState([]);            // 当前编辑中的行
  const [hitlDone, setHitlDone] = useState(false);
  const [log, setLog] = useState([]);              // 修改留痕

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.generatePlan({});
      setPlan(r);
      setRows(r.planA || []);
      setHitlDone(false);
      setLog([]);
    } catch (e) {
      message.error('方案生成失败：' + String(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const switchTab = (key) => {
    setActiveTab(key);
    setRows((plan && (key === 'B' ? plan.planB : plan.planA)) || []);
  };

  // 编辑分配量
  const editQty = (idx, val) => {
    const next = rows.map((r, i) => {
      if (i !== idx) return r;
      const reason = r.reason || '人工修改分配量';
      const changed = val !== r.jhSuggested;
      return { ...r, allocated: val, reason: changed ? reason : r.reason };
    });
    setRows(next);
  };

  const setReason = (idx, val) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, reason: val } : r));
    setRows(next);
  };

  // HITL 确认（写入分配量 + 留痕）
  const confirmWrite = async () => {
    setValidating(true);
    setHitlDone(true);
    setLog((p) => [...p, { time: new Date().toLocaleTimeString('zh-CN'), action: '人工确认：北京顺义仓分配量 1344 罐（较京慧建议上调 12%）已写入' }]);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await api.adjustPlan({ rows });
      setRows(res.rows || rows);
      message.success('约束重新校验通过，分配量已写入');
    } catch (e) {
      message.error('校验失败：' + String(e));
    } finally {
      setValidating(false);
    }
  };

  // 手动微调后重新校验
  const revalidate = async () => {
    setValidating(true);
    const edits = rows.filter((r) => r.reason && r.reason.includes('人工修改'));
    edits.forEach((r) => {
      setLog((p) => [...p, { time: new Date().toLocaleTimeString('zh-CN'), action: `人工修改：${r.warehouse} 分配量 → ${r.allocated} 罐（${r.reason}）` }]);
    });
    await new Promise((r) => setTimeout(r, 700));
    try {
      const res = await api.adjustPlan({ rows });
      setRows(res.rows || rows);
      message.success('已重新校验：全部约束通过（可发量/安全水位/时效）');
    } catch (e) {
      message.error('校验失败：' + String(e));
    } finally {
      setValidating(false);
    }
  };

  const columns = [
    {
      title: '收货分仓', dataIndex: 'warehouse', width: 122, fixed: 'left',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{v}</div>
          <Tag style={{ fontSize: 10, margin: '2px 0 0' }} color={r.priority?.startsWith('P0') ? 'error' : r.priority?.startsWith('P1') ? 'warning' : 'default'}>
            {r.priority}
          </Tag>
        </div>
      ),
    },
    { title: 'SKU 品名', dataIndex: 'sku', width: 170 },
    {
      title: <TermTooltip term="京慧建议量" define={termMap['京慧建议量'] || '京慧一盘货给出的基准建议分配量，偏离>10% 需 HITL 确认'}>京慧建议量</TermTooltip>,
      dataIndex: 'jhSuggested', width: 96,
      render: (v) => <span className="num-muted">{v.toLocaleString()} 罐</span>,
    },
    {
      title: <TermTooltip term="目标备货率" define={termMap['目标备货率'] || '目标备货率 = 订单进度 + 20%（封顶 100%）'}>目标备货率</TermTooltip>,
      dataIndex: 'targetFillRate', width: 110,
      render: (v) => (v ? <Tag style={{ margin: 0 }} color={v.includes('封顶') ? 'warning' : 'processing'}>{v}</Tag> : '—'),
    },
    {
      title: <TermTooltip term="分配量" define={termMap['分配量'] || '经人工确认后写入的实际分货数量（京慧建议量的落地值）'}>分配量（可编辑）</TermTooltip>,
      dataIndex: 'allocated', width: 128,
      render: (v, r, idx) => (
        <InputNumber
          size="small"
          min={0}
          step={50}
          value={v}
          onChange={(val) => editQty(idx, val)}
          style={{ width: 108 }}
          formatter={(x) => `${x}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      ),
    },
    {
      title: '分配后库存天数', dataIndex: 'afterDays', width: 110,
      render: (v) => (
        <span className={v < 10 ? 'delta-down' : 'num-strong'}>{v} 天</span>
      ),
    },
    {
      title: '调整原因（留痕）', dataIndex: 'reason', width: 190,
      render: (v, r, idx) => (
        <Select
          size="small"
          style={{ width: 176 }}
          value={v || '—'}
          onChange={(val) => setReason(idx, val)}
          options={[{ value: '—', label: '按京慧建议' }, ...REASON_OPTIONS.map((o) => ({ value: o, label: o }))]}
        />
      ),
    },
  ];

  const summary = (rows2) => {
    const total = rows2.reduce((a, b) => a + (b.allocated || 0), 0);
    const base = rows2.reduce((a, b) => a + (b.jhSuggested || 0), 0);
    return (
      <Table.Summary.Row style={{ background: '#f8fafd' }}>
        <Table.Summary.Cell index={0} colSpan={4}><b>合计</b></Table.Summary.Cell>
        <Table.Summary.Cell index={4}><b className="num-strong">{total.toLocaleString()} 罐</b></Table.Summary.Cell>
        <Table.Summary.Cell index={5} colSpan={2}>
          <span style={{ fontSize: 12 }}>
            较京慧建议总量{' '}
            <b className={total >= base ? 'delta-up' : 'delta-down'}>
              {total >= base ? '+' : ''}{Math.round(((total - base) / Math.max(base, 1)) * 100)}%
            </b>
          </span>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {validating ? <AgentStatusBadge status="tool_calling" label="重新校验约束" /> : hitlDone ? <AgentStatusBadge status="idle" label="方案已确认" /> : <AgentStatusBadge status="awaiting_human" label="等待人工确认" />}
          <span style={{ fontSize: 12, color: '#8a94ab' }}>约束：分配量≤可发量（硬）· 目标备货率=订单进度+20%封顶100% · 凑车±200件 · 就近优先选仓 · 安全水位</span>
        </div>
        <Space>
          <SourceCard
            compact
            sources={[
              { name: '京慧建议量', system: '京慧一盘货', trust: '高 · 建议基准', desc: '偏离>10% 需 HITL 确认' },
              { name: '可发量/订单完成率', system: '奶粉分仓补调系统', trust: '高 · 准实时', desc: '订单完成率=(当月未发+本月累出)/销售计划' },
              { name: '促销计划', system: '促销管理系统', trust: '中 · 周更', desc: '140+ 广促品指标' },
              { name: '备货率分配规则', system: 'SKP 决策模型类', trust: '专家一致率≥90%', desc: '目标备货率=订单进度+20% 封顶100%' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>重新求解</Button>
          <Button type="primary" icon={<CheckOutlined />} loading={validating} onClick={confirmWrite} disabled={hitlDone}>
            确认并写入分配量
          </Button>
        </Space>
      </div>

      {/* HITL 拦截横幅 */}
      {!hitlDone && (
        <div className="ui-card" style={{ marginBottom: 14, borderColor: '#f0d9a6', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <SafetyCertificateOutlined style={{ fontSize: 22, color: '#f59e0b' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#b45309', marginBottom: 2 }}>
                HITL · 等待人工确认
              </div>
              <div style={{ fontSize: 13, color: '#10213e' }}>
                <b>北京顺义仓</b>分配量 <b>1344 罐</b>，较京慧建议量 <b>1200 罐</b> 上调 <b>12%</b>（因促销放量），需确认后写入。
              </div>
              <div style={{ fontSize: 11.5, color: '#8a94ab', marginTop: 3 }}>
                决策因子：目标备货率=订单进度+20%（封顶 100%）；顺义仓本周促销放量且 DOS&lt;7 天（红色缺口），按「促销放量优先保障」上调 12% · 规则来源：SKP 分配量调整经验（写入前必停）
              </div>
            </div>
            <Space>
              <Button type="primary" size="small" loading={validating} onClick={confirmWrite}>确认写入</Button>
              <Button size="small" onClick={() => { switchTab('B'); message.info('已切换至方案B（优先版）'); }}>改用方案B</Button>
              <Button size="small" onClick={revalidate} loading={validating}>修改后重新校验</Button>
            </Space>
          </div>
        </div>
      )}

      {/* 方案工作台 */}
      <Card
        size="small"
        title={
          <Tabs
            size="small"
            activeKey={activeTab}
            onChange={switchTab}
            items={[
              { key: 'A', label: '方案A · 均衡版' },
              { key: 'B', label: '方案B · 优先版' },
            ]}
            style={{ marginBottom: -12 }}
          />
        }
        extra={
          <Space>
            <Popover
              content={
                <div style={{ width: 340 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>修改留痕（本会话）</div>
                  {log.length === 0 && <div style={{ fontSize: 12, color: '#8a94ab' }}>暂无人工修改记录</div>}
                  {log.map((l, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '5px 0', borderTop: '1px solid #eef1f6', color: '#55617a' }}>
                      <span className="mono" style={{ color: '#8a94ab' }}>[{l.time}]</span> {l.action}
                    </div>
                  ))}
                </div>
              }
              trigger="click"
            >
              <Button size="small" icon={<HistoryOutlined />}>修改留痕（{log.length}）</Button>
            </Popover>
            <Button size="small" icon={<EditOutlined />} onClick={revalidate} loading={validating}>微调后重新校验</Button>
          </Space>
        }
      >
        <Table
          rowKey={(r) => `${r.warehouse}-${r.sku}`}
          size="middle"
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          summary={summary}
        />
        <div style={{ marginTop: 10, fontSize: 11.5, color: '#8a94ab' }}>
          <SafetyCertificateOutlined style={{ color: '#5db2e2', marginRight: 4 }} />
          Agent 承诺：分配量给建议，最终下发由你确认；所有人工修改自动留痕并可追溯（出处：分货数据关键字段）。
        </div>
      </Card>

      {/* 校验结果提示 */}
      {hitlDone && (
        <Alert
          style={{ marginTop: 14 }}
          type="success"
          showIcon
          message="约束校验通过 · 方案已锁定"
          description="全部行满足：分配量 ≤ 可发量上限、分配后库存天数 ≥ 安全水位、促销放量仓优先保障、大日期不新增积压。可进入补货单生成与下发（故事线4）。"
        />
      )}
    </div>
  );
}
