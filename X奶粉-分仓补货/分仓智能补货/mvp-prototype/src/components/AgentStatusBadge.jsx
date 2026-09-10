// #8 状态徽章（idle / thinking / tool_calling / awaiting_human / error）
import React from 'react';

const META = {
  idle: { zh: '空闲', color: 'default' },
  thinking: { zh: '思考中', color: 'thinking' },
  tool_calling: { zh: '调用工具', color: 'tool_calling' },
  awaiting_human: { zh: '等待人工确认', color: 'awaiting_human' },
  error: { zh: '出现降级', color: 'error' },
  streaming: { zh: '生成中', color: 'thinking' },
};

export default function AgentStatusBadge({ status = 'idle', label }) {
  const m = META[status] || META.idle;
  return (
    <span className={`status-badge ${m.color}`}>
      <span className="pulse" />
      {label || m.zh}
    </span>
  );
}
