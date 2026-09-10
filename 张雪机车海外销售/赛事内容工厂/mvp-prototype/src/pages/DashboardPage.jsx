import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});

const tagMap_reviewStatus = {"待审核": "warning", "已放行": "processing", "已发布": "success"};
const tblCols = [
    { key: 'code', dataIndex: 'code', title: '内容编号' },
    { key: 'languages', dataIndex: 'languages', title: '语言' },
    { key: 'platforms', dataIndex: 'platforms', title: '适配平台' },
    { key: 'reviewStatus', dataIndex: 'reviewStatus', title: '审核状态', render: (v) => <Tag color={ tagMap_reviewStatus[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"code": "CA-0901-01", "languages": "6 语言", "platforms": "YouTube/TikTok/Reels", "reviewStatus": "待审核"}, {"code": "CA-0901-02", "languages": "6 语言", "platforms": "YouTube/TikTok", "reviewStatus": "已放行"}, {"code": "CA-0831-05", "languages": "6 语言", "platforms": "全平台", "reviewStatus": "已发布"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>内容工厂总览</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>赛事内容工厂北极星贡献看板：内容产出时效 3 天 → 30 分钟，多语言成本 ↓90%</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 0 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="内容产出时效" value={ "30" } suffix="分钟（原 3 天）" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="多语言单位成本" value={ "\u219390" } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="内容互动率" value={ "\u219135" } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="社媒运营人力" value={ "1" } suffix="人（原 5 人）" />
      </Card>
    </Col>
  </Row>
  <Alert type="info" message="场景定位：AI 赛事内容工厂" description="WSBK 高光 → 多语言解说短视频/图文 → 多平台适配发布 → 效果回流；Agent 主驱动，人工仅在品牌价值判断与风险兜底介入" showIcon style={{ marginBottom: 16 }} />
  <Card title="我的内容包" style={{ marginBottom: 16 }}>
    <Table rowKey="code" dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/ingest') }>开始内容生产</Button>
  </Space>
    </div>
  );
}
