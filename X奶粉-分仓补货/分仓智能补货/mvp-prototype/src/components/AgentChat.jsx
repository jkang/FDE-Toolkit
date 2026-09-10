// AgentChat · 工作台对话流（#1 流式 #2 工具卡 #3 思考折叠 #4 内联组件 #5 HITL #7 出处 #8 状态徽章）
import React, { useRef, useState } from 'react';
import { Button, Input, Space, Tag, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import AgentStatusBadge from './AgentStatusBadge.jsx';
import ThinkingBlock from './ThinkingBlock.jsx';
import ToolCallCard from './ToolCallCard.jsx';
import HitlBanner from './HitlBanner.jsx';
import SourceCard from './SourceCard.jsx';
import { api } from '../api/client.js';
import { storyLines } from '../data/appData.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 内联 Artifact（#4 内联组件 · mini 版，点击跳转完整页） ---------- */
function InlineArtifact({ kind, data, onOpen }) {
  const btn = (label, route) => (
    <Button size="small" type="link" style={{ padding: 0, fontWeight: 700 }} onClick={() => onOpen(route)}>
      {label} <ArrowRightOutlined />
    </Button>
  );

  if (kind === 'supplyOverview') {
    const red = (data.gaps || []).filter((g) => g.level === '红').length;
    const yellow = (data.gaps || []).filter((g) => g.level === '黄').length;
    const blue = (data.gaps || []).filter((g) => g.level === '蓝').length;
    return (
      <div className="ui-card">
        <div className="ui-card-title">全仓网供需全景</div>
        <div className="ui-card-body">
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <Tag color="error">红 · 紧急 {red} 项</Tag>
            <Tag color="warning">黄 · 常规 {yellow} 项</Tag>
            <Tag color="processing">蓝 · 积压 {blue} 项</Tag>
            <span style={{ fontSize: 11, color: '#8a94ab', alignSelf: 'center' }}>4 基地仓 × 11 销售分仓 · 近 700 SKU</span>
          </div>
          <div style={{ maxHeight: 180, overflow: 'auto' }}>
            {(data.gaps || []).slice(0, 6).map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: '1px solid #f0f3f8' }}>
                <span className={`dot ${g.level === '红' ? 'red' : g.level === '黄' ? 'yellow' : g.level === '蓝' ? 'blue' : 'normal'}`} />
                <span style={{ fontSize: 12.5, width: 100, fontWeight: 600 }}>{g.warehouse}</span>
                <span style={{ fontSize: 12, color: '#55617a', flex: 1 }}>{g.sku}</span>
                <span className="num-strong" style={{ fontSize: 12 }}>DOS {g.dos} 天</span>
                <span className={`badge-dos ${g.level === '红' ? 'red' : g.level === '黄' ? 'yellow' : g.level === '蓝' ? 'blue' : 'normal'}`}>
                  {g.level === '红' ? '紧急补货' : g.level === '黄' ? '常规补货' : g.level === '蓝' ? '积压预警' : '正常'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right', marginTop: 6 }}>{btn('查看完整供需全景', '/supply')}</div>
        </div>
      </div>
    );
  }

  if (kind === 'allocationPlan') {
    const rows = data.planA || [];
    return (
      <div className="ui-card">
        <div className="ui-card-title">多约束分配方案 · 方案A（均衡版）</div>
        <div className="ui-card-body">
          {rows.slice(0, 5).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '1px solid #f0f3f8' }}>
              <span style={{ fontSize: 12.5, width: 104, fontWeight: 600 }}>{r.warehouse}</span>
              <span style={{ fontSize: 12, color: '#55617a', flex: 1 }}>{r.sku}</span>
              <span className="num-muted" style={{ fontSize: 12 }}>建议 {r.jhSuggested}</span>
              <span className="num-strong" style={{ fontSize: 12.5 }}>{r.allocated} 罐</span>
              <Tag style={{ margin: 0 }}>{r.priority}</Tag>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 6 }}>{btn('进入分货方案工作台', '/allocation')}</div>
        </div>
      </div>
    );
  }

  if (kind === 'alternativePlan') {
    return (
      <div className="ui-card">
        <div className="ui-card-title">异常备选方案 · 3 套</div>
        <div className="ui-card-body">
          {(data.rows || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '1px solid #f0f3f8' }}>
            <Tag color={i === 0 ? 'processing' : 'default'} style={{ width: 130, margin: 0 }}>{r.option}</Tag>
            <span className="num-muted" style={{ fontSize: 12 }}>{r.distance} km</span>
            <span className="num-strong" style={{ fontSize: 12 }}>{r.transitDays} 天</span>
            <span className="num-muted" style={{ fontSize: 12 }}>可发 {r.availability ? r.availability.toLocaleString() : '—'}</span>
            <span className="num-muted" style={{ fontSize: 12 }}>生产备货率 {r.stockRate}</span>
              <span style={{ fontSize: 11.5, color: r.warning === '无预警' ? '#1a8f5c' : '#b45309' }}>{r.warning}</span>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 6 }}>{btn('查看备选方案对比', '/exception')}</div>
        </div>
      </div>
    );
  }

  if (kind === 'replenishOrders') {
    return (
      <div className="ui-card">
        <div className="ui-card-title">补货单 · 已下发（可撤销）</div>
        <div className="ui-card-body">
          <div style={{ fontSize: 12, color: '#55617a', marginBottom: 6 }}>
            校验 4/4 通过 · 已下发物流调度与财务核算 · 下发时间 {data.issuedAt}
          </div>
          {(data.orders || []).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderTop: '1px solid #f0f3f8' }}>
              <span className="mono" style={{ fontSize: 11.5, color: '#2b5db8', width: 150 }}>{o.code}</span>
              <span style={{ fontSize: 12, flex: 1 }}>{o.shipFrom} → {o.shipTo}</span>
              <span className="num-strong" style={{ fontSize: 12 }}>{o.qty} 罐</span>
              <Tag color="processing" style={{ margin: 0 }}>{o.status}</Tag>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 6 }}>{btn('进入执行跟踪看板', '/replenish')}</div>
        </div>
      </div>
    );
  }

  return null;
}

/* ---------- 流式打字机文本 ---------- */
function StreamText({ text }) {
  const [shown, setShown] = useState('');
  React.useEffect(() => {
    // 注意：不依赖 doneRef 守卫——React.StrictMode 下 effect 会 mount→cleanup→mount 且 ref 保留，
    // 守卫会导致第二次 effect 直接 return、计时器永不启动（流式气泡空白）。改为幂等启动+清理。
    setShown('');
    let i = 0;
    const timer = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [text]);
  const complete = shown.length >= text.length;
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {shown}
      {!complete && <span className="stream-caret" />}
    </div>
  );
}

/* =========================================================
   AgentChat 主组件：播放剧本（status/thinking/tool/stream/artifact/hitl/final）
   ========================================================= */
export default function AgentChat({ onOpenPage }) {
  const [messages, setMessages] = useState([]); // { role: 'user'|'agent', type, ... }
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [playing, setPlaying] = useState(false);
  const boxRef = useRef(null);

  const push = (m) => setMessages((prev) => [...prev, m]);
  const scroll = () => setTimeout(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }), 60);

  const matchStory = (text) => {
    const t = text || '';
    if (t.includes('货源') || t.includes('缺口') || t.includes('供需') || t.includes('全国仓网')) return 's1';
    if (t.includes('分货方案') || t.includes('出分货') || t.includes('分配方案')) return 's2';
    if (t.includes('可发量不足') || t.includes('怎么办') || t.includes('异常') || t.includes('备选')) return 's3';
    if (t.includes('补货单') || t.includes('下发') || t.includes('生成补货')) return 's4';
    return 's1';
  };

  const playScript = async (story, userText) => {
    setPlaying(true);
    setStatus('thinking');
    push({ role: 'user', text: userText });
    scroll();
    await sleep(350);
    const script = await api.runAgent({ story, userInput: userText });

    for (const step of script.steps) {
      if (step.type === 'status') {
        setStatus(step.status);
        await sleep(260);
      } else if (step.type === 'thinking') {
        push({ role: 'agent', type: 'thinking', title: step.title, content: step.content });
        scroll();
        await sleep(650);
      } else if (step.type === 'tool') {
        setStatus('tool_calling');
        push({ role: 'agent', type: 'tool', tool: { ...step, status: 'running' } });
        scroll();
        await sleep(450);
        // 更新为 done
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, tool: { ...m.tool, status: step.error ? 'error' : 'done' } } : m))
        );
        await sleep(300);
      } else if (step.type === 'stream') {
        setStatus('streaming');
        push({ role: 'agent', type: 'stream', text: step.text });
        scroll();
        await sleep(step.text.length * 12 + 400);
      } else if (step.type === 'artifact') {
        setStatus('idle');
        push({ role: 'agent', type: 'artifact', kind: step.kind, data: step.data });
        scroll();
        await sleep(400);
      } else if (step.type === 'hitl') {
        setStatus('awaiting_human');
        push({ role: 'agent', type: 'hitl', hitl: step });
        scroll();
        // 等待用户操作：由 hitl 组件的回调驱动后续
        const resolved = await new Promise((resolve) => {
          window.__hitlResolve = resolve;
        });
        push({ role: 'agent', type: 'note', text: `✅ 人工操作：${resolved}` });
        setStatus('idle');
        scroll();
        await sleep(500);
      } else if (step.type === 'final') {
        setStatus('idle');
        push({ role: 'agent', type: 'final', text: step.text, sources: step.sources || [] });
        scroll();
      }
    }
    setStatus('idle');
    setPlaying(false);
  };

  const handleHitlAction = async (label) => {
    await sleep(300);
    try {
      const r = await api.adjustPlan({});
      window.__hitlResolve?.(`${label}（${r.summary.split('。')[0]}）`);
    } catch {
      window.__hitlResolve?.(label);
    }
  };

  const send = (text) => {
    if (!text || playing) return;
    const story = matchStory(text);
    playScript(story, text).catch((e) => {
      setStatus('error');
      push({ role: 'agent', type: 'final', text: `运行出现异常：${String(e?.response?.data?.error || e)}`, sources: [] });
      setPlaying(false);
    });
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* 对话流 */}
      <div
        ref={boxRef}
        style={{ flex: 1, overflow: 'auto', padding: '16px 4px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {messages.length === 0 && (
          <div className="empty-block" onClick={() => send(storyLines[0].prompt)}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#55617a', marginBottom: 6 }}>还没有对话，点击下方任一故事线开始演示</div>
            <div style={{ fontSize: 12 }}>或直接输入自然语言提问，Agent 将自动匹配对应流程</div>
          </div>
        )}
        {messages.map((m, i) => {
          if (m.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <div className="chat-user-bubble">{m.text}</div>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: '#10213e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flex: 'none' }}>
                  <UserOutlined />
                </div>
              </div>
            );
          }
          // agent 消息
          const body = (() => {
            if (m.type === 'thinking') return <ThinkingBlock title={m.title} content={m.content} />;
            if (m.type === 'tool') return <ToolCallCard tool={m.tool} />;
            if (m.type === 'stream') return <StreamText text={m.text} />;
            if (m.type === 'artifact') return <InlineArtifact kind={m.kind} data={m.data} onOpen={onOpenPage} />;
            if (m.type === 'hitl') {
              return (
                <HitlBanner
                  banner={m.hitl.banner}
                  detail={m.hitl.detail}
                  onConfirm={() => handleHitlAction('确认并写入分配量')}
                  onAlternative={() => handleHitlAction('改用方案B（优先版）')}
                  onModify={() => handleHitlAction('修改后重新校验')}
                />
              );
            }
            if (m.type === 'note') return <div style={{ fontSize: 12, color: '#1a8f5c', fontWeight: 600 }}>{m.text}</div>;
            if (m.type === 'final') {
              return (
                <div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  {m.sources?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <SourceCard sources={m.sources} />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })();
          return (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#10213e,#5db2e2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flex: 'none' }}>
                <RobotOutlined />
              </div>
              <div className="chat-agent-bubble">{body}</div>
            </div>
          );
        })}
      </div>

      {/* 快捷指令 + 输入区 */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '10px 0 2px' }}>
        <Space size={[8, 8]} wrap>
          {storyLines.map((s) => (
            <Tag
              key={s.id}
              onClick={() => send(s.prompt)}
              style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, background: '#f0f4fb', border: '1px solid #d5e2f2', color: '#16304f' }}
            >
              {s.no} · {s.title}
            </Tag>
          ))}
        </Space>
        <Input
          size="large"
          placeholder="输入自然语言指令，例如：帮我看看全国仓网现在的货源情况"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => send(input)}
          suffix={
            <Button type="primary" size="small" icon={<SendOutlined />} loading={playing} onClick={() => send(input)}>
              发送
            </Button>
          }
          style={{ marginTop: 10 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: '#8a94ab' }}>
          <span>Agent 人格：分货方案助理 · 专业克制 · 数字驱动（用生产备货率/DOS/库存天数说话）</span>
          <span>HITL：分配方案给建议，最终下发由你确认</span>
        </div>
      </div>
    </div>
  );
}
