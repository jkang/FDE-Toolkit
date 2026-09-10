import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function PostingPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [executePostingResult, setExecutePostingResult] = useState(null);
  const [executePostingLoading, setExecutePostingLoading] = useState(false);

  const handleExecutePosting = async (payload) => {
    setExecutePostingLoading(true);
    try {
      const data = await api.executePosting(payload || {});
      setExecutePostingResult(data);
    } catch (e) {
      setExecutePostingResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setExecutePostingLoading(false);
    }
  };

const tagMap_postingStatus = {"未过账": "processing", "已过账": "success", "过账失败": "error"};
const tblCols = [
    { key: 'prebillNo', dataIndex: 'prebillNo', title: '预制发票号' },
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'amount', dataIndex: 'amount', title: '金额' },
    { key: 'postingStatus', dataIndex: 'postingStatus', title: '过账状态', render: (v) => <Tag color={ tagMap_postingStatus[v] || 'default' }>{v}</Tag> },
    { key: 'voucherNo', dataIndex: 'voucherNo', title: '凭证号' },
];
const tblData = [{"prebillNo": "PI-2026-08-001", "deliveryNo": "8000123459", "amount": 342000, "postingStatus": "未过账", "voucherNo": ""}, {"prebillNo": "PI-2026-08-002", "deliveryNo": "8000123460", "amount": 158000, "postingStatus": "已过账", "voucherNo": "1000234567"}, {"prebillNo": "PI-2026-08-003", "deliveryNo": "8000123461", "amount": 76000, "postingStatus": "过账失败", "voucherNo": ""}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>发票过账</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>待过账清单、财务过账、凭证回写与打印归档</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 4 } items={ [{ title: '进入工作台' }, { title: '采集与关联确认' }, { title: '对账与差异处理' }, { title: 'POD匹配确认' }, { title: '过账归档' }] } />
  </Card>
  <Card title="待过账清单" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleExecutePosting({}) }>执行发票过账</Button>
  </Space>
  <Card title="过账凭证回写" style={{ marginBottom: 16 }}>
    { executePostingLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : executePostingResult ? (
      executePostingResult.error ? (
        <Alert type="error" message="调用失败" description={ executePostingResult.error } />
      ) : (
        <div>
          { executePostingResult && Object.entries(executePostingResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Card style={{ marginBottom: 16 }}>
    <Timeline>
      <Timeline.Item color="blue">POD 已确认</Timeline.Item>
      <Timeline.Item color="blue">预制发票已生成</Timeline.Item>
      <Timeline.Item color="blue">财务过账</Timeline.Item>
      <Timeline.Item color="blue">打印与归档</Timeline.Item>
    </Timeline>
  </Card>
    </div>
  );
}
