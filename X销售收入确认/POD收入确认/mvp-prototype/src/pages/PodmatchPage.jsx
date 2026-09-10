import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Upload, Button, Table, Statistic, Row, Col, Alert, Timeline, Empty, Typography, Space, Tag, Input, Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { api } from '../api/client.js';

const { Dragger } = Upload;

export default function PodmatchPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({});
  const [checkPodConditionsResult, setCheckPodConditionsResult] = useState(null);
  const [checkPodConditionsLoading, setCheckPodConditionsLoading] = useState(false);
  const [confirmPodResult, setConfirmPodResult] = useState(null);
  const [confirmPodLoading, setConfirmPodLoading] = useState(false);

  const handleCheckPodConditions = async (payload) => {
    setCheckPodConditionsLoading(true);
    try {
      const data = await api.checkPodConditions(payload || {});
      setCheckPodConditionsResult(data);
    } catch (e) {
      setCheckPodConditionsResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setCheckPodConditionsLoading(false);
    }
  };

  const handleConfirmPod = async (payload) => {
    setConfirmPodLoading(true);
    try {
      const data = await api.confirmPod(payload || {});
      setConfirmPodResult(data);
    } catch (e) {
      setConfirmPodResult({ error: String(e?.response?.data?.error || e) });
    } finally {
      setConfirmPodLoading(false);
    }
  };

const tagMap_logistics = {"已关联": "success", "未关联": "error"};
const tagMap_sign = {"已签收": "success", "未签收": "error"};
const tagMap_recon = {"已完成": "success", "有差异": "warning", "未创建": "error"};
const tagMap_creditDebit = {"不适用": "default", "待生成": "warning", "已过账": "success"};
const tagMap_matchResult = {"具备条件": "success", "条件缺口": "warning"};
const tblCols = [
    { key: 'deliveryNo', dataIndex: 'deliveryNo', title: '交货单号/DN' },
    { key: 'logistics', dataIndex: 'logistics', title: '物流关联', render: (v) => <Tag color={ tagMap_logistics[v] || 'default' }>{v}</Tag> },
    { key: 'sign', dataIndex: 'sign', title: '签收/POD', render: (v) => <Tag color={ tagMap_sign[v] || 'default' }>{v}</Tag> },
    { key: 'recon', dataIndex: 'recon', title: '对账完成', render: (v) => <Tag color={ tagMap_recon[v] || 'default' }>{v}</Tag> },
    { key: 'creditDebit', dataIndex: 'creditDebit', title: '借贷项', render: (v) => <Tag color={ tagMap_creditDebit[v] || 'default' }>{v}</Tag> },
    { key: 'matchResult', dataIndex: 'matchResult', title: '匹配结论', render: (v) => <Tag color={ tagMap_matchResult[v] || 'default' }>{v}</Tag> },
];
const tblData = [{"deliveryNo": "8000123456", "logistics": "已关联", "sign": "已签收", "recon": "已完成", "creditDebit": "不适用", "matchResult": "具备条件"}, {"deliveryNo": "8000123457", "logistics": "已关联", "sign": "已签收", "recon": "有差异", "creditDebit": "待生成", "matchResult": "条件缺口"}, {"deliveryNo": "8000123458", "logistics": "未关联", "sign": "未签收", "recon": "未创建", "creditDebit": "不适用", "matchResult": "条件缺口"}];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>POD 匹配与确认</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>五要素横向匹配、POD 条件校验与一键 POD 确认（对外确认收入的强制人工闸门）</Typography.Paragraph>
      </div>
  <Card style={{ marginBottom: 16 }}>
    <Steps size="small" current={ 3 } items={ [{ title: '进入工作台' }, { title: '采集与关联确认' }, { title: '对账与差异处理' }, { title: 'POD匹配确认' }, { title: '过账归档' }] } />
  </Card>
  <Card title="横向匹配表（五要素状态）" style={{ marginBottom: 16 }}>
    <Table rowKey={(r, i) => i} dataSource={tblData} columns={tblCols} pagination={false} size="small" />
  </Card>
  <Card title="POD 条件校验结论" style={{ marginBottom: 16 }}>
    { checkPodConditionsLoading ? (
      <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>AI 分析中，请稍候…</div>
    ) : checkPodConditionsResult ? (
      checkPodConditionsResult.error ? (
        <Alert type="error" message="调用失败" description={ checkPodConditionsResult.error } />
      ) : (
        <div>
          { checkPodConditionsResult && Object.entries(checkPodConditionsResult).filter(([k]) => k !== 'error').map(([k, v]) => (
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
  <Alert type="warning" message="POD 确认是对外确认收入的强制人工闸门，五要素任一不满足将被阻断" description="确认后系统自动生成 POD 日志并触发 SAP 预制发票" showIcon style={{ marginBottom: 16 }} />
  <Space wrap>
    <Button type="default" onClick={ () => handleCheckPodConditions({}) }>校验 POD 条件</Button>
    <Button type="primary" onClick={ () => handleConfirmPod({}) }>一键 POD 确认</Button>
    <Button type="link" onClick={ () => navigate('/posting') }>进入发票过账</Button>
  </Space>
  { confirmPodResult ? (
    <Card title="POD 确认结果" style={{ marginTop: 16 }}>
      { confirmPodResult.error ? (
        <Alert type="error" message="调用失败" description={ confirmPodResult.error } />
      ) : (
        <div>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>{ confirmPodResult.message }</Typography.Paragraph>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}><Typography.Text strong style={{ minWidth: 90 }}>POD 日志：</Typography.Text><Typography.Text>{ confirmPodResult.podLog }</Typography.Text></div>
          <div style={{ display: 'flex', gap: 8 }}><Typography.Text strong style={{ minWidth: 90 }}>预制发票号：</Typography.Text><Typography.Text>{ confirmPodResult.prebillNo }</Typography.Text></div>
        </div>
      )}
    </Card>
  ) : null}
    </div>
  );
}
