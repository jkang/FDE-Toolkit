// #3 思考过程可折叠
import React, { useState } from 'react';
import { Collapse } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

export default function ThinkingBlock({ title = 'Agent 思考过程', content }) {
  return (
    <div style={{ margin: '8px 0' }}>
      <Collapse
        ghost
        size="small"
        items={[
          {
            key: 'thinking',
            label: (
              <span style={{ fontSize: 12, color: '#2b5db8', fontWeight: 600 }}>
                <BulbOutlined style={{ marginRight: 6 }} />
                {title}（点击展开）
              </span>
            ),
            children: (
              <div
                style={{
                  fontSize: 12.5, lineHeight: 1.8, color: '#55617a',
                  background: '#f8fafd', border: '1px solid #e6ecf5', borderRadius: 8, padding: '10px 12px',
                }}
              >
                {content}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
