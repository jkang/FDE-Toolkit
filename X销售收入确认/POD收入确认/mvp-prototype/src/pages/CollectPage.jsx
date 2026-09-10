import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function CollectPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [syncCollectionResult, setSyncCollectionResult] = useState(null);
  const [syncCollectionLoading, setSyncCollectionLoading] = useState(false);

  const handleSyncCollection = async (payload) => {
    setSyncCollectionLoading(true);
    try {
      const data = await api.syncCollection(payload || {});
      setSyncCollectionResult(data);
    } catch (e) {
      setSyncCollectionResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setSyncCollectionLoading(false);
    }
  };

const tagMap_relation = {"已关联": "success", "待复核": "warning", "关联异常": "error"};
const syncCollectionCols = [
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'carrier', dataIndex: 'carrier', title: '承运商' },
    { key: 'shipmentNo', dataIndex: 'shipmentNo', title: '物流发运单号' },
    { key: 'confidence', dataIndex: 'confidence', title: '置信度' },
    { key: 'status', dataIndex: 'status', title: '关联状态', render: (v) => <Tag color={ tagMap_relation[v] || 'default' }>{v}</Tag> },
];
const tagMap_sign = {"有效": "success", "待复核": "warning"};
const podCols = [
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'signPerson', dataIndex: 'signPerson', title: '签收人' },
    { key: 'signTime', dataIndex: 'signTime', title: '签收时间' },
    { key: 'signResult', dataIndex: 'signResult', title: '签收结果' },
    { key: 'status', dataIndex: 'status', title: '复核状态', render: (v) => <Tag color={ tagMap_sign[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>数据采集中心</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>交货单同步、邮件识别与物流发运关联、签收/POD资料识别</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 1 } items={ [{ title: '进入工作台' }, { title: '采集与关联确认' }, { title: '对账与差异处理' }, { title: 'POD匹配确认' }, { title: '过账归档' }] } />
  </Card>
  <Card title="刷新公共邮箱 / 公共文件夹采集" style={{ marginBottom: 16 }}>
    <Dragger
      accept=".eml,.pdf,.xlsx,.png"
      beforeUpload={() => false}
      onChange={(info) => setFileName(info.file?.name || '')}
    >
      <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">系统定时拉取为主、手工刷新为辅；物流发运单号以邮件原文为依据，不开放手工改写（示例：邮件含 DN 8000123456）</p>
    </Dragger>
    <Space style={{ marginTop: 16 }}>
      <Button type="primary" icon={ <CloudUploadOutlined /> } loading={ syncCollectionLoading } onClick={ () => handleSyncCollection({ file: fileName || '示例文件.xlsx' }) }>刷新采集并识别</Button>
    </Space>
  </Card>
  <Card title="邮件识别与物流发运关联结果" style={{ marginBottom: 16 }}>
    { syncCollectionLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : syncCollectionResult ? (
      syncCollectionResult.error ? (
        <Alert type="error" message="调用失败" description={ syncCollectionResult.error } />
      ) : (
        <div>
          { syncCollectionResult.summary ? <Typography.Paragraph type="secondary">{ syncCollectionResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ syncCollectionResult.relations || [] } columns={ syncCollectionCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Card title="签收/POD 识别结果" style={{ marginBottom: 16 }}>
    { syncCollectionLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : syncCollectionResult ? (
      syncCollectionResult.error ? (
        <Alert type="error" message="调用失败" description={ syncCollectionResult.error } />
      ) : (
        <div>
          { syncCollectionResult.summary ? <Typography.Paragraph type="secondary">{ syncCollectionResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ syncCollectionResult.pods || [] } columns={ podCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/reconcile') }>进入对账单工作台</Button>
  </Space>
    </div>
  );
}
