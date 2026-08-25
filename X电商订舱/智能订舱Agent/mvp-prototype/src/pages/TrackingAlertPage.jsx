import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function TrackingAlertPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [getTrackingResult, setGetTrackingResult] = useState(null);
  const [getTrackingLoading, setGetTrackingLoading] = useState(false);
  const [predictDelayResult, setPredictDelayResult] = useState(null);
  const [predictDelayLoading, setPredictDelayLoading] = useState(false);

  const handleGetTracking = async (payload) => {
    setGetTrackingLoading(true);
    try {
      const data = await api.getTracking(payload || {});
      setGetTrackingResult(data);
    } catch (e) {
      setGetTrackingResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setGetTrackingLoading(false);
    }
  };

  const handlePredictDelay = async (payload) => {
    setPredictDelayLoading(true);
    try {
      const data = await api.predictDelay(payload || {});
      setPredictDelayResult(data);
    } catch (e) {
      setPredictDelayResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setPredictDelayLoading(false);
    }
  };

const tagMap_status = {"完成": "success", "进行中": "processing", "待到达": "default"};
const getTrackingCols = [
    { key: 'milestone', dataIndex: 'milestone', title: '节点' },
    { key: 'time', dataIndex: 'time', title: '时间' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
const tagMap_status2 = {"推荐": "success", "可选": "default"};
const predictDelayCols = [
    { key: 'option', dataIndex: 'option', title: '方案' },
    { key: 'voyage', dataIndex: 'voyage', title: '航次' },
    { key: 'etd', dataIndex: 'etd', title: 'ETD' },
    { key: 'impact', dataIndex: 'impact', title: '货期影响' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status2[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>出运跟踪与预警</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>控制塔里程碑实时可见；AI 预测性延误预警与改配方案</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 4 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="预计到港（ETA）" value={ "10-02" } suffix="" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="延误概率 [推断]" value={ 68 } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="在航天数" value={ 12 } suffix=" 天" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="里程碑" value={ 5 } suffix="/8" />
      </Card>
    </Col>
  </Row>
  <Space wrap>
    <Button type="default" onClick={ () => handleGetTracking({}) }>刷新实时跟踪</Button>
  </Space>
  <Card title="控制塔 · 实时里程碑" style={{ marginBottom: 16 }}>
    { getTrackingLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : getTrackingResult ? (
      getTrackingResult.error ? (
        <Alert type="error" message="调用失败" description={ getTrackingResult.error } />
      ) : (
        <div>
          { getTrackingResult.summary ? <Typography.Paragraph type="secondary">{ getTrackingResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ getTrackingResult.items || [] } columns={ getTrackingCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="warning" message="AI 预测性预警：预计延误 2~3 天 [推断]" description="洛杉矶码头拥堵指数高企 + 上一航次晚到 1.5 天（多源轨迹/码头数据）。建议启用改配方案或 Delay in Transit 保障（2025.12 上线条款）" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => handlePredictDelay({}) }>AI 延误预测 / 生成改配建议</Button>
  </Space>
  <Card title="改配方案建议" style={{ marginBottom: 16 }}>
    { predictDelayLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : predictDelayResult ? (
      predictDelayResult.error ? (
        <Alert type="error" message="调用失败" description={ predictDelayResult.error } />
      ) : (
        <div>
          { predictDelayResult.summary ? <Typography.Paragraph type="secondary">{ predictDelayResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ predictDelayResult.items || [] } columns={ predictDelayCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/payment-aftercare') }>在线支付运费 →</Button>
  </Space>
    </div>
  );
}
