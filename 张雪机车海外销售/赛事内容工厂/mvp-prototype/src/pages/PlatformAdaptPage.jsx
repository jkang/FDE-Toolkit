import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function PlatformAdaptPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [adaptPlatformsResult, setAdaptPlatformsResult] = useState(null);
  const [adaptPlatformsLoading, setAdaptPlatformsLoading] = useState(false);

  const handleAdaptPlatforms = async (payload) => {
    setAdaptPlatformsLoading(true);
    try {
      const data = await api.adaptPlatforms(payload || {});
      setAdaptPlatformsResult(data);
    } catch (e) {
      setAdaptPlatformsResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setAdaptPlatformsLoading(false);
    }
  };

const tagMap_status = {"已适配": "success", "拆条": "warning", "超限": "error"};
const adaptPlatformsCols = [
    { key: 'platform', dataIndex: 'platform', title: '平台' },
    { key: 'ratio', dataIndex: 'ratio', title: '比例' },
    { key: 'duration', dataIndex: 'duration', title: '时长' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>平台适配与内容包</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>按 YouTube/TikTok/Instagram/Reels 硬规范适配时长/比例/编码并生成标签与 SEO 图文</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 4 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleAdaptPlatforms({}) }>一键适配 4 平台内容包</Button>
  </Space>
  <Card title="多平台适配内容包" style={{ marginBottom: 16 }}>
    { adaptPlatformsLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : adaptPlatformsResult ? (
      adaptPlatformsResult.error ? (
        <Alert type="error" message="调用失败" description={ adaptPlatformsResult.error } />
      ) : (
        <div>
          { adaptPlatformsResult.summary ? <Typography.Paragraph type="secondary">{ adaptPlatformsResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ adaptPlatformsResult.items || [] } columns={ adaptPlatformsCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="info" message="标签与 SEO 图文" description="标签按品牌词/赛事词/品类词/热点词四类组合；标题含赛事+车手+结果，禁止标题党与无关热词堆砌" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/review-publish') }>送品牌审核</Button>
  </Space>
    </div>
  );
}
