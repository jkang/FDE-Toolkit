import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [attributePerformanceResult, setAttributePerformanceResult] = useState(null);
  const [attributePerformanceLoading, setAttributePerformanceLoading] = useState(false);

  const handleAttributePerformance = async (payload) => {
    setAttributePerformanceLoading(true);
    try {
      const data = await api.attributePerformance(payload || {});
      setAttributePerformanceResult(data);
    } catch (e) {
      setAttributePerformanceResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setAttributePerformanceLoading(false);
    }
  };

const attributePerformanceCols = [
    { key: 'highlightType', dataIndex: 'highlightType', title: '高光类型' },
    { key: 'engagementRate', dataIndex: 'engagementRate', title: '互动率' },
    { key: 'sampleSize', dataIndex: 'sampleSize', title: '样本量' },
    { key: 'trend', dataIndex: 'trend', title: '相对基准' },
];
const tagMap_status = {"已发布": "success", "排队中": "processing", "失败": "error"};
const tblCols = [
    { key: 'code', dataIndex: 'code', title: '发布编号' },
    { key: 'market', dataIndex: 'market', title: '目标市场' },
    { key: 'platform', dataIndex: 'platform', title: '平台' },
    { key: 'publishTime', dataIndex: 'publishTime', title: '发布时间' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"code": "PUB-0901-01", "market": "北美", "platform": "YouTube", "publishTime": "2026-09-01 22:10", "status": "已发布"}, {"code": "PUB-0901-02", "market": "欧洲", "platform": "TikTok", "publishTime": "2026-09-01 21:40", "status": "已发布"}, {"code": "PUB-0901-03", "market": "拉美", "platform": "Instagram", "publishTime": "2026-09-02 08:00", "status": "排队中"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>效果回流与策略优化</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>互动数据归因到高光类型/脚本风格/平台/时段，样本充分时更新高光偏好权重</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 6 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="内容互动率" value={ "\u219135" } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="归因样本量" value={ 101 } suffix=" 条" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="高光偏好更新" value={ 3 } suffix=" 类" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="内容合规通过率" value={ "100" } suffix="%" />
      </Card>
    </Col>
  </Row>
  <Space wrap>
    <Button type="primary" onClick={ () => handleAttributePerformance({}) }>AI 效果归因</Button>
  </Space>
  <Card title="效果归因结论" style={{ marginBottom: 16 }}>
    { attributePerformanceLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : attributePerformanceResult ? (
      attributePerformanceResult.error ? (
        <Alert type="error" message="调用失败" description={ attributePerformanceResult.error } />
      ) : (
        <div>
          { attributePerformanceResult.summary ? <Typography.Paragraph type="secondary">{ attributePerformanceResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ attributePerformanceResult.items || [] } columns={ attributePerformanceCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Card title="发布记录" style={{ marginBottom: 16 }}>
    <Table rowKey="code" dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Alert type="success" message="策略已优化" description="样本充分时更新高光偏好权重；样本不足/波动大则保守微调或不调整，避免被噪声带偏" showIcon style={{ marginBottom: 16 }} />
    </div>
  );
}
