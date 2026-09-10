import { useCallback, useRef, useState } from 'react';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * useAgentRun —— 驱动 Agent 流式输出 / 工具调用 / HITL / 状态徽章
 * 事件类型：
 *   { type:'status', value }                     状态切换
 *   { type:'stream', text, tone }                流式文本行
 *   { type:'tool', name, system, input, output } 工具调用可视化
 *   { type:'think', title, lines }               思考过程（折叠）
 *   { type:'hitl', title, desc, options }        HITL 拦截
 *   { type:'result', data }                      结果块
 */
export function useAgentRun() {
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [running, setRunning] = useState(false);
  const runIdRef = useRef(0);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setEvents([]);
    setStatus('idle');
    setRunning(false);
  }, []);

  const run = useCallback(async (sequence, options = {}) => {
    const myId = ++runIdRef.current;
    const stepDelay = options.stepDelay ?? 620;
    setEvents([]);
    setRunning(true);
    setStatus('thinking');
    for (const ev of sequence) {
      if (myId !== runIdRef.current) return; // 被 reset / 新 run 打断
      await sleep(ev.delay ?? stepDelay);
      if (myId !== runIdRef.current) return;
      if (ev.type === 'status') {
        setStatus(ev.value);
        continue;
      }
      if (ev.type === 'tool') setStatus('calling_tool');
      if (ev.type === 'hitl') setStatus('awaiting_human');
      setEvents((prev) => [...prev, ev]);
    }
    if (myId !== runIdRef.current) return;
    setRunning(false);
    setStatus((s) => (s === 'awaiting_human' ? s : 'done'));
  }, []);

  const push = useCallback((ev) => setEvents((prev) => [...prev, ev]), []);

  return { status, events, running, run, reset, push, setStatus };
}
