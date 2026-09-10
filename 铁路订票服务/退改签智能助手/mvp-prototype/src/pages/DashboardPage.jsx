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
  const [identifySceneResult, setIdentifySceneResult] = useState(null);
  const [identifySceneLoading, setIdentifySceneLoading] = useState(false);

  const handleIdentifyScene = async (payload) => {
    setIdentifySceneLoading(true);
    try {
      const data = await api.identifyScene(payload || {});
      setIdentifySceneResult(data);
    } catch (e) {
      setIdentifySceneResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setIdentifySceneLoading(false);
    }
  };

const tagMap_status = {"有效": "success", "已改签": "processing", "已退票": "default"};
const tblCols = [
    { key: 'orderNo', dataIndex: 'orderNo', title: '订单号' },
    { key: 'trainNo', dataIndex: 'trainNo', title: '车次' },
    { key: 'seatClass', dataIndex: 'seatClass', title: '席别' },
    { key: 'fare', dataIndex: 'fare', title: '票价' },
    { key: 'departTime', dataIndex: 'departTime', title: '发车时间' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"orderNo": "E123456789", "trainNo": "G1234", "seatClass": "二等座", "fare": 553, "departTime": "2026-09-12 09:00", "status": "有效"}, {"orderNo": "E123456790", "trainNo": "G2345", "seatClass": "一等座", "fare": 880, "departTime": "2026-09-13 14:30", "status": "有效"}, {"orderNo": "E123456791", "trainNo": "D3456", "seatClass": "二等座", "fare": 320, "departTime": "2026-09-14 07:15", "status": "有效"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>处置工作台总览</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>退改签待办、运行变更与自助率概览</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 0 } items={ [{ title: '场景识别' }, { title: '规则转译' }, { title: '方案推荐' }, { title: '一体化处置' }, { title: '确认后续' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待处置订单" value={ 12 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="运行变更影响" value={ 3 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="自助率" value={ 95 } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="平均决策耗时" value={ 8 } suffix="秒" />
      </Card>
    </Col>
  </Row>
  <Card title="待处理订单" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/translate') }>进入规则转译</Button>
  </Space>
    </div>
  );
}
