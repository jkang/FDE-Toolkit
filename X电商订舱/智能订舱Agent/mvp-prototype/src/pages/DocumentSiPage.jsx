import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function DocumentSiPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [parseDocumentsResult, setParseDocumentsResult] = useState(null);
  const [parseDocumentsLoading, setParseDocumentsLoading] = useState(false);

  const handleParseDocuments = async (payload) => {
    setParseDocumentsLoading(true);
    try {
      const data = await api.parseDocuments(payload || {});
      setParseDocumentsResult(data);
    } catch (e) {
      setParseDocumentsResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setParseDocumentsLoading(false);
    }
  };

const tagMap_status = {"通过": "success", "待复核": "warning", "缺失": "error"};
const parseDocumentsCols = [
    { key: 'field', dataIndex: 'field', title: '字段' },
    { key: 'value', dataIndex: 'value', title: '识别值' },
    { key: 'status', dataIndex: 'status', title: '校验状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>单证预填与补件</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>上传 PI / 装箱单，AI 自动抽取字段预填 SI，缺件实时提示并给出示例</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 3 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Card title="贸易单据（PI / 装箱单 / 发票）" style={{ marginBottom: 16 }}>
    <Dragger
      accept=".pdf,.xlsx,.png"
      beforeUpload={() => false}
      onChange={(info) => setFileName(info.file?.name || '')}
    >
      <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">示例：PI-2026-0902.pdf + 装箱单-0902.xlsx（自动抽取品名/唛头/件数/毛重/体积/HS）</p>
    </Dragger>
    <Space style={{ marginTop: 16 }}>
      <Button type="primary" icon={ <CloudUploadOutlined /> } loading={ parseDocumentsLoading } onClick={ () => handleParseDocuments({ file: fileName || '示例文件.xlsx' }) }>识别并预填 SI</Button>
    </Space>
  </Card>
  <Card title="SI 预填与校验结果" style={{ marginBottom: 16 }}>
    { parseDocumentsLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : parseDocumentsResult ? (
      parseDocumentsResult.error ? (
        <Alert type="error" message="调用失败" description={ parseDocumentsResult.error } />
      ) : (
        <div>
          { parseDocumentsResult.summary ? <Typography.Paragraph type="secondary">{ parseDocumentsResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ parseDocumentsResult.items || [] } columns={ parseDocumentsCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="warning" message="补件提醒：2 项待补" description="VGM 截止时间、收货人税号缺失。AI 已生成填写示例：VGM 12,900 KG（装柜后过磅）；税号 US/EIN 88-1234567" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/tracking-alert') }>完成单证 → 出运跟踪</Button>
  </Space>
    </div>
  );
}
