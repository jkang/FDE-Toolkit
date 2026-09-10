// 术语 hover 卡（待检/合格/可发量/DOS/备货率/分配量/京慧建议量/安全水位/大日期库存）
import React from 'react';
import { Tooltip } from 'antd';

export default function TermTooltip({ term, define, children, style }) {
  return (
    <Tooltip
      title={
        <div style={{ maxWidth: 260 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#7cc0e8' }}>{term}</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: '#dfe7f5' }}>{define}</div>
        </div>
      }
      color="#10213E"
      placement="top"
      styles={{ root: { borderRadius: 8 } }}
    >
      <span
        style={{
          cursor: 'help',
          borderBottom: '1px dashed #8a94ab',
          fontWeight: 600,
          color: '#10213e',
          ...style,
        }}
      >
        {children || term}
      </span>
    </Tooltip>
  );
}
