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

const tagMap_status = {"待装柜": "processing", "已开船": "success", "待补件": "warning"};
const tblCols = [
    { key: 'code', dataIndex: 'code', title: '订舱号' },
    { key: 'route', dataIndex: 'route', title: '航线' },
    { key: 'vessel', dataIndex: 'vessel', title: '船名航次' },
    { key: 'etd', dataIndex: 'etd', title: 'ETD' },
    { key: 'rate', dataIndex: 'rate', title: '运价' },
    { key: 'status', dataIndex: 'status', title: '状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"code": "BK-2026-0901-001", "route": "上海→洛杉矶", "vessel": "X-PRIDE 101E", "etd": "2026-09-12", "rate": "USD 2,450", "status": "待装柜"}, {"code": "BK-2026-0901-002", "route": "宁波→汉堡", "vessel": "X-HARMONY 201E", "etd": "2026-09-15", "rate": "USD 2,780", "status": "已开船"}, {"code": "BK-2026-0901-003", "route": "上海→鹿特丹", "vessel": "X-VOYAGER 305E", "etd": "2026-09-18", "rate": "USD 2,950", "status": "待补件"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>工作台总览</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>北极星贡献看板：电商订舱渗透率 25%[推断] → 40%（phase3 口径）</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 0 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="电商订舱渗透率（当前）" value={ 25 } suffix="% [推断]" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="目标渗透率（12 个月）" value={ 40 } suffix="%" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="在线订舱确认时效" value={ "\u22642h" } suffix="" />
      </Card>
    </Col>
    <Col xs={12} md={6}>
      <Card>
        <Statistic title="AI 服务分流率" value={ 30 } suffix="%+" />
      </Card>
    </Col>
  </Row>
  <Alert type="info" message="场景定位：智能订舱 Agent（优先级 Top 6 · 7.35 分，高认知辅助）" description="将 AI 客服（Ask Fin/小飞）从问答升级为可执行订舱的 Agent：报价解读、舱位推荐、订舱操作、单证预填、异常补件（来源：AI 场景优先级矩阵 G02）" showIcon style={{ marginBottom: 16 }} />
  <Card title="我的电商订舱" style={{ marginBottom: 16 }}>
    <Table rowKey="code" dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/chat-quote') }>开始对话询价</Button>
    <Button type="default" onClick={ () => navigate('/tracking-alert') }>查看出运跟踪</Button>
  </Space>
    </div>
  );
}
