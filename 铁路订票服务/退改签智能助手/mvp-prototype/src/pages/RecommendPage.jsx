import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function RecommendPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [recommendPlansResult, setRecommendPlansResult] = useState(null);
  const [recommendPlansLoading, setRecommendPlansLoading] = useState(false);
  const [disposeChangeResult, setDisposeChangeResult] = useState(null);
  const [disposeChangeLoading, setDisposeChangeLoading] = useState(false);

  const handleRecommendPlans = async (payload) => {
    setRecommendPlansLoading(true);
    try {
      const data = await api.recommendPlans(payload || {});
      setRecommendPlansResult(data);
    } catch (e) {
      setRecommendPlansResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setRecommendPlansLoading(false);
    }
  };

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

const tagMap_planType = {"直达": "success", "换乘": "warning", "候补": "processing"};
const tagMap_riskLevel = {"低": "success", "中": "warning", "高": "error"};
const recommendPlansCols = [
    { key: 'planId', dataIndex: 'planId', title: '方案' },
    { key: 'trainNo', dataIndex: 'trainNo', title: '车次' },
    { key: 'planType', dataIndex: 'planType', title: '类型', render: (v) => <Tag color={ tagMap_planType[v] || 'default' }>{v}</Tag> },
    { key: 'departTime', dataIndex: 'departTime', title: '出发时间' },
    { key: 'matchScore', dataIndex: 'matchScore', title: '匹配度' },
    { key: 'riskLevel', dataIndex: 'riskLevel', title: '风险', render: (v) => <Tag color={ tagMap_riskLevel[v] || 'default' }>{v}</Tag> },
    { key: 'priceDiff', dataIndex: 'priceDiff', title: '票价差' },
];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>改签方案推荐</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>并发检索直达/候补/换乘方案，结合偏好与成功率排序输出 Top 3（P0）</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 2 } items={ [{ title: '场景识别' }, { title: '规则转译' }, { title: '方案推荐' }, { title: '一体化处置' }, { title: '确认后续' }] } />
  </Card>
  <Card title="Top 3 改签方案（含风险与票价差）" style={{ marginBottom: 16 }}>
    { recommendPlansLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : recommendPlansResult ? (
      recommendPlansResult.error ? (
        <Alert type="error" message="调用失败" description={ recommendPlansResult.error } />
      ) : (
        <div>
          { recommendPlansResult.summary ? <Typography.Paragraph type="secondary">{ recommendPlansResult.summary }</Typography.Paragraph> : null }
          <Table rowKey={(r, i) => i} dataSource={ recommendPlansResult.items || [] } columns={ recommendPlansCols } pagination={ false } size="small" />
        </div>
      )
    ) : (
      <Empty description="触发操作后展示结果" />
    )}
  </Card>
  <Alert type="warning" message="选择改签方案与发起退改交易是对外承诺，需旅客确认放行" description="硬约束：席别一致不可突破；偏好冲突优先级：尽早出发 > 席别一致 > 不换乘" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="default" onClick={ () => handleRecommendPlans({}) }>智能推荐改签方案</Button>
    <Button type="primary" onClick={ () => handleDisposeChange({}) }>选定方案并处置</Button>
    <Button type="link" onClick={ () => navigate('/dispose') }>进入一体化处置</Button>
  </Space>
    </div>
  );
}
