// 仓网拓扑图（SVG · 4 基地仓 → 9+ 销售分仓）
import React from 'react';

const BASE = [
  { name: '天津基地仓', region: '华北', x: 300, y: 60, color: '#16304f' },
  { name: '呼市基地仓', region: '华北', x: 130, y: 130, color: '#2a4a7f' },
  { name: '杜蒙基地仓', region: '东北', x: 420, y: 30, color: '#2a4a7f' },
  { name: '武汉基地仓', region: '华中', x: 250, y: 250, color: '#2a4a7f' },
];

const SALE = [
  { name: '北京顺义仓', x: 520, y: 40, hot: true },
  { name: '天津武清仓', x: 610, y: 70, hot: true },
  { name: '济南遥墙仓', x: 700, y: 110 },
  { name: '合肥新桥仓', x: 640, y: 180 },
  { name: '武汉东西湖仓', x: 560, y: 230 },
  { name: '郑州航空港仓', x: 470, y: 150 },
  { name: '郑州大学路仓', x: 450, y: 210 },
  { name: '广州白云仓', x: 620, y: 300 },
  { name: '柳州柳北仓', x: 520, y: 330 },
  { name: '成都青白江仓', x: 300, y: 320 },
  { name: '呼市金桥仓', x: 150, y: 210 },
];

export default function NetworkMap({ base = BASE, sale = SALE }) {
  // 连接线：每个销售仓连到最近/主供基地仓（模拟）
  const link = (sx, sy) => {
    // 按 x 距离简单分组
    let best = base[0];
    let bd = Infinity;
    base.forEach((b) => {
      const d = Math.abs(b.x - sx) + Math.abs(b.y - sy) * 0.6;
      if (d < bd) { bd = d; best = b; }
    });
    return { from: best, to: { x: sx, y: sy } };
  };

  const links = sale.map((s) => link(s.x, s.y));

  return (
    <svg viewBox="0 0 820 380" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#9db4d8" />
        </marker>
      </defs>
      <rect x="0" y="0" width="820" height="380" rx="12" fill="#f8fafd" />

      {/* 网格背景 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`v${i}`} x1={i * 205} y1="0" x2={i * 205} y2="380" stroke="#edf1f7" strokeWidth="1" />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * 190} x2="820" y2={i * 190} stroke="#edf1f7" strokeWidth="1" />
      ))}

      {/* 区域标注 */}
      <text x="60" y="30" fontSize="11" fill="#8a94ab" fontWeight="600">华北</text>
      <text x="730" y="330" fontSize="11" fill="#8a94ab" fontWeight="600">华南</text>
      <text x="700" y="30" fontSize="11" fill="#8a94ab" fontWeight="600">华北东</text>
      <text x="30" y="340" fontSize="11" fill="#8a94ab" fontWeight="600">西南</text>

      {/* 连线 */}
      {links.map((l, i) => (
        <line
          key={i}
          x1={l.from.x + 26}
          y1={l.from.y + 12}
          x2={l.to.x - 14}
          y2={l.to.y + 4}
          stroke={l.to.hot ? '#f0a23a' : '#9db4d8'}
          strokeWidth={l.to.hot ? 2.2 : 1.2}
          strokeDasharray={l.to.hot ? 'none' : '5 4'}
          opacity="0.75"
          markerEnd="url(#arrow)"
        />
      ))}

      {/* 销售分仓 */}
      {sale.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y + 4} r={s.hot ? 17 : 13} fill={s.hot ? '#fff7ec' : '#fff'} stroke={s.hot ? '#f0a23a' : '#b9c8e0'} strokeWidth={s.hot ? 2 : 1.2} />
          <text x={s.x} y={s.y + 8} textAnchor="middle" fontSize="10" fill={s.hot ? '#c2410c' : '#55617a'} fontWeight="700">
            {s.name.replace('仓', '')}
          </text>
          {s.hot && <text x={s.x} y={s.y + 26} textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">● 缺口</text>}
        </g>
      ))}

      {/* 基地仓 */}
      {base.map((b, i) => (
        <g key={i}>
          <rect x={b.x - 62} y={b.y - 16} width={124} height={30} rx="15" fill={b.color} />
          <text x={b.x} y={b.y + 4} textAnchor="middle" fontSize="11.5" fill="#fff" fontWeight="700">{b.name}</text>
          <text x={b.x} y={b.y + 16} textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.65)">{b.region} · 基地仓</text>
        </g>
      ))}

      {/* 图例 */}
      <g>
        <rect x="20" y="352" width="10" height="10" rx="2" fill="#16304f" />
        <text x="36" y="362" fontSize="10.5" fill="#55617a">基地仓</text>
        <circle cx="110" cy="357" r="6" fill="#fff" stroke="#b9c8e0" />
        <text x="122" y="362" fontSize="10.5" fill="#55617a">销售分仓</text>
        <circle cx="210" cy="357" r="6" fill="#fff" stroke="#f0a23a" strokeWidth="2" />
        <text x="222" y="362" fontSize="10.5" fill="#c2410c" fontWeight="600">缺口热点</text>
        <line x1="310" y1="357" x2="345" y2="357" stroke="#9db4d8" strokeDasharray="5 4" />
        <text x="352" y="362" fontSize="10.5" fill="#55617a">常规补货线</text>
      </g>
    </svg>
  );
}
