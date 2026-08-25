import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function ChatQuotePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [chatQuoteResult, setChatQuoteResult] = useState(null);
  const [chatQuoteLoading, setChatQuoteLoading] = useState(false);

  const handleChatQuote = async (payload) => {
    setChatQuoteLoading(true);
    try {
      const data = await api.chatQuote(payload || {});
      setChatQuoteResult(data);
    } catch (e) {
      setChatQuoteResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setChatQuoteLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>对话询价</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>以自然语言发起询价，Agent 实时解读报价与费用构成</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 1 } items={ [{ title: '对话询价' }, { title: '舱位推荐' }, { title: '一键订舱' }, { title: '单证预填' }, { title: '出运跟踪' }] } />
  </Card>
  <Card title="智能订舱 Agent" style={{ marginBottom: 16 }}>
    <div style={{ minHeight: 120, marginBottom: 12 }}>
      { chatQuoteResult ? <Alert type="info" showIcon message={ chatQuoteResult.reply || JSON.stringify(chatQuoteResult) } /> : <Typography.Paragraph type="secondary">与 AI 助手对话，获取推荐操作</Typography.Paragraph> }
    </div>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Search
        placeholder="例如：上海到洛杉矶 40HQ，10月8日截关的船有吗？全包价多少？"
        enterButton="发送"
        loading={ chatQuoteLoading }
        onSearch={ (v) => handleChatQuote({ message: v }) }
      />
      <Space wrap>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>推荐指令：</span>
        <Tag color="processing" style={{ cursor: 'pointer' }} onClick={ () => handleChatQuote({ message: '上海→洛杉矶 40HQ 即期报价' }) }>上海→洛杉矶 40HQ 即期报价</Tag>
        <Tag color="processing" style={{ cursor: 'pointer' }} onClick={ () => handleChatQuote({ message: '解读 E-Quote 锁价条款' }) }>解读 E-Quote 锁价条款</Tag>
        <Tag color="processing" style={{ cursor: 'pointer' }} onClick={ () => handleChatQuote({ message: '查询 Space Protection 舱位保证' }) }>查询 Space Protection 舱位保证</Tag>
      </Space>
    </Space>
  </Card>
  <Card title="Agent 报价解读" style={{ marginBottom: 16 }}>
    { chatQuoteLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : chatQuoteResult ? (
      chatQuoteResult.error ? (
        <Alert type="error" message="调用失败" description={ chatQuoteResult.error } />
      ) : (
        <div>
          { chatQuoteResult && Object.entries(chatQuoteResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/recommend-confirm') }>查看舱位推荐 →</Button>
  </Space>
    </div>
  );
}
