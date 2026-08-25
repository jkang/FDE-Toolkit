import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function PaymentAftercarePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [payOrderResult, setPayOrderResult] = useState(null);
  const [payOrderLoading, setPayOrderLoading] = useState(false);

  const handlePayOrder = async (payload) => {
    setPayOrderLoading(true);
    try {
      const data = await api.payOrder(payload || {});
      setPayOrderResult(data);
    } catch (e) {
      setPayOrderResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setPayOrderLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>支付与售后复购</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>多币种在线支付；D&D 前置透明与会员权益推荐</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 5 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Card title="在线支付运费" style={{ marginBottom: 16 }}>
    <div style={{ marginBottom: 12 }}><span style={{ marginRight: 8 }}>订舱号：</span><Input style={{ width: 260 }} onChange={ (e) => setForm(v => ({ ...v, bookingNo: e.target.value })) } /></div>
    <div style={{ marginBottom: 12 }}><span style={{ marginRight: 8 }}>应付金额：</span><Input style={{ width: 260 }} onChange={ (e) => setForm(v => ({ ...v, amount: e.target.value })) } /></div>
    <div style={{ marginBottom: 12 }}><span style={{ marginRight: 8 }}>币种：</span><Select style={{ width: 260 }} options={ [{ value: 'USD', label: 'USD' }, { value: 'CNY', label: 'CNY' }, { value: 'EUR', label: 'EUR' }] } onChange={ (v) => setForm(v => ({ ...v, currency: v })) } /></div>
    <div style={{ marginBottom: 12 }}><span style={{ marginRight: 8 }}>支付方式：</span><Select style={{ width: 260 }} options={ [{ value: '本地支付', label: '本地支付' }, { value: '信用卡', label: '信用卡' }, { value: '电汇', label: '电汇' }] } onChange={ (v) => setForm(v => ({ ...v, method: v })) } /></div>
    <Button type="primary" loading={ payOrderLoading } onClick={ () => handlePayOrder(form) }>提交</Button>
  </Card>
  <Card title="支付结果" style={{ marginBottom: 16 }}>
    { payOrderLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : payOrderResult ? (
      payOrderResult.error ? (
        <Alert type="error" message="调用失败" description={ payOrderResult.error } />
      ) : (
        <div>
          { payOrderResult && Object.entries(payOrderResult).filter(([k]) => k !== 'error').map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6, display: 'flex', gap: 8 }}>
              <Typography.Text strong style={{ minWidth: 90, flexShrink: 0 }}>{k}：</Typography.Text>
              <Typography.Text>{typeof v === 'string' ? v : JSON.stringify(v)}</Typography.Text>
            </div>
          ))}
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Space wrap style={{ marginBottom: 16 }}>
    <Tag color="gold">PlumSmart Silver 会员</Tag>
    <Tag color="blue">舱位保证兑现率 95%+（KPI 5）</Tag>
    <Tag color="cyan">E-Spot Flash Sale 优先权</Tag>
    <Tag color="green">24/7 Agent 服务</Tag>
  </Space>
  <Alert type="success" message="AI 复购关怀 [推断]" description="基于近 3 个月 12 TEU 订舱量，已为您预留下月美西舱位保证额度；直客（非货代）订单占比目标 40%（KPI 7）" showIcon style={{ marginBottom: 16 }} />
    </div>
  );
}
