import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function ReconcilePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [analyzeReconciliationResult, setAnalyzeReconciliationResult] = useState(null);
  const [analyzeReconciliationLoading, setAnalyzeReconciliationLoading] = useState(false);

  const handleAnalyzeReconciliation = async (payload) => {
    setAnalyzeReconciliationLoading(true);
    try {
      const data = await api.analyzeReconciliation(payload || {});
      setAnalyzeReconciliationResult(data);
    } catch (e) {
      setAnalyzeReconciliationResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setAnalyzeReconciliationLoading(false);
    }
  };

const tagMap_creditDebit = {"不适用": "default", "待生成": "warning", "已过账": "success"};
const tagMap_status = {"对账完成": "success", "对账差异": "warning", "已下载": "processing"};
const tblCols = [
    { key: 'statementNo', dataIndex: 'statementNo', title: '对账单号' },
    { key: 'customer', dataIndex: 'customer', title: '客户' },
    { key: 'period', dataIndex: 'period', title: '对账周期' },
    { key: 'difference', dataIndex: 'difference', title: '差异金额' },
    { key: 'creditDebit', dataIndex: 'creditDebit', title: '借贷项状态', render: (v) => <Tag color={ tagMap_creditDebit[v] || 'default' }>{v}</Tag> },
    { key: 'status', dataIndex: 'status', title: '对账状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"statementNo": "RC-2026-08-001", "customer": "比亚迪电池", "period": "2026-08", "difference": 0, "creditDebit": "不适用", "status": "对账完成"}, {"statementNo": "RC-2026-08-002", "customer": "福耀玻璃", "period": "2026-08", "difference": 1200, "creditDebit": "待生成", "status": "对账差异"}, {"statementNo": "RC-2026-08-003", "customer": "宁德时代", "period": "2026-08", "difference": 0, "creditDebit": "不适用", "status": "已下载"}];
const tagMap_diffStatus = {"容差内": "success", "超容差待裁决": "error", "已处理": "processing"};
const analyzeReconciliationCols = [
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'differenceType', dataIndex: 'differenceType', title: '差异类型' },
    { key: 'differenceAmount', dataIndex: 'differenceAmount', title: '差异金额' },
    { key: 'suggestion', dataIndex: 'suggestion', title: '借贷项建议' },
    { key: 'status', dataIndex: 'status', title: '处理状态', render: (v) => <Tag color={ tagMap_diffStatus[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>对账单工作台</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>创建对账单、上传客户反馈、差异分析、借贷项处理</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 2 } items={ [{ title: '进入工作台' }, { title: '采集与关联确认' }, { title: '对账与差异处理' }, { title: 'POD匹配确认' }, { title: '过账归档' }] } />
  </Card>
  <Card title="对账单清单" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Card title="上传客户反馈对账文件" style={{ marginBottom: 16 }}>
    <Dragger
      accept=".xlsx,.pdf"
      beforeUpload={() => false}
      onChange={(info) => setFileName(info.file?.name || '')}
    >
      <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">上传后系统自动按客户一致性/交货单存在性/数量金额一致性/重复缺失/容差规则比对（示例：客户反馈交货单 8000123456 数量少 1 箱）</p>
    </Dragger>
    <Space style={{ marginTop: 16 }}>
      <Button type="primary" icon={ <CloudUploadOutlined /> } loading={ analyzeReconciliationLoading } onClick={ () => handleAnalyzeReconciliation({ file: fileName || '示例文件.xlsx' }) }>上传反馈并分析差异</Button>
    </Space>
  </Card>
  <Card title="差异分析结果与借贷项建议" style={{ marginBottom: 16 }}>
    { analyzeReconciliationLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : analyzeReconciliationResult ? (
      analyzeReconciliationResult.error ? (
        <Alert type="error" message="调用失败" description={ analyzeReconciliationResult.error } />
      ) : (
        <div>
          { analyzeReconciliationResult.summary ? <Typography.Paragraph type="secondary">{ analyzeReconciliationResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ analyzeReconciliationResult.diffs || [] } columns={ analyzeReconciliationCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/podmatch') }>进入 POD 匹配与确认</Button>
  </Space>
    </div>
  );
}
