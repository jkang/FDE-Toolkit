import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function RecommendConfirmPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [recommendSpaceResult, setRecommendSpaceResult] = useState(null);
  const [recommendSpaceLoading, setRecommendSpaceLoading] = useState(false);
  const [submitBookingResult, setSubmitBookingResult] = useState(null);
  const [submitBookingLoading, setSubmitBookingLoading] = useState(false);

  const handleRecommendSpace = async (payload) => {
    setRecommendSpaceLoading(true);
    try {
      const data = await api.recommendSpace(payload || {});
      setRecommendSpaceResult(data);
    } catch (e) {
      setRecommendSpaceResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setRecommendSpaceLoading(false);
    }
  };

  const handleSubmitBooking = async (payload) => {
    setSubmitBookingLoading(true);
    try {
      const data = await api.submitBooking(payload || {});
      setSubmitBookingResult(data);
    } catch (e) {
      setSubmitBookingResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setSubmitBookingLoading(false);
    }
  };

const tagMap_space = {"舱位保证": "success", "可订": "processing", "需确认": "warning"};
const recommendSpaceCols = [
    { key: 'option', dataIndex: 'option', title: '方案' },
    { key: 'product', dataIndex: 'product', title: '产品' },
    { key: 'rate', dataIndex: 'rate', title: 'All-in 运价' },
    { key: 'transit', dataIndex: 'transit', title: '航程' },
    { key: 'etd', dataIndex: 'etd', title: 'ETD' },
    { key: 'space', dataIndex: 'space', title: '舱位状态', render: (v) => <Tag color={ tagMap_space[v] || 'default' }>{v}</Tag> },
    { key: 'score', dataIndex: 'score', title: '推荐指数' },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>舱位推荐与一键订舱</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>AI 综合排序推荐 Top 3 舱位方案，对话内一键确认订舱</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 2 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleRecommendSpace({}) }>AI 舱位推荐（Top 3）</Button>
  </Space>
  <Card title="Agent 舱位推荐" style={{ marginBottom: 16 }}>
    { recommendSpaceLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : recommendSpaceResult ? (
      recommendSpaceResult.error ? (
        <Alert type="error" message="调用失败" description={ recommendSpaceResult.error } />
      ) : (
        <div>
          { recommendSpaceResult.summary ? <Typography.Paragraph type="secondary">{ recommendSpaceResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ recommendSpaceResult.items || [] } columns={ recommendSpaceCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="info" message="舱位保证（Space Protection）" description="E-Spot / Secured E-Quote 带舱位保证；电商订舱舱位保证兑现率目标 95%+（KPI 5，phase3 口径）" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => handleSubmitBooking({}) }>确认并一键订舱</Button>
  </Space>
  <Card title="订舱确认结果（Booking Confirmation）" style={{ marginBottom: 16 }}>
    { submitBookingLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : submitBookingResult ? (
      submitBookingResult.error ? (
        <Alert type="error" message="调用失败" description={ submitBookingResult.error } />
      ) : (
        <div>
          { submitBookingResult && Object.entries(submitBookingResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
    </div>
  );
}
