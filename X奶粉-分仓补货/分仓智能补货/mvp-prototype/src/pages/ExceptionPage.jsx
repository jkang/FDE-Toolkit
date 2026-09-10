// 故事线3 · 异常诊断与备选方案（3 套备选对比 · 错误态降级提示 · 出处引用）
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Alert, Space, message, Statistic, Row, Col } from 'antd';
import { ThunderboltOutlined, WarningFilled, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import SourceCard from '../components/SourceCard.jsx';
import TermTooltip from '../components/TermTooltip.jsx';
import { api } from '../api/client.js';
import { glossary } from '../data/appData.js';

const termMap = Object.fromEntries(glossary.map((g) => [g.term, g.define]));

export default function ExceptionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.diagnoseException({});
      setData(r);
    } catch (e) {
      message.error('诊断失败：' + String(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const rows = data?.rows || [];

  const columns = [
    {
      title: '备选方案', dataIndex: 'option', width: 170, fixed: 'left',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 700 }}>{v}</div>
          {r.option.includes('A') && <Tag color="processing" style={{ marginTop: 3 }}>推荐</Tag>}
        </div>
      ),
    },
    { title: '货源基地仓', dataIndex: 'sourceWarehouse', width: 120 },
    { title: '距离', dataIndex: 'distance', width: 90, render: (v) => <span className="num-strong">{v} km</span> },
    {
      title: '时效', dataIndex: 'transitDays', width: 90,
      render: (v) => <span className="num-strong">{v} 天</span>,
    },
    {
      title: '可发量', dataIndex: 'availability', width: 100,
      render: (v) => <span className="num-strong">{v ? v.toLocaleString() : '—'} 罐</span>,
    },
    {
      title: <TermTooltip term="生产备货率" define={termMap['生产备货率']}>生产备货率</TermTooltip>,
      dataIndex: 'stockRate', width: 96,
      render: (v) => {
        const n = parseInt(v);
        return (
          <div>
            <span className="num-strong">{v}</span>
            <div className="mini-bar" style={{ marginTop: 4 }}>
              <i style={{ width: `${n}%`, background: n >= 90 ? '#1a8f5c' : n >= 85 ? '#5db2e2' : '#f59e0b' }} />
            </div>
          </div>
        );
      },
    },
    {
      title: '物流预警', dataIndex: 'warning', width: 200,
      render: (v) => (v === '无预警' ? <Tag color="success">无预警</Tag> : <Tag color="warning" icon={<WarningFilled />}>{v}</Tag>),
    },
    {
      title: '操作', key: 'op', width: 90, fixed: 'right',
      render: (_, r) => (
        <Button size="small" type="link" icon={<SendOutlined />} onClick={() => message.info(`概念原型：已选择「${r.option}」，可进入补货单生成（故事线4）`)}>
          采用
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {loading ? <AgentStatusBadge status="tool_calling" label="诊断中" /> : <AgentStatusBadge status="error" label="降级运行" />}
          <span style={{ fontSize: 12, color: '#8a94ab' }}>异常分支 · 冲突仲裁：可发量约束 &gt; 时效优先（SKP 分配量调整经验）· 拆分多仓补足</span>
        </div>
        <Space>
          <SourceCard
            compact
            sources={[
              { name: '仓网距离', system: '仓网主数据', trust: '高 · 静态主数据', desc: '线路里程 / 标准时效' },
              { name: '物流预警', system: 'TMS', trust: '低 · 未接通', desc: '降级为历史运输时效估算' },
              { name: '各仓可发量', system: '库存系统', trust: '高 · 准实时', desc: '可发量约束 > 时效优先' },
              { name: '分配量调整经验', system: 'SKP 决策模型类', trust: '高 · 已深挖', desc: '可发量不足 → 拆分多仓补足' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>重新诊断</Button>
        </Space>
      </div>

      {/* 诊断结论 + 错误态 */}
      <Row gutter={14} style={{ marginBottom: 14 }}>
        <Col xs={24} xl={16}>
          <Alert
            type="error"
            showIcon
            icon={<WarningFilled />}
            message="错误态降级：TMS 物流预警数据暂未接通（评级 C · 需开发）"
            description="备选方案中的「物流预警」列已按历史运输时效估算，确定性偏低。按 Agent 兜底策略：给降级建议 + 升级人工，建议人工复核后下发。"
            action={
              <Button size="small" danger onClick={() => message.info('已升级人工复核：等待物流调度组人工复核线路风险后决定')}>
                升级人工复核
              </Button>
            }
            style={{ marginBottom: 12 }}
          />
          <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>诊断结论</span>}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Statistic title="华北基地仓可发量" value={32000} suffix="罐" valueStyle={{ fontSize: 22 }} />
              <Statistic title="华北区 14 天缺口" value={58000} suffix="罐" valueStyle={{ fontSize: 22, color: '#ef4444' }} />
              <Statistic title="缺口率" value={45} suffix="%" valueStyle={{ fontSize: 22, color: '#ef4444' }} />
              <div style={{ alignSelf: 'center', fontSize: 12, color: '#8a94ab', maxWidth: 280, lineHeight: 1.7 }}>
                <ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 4 }} />
                已按「可发量约束 &gt; 时效优先」检索周边资源，拆分多仓补足：华东大仓 / 武汉基地仓 / 就近仓拼车，输出 3 套备选（距离/时效/可发量/生产备货率维度）。
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card size="small" title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>人工兜底路径</span>}>
            {['方案A 或 B 下发前：人工复核 TMS 线路风险', '方案C（就近拼车）：时效最短但生产备货率仅 78%', '完全失败时：切人工 / 按历史经验估算 / 放弃并保留上下文'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderTop: '1px solid #f0f3f8', fontSize: 12.5, color: '#55617a' }}>
                <span className="num-strong" style={{ color: '#2b5db8' }}>{i + 1}.</span>
                {t}
              </div>
            ))}
            <Alert style={{ marginTop: 10 }} type="warning" showIcon message="Agent 不会在数据不确定时直接下发，兜底选项 ≥2 个" />
          </Card>
        </Col>
      </Row>

      {/* 备选方案对比表 */}
      <Card
        size="small"
        title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>备选方案对比</span>}
        extra={
          <span style={{ fontSize: 11.5, color: '#8a94ab' }}>
            <TermTooltip term="生产备货率" define={termMap['生产备货率']}>生产备货率</TermTooltip> = (现货+在途+本月已出库)/销售计划 · 物流预警列当前为降级估算值
          </span>
        }
      >
        <Table
          rowKey={(r) => r.option}
          size="middle"
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={false}
          scroll={{ x: 880 }}
        />
        <div style={{ marginTop: 10, fontSize: 11.5, color: '#8a94ab' }}>
          ⚠️ 本分支决策依据为 SKP 决策模型类·分配量调整经验（冲突仲裁：可发量约束 &gt; 时效优先）；「积兆逻辑」仍为伪经验候选待二轮验证，概念原型沿用可发量约束仲裁逻辑，SKP 二轮验证后回填。
        </div>
      </Card>
    </div>
  );
}
