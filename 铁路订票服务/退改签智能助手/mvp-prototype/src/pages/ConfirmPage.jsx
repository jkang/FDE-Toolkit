import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [pushNoticeResult, setPushNoticeResult] = useState(null);
  const [pushNoticeLoading, setPushNoticeLoading] = useState(false);

  const handlePushNotice = async (payload) => {
    setPushNoticeLoading(true);
    try {
      const data = await api.pushNotice(payload || {});
      setPushNoticeResult(data);
    } catch (e) {
      setPushNoticeResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setPushNoticeLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>确认与通知</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>输出处置确认清单、通知推送与行程更新；复杂异常建单转客服</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 4 } items={ [{ title: '场景识别' }, { title: '规则转译' }, { title: '方案推荐' }, { title: '一体化处置' }, { title: '确认后续' }] } />
  </Card>
  <Card title="处置结果与通知" style={{ marginBottom: 16 }}>
    { pushNoticeLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : pushNoticeResult ? (
      pushNoticeResult.error ? (
        <Alert type="error" message="调用失败" description={ pushNoticeResult.error } />
      ) : (
        <div>
          { pushNoticeResult && Object.entries(pushNoticeResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
      <Timeline.Item color="blue">场景已识别</Timeline.Item>
      <Timeline.Item color="blue">费用已转译</Timeline.Item>
      <Timeline.Item color="blue">方案已选定</Timeline.Item>
      <Timeline.Item color="blue">主票与关联服务已处置</Timeline.Item>
      <Timeline.Item color="blue">通知推送与行程更新</Timeline.Item>
    </Timeline>
  </Card>
  <Space wrap>
    <Button type="primary" onClick={ () => handlePushNotice({}) }>推送处置结果并更新行程</Button>
  </Space>
    </div>
  );
}
