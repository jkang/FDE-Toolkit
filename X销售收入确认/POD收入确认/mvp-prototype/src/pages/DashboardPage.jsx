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
  const [loadDashboardResult, setLoadDashboardResult] = useState(null);
  const [loadDashboardLoading, setLoadDashboardLoading] = useState(false);

  const handleLoadDashboard = async (payload) => {
    setLoadDashboardLoading(true);
    try {
      const data = await api.loadDashboard(payload || {});
      setLoadDashboardResult(data);
    } catch (e) {
      setLoadDashboardResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setLoadDashboardLoading(false);
    }
  };

const tagMap_reconStatus = {"对账完成": "success", "对账差异": "warning", "未创建": "default"};
const tagMap_podStatus = {"已确认": "success", "待确认": "processing", "未确认": "default"};
const tblCols = [
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'customer', dataIndex: 'customer', title: '客户' },
    { key: 'amount', dataIndex: 'amount', title: '金额' },
    { key: 'reconStatus', dataIndex: 'reconStatus', title: '对账状态', render: (v) => <Tag color={ tagMap_reconStatus[v] || 'default' }>{v}</Tag> },
    { key: 'podStatus', dataIndex: 'podStatus', title: 'POD状态', render: (v) => <Tag color={ tagMap_podStatus[v] || 'default' }>{v}</Tag> },
    { key: 'owner', dataIndex: 'owner', title: '责任人' },
];
const tblData = [{"deliveryNo": "8000123456", "customer": "比亚迪电池", "amount": 128600, "deliveryDate": "2026-08-28", "reconStatus": "对账完成", "podStatus": "待确认", "owner": "王静"}, {"deliveryNo": "8000123457", "customer": "福耀玻璃", "amount": 86500, "deliveryDate": "2026-08-29", "reconStatus": "对账差异", "podStatus": "待确认", "owner": "王静"}, {"deliveryNo": "8000123458", "customer": "宁德时代", "amount": 205000, "deliveryDate": "2026-08-30", "reconStatus": "未创建", "podStatus": "未确认", "owner": "王静"}, {"deliveryNo": "8000123459", "customer": "比亚迪整车", "amount": 342000, "deliveryDate": "2026-08-31", "reconStatus": "对账完成", "podStatus": "已确认", "owner": "王静"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>首页驾驶舱</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>流程节点数量看板与超期异常，待办按角色过滤</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 0 } items={ [{ title: '进入工作台' }, { title: '采集与关联确认' }, { title: '对账与差异处理' }, { title: 'POD匹配确认' }, { title: '过账归档' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待物流关联" value={ 3 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待签收" value={ 5 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待创建对账单" value={ 2 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待POD确认" value={ 18 } suffix="单" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="待过账" value={ 7 } suffix="单" />
      </Card>
    </Col>
  </Row>
  <Card title="待办清单（按角色/数据范围过滤）" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Alert type="warning" message="超期异常：已发货未取发运单 3 单 / 已取得未签收 5 单 / 已发货未创建对账单 2 单 / 具备条件未 POD 确认 4 单" description="超期阈值可在系统配置中维护，超过严重阈值将升级责任人/经理" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/collect') }>进入数据采集中心</Button>
  </Space>
    </div>
  );
}
