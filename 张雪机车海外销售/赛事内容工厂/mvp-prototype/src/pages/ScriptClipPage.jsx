import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function ScriptClipPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [generateScriptResult, setGenerateScriptResult] = useState(null);
  const [generateScriptLoading, setGenerateScriptLoading] = useState(false);

  const handleGenerateScript = async (payload) => {
    setGenerateScriptLoading(true);
    try {
      const data = await api.generateScript(payload || {});
      setGenerateScriptResult(data);
    } catch (e) {
      setGenerateScriptResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setGenerateScriptLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>多语言脚本与剪辑</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>基于叙事要素生成 6 语言解说脚本并本地化改写，随后自动剪辑配音包装</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 2 } items={ [{ title: '素材接入' }, { title: '高光识别' }, { title: '脚本生成' }, { title: '剪辑配音' }, { title: '平台适配' }, { title: '审核发布' }, { title: '效果回流' }] } />
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handleGenerateScript({}) }>生成 6 语言解说脚本</Button>
  </Space>
  <Card title="多语言解说脚本（钩子 → 高潮 → 结果 → CTA）" style={{ marginBottom: 16 }}>
    { generateScriptLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : generateScriptResult ? (
      generateScriptResult.error ? (
        <Alert type="error" message="调用失败" description={ generateScriptResult.error } />
      ) : (
        <div>
          { generateScriptResult && Object.entries(generateScriptResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Alert type="warning" message="文化本地化红线" description="命中文化禁忌/敏感表述自动改写或降级，仍冲突则拉人（品牌内容经理）裁决；某语种配音合成失败切换备用 TTS" showIcon style={{ marginBottom: 16 }} />
  <Card style={{ marginBottom: 16 }}>
    <Timeline>
      <Timeline.Item color="green">自动剪辑高光片段</Timeline.Item>
      <Timeline.Item color="green">6 语言配音与字幕合成</Timeline.Item>
      <Timeline.Item color="blue">品牌元素与封面包装</Timeline.Item>
    </Timeline>
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/platform-adapt') }>脚本确认 → 平台适配</Button>
  </Space>
    </div>
  );
}
