// #6 撤销 Toast（10 秒倒计时窗口）
import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { UndoOutlined, RollbackOutlined } from '@ant-design/icons';

export default function UndoToast({ seconds = 10, text, onUndo, onExpire }) {
  const [left, setLeft] = useState(seconds);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current);
          onExpire?.();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleUndo = async () => {
    clearInterval(timerRef.current);
    await onUndo?.();
    message.success('已撤销下发，补货单回到待下发状态', 2);
  };

  return (
    <div className="undo-toast">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="undo-ring" style={{ ['--pct']: `${(left / seconds) * 100}%` }}>
          <span>{left}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{text}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            {left > 0 ? `${left} 秒内可撤销 · 撤销后将回滚物流调度与财务核算` : '撤销窗口已关闭'}
          </div>
        </div>
        <Button
          danger
          size="small"
          icon={<UndoOutlined />}
          disabled={left <= 0}
          onClick={handleUndo}
          style={{ fontWeight: 700 }}
        >
          撤销下发
        </Button>
        {left <= 0 && (
          <Button size="small" type="text" icon={<RollbackOutlined />} style={{ color: 'rgba(255,255,255,0.7)' }} />
        )}
      </div>
    </div>
  );
}
