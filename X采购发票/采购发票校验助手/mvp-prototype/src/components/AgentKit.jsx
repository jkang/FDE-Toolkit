import React, { useState } from 'react';
import { Tag, Card, Collapse, Popover, Typography, Space, Alert, Button, Empty, Spin } from 'antd';
import {
  CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, ClockCircleFilled,
  LoadingOutlined, ApiOutlined, PauseCircleFilled, RobotOutlined, SyncOutlined,
  CloudSyncOutlined, DatabaseOutlined, BulbOutlined, SafetyCertificateOutlined,
  InboxOutlined, ScanOutlined, ApartmentOutlined, AuditOutlined, FileTextOutlined,
  InfoCircleOutlined, UndoOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

// =========================================================
// Agent 状态徽章（idle / thinking / calling_tool / awaiting_human / done / error）
// =========================================================
export const STATUS_META = {
  idle: { label: '待机', color: 'default', icon: <ClockCircleFilled /> },
  thinking: { label: '思考中', color: 'processing', icon: <LoadingOutlined /> },
  calling_tool: { label: '调用工具', color: 'processing', icon: <ApiOutlined /> },
  awaiting_human: { label: '等待人工确认', color: 'warning', icon: <PauseCircleFilled /> },
  done: { label: '完成', color: 'success', icon: <CheckCircleFilled /> },
  error: { label: '异常', color: 'error', icon: <CloseCircleFilled /> },
};

export function AgentStatusBadge({ status = 'idle' }) {
  const meta = STATUS_META[status] || STATUS_META.idle;
  return (
    <Tag color={meta.color} icon={meta.icon} className="agent-status-badge">
      {meta.label}
    </Tag>
  );
}

// =========================================================
// 语义状态标签：色 + 图标 + 文字 三重表达
// =========================================================
const STATUS_TAG_MAP = {
  '匹配通过': ['success', <CheckCircleFilled key="i" />],
  '通过': ['success', <CheckCircleFilled key="i" />],
  '已过账': ['success', <CheckCircleFilled key="i" />],
  '已更新': ['success', <CheckCircleFilled key="i" />],
  '全绿': ['success', <CheckCircleFilled key="i" />],
  '预制成功': ['success', <CheckCircleFilled key="i" />],
  '已放行': ['success', <CheckCircleFilled key="i" />],
  '数量超差': ['error', <CloseCircleFilled key="i" />],
  '抬头税号不符': ['error', <CloseCircleFilled key="i" />],
  '单价不符': ['error', <CloseCircleFilled key="i" />],
  '预制失败': ['error', <CloseCircleFilled key="i" />],
  '成本中心缺失': ['error', <CloseCircleFilled key="i" />],
  '金额超尾差': ['warning', <ExclamationCircleFilled key="i" />],
  '跨期发票': ['warning', <ExclamationCircleFilled key="i" />],
  '待确认': ['warning', <ExclamationCircleFilled key="i" />],
  '待补': ['warning', <ExclamationCircleFilled key="i" />],
  '待预制': ['warning', <ExclamationCircleFilled key="i" />],
  '待更新': ['warning', <ExclamationCircleFilled key="i" />],
  '与昨日批次重复': ['warning', <ExclamationCircleFilled key="i" />],
  '换票中': ['processing', <SyncOutlined spin key="i" />],
  '补单中': ['processing', <SyncOutlined spin key="i" />],
  '待过账': ['processing', <ClockCircleFilled key="i" />],
};

export function StatusTag({ status }) {
  const [color, icon] = STATUS_TAG_MAP[status] || ['default', <InfoCircleOutlined key="i" />];
  return <Tag color={color} icon={icon}>{status}</Tag>;
}

// =========================================================
// 工具调用可视化卡片
// =========================================================
const TOOL_ICON = {
  '乐企平台': <CloudSyncOutlined />,
  'SAP ERP': <DatabaseOutlined />,
  'OCR/AI 识别': <ScanOutlined />,
  '公共网盘': <FileTextOutlined />,
  '文件服务': <InboxOutlined />,
  '规则引擎': <ApartmentOutlined />,
  '打印服务': <AuditOutlined />,
};

export function ToolCallCard({ ev }) {
  return (
    <div className="tool-call-card">
      <div className="tool-call-head">
        <span className="tool-call-icon">{TOOL_ICON[ev.system] || <ApiOutlined />}</span>
        <Text strong>{ev.name}</Text>
        <Tag color="processing" className="tool-call-sys">{ev.system}</Tag>
        <Tag color="success" icon={<CheckCircleFilled />}>{ev.status || '已完成'}</Tag>
      </div>
      {(ev.input || ev.output) && (
        <div className="tool-call-body">
          {ev.input && <div className="tool-io"><span className="tool-io-label">入参</span><code>{ev.input}</code></div>}
          {ev.output && <div className="tool-io"><span className="tool-io-label">出参</span><code>{ev.output}</code></div>}
        </div>
      )}
    </div>
  );
}

// =========================================================
// 思考过程可折叠
// =========================================================
export function ThinkBlock({ ev }) {
  return (
    <Collapse
      size="small"
      className="think-block"
      items={[{
        key: '1',
        label: <span><BulbOutlined /> {ev.title || '查看判定依据'}</span>,
        children: (
          <ol className="think-lines">
            {(ev.lines || []).map((l, i) => <li key={i}>{l}</li>)}
          </ol>
        ),
      }]}
    />
  );
}

// =========================================================
// 出处引用悬浮卡（规则依据 / 票面位置 / ERP 返回）
// =========================================================
export function CitationPopover({ citations = [], children }) {
  const content = (
    <div className="citation-pop">
      {citations.map((c, i) => (
        <div className="citation-row" key={i}>
          <span className="citation-k">{c.label}</span>
          <span className="citation-v">{c.value}</span>
        </div>
      ))}
    </div>
  );
  return <Popover content={content} title="出处引用 · 可核查" trigger="click" placement="topLeft">{children}</Popover>;
}

// =========================================================
// 术语 hover 卡
// =========================================================
export function TermHint({ term, def, context, children }) {
  const content = (
    <div className="citation-pop">
      <div className="citation-row"><span className="citation-k">标准口径</span><span className="citation-v">{def}</span></div>
      <div className="citation-row"><span className="citation-k">引用场景</span><span className="citation-v">{context}</span></div>
    </div>
  );
  return <Popover content={content} title={`术语 · ${term}`} trigger="hover">{children || <span className="term-hint">{term}</span>}</Popover>;
}

// =========================================================
// HITL 拦截卡
// =========================================================
export function HitlCard({ title, desc, basis, resolved, onResolve, actions }) {
  return (
    <div className={`hitl-card ${resolved ? 'hitl-resolved' : ''}`}>
      <div className="hitl-head">
        <PauseCircleFilled />
        <Text strong>HITL 拦截 · {title}</Text>
        {resolved ? <Tag color="success" icon={<CheckCircleFilled />}>已处理</Tag> : <Tag color="warning">必停人工确认</Tag>}
      </div>
      <Paragraph className="hitl-desc">{desc}</Paragraph>
      {basis && <div className="hitl-basis"><SafetyCertificateOutlined /> 依据：{basis}</div>}
      {!resolved && (actions || (
        <Space wrap>
          <Button type="primary" size="small" onClick={onResolve}>确认并继续</Button>
          <Button size="small">转人工处理</Button>
        </Space>
      ))}
    </div>
  );
}

// =========================================================
// 空态 / 错误态
// =========================================================
export function EmptyHint({ description = '暂无数据', hint, cta }) {
  return (
    <div className="empty-hint">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
      {hint && <div className="empty-sub">{hint}</div>}
      {cta && <div className="empty-cta">{cta}</div>}
    </div>
  );
}

export function ErrorHint({ title = '调用失败', desc, actions }) {
  return (
    <Alert
      type="error"
      showIcon
      message={title}
      description={<div>{desc}{actions && <div className="mt8">{actions}</div>}</div>}
    />
  );
}

// =========================================================
// Agent 控制台（流式输出 + 工具调用 + 思考折叠 + 结果）
// =========================================================
export function AgentConsole({ status, events = [], title = 'Agent 执行过程', emptyHint = '触发操作后，这里会实时展示 Agent 的流式输出与工具调用。', renderResult }) {
  return (
    <Card
      className="agent-console"
      title={<span><RobotOutlined /> {title}</span>}
      extra={<AgentStatusBadge status={status} />}
    >
      {events.length === 0 ? (
        <EmptyHint description={emptyHint} />
      ) : (
        <div className="agent-events">
          {events.map((ev, i) => {
            if (ev.type === 'stream') {
              return (
                <div className={`stream-line ${ev.tone || ''}`} key={i}>
                  <span className="stream-dot" />
                  <span>{ev.text}</span>
                </div>
              );
            }
            if (ev.type === 'tool') return <ToolCallCard ev={ev} key={i} />;
            if (ev.type === 'think') return <ThinkBlock ev={ev} key={i} />;
            if (ev.type === 'hitl') return <HitlCard key={i} {...ev} />;
            if (ev.type === 'result') return <div className="agent-result" key={i}>{renderResult ? renderResult(ev.data) : null}</div>;
            return null;
          })}
          {status === 'thinking' && <div className="stream-line"><Spin size="small" /> <span className="muted">Agent 正在处理…</span></div>}
        </div>
      )}
    </Card>
  );
}

// =========================================================
// 指标卡（Metric Hero）
// =========================================================
export function MetricCard({ label, value, suffix, hint, tone = 'primary' }) {
  return (
    <Card className={`metric-card metric-${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value}
        {suffix ? <span className="metric-suffix">{suffix}</span> : null}
      </div>
      {hint ? <div className="metric-hint">{hint}</div> : null}
    </Card>
  );
}

export { UndoOutlined };
