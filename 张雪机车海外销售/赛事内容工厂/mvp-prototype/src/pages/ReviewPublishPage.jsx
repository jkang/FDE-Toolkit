import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function ReviewPublishPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [reviewComplianceResult, setReviewComplianceResult] = useState(null);
  const [reviewComplianceLoading, setReviewComplianceLoading] = useState(false);
  const [publishContentResult, setPublishContentResult] = useState(null);
  const [publishContentLoading, setPublishContentLoading] = useState(false);

  const handleReviewCompliance = async (payload) => {
    setReviewComplianceLoading(true);
    try {
      const data = await api.reviewCompliance(payload || {});
      setReviewComplianceResult(data);
    } catch (e) {
      setReviewComplianceResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setReviewComplianceLoading(false);
    }
  };

  const handlePublishContent = async (payload) => {
    setPublishContentLoading(true);
    try {
      const data = await api.publishContent(payload || {});
      setPublishContentResult(data);
    } catch (e) {
      setPublishContentResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setPublishContentLoading(false);
    }
  };

const tagMap_status = {"通过": "success", "待复核": "warning", "拦截": "error"};
const reviewComplianceCols = [
    { key: 'item', dataIndex: 'item', title: '校验项' },
    { key: 'result', dataIndex: 'result', title: '结论' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>品牌审核与发布</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>品牌调性/内容红线/事实三级校验（对外必停），放行后按热点窗口排期发布</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 5 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleReviewCompliance({}) }>品牌调性与内容红线校验</Button>
  </Space>
  <Card title="品牌合规校验结果（调性/红线/事实）" style={{ marginBottom: 16 }}>
    { reviewComplianceLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : reviewComplianceResult ? (
      reviewComplianceResult.error ? (
        <Alert type="error" message="调用失败" description={ reviewComplianceResult.error } />
      ) : (
        <div>
          { reviewComplianceResult.summary ? <Typography.Paragraph type="secondary">{ reviewComplianceResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ reviewComplianceResult.items || [] } columns={ reviewComplianceCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="warning" message="对外必停确认（HITL gate）" description="AI 无权代替品牌承诺：红线命中或事实重大错误一票否决；品牌调性与内容红线终审须人工放行后方可发布" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => handlePublishContent({}) }>确认放行并排期发布</Button>
  </Space>
  <Card title="发布结果" style={{ marginBottom: 16 }}>
    { publishContentLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : publishContentResult ? (
      publishContentResult.error ? (
        <Alert type="error" message="调用失败" description={ publishContentResult.error } />
      ) : (
        <div>
          { publishContentResult && Object.entries(publishContentResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Space wrap>
    <Button type="default" onClick={ () => navigate('/feedback') }>查看效果回流</Button>
  </Space>
    </div>
  );
}
