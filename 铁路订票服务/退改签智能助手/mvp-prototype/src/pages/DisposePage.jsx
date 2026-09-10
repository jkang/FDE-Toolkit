import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function DisposePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [disposeChangeResult, setDisposeChangeResult] = useState(null);
  const [disposeChangeLoading, setDisposeChangeLoading] = useState(false);

  const handleDisposeChange = async (payload) => {
    setDisposeChangeLoading(true);
    try {
      const data = await api.disposeChange(payload || {});
      setDisposeChangeResult(data);
    } catch (e) {
      setDisposeChangeResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setDisposeChangeLoading(false);
    }
  };

const tagMap_serviceType = {"餐食": "processing", "约车": "default", "行程单": "processing"};
const tagMap_disposeStatus = {"已更新": "success", "已注销": "default", "处置失败": "error"};
const tblCols = [
    { key: 'serviceNo', dataIndex: 'serviceNo', title: '服务单号' },
    { key: 'serviceType', dataIndex: 'serviceType', title: '服务类型', render: (v) => <Tag color={ tagMap_serviceType[v] || 'default' }>{v}</Tag> },
    { key: 'disposeStatus', dataIndex: 'disposeStatus', title: '处置状态', render: (v) => <Tag color={ tagMap_disposeStatus[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"serviceNo": "CT-8801", "serviceType": "餐食", "disposeStatus": "已更新"}, {"serviceNo": "RD-3302", "serviceType": "约车", "disposeStatus": "已注销"}, {"serviceNo": "IT-1105", "serviceType": "行程单", "disposeStatus": "已更新"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>一体化处置</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>发起主票退改并同步处置关联延伸服务（餐食/约车/行程单）</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 3 } items={ [{ title: '场景识别' }, { title: '规则转译' }, { title: '方案推荐' }, { title: '一体化处置' }, { title: '确认后续' }] } />
  </Card>
  <Card title="主票退改结果" style={{ marginBottom: 16 }}>
    { disposeChangeLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : disposeChangeResult ? (
      disposeChangeResult.error ? (
        <Alert type="error" message="调用失败" description={ disposeChangeResult.error } />
      ) : (
        <div>
          { disposeChangeResult && Object.entries(disposeChangeResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Card title="关联延伸服务处置状态" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleDisposeChange({}) }>执行一体化处置</Button>
    <Button type="link" onClick={ () => navigate('/confirm') }>进入确认与通知</Button>
  </Space>
    </div>
  );
}
