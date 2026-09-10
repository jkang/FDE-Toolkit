import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function TranslatePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [translateFeeResult, setTranslateFeeResult] = useState(null);
  const [translateFeeLoading, setTranslateFeeLoading] = useState(false);

  const handleTranslateFee = async (payload) => {
    setTranslateFeeLoading(true);
    try {
      const data = await api.translateFee(payload || {});
      setTranslateFeeResult(data);
    } catch (e) {
      setTranslateFeeResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setTranslateFeeLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>规则转译与费用对比</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>阶梯费率实时转译为大白话，输出退票损失 vs 改签成本对比</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 1 } items={ [{ title: '场景识别' }, { title: '规则转译' }, { title: '方案推荐' }, { title: '一体化处置' }, { title: '确认后续' }] } />
  </Card>
  <Card title="退改签费用转译与对比" style={{ marginBottom: 16 }}>
    { translateFeeLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : translateFeeResult ? (
      translateFeeResult.error ? (
        <Alert type="error" message="调用失败" description={ translateFeeResult.error } />
      ) : (
        <div>
          { translateFeeResult && Object.entries(translateFeeResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Alert type="info" message="计费由确定性规则引擎计算，LLM 仅做规则转译，金额与结果一致" description="阶梯费率：开车前 8 天以上免费、48 小时以上 5%、24–48 小时 10%、不足 24 小时 20%（最低 2 元）；因铁路责任免费" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="primary" onClick={ () => navigate('/recommend') }>进入改签方案推荐</Button>
  </Space>
    </div>
  );
}
