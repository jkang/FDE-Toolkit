// 故事线1 · 全仓网供需全景与缺口告警（红/黄/蓝 DOS 分级 · 支持钻取到仓×SKU）
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Drawer, Descriptions, Empty, Space, message } from 'antd';
import { ReloadOutlined, TableOutlined, DownloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import NetworkMap from '../components/NetworkMap.jsx';
import DonutChart from '../components/DonutChart.jsx';
import KpiCards from '../components/KpiCards.jsx';
import TermTooltip from '../components/TermTooltip.jsx';
import SourceCard from '../components/SourceCard.jsx';
import { api } from '../api/client.js';
import { glossary } from '../data/appData.js';

const termMap = Object.fromEntries(glossary.map((g) => [g.term, g.define]));
const LEVEL_META = {
  红: { cls: 'red', text: '紧急补货' },
  黄: { cls: 'yellow', text: '常规补货' },
  蓝: { cls: 'blue', text: '积压预警' },
  正常: { cls: 'normal', text: '正常' },
};

export default function SupplyOverviewPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [drill, setDrill] = useState(null); // 钻取：仓 × SKU

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.detectGaps({});
      setData(r);
    } catch (e) {
      message.error('缺口识别失败：' + String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const gaps = data?.gaps || [];
  const red = gaps.filter((g) => g.level === '红').length;
  const yellow = gaps.filter((g) => g.level === '黄').length;
  const blue = gaps.filter((g) => g.level === '蓝').length;
  const normal = gaps.filter((g) => g.level === '正常').length;
  const total = gaps.length;

  const pct = (n) => Math.round((n / Math.max(total, 1)) * 100);

  const columns = [
    {
      title: '销售分仓', dataIndex: 'warehouse', width: 120, fixed: 'left',
      render: (v) => <span style={{ fontWeight: 700 }}>{v}</span>,
    },
    { title: 'SKU 品名', dataIndex: 'sku', width: 170 },
    {
      title: <TermTooltip term="DOS" define={termMap['库存天数(DOS)']}>DOS（库存可销天数）</TermTooltip>,
      dataIndex: 'dos', width: 90,
      render: (v, r) => <span className="num-strong">{v}<span className="num-muted"> 天</span></span>,
    },
    { title: '14天销售计划', dataIndex: 'salePlan14d', width: 100, render: (v) => <span className="num-strong">{v.toLocaleString()} 罐</span> },
    { title: '可发量', dataIndex: 'available', width: 100, render: (v) => <span className="num-muted">{v.toLocaleString()} 罐</span> },
    { title: '在途', dataIndex: 'inTransit', width: 90, render: (v) => <span className="num-muted">{v.toLocaleString()} 罐</span> },
    {
      title: '缺口等级', dataIndex: 'level', width: 120, filters: [{ text: '红·紧急', value: '红' }, { text: '黄·常规', value: '黄' }, { text: '蓝·积压', value: '蓝' }, { text: '正常', value: '正常' }],
      onFilter: (v, r) => r.level === v,
      render: (v) => (
        <span className={`badge-dos ${LEVEL_META[v]?.cls}`}>
          <span className={`dot ${LEVEL_META[v]?.cls}`} />
          {LEVEL_META[v]?.text || v}
        </span>
      ),
    },
    {
      title: '操作', key: 'op', width: 90, fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDrill(r)}>钻取</Button>
      ),
    },
  ];

  return (
    <div>
      {/* 头部：状态 + 动作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {loading ? <AgentStatusBadge status="thinking" label="识别全仓网缺口" /> : <AgentStatusBadge status="idle" label="缺口识别完成" />}
          <span style={{ fontSize: 12, color: '#8a94ab' }}>分级口径：红＝可发量+在途&lt;未来7天需求 且 DOS&lt;7 · 黄 7≤DOS&lt;14 · 蓝 DOS&gt;60 且无促销</span>
        </div>
        <Space>
          <SourceCard
            compact
            sources={[
              { name: '现货库存', system: '库存系统', trust: '高 · 准实时', desc: '4 基地仓可发量/待检/合格' },
              { name: '在途库存', system: '库存系统', trust: '高 · 准实时', desc: '在途/已下发未发货' },
              { name: '销售计划', system: '奶粉分仓补调系统', trust: '高 · 批量', desc: '11 分仓 × 14 天计划' },
              { name: '缺口分级规则', system: 'SKP 决策模型类', trust: '专家一致率≥90%', desc: '红＝可发量+在途<未来7天需求且DOS<7 · 蓝>60 且无促销（促销抑制）' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>重新识别</Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.info('概念原型：导出为 Excel 底表（SKP 已深挖口径，演示数据待客户 IT 校验）')}>导出底表</Button>
        </Space>
      </div>

      {/* KPI 卡 */}
      <div style={{ marginBottom: 14 }}>
        <KpiCards
          cols={4}
          items={[
            { label: '监控销售分仓', value: 11, suffix: '仓', sub: '覆盖近 700 SKU', trend: '', color: '#5db2e2' },
            { label: '红色缺口', value: red, suffix: '项', sub: 'DOS<7 紧急补货', trend: '', color: '#ef4444' },
            { label: '黄色缺口', value: yellow, suffix: '项', sub: '7≤DOS<14 常规补货', trend: '', color: '#f59e0b' },
            { label: '蓝色积压', value: blue, suffix: '项', sub: 'DOS>60 促销联动消化', trend: '', color: '#2b5db8' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 14, marginBottom: 14 }}>
        {/* 供需全景看板 */}
        <Card
          size="small"
          title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>供需全景 · 仓网拓扑</span>}
          extra={<Tag color="processing">4 基地仓 → 9+ 销售分仓</Tag>}
        >
          <NetworkMap />
        </Card>

        {/* DOS 分布 */}
        <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>DOS 分级分布</span>}>
          <DonutChart
            size={132}
            segments={[
              { label: '红 · 紧急补货', value: pct(red), color: '#ef4444', cls: 'red' },
              { label: '黄 · 常规补货', value: pct(yellow), color: '#f59e0b', cls: 'yellow' },
              { label: '蓝 · 积压预警', value: pct(blue), color: '#2b5db8', cls: 'blue' },
              { label: '正常', value: pct(normal), color: '#1a8f5c', cls: 'normal' },
            ]}
            centerTitle="缺口样本"
            centerValue={total}
          />
          <div style={{ marginTop: 10, fontSize: 11.5, color: '#8a94ab', borderTop: '1px dashed #e2e8f0', paddingTop: 8 }}>
            <DatabaseOutlined style={{ marginRight: 4, color: '#5db2e2' }} />
            识别口径：可发量 + 在途对 14 天销售计划；红色＝可发量+在途&lt;未来7天需求且 DOS&lt;7，优先触发补货建议；促销期 DOS 高不触发蓝色积压
          </div>
        </Card>
      </div>

      {/* 缺口告警清单 */}
      <Card
        size="small"
        title={
          <span style={{ fontSize: 13.5, fontWeight: 800 }}>
            缺口告警清单
            <Tag style={{ marginLeft: 8, fontWeight: 700 }} color="error">{red} 红</Tag>
            <Tag color="warning">{yellow} 黄</Tag>
            <Tag color="processing">{blue} 蓝</Tag>
          </span>
        }
        extra={<span style={{ fontSize: 11.5, color: '#8a94ab' }}>支持按等级筛选 · 点击「钻取」下钻到仓×SKU 明细</span>}
      >
        <Table
          rowKey={(r) => `${r.warehouse}-${r.sku}`}
          size="middle"
          loading={loading}
          columns={columns}
          dataSource={gaps}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 860 }}
          locale={{ emptyText: <Empty description="暂无缺口数据" /> }}
        />
      </Card>

      {/* 钻取抽屉 */}
      <Drawer
        title={`缺口钻取 · ${drill?.warehouse || ''}`}
        width={520}
        open={!!drill}
        onClose={() => setDrill(null)}
      >
        {drill && (
          <div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="销售分仓">{drill.warehouse}</Descriptions.Item>
              <Descriptions.Item label="区域">{data?.sale?.find((s) => s.name === drill.warehouse)?.region || '—'}</Descriptions.Item>
              <Descriptions.Item label="SKU">{drill.sku}</Descriptions.Item>
              <Descriptions.Item label="缺口等级">
                <span className={`badge-dos ${LEVEL_META[drill.level]?.cls}`}>{LEVEL_META[drill.level]?.text}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<TermTooltip term="DOS" define={termMap['库存天数(DOS)']}>DOS</TermTooltip>}>
                <span className="num-strong">{drill.dos} 天</span>
              </Descriptions.Item>
              <Descriptions.Item label="建议动作">
                {drill.level === '红' ? '本周优先补货（紧急）' : drill.level === '黄' ? '本周常规补货' : '促销联动消化'}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 14, fontSize: 12, color: '#8a94ab' }}>
              <TableOutlined style={{ marginRight: 6 }} />
              概念级：仓×SKU 明细底表（待检/合格/在途/效期批次）沿用 SKP 关键信息提取要点（5 字段），演示数据待客户 IT 校验后回填。
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
