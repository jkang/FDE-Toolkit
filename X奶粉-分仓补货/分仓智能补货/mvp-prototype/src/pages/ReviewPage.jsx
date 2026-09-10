// 故事线4 延伸 · 月度复盘报告（时效达成率/缺货缓解率/周转率/新鲜度 + 调参建议审批）
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Alert, Timeline } from 'antd';
import { FileTextOutlined, CheckCircleFilled, SendOutlined, ReloadOutlined, WarningFilled } from '@ant-design/icons';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import KpiCards from '../components/KpiCards.jsx';
import SourceCard from '../components/SourceCard.jsx';
import { api } from '../api/client.js';

export default function ReviewPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [approved, setApproved] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.generateReview({});
      setData(r);
    } catch (e) {
      message.error('复盘生成失败：' + String(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const approve = (region) => {
    setApproved((p) => [...p, region]);
    message.success(`调参建议「${region}」已审批生效，参数将在下一分货周期回写`); 
  };

  const kpiItems = (data?.kpi || []).map((k) => ({
    label: k.label,
    value: k.value,
    suffix: k.suffix,
    trend: k.trend,
    sub: `目标 ${k.target}`,
    color: k.status === '达标' ? '#1a8f5c' : '#f59e0b',
  }));

  const sugColumns = [
    { title: '区域', dataIndex: 'region', width: 110, render: (v) => <b>{v}</b> },
    {
      title: '安全水位', key: 'water', width: 190,
      render: (_, r) => (
        <Space size={6}>
          <Tag>{r.current}</Tag>
          <span style={{ color: '#8a94ab' }}>→</span>
          <Tag color="processing"><b>{r.target}</b></Tag>
        </Space>
      ),
    },
    { title: '建议理由', dataIndex: 'reason', width: 340 },
    { title: '影响', dataIndex: 'impact', width: 220 },
    {
      title: '审批', key: 'op', width: 120,
      render: (_, r) =>
        approved.includes(r.region) ? (
          <Tag color="success" icon={<CheckCircleFilled />}>已生效</Tag>
        ) : (
          <Button size="small" type="primary" onClick={() => approve(r.region)}>审批生效</Button>
        ),
    },
  ];

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {loading ? <AgentStatusBadge status="thinking" label="生成复盘" /> : <AgentStatusBadge status="idle" label="复盘已生成" />}
          <span style={{ fontSize: 12, color: '#8a94ab' }}>复盘周期：{data?.period || '…'} · 自动生成 · 调参建议需人工审批生效</span>
        </div>
        <Space>
          <SourceCard
            compact
            sources={[
              { name: '时效达成率', system: 'TMS 台账', trust: '高 · 月度汇总', desc: '≥90% 目标' },
              { name: '缺货缓解率', system: '库存监控报表', trust: '高', desc: '≥85% 目标' },
              { name: '周转天数', system: '库存系统', trust: '中', desc: '同比降幅≤10%' },
              { name: '复盘调参经验', system: 'SKP 决策模型类', trust: '高 · 已深挖', desc: '90%/85%/10% 阈值 · 时效优先于周转' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>重新生成</Button>
        </Space>
      </div>

      {/* KPI */}
      <div style={{ marginBottom: 14 }}>
        <KpiCards cols={4} items={kpiItems} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* 复盘摘要 */}
        <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}><FileTextOutlined style={{ color: '#5db2e2', marginRight: 6 }} />复盘摘要</span>}>
          <div style={{ fontSize: 13, lineHeight: 1.9, color: '#55617a' }}>
            本周期共下发补货单 <b style={{ color: '#10213e' }}>126 张</b>，覆盖 <b style={{ color: '#10213e' }}>11 个销售分仓</b>。
            时效达成率 <b className="delta-up">92%</b>（目标 ≥90%），缺货缓解率 <b className="delta-up">88%</b>（目标 ≥85%），
            库存周转天数 <b className="delta-down">31 天</b>（同比 -3.2 天），商品新鲜度 <b>94%</b>（临期占比 2.1% &lt; 3% 阈值）。
            <br />
            关键发现：华北区域过去 3 个月缺货缓解率持续高于 85%，当前 14 天安全水位偏保守，建议下调至 12 天释放周转空间；
            华南广州白云仓大日期库存占比偏高（6.8%），建议维持水位并加强促销联动消化。
          </div>
          <Alert style={{ marginTop: 10 }} type="info" showIcon message={data?.thresholds || '复盘阈值：时效达成率<90% 优化物流/上调水位 · 缺货缓解率<85% 优化预测/促销上浮 · 周转率同比降>10% 下调水位（SKP 决策模型类·复盘调参经验）'} />
        </Card>

        {/* 调参建议审批 */}
        <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>调参建议 · 审批流</span>}>
          <Table
            rowKey="region"
            size="small"
            columns={sugColumns}
            dataSource={data?.suggestions || []}
            loading={loading}
            pagination={false}
            scroll={{ x: 680 }}
          />
          <div style={{ marginTop: 8, fontSize: 11.5, color: '#8a94ab' }}>
            审批生效后参数将在下一分货周期回写（HITL：参数迭代需计划员审批）
          </div>
        </Card>
      </div>

      {/* 短板分析（SKP 模版范例类·复盘报告：指标总览 → 短板分析 → 调参建议 → 审批） */}
      <Card
        size="small"
        style={{ marginBottom: 14 }}
        title={<span style={{ fontSize: 13.5, fontWeight: 800 }}><WarningFilled style={{ color: '#f59e0b', marginRight: 6 }} />短板分析</span>}
        extra={<span style={{ fontSize: 11.5, color: '#8a94ab' }}>复盘报告模版结构：指标总览 → 短板分析 → 调参建议 → 审批</span>}
      >
        {(data?.analysis || []).map((a, i) => (
          <Alert
            key={i}
            style={{ marginBottom: i < (data?.analysis || []).length - 1 ? 8 : 0 }}
            type={a.level === 'green' ? 'success' : a.level === 'amber' ? 'warning' : 'error'}
            showIcon
            message={<b style={{ fontSize: 12.5 }}>{a.topic}</b>}
            description={<span style={{ fontSize: 12 }}>{a.text}</span>}
          />
        ))}
        {!data?.analysis?.length && (
          <Alert type="success" showIcon message="本周期无突出短板指标" />
        )}
      </Card>

      {/* 参数迭代时间线 */}
      <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>参数迭代留痕</span>}>
        <Timeline
          items={[
            { color: 'green', children: <div><b>2026-08-23 · 安全水位调参审批（华北 14天→12天）</b><div style={{ fontSize: 12, color: '#8a94ab' }}>预计释放约 1.1 万罐周转库存 · 下一分货周期生效</div></div> },
            { color: 'blue', children: <div><b>2026-07-25 · 安全水位调整（华中 13天→14天）</b><div style={{ fontSize: 12, color: '#8a94ab' }}>因郑州大促备货，上调 1 天保障有货率</div></div> },
            { color: 'blue', children: <div><b>2026-06-28 · 备货率分配规则复核</b><div style={{ fontSize: 12, color: '#8a94ab' }}>偏远区域备货率上浮 3%</div></div> },
            { color: 'gray', children: <div><b>2026-05-30 · 首次上线 · 规则基线冻结</b></div> },
          ]}
        />
      </Card>
    </div>
  );
}
