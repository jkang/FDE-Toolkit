// 故事线4 · 补货单生成下发（撤销 Toast） + 执行跟踪看板（#6 撤销回滚 · #10 空态）
import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Steps, Descriptions, Alert, Empty } from 'antd';
import {
  SendOutlined, CarOutlined, CheckCircleFilled, WarningFilled,
  RadarChartOutlined, FileDoneOutlined,
} from '@ant-design/icons';
import AgentStatusBadge from '../components/AgentStatusBadge.jsx';
import UndoToast from '../components/UndoToast.jsx';
import SourceCard from '../components/SourceCard.jsx';
import { api } from '../api/client.js';

export default function ReplenishPage() {
  const [phase, setPhase] = useState('empty');      // empty | issuing | issued | tracking
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState(null);
  const [orders, setOrders] = useState([]);
  const [track, setTrack] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [rolledBack, setRolledBack] = useState(false);

  const issue = async () => {
    setPhase('issuing');
    setIssuing(true);
    setRolledBack(false);
    try {
      const r = await api.issueOrder({});
      setIssued(r);
      setOrders(r.orders || []);
      setPhase('issued');
      setShowUndo(true);
    } catch (e) {
      message.error('下发失败：' + String(e));
      setPhase('empty');
    } finally {
      setIssuing(false);
    }
  };

  const handleUndo = async () => {
    const r = await api.undoOrder({});
    setOrders(r.orders || []);
    setRolledBack(true);
    setPhase('empty');
    setShowUndo(false);
  };

  const handleExpire = () => {
    setShowUndo(false);
    message.info('撤销窗口已关闭，补货单已锁定下发');
  };

  const loadTrack = async () => {
    const r = await api.trackExecution({});
    setTrack(r);
    setPhase('tracking');
  };

  useEffect(() => {
    // 初始展示空态（#10）：未下发前
  }, []);

  const trackColumns = [
    { title: '补货单号', dataIndex: 'orderCode', width: 160, render: (v) => <span className="mono" style={{ color: '#2b5db8' }}>{v}</span> },
    { title: '车辆', dataIndex: 'vehicle', width: 110 },
    { title: '当前位置', dataIndex: 'position', width: 180 },
    {
      title: '运输状态', dataIndex: 'status', width: 110,
      render: (v) => {
        const map = { '运输中': <Tag color="processing">运输中</Tag>, '待装车': <Tag>待装车</Tag>, '已入库': <Tag color="success">已入库</Tag> };
        return map[v] || v;
      },
    },
    {
      title: '进度', dataIndex: 'progress', width: 150,
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="mini-bar" style={{ flex: 1 }}><i style={{ width: `${v}%`, background: v >= 100 ? '#1a8f5c' : '#5db2e2' }} /></div>
          <span className="num-strong" style={{ fontSize: 12 }}>{v}%</span>
        </div>
      ),
    },
    { title: '预计到达', dataIndex: 'eta', width: 110 },
    { title: '入库差异', dataIndex: 'diff', width: 100, render: (v) => (v ? <Tag color="warning">{v} 正常损耗</Tag> : '—') },
  ];

  const orderColumns = [
    { title: '补货单号', dataIndex: 'code', width: 170, render: (v) => <span className="mono" style={{ color: '#2b5db8' }}>{v}</span> },
    { title: '发货基地仓', dataIndex: 'shipFrom', width: 110 },
    { title: '收货销售分仓', dataIndex: 'shipTo', width: 120, render: (v) => <b>{v}</b> },
    { title: 'SKU', dataIndex: 'sku', width: 170 },
    { title: '数量', dataIndex: 'qty', width: 100, render: (v) => <span className="num-strong">{v.toLocaleString()} 罐</span> },
    {
      title: '状态', dataIndex: 'status', width: 130,
      render: (v, r) => {
        if (rolledBack) return <Tag color="default">{v}</Tag>;
        if (v.includes('已下发')) return <Tag color="processing" icon={<SendOutlined />}>{v}</Tag>;
        return <Tag>{v}</Tag>;
      },
    },
  ];

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {issuing ? (
            <AgentStatusBadge status="tool_calling" label="校验并下发中" />
          ) : phase === 'issued' ? (
            <AgentStatusBadge status="awaiting_human" label="已下发 · 撤销窗口中" />
          ) : (
            <AgentStatusBadge status="idle" label="待下发" />
          )}
          <span style={{ fontSize: 12, color: '#8a94ab' }}>补货单校验：收发仓 / SKU 编码 / 数量 ≤ 可发量 / 时效</span>
        </div>
        <Space>
          <SourceCard
            compact
            sources={[
              { name: '补货单校验规则', system: '知识资产', trust: '高 · 显性', desc: '收发仓/SKU/数量/时效 4 项' },
              { name: '物流调度', system: '物流调度系统', trust: '高', desc: '补货单下发写入' },
              { name: '财务核算', system: '财务核算系统', trust: '高', desc: '补货单下发写入' },
              { name: 'TMS 定位', system: 'TMS', trust: '中 · 准实时', desc: '延误>24h/48h 预警' },
            ]}
          />
          <Button type="primary" icon={<SendOutlined />} loading={issuing} onClick={issue} disabled={rolledBack || phase === 'issued'}>
            {rolledBack ? '已撤销 · 可重新下发' : '生成并下发补货单'}
          </Button>
        </Space>
      </div>

      {/* 流程步骤 */}
      <Card size="small" style={{ marginBottom: 14 }}>
        <Steps
          size="small"
          current={phase === 'empty' ? 0 : phase === 'issued' ? 2 : 3}
          items={[
            { title: '方案确认', description: '故事线2 已完成' },
            { title: '生成校验', description: '4 项校验' },
            { title: '下发（可撤销）', description: '物流调度 + 财务' },
            { title: '执行跟踪', description: '在途 / 入库' },
          ]}
        />
      </Card>

      {/* 空态（#10）：未下发时 */}
      {phase === 'empty' && !rolledBack && (
        <Card size="small">
          <div className="empty-block" onClick={issue} style={{ margin: 0 }}>
            <FileDoneOutlined style={{ fontSize: 34, color: '#c5d3e8', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#55617a', marginBottom: 4 }}>暂无已下发的补货单</div>
            <div style={{ fontSize: 12, marginBottom: 10 }}>方案确认后，点击「生成并下发补货单」一键完成校验与下发（概念原型 · 脱敏数据）</div>
            <Button type="primary" icon={<SendOutlined />} onClick={issue}>立即下发（演示故事线4）</Button>
          </div>
        </Card>
      )}

      {/* 已回滚空态 */}
      {rolledBack && (
        <Alert
          style={{ marginBottom: 14 }}
          type="info"
          showIcon
          message="补货单已撤销回滚"
          description="物流调度与财务侧回滚完成，补货单回到「待下发」状态。可重新生成并下发。"
        />
      )}

      {/* 已下发：补货单列表 */}
      {phase !== 'empty' && (
        <Card
          size="small"
          title={<span style={{ fontSize: 13.5, fontWeight: 800 }}>补货单 · {rolledBack ? '已回滚' : '已下发'}</span>}
          extra={<span style={{ fontSize: 11.5, color: '#8a94ab' }}>下发时间：{issued?.issuedAt} · 校验 4/4 通过</span>}
          style={{ marginBottom: 14 }}
        >
          <Table rowKey="code" size="middle" columns={orderColumns} dataSource={orders} pagination={false} />
        </Card>
      )}

      {/* 执行跟踪看板 */}
      <Card
        size="small"
        title={<span style={{ fontSize: 13.5, fontWeight: 800 }}><RadarChartOutlined style={{ color: '#5db2e2', marginRight: 6 }} />执行跟踪 · 在途监控</span>}
        extra={
          <Space>
            <Button size="small" onClick={() => loadTrack()} disabled={phase === 'empty'}>刷新跟踪（4h 自动）</Button>
            <Button size="small" type="link" onClick={() => { if (phase !== 'empty') message.info('查看在途明细：TMS GPS 定位 / 延误 / 破损预警（概念级）'); }}>在途明细</Button>
          </Space>
        }
      >
        {track ? (
          <div>
            {track.alerts.map((a, i) => (
              <Alert
                key={i}
                style={{ marginBottom: 10 }}
                type={a.level === 'warning' ? 'warning' : 'info'}
                showIcon
                message={a.text}
              />
            ))}
            <Table rowKey="orderCode" size="middle" columns={trackColumns} dataSource={track.rows} pagination={false} scroll={{ x: 920 }} />
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#8a94ab' }}>
              自动预警阈值：延误&gt;24h/48h · 破损率&gt;1% · 差异率&gt;0.5% 触发拉人（来源：客户 OSL 采集表决策规则）
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: 12.5, color: '#8a94ab' }}>
                下发补货单后自动开始跟踪在途执行（TMS 定位 + WMS 入库同步）
              </span>
            }
          />
        )}
      </Card>

      {/* 撤销 Toast（#6） */}
      {showUndo && phase === 'issued' && !rolledBack && (
        <UndoToast
          seconds={10}
          text={`已下发 ${orders.length} 张补货单（批次 TB-20260823）`}
          onUndo={handleUndo}
          onExpire={handleExpire}
        />
      )}
    </div>
  );
}
