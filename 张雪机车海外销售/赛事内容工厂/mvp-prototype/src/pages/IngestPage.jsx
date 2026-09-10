import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function IngestPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [parseFootageResult, setParseFootageResult] = useState(null);
  const [parseFootageLoading, setParseFootageLoading] = useState(false);
  const [scoreHighlightsResult, setScoreHighlightsResult] = useState(null);
  const [scoreHighlightsLoading, setScoreHighlightsLoading] = useState(false);

  const handleParseFootage = async (payload) => {
    setParseFootageLoading(true);
    try {
      const data = await api.parseFootage(payload || {});
      setParseFootageResult(data);
    } catch (e) {
      setParseFootageResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setParseFootageLoading(false);
    }
  };

  const handleScoreHighlights = async (payload) => {
    setScoreHighlightsLoading(true);
    try {
      const data = await api.scoreHighlights(payload || {});
      setScoreHighlightsResult(data);
    } catch (e) {
      setScoreHighlightsResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setScoreHighlightsLoading(false);
    }
  };

const tagMap_brandVisibility = {"高": "success", "中": "processing", "低": "warning"};
const parseFootageCols = [
    { key: 'clip', dataIndex: 'clip', title: '镜头' },
    { key: 'eventType', dataIndex: 'eventType', title: '事件类型' },
    { key: 'brandVisibility', dataIndex: 'brandVisibility', title: '品牌露出', render: (v) => <Tag color={ tagMap_brandVisibility[v] || 'default' }>{v}</Tag> },
    { key: 'confidence', dataIndex: 'confidence', title: '置信度' },
];
const tagMap_brandVisibility = {"高": "success", "中": "processing", "低": "warning"};
const tagMap_status = {"置顶封面级": "error", "入选": "success", "补加角标": "warning"};
const scoreHighlightsCols = [
    { key: 'code', dataIndex: 'code', title: '高光编号' },
    { key: 'eventType', dataIndex: 'eventType', title: '事件类型' },
    { key: 'score', dataIndex: 'score', title: '高光分' },
    { key: 'brandVisibility', dataIndex: 'brandVisibility', title: '品牌露出', render: (v) => <Tag color={ tagMap_brandVisibility[v] || 'default' }>{v}</Tag> },
    { key: 'status', dataIndex: 'status', title: '处理状态', render: (v) => <Tag color={ tagMap_status[v] || 'default' }>{v}</Tag> },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>素材接入与高光识别</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>上传 WSBK 原始素材，Agent 多模态理解并四因子打分产出高光候选</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 0 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Card title="WSBK 原始赛事素材" style={{ marginBottom: 16 }}>
    <Dragger
      accept=".mp4,.mov,.mkv,.wav,.zip,.json"
      beforeUpload={() => false}
      onChange={(info) => setFileName(info.file?.name || '')}
    >
      <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">示例：WSBK-荷兰站-全程素材-42GB（自动切分镜头、关联赛事数据、标注品牌露出）</p>
    </Dragger>
    <Space style={{ marginTop: 16 }}>
      <Button type="primary" icon={ <CloudUploadOutlined /> } loading={ parseFootageLoading } onClick={ () => handleParseFootage({ file: fileName || '示例文件.xlsx' }) }>多模态理解素材</Button>
    </Space>
  </Card>
  <Card title="多模态理解结果" style={{ marginBottom: 16 }}>
    { parseFootageLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : parseFootageResult ? (
      parseFootageResult.error ? (
        <Alert type="error" message="调用失败" description={ parseFootageResult.error } />
      ) : (
        <div>
          { parseFootageResult.summary ? <Typography.Paragraph type="secondary">{ parseFootageResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ parseFootageResult.items || [] } columns={ parseFootageCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleScoreHighlights({}) }>高光识别与打分（四因子）</Button>
  </Space>
  <Card title="高光候选清单" style={{ marginBottom: 16 }}>
    { scoreHighlightsLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : scoreHighlightsResult ? (
      scoreHighlightsResult.error ? (
        <Alert type="error" message="调用失败" description={ scoreHighlightsResult.error } />
      ) : (
        <div>
          { scoreHighlightsResult.summary ? <Typography.Paragraph type="secondary">{ scoreHighlightsResult.summary }</Typography.Paragraph> : null }
          <Table rowKey="code" dataSource={ scoreHighlightsResult.items || [] } columns={ scoreHighlightsCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="info" message="高光打分四因子" description="品牌相关度 ＞ 叙事价值 ＞ 精彩度 ＞ 历史互动偏好；高光分低于阈值或候选不足 → 回退候选池或拉人判定" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/script-clip') }>进入脚本生成</Button>
  </Space>
    </div>
  );
}
