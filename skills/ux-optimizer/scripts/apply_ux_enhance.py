#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ux-optimizer · 定制设计系统注入引擎
========================================
读取 ux-audit.yaml（UX-Optimizer 产出的定制设计系统），
以「无侵入覆盖层」方式注入到 mvp-prototype 工程：
  - 生成 src/ux-design.css    (全局视觉覆盖：tokens/字体/圆角/阴影/状态/响应式/cursor-pointer)
  - 生成 src/ux-design.js     (JS 设计令牌 + antd token 合并 / arco CSS 变量)
  - 在入口 main.jsx / main.js 注入 import 与主题合并

用法:
    python3 apply_ux_enhance.py <ux-audit.yaml> --target <mvp-prototype目录>
"""

import os
import sys
import json
import argparse
import yaml

# ---------------------------------------------------------------
# 读取 & 预处理
# ---------------------------------------------------------------

def load_audit(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return yaml.safe_load(raw)


def deep_get(d, key, default=""):
    if not isinstance(d, dict):
        return default
    v = d.get(key, default)
    return v if v not in (None, "") else default


def css_var_value(g):
    return {
        "primary": deep_get(g, "primary", "#2563eb"),
        "primaryDark": deep_get(g, "primaryDark", "#1d4ed8"),
        "primaryLight": deep_get(g, "primaryLight", "#93c5fd"),
        "accent": deep_get(g, "accent", "#f97316"),
        "success": deep_get(g, "success", "#16a34a"),
        "warning": deep_get(g, "warning", "#f59e0b"),
        "danger": deep_get(g, "danger", "#ef4444"),
        "info": deep_get(g, "info", "#0ea5e9"),
    }


def js_str(value):
    """把任意字符串安全地输出为 JS 字符串字面量（用双引号包裹并转义）。"""
    if value is None:
        return '""'
    s = str(value)
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    return '"' + s + '"'


# ---- WCAG 对比度护栏（见 references/contrast_guard.md）----
_MUTED_BG = "#F5F5F6"          # 次要文字最常叠的浅灰底
_SAFE_SECONDARY = "#475569"     # 在浅灰底/白底均 ≥4.5:1 的达标次文字
_SAFE_TEXT = "#1e293b"

def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def _lum(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)

def _contrast(fg, bg):
    a, b = _lum(fg), _lum(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

def guard_secondary_color(value):
    """次要文字色护栏：若在浅灰底上 <4.5:1，则提升到达标深次色。"""
    v = value if value else "#64748b"
    try:
        if _contrast(v, _MUTED_BG) < 4.5:
            return _SAFE_SECONDARY
    except Exception:
        pass
    return v

def guard_text_color(value):
    """正文主色护栏：若在浅灰底上 <4.5:1，则提升到达标深色。"""
    v = value if value else "#1e293b"
    try:
        if _contrast(v, _MUTED_BG) < 4.5:
            return _SAFE_TEXT
    except Exception:
        pass
    return v


# ---------------------------------------------------------------
# 生成 ux-design.js（JS 设计令牌）
# ---------------------------------------------------------------

def build_design_js(dl, typo, spacing):
    c = css_var_value(dl.get("colors", {}))
    font = deep_get(typo, "fontFamily", "MiSans, Inter, -apple-system, 'Microsoft YaHei', sans-serif")
    h1 = typo.get("h1", {})
    h2 = typo.get("h2", {})
    h3 = typo.get("h3", {})
    body = typo.get("body", {})
    label = typo.get("label", {})
    radius = dl.get("radius", {})
    shadow = dl.get("shadow", {})
    component = dl.get("components", {})
    motion = dl.get("motion", {})

    lines = []
    lines.append("// =========================================================")
    lines.append("// UX-Optimizer · 定制设计系统 (Design Tokens)")
    lines.append("// 无侵入覆盖层：仅作主题增强，不改变业务逻辑")
    lines.append("// =========================================================")
    lines.append(f"export const brand = {{ name: {js_str(deep_get(dl, 'mode', ''))}, primary: '{c['primary']}', accent: '{c['accent']}' }};")
    lines.append("")
    lines.append("// 供 antd ConfigProvider 合并的 token（React）")
    lines.append("export const designAppTheme = {")
    lines.append(f"  colorPrimary: '{c['primary']}',")
    lines.append(f"  colorInfo: '{c['primary']}',")
    lines.append(f"  colorSuccess: '{c['success']}',")
    lines.append(f"  colorWarning: '{c['warning']}',")
    lines.append(f"  colorError: '{c['danger']}',")
    lines.append(f"  colorText: '{guard_text_color(deep_get(dl.get('colors', {}).get('neutral', {}), 'text', '#1e293b'))}',")
    lines.append(f"  colorTextSecondary: '{guard_secondary_color(deep_get(dl.get('colors', {}).get('neutral', {}), 'textSecondary', '#64748b'))}',")
    lines.append(f"  colorBorder: '{deep_get(dl.get('colors', {}).get('neutral', {}), 'border', '#e2e8f0')}',")
    lines.append(f"  colorBgBase: '{deep_get(dl.get('colors', {}).get('neutral', {}), 'bg', '#ffffff')}',")
    lines.append(f"  borderRadius: {deep_get(radius, 'md', 8)},")
    # ---- 完整排版 token（antd Heading/lineHeight/weight）----
    lines.append(f"  fontSize: {deep_get(body, 'size', 14)},")
    lines.append(f"  fontSizeSM: {deep_get(typo.get('caption', {}), 'size', 12)},")
    lines.append(f"  fontSizeLG: {deep_get(typo.get('h3', {}), 'size', 18)},")
    lines.append(f"  fontSizeHeading1: {deep_get(typo.get('h1', {}), 'size', 30)},")
    lines.append(f"  fontSizeHeading2: {deep_get(typo.get('h2', {}), 'size', 24)},")
    lines.append(f"  fontSizeHeading3: {deep_get(typo.get('h3', {}), 'size', 20)},")
    lines.append(f"  fontSizeHeading4: 20,")
    lines.append(f"  fontSizeHeading5: 16,")
    lines.append(f"  fontWeightStrong: 600,")
    lines.append(f"  lineHeight: {deep_get(body, 'lineHeight', 1.5)},")
    lines.append(f"  lineHeightHeading1: 1.2,")
    lines.append(f"  lineHeightHeading2: 1.25,")
    lines.append(f"  lineHeightHeading3: 1.3,")
    lines.append(f"  lineHeightHeading4: 1.3,")
    lines.append(f"  fontFamily: {js_str(font)},")
    lines.append(f"  wireframe: false,")
    lines.append("};")
    lines.append("")
    lines.append("// 供 arco / CSS 变量环境（Vue）")
    lines.append("export function applyDesignTheme() {")
    lines.append("  const root = document.documentElement.style;")
    lines.append(f"  root.setProperty('--ux-primary', '{c['primary']}');")
    lines.append(f"  root.setProperty('--ux-accent', '{c['accent']}');")
    lines.append(f"  root.setProperty('--ux-success', '{c['success']}');")
    lines.append(f"  root.setProperty('--ux-warning', '{c['warning']}');")
    lines.append(f"  root.setProperty('--ux-danger', '{c['danger']}');")
    lines.append(f"  root.setProperty('--ux-info', '{c['info']}');")
    lines.append(f"  root.setProperty('--ux-text', '{deep_get(dl.get('colors', {}).get('neutral', {}), 'text', '#1e293b')}');")
    lines.append(f"  root.setProperty('--ux-text-secondary', '{guard_secondary_color(deep_get(dl.get('colors', {}).get('neutral', {}), 'textSecondary', '#64748b'))}');")
    lines.append(f"  root.setProperty('--ux-border', '{deep_get(dl.get('colors', {}).get('neutral', {}), 'border', '#e2e8f0')}');")
    lines.append(f"  root.setProperty('--ux-bg', '{deep_get(dl.get('colors', {}).get('neutral', {}), 'bg', '#ffffff')}');")
    lines.append(f"  root.setProperty('--ux-bg-alt', '{deep_get(dl.get('colors', {}).get('neutral', {}), 'bgAlt', '#f8fafc')}');")
    lines.append(f"  root.setProperty('--ux-radius-sm', '{deep_get(radius, 'sm', 6)}px');")
    lines.append(f"  root.setProperty('--ux-radius-md', '{deep_get(radius, 'md', 8)}px');")
    lines.append(f"  root.setProperty('--ux-radius-lg', '{deep_get(radius, 'lg', 12)}px');")
    lines.append(f"  root.setProperty('--ux-shadow-card', '{deep_get(shadow, 'card', '0 2px 8px rgba(16,33,62,0.08)')}');")
    lines.append(f"  root.setProperty('--ux-font-family', {js_str(font)});")
    # ---- 排版层级变量 ----
    lines.append(f"  root.setProperty('--ux-fs-h1', '{deep_get(typo.get('h1', {}), 'size', 30)}px');")
    lines.append(f"  root.setProperty('--ux-fs-h2', '{deep_get(typo.get('h2', {}), 'size', 24)}px');")
    lines.append(f"  root.setProperty('--ux-fs-h3', '{deep_get(typo.get('h3', {}), 'size', 20)}px');")
    lines.append(f"  root.setProperty('--ux-fs-body', '{deep_get(body, 'size', 14)}px');")
    lines.append(f"  root.setProperty('--ux-fs-caption', '{deep_get(typo.get('caption', {}), 'size', 12)}px');")
    lines.append(f"  root.setProperty('--ux-fw-h1', '{deep_get(typo.get('h1', {}), 'weight', 600)}');")
    lines.append(f"  root.setProperty('--ux-fw-body', '{deep_get(body, 'weight', 400)}');")
    lines.append("}")
    return "\n".join(lines)


# ---------------------------------------------------------------
# 生成 ux-design.css（全局视觉覆盖层）
# ---------------------------------------------------------------

def build_design_css(dl, typo, spacing, radius, motion):
    c = dl.get("colors", {})
    neu = c.get("neutral", {}) if isinstance(c, dict) else {}
    g = c.get("gradient", {}) if isinstance(c, dict) else {}
    font = deep_get(typo, "fontFamily", "MiSans, Inter, sans-serif")
    h1 = typo.get("h1", {})
    h2 = typo.get("h2", {})
    h3 = typo.get("h3", {})
    label = typo.get("label", {})
    radius_md = deep_get(radius, "md", 8)
    radius_lg = deep_get(radius, "lg", 12)
    shadow_card = deep_get(shadow_dict(dl), "card", "0 2px 8px rgba(16,33,62,0.08)")
    trans = deep_get(motion, "transition", "0.15s ease-out")
    card_padding = deep_get(spacing, "cardPadding", 24)
    # 字体层级样式
    h1_size = deep_get(h1, "size", 30)
    h1_weight = deep_get(h1, "weight", 600)
    h2_size = deep_get(h2, "size", 24)
    h2_weight = deep_get(h2, "weight", 600)
    h3_size = deep_get(h3, "size", 20)
    h3_weight = deep_get(h3, "weight", 600)
    body_size = deep_get(typo.get("body", {}), "size", 14)
    label_size = deep_get(label, "size", 12)
    label_weight = deep_get(label, "weight", 600)

    css = f"""/* =========================================================
   UX-Optimizer · 定制设计系统覆盖层 (theme.override)
   无侵入：仅覆盖视觉，不改业务逻辑与接口
   ========================================================= */

:root {{
  --ux-primary: {deep_get(c, 'primary', '#2563eb')};
  --ux-primary-dark: {deep_get(c, 'primaryDark', '#1d4ed8')};
  --ux-accent: {deep_get(c, 'accent', '#f97316')};
  --ux-success: {deep_get(c, 'success', '#16a34a')};
  --ux-warning: {deep_get(c, 'warning', '#f59e0b')};
  --ux-danger: {deep_get(c, 'danger', '#ef4444')};
  --ux-info: {deep_get(c, 'info', '#0ea5e9')};
  --ux-text: {guard_text_color(deep_get(neu, 'text', '#1e293b'))};
  --ux-text-secondary: {guard_secondary_color(deep_get(neu, 'textSecondary', '#64748b'))};
  --ux-border: {deep_get(neu, 'border', '#e2e8f0')};
  --ux-bg: {deep_get(neu, 'bg', '#ffffff')};
  --ux-bg-alt: {deep_get(neu, 'bgAlt', '#f8fafc')};
  --ux-gradient-from: {deep_get(g, 'from', '#1e3a5f')};
  --ux-gradient-to: {deep_get(g, 'to', '#4A9FD8')};
  --ux-font-family: {font};
  --ux-radius-md: {radius_md}px;
  --ux-radius-lg: {radius_lg}px;
  --ux-shadow-card: {shadow_card};
  --ux-transition: {trans};
  --ux-content-max: {deep_get(spacing, 'contentMaxWidth', 1440)}px;
  --ux-card-padding: {card_padding}px;
}}

/* ---------- 全局字体 ---------- */
* {{
  font-family: var(--ux-font-family);
}}
body {{
  color: var(--ux-text);
  background: var(--ux-bg);
}}

/* ---------- 排版层级体系（Typography Hierarchy） ----------
   impeccable：主次压强分明。主标题大而有力，正文稳定，次要信息弱化。
   直接命中 antd 组件类（antd 5 字号由 token 驱动，需显式覆盖）。 */
h1 {{ font-size: {h1_size}px; font-weight: {h1_weight}; line-height: 1.2; letter-spacing: -0.02em; color: var(--ux-text); }}
h2 {{ font-size: {h2_size}px; font-weight: {h2_weight}; line-height: 1.25; color: var(--ux-text); }}
h3 {{ font-size: {h3_size}px; font-weight: {h3_weight}; line-height: 1.3; color: var(--ux-text); }}
.ant-typography, .arco-typography {{ color: var(--ux-text); line-height: 1.5; }}

/* 页面主标题（Typography.Title level=4 → 20px 提升为 h2 量级，主次分明） */
.ant-typography.ant-typography-primary,
.ant-page-header-heading-title,
h4.ant-typography {{ font-size: {h2_size}px !important; font-weight: 650 !important; color: var(--ux-text) !important; }}
.ant-page-header-heading-title {{ font-size: {h2_size}px; font-weight: 650; }}

/* 卡片标题（Card titles → 保持 h3 量级，不再是默认 16px 平铺） */
.ant-card-head-title, .arco-card-header h3 {{ font-size: 16px; font-weight: 600; color: var(--ux-text); }}

/* 指标卡（Statistic）：数值大而美，标签弱化，主次分明 */
.ant-statistic-title {{ font-size: 13px; color: var(--ux-text-secondary); margin-bottom: 8px; font-weight: 500; }}
.ant-statistic-content {{ font-size: {h1_size}px; font-weight: 700; color: var(--ux-primary-dark); line-height: 1.15; letter-spacing: -0.02em; }}
.ant-statistic-content-value {{ font-variant-numeric: tabular-nums; }}
.ant-statistic-content-prefix, .ant-statistic-content-suffix {{ font-size: 16px; font-weight: 600; color: var(--ux-text-secondary); }}

/* 表格：表头 label-caps 化，正文稳定 */
.ant-table-thead > tr > th, .arco-table-th {{ background: var(--ux-bg-alt) !important; font-size: {label_size}px; font-weight: {label_weight}; text-transform: uppercase; letter-spacing: 0.03em; color: var(--ux-text-secondary) !important; }}
.ant-table-tbody > tr > td, .arco-table-td {{ font-size: {body_size}px; color: var(--ux-text); }}

/* 描述 / KV 展示（AI 报价解读、订舱确认） */
.ant-descriptions-item-label {{ font-size: {label_size}px; font-weight: 500; color: var(--ux-text-secondary); }}
.ant-descriptions-item-content {{ font-size: {body_size}px; color: var(--ux-text); font-weight: 500; }}

/* 时间线：节点标题主、时间弱 */
.ant-timeline-item-content {{ font-size: {body_size}px; color: var(--ux-text); }}

/* Alert：message 主（semibold），description 弱 */
.ant-alert-message {{ font-size: 15px; font-weight: 600; color: var(--ux-text); }}
.ant-alert-description {{ font-size: {body_size}px; color: var(--ux-text-secondary); line-height: 1.5; }}

/* 步骤条：当前步突出 */
.ant-steps-item-title {{ font-weight: 600; color: var(--ux-text); }}
.ant-steps-item-description {{ color: var(--ux-text-secondary); }}

/* 表单单行 label（formCard 内联 span） */
.ant-form-item-label > label {{ font-size: {body_size}px; font-weight: 500; color: var(--ux-text-secondary); }}

/* label-caps 辅助类 */
.label-caps {{ font-size: {label_size}px; font-weight: {label_weight}; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ux-text-secondary); }}

/* ---------- 卡片 / 容器视觉 ---------- */
.ant-card, .arco-card {{ border-radius: var(--ux-radius-md); box-shadow: var(--ux-shadow-card); border: 1px solid var(--ux-border); }}
.ant-table-tbody > tr:hover > td, .arco-table-tr:hover .arco-table-td {{ background: var(--ux-bg-alt) !important; }}

/* ---------- 交互状态 ---------- */
* {{ transition: background var(--ux-transition), border-color var(--ux-transition), box-shadow var(--ux-transition), color var(--ux-transition), transform var(--ux-transition); }}
a, .ant-btn, .arco-btn, .ant-card, .arco-card, .ant-menu-item, .arco-menu-item, [role="button"], .clickable {{ cursor: pointer; }}
a:focus-visible, .ant-btn:focus-visible, .arco-btn:focus-visible, .ant-input:focus-visible, .arco-input:focus-visible,
input:focus-visible, .ant-select-selector:focus-visible, .arco-select-view:focus-visible {{
  outline: 2px solid #5db2e2 !important; outline-offset: 1px;
}}
.ant-btn-primary, .arco-btn-primary {{ box-shadow: var(--ux-shadow-card); }}
.ant-btn-primary:hover, .arco-btn-primary:hover {{ opacity: 0.85; }}

/* ---------- 卡片 / 组件微交互（克制起升） ---------- */
.ant-card:hover, .arco-card:hover {{ box-shadow: 0 4px 16px rgba(16,33,62,0.12); }}

/* ---------- 品牌 Header（定制） ---------- */
.ux-app-header {{
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; padding: 0 24px; background: var(--ux-bg);
  border-bottom: 1px solid var(--ux-border);
  position: sticky; top: 0; z-index: 10;
}}
.ux-app-header .ux-title {{ font-size: 22px; font-weight: 600; color: var(--ux-text); }}
.ux-app-header .ux-subtitle {{ font-size: 13px; color: var(--ux-text-secondary); margin-left: 12px; }}

/* ---------- WCAG 对比度护栏（Contrast Guard） ----------
   强制语义色对达标（见 references/contrast_guard.md）。
   修复 antd 预设 gold/cyan/processing 深底深字/浅字等低对比色。 */
.ant-tag{{ background: var(--ux-bg) !important; border-color: var(--ux-border) !important; color: var(--ux-text) !important; font-weight: 500; border-radius: 6px; }}
.ant-tag-gold, .ant-tag-warning {{ background: #FFF4E5 !important; color: #B45309 !important; border: 1px solid #F0C98A !important; }}
.ant-tag-cyan, .ant-tag-info, .ant-tag-processing {{ background: #EAF2FB !important; color: #1D4ED8 !important; border: 1px solid #BFD8F0 !important; }}
.ant-tag-blue, .ant-tag-primary {{ background: #EAF2FB !important; color: #10213E !important; border: 1px solid #BFD8F0 !important; }}
.ant-tag-green, .ant-tag-success {{ background: #EAF7EE !important; color: #15803D !important; border: 1px solid #B5E0C0 !important; }}
.ant-tag-red, .ant-tag-error {{ background: #FDECEC !important; color: #B91C1C !important; border: 1px solid #F0B6B6 !important; }}
.ant-tag-geekblue, .ant-tag-purple {{ background: #EEF2FF !important; color: #4338CA !important; border: 1px solid #C7D2FE !important; }}
.ant-tag-default {{ background: #EEF2F7 !important; color: #334155 !important; border: 1px solid #E2E8F0 !important; }}

/* 推荐指令 chips：primary-soft 浅蓝底 + 深字（≈14:1）高可读 */
.chat-suggestion, .ant-tag[color="processing"], .ant-tag.processing-chip {{ background: #EAF2FB !important; color: #10213E !important; border: 1px solid #BFD8F0 !important; }}

/* Alert 语义色对（浅底深字，阈值达标） */
.ant-alert{{ border-radius: var(--ux-radius-md); }}
.ant-alert-info {{ background: #EAF2FB !important; border-color: #BFD8F0 !important; }}
.ant-alert-info .ant-alert-message, .ant-alert-info .ant-alert-icon {{ color: #10213E !important; }}
.ant-alert-info .ant-alert-description {{ color: #1E293B !important; }}
.ant-alert-success {{ background: #EAF7EE !important; border-color: #B5E0C0 !important; }}
.ant-alert-warning {{ background: #FFF4E5 !important; border-color: #F0C98A !important; }}
.ant-alert-warning .ant-alert-message, .ant-alert-warning .ant-alert-icon {{ color: #B45309 !important; }}
.ant-alert-error {{ background: #FDECEC !important; border-color: #F0B6B6 !important; }}
.ant-alert-error .ant-alert-message, .ant-alert-error .ant-alert-icon {{ color: #B91C1C !important; }}

/* 次要说明文字保底可读（防浅灰叠白） */
.text-secondary, .ant-typography-secondary {{ color: var(--ux-text-secondary) !important; }}
.ant-upload-hint {{ color: var(--ux-text-secondary) !important; }}

/* ---------- 响应式断点 ---------- */
@media (max-width: 375px) {{ .ux-card-pad, .ant-card, .arco-card {{ padding: 16px; }} .ux-app-header {{ padding: 0 16px; }} }}
@media (max-width: 768px) {{ .ux-app-header .ux-subtitle {{ display: none; }} }}
@media (max-width: 1024px) {{ .ux-content {{ max-width: 100%; }} }}
@media (min-width: 1440px) {{ .ux-content {{ max-width: var(--ux-content-max); }} }}
"""
    return css


def shadow_dict(dl):
    return dl.get("shadow", {}) if isinstance(dl, dict) else {}


# ---------------------------------------------------------------
# 注入入口文件（main.jsx / main.js）
# ---------------------------------------------------------------

def inject_main(target_src, frontend):
    css_path = os.path.join(target_src, "ux-design.css")
    js_path = os.path.join(target_src, "ux-design.js")
    if not os.path.exists(css_path) or not os.path.exists(js_path):
        return False, "ux-design 文件未生成"
    if frontend == "react":
        main = os.path.join(target_src, "main.jsx")
        if not os.path.exists(main):
            return False, "未找到 main.jsx"
        with open(main, "r", encoding="utf-8") as f:
            content = f.read()
        changed = []
        if "./ux-design.css" not in content:
            content = content.replace(
                "import App from './App.jsx';",
                "import App from './App.jsx';\nimport './ux-design.css';",
            )
            changed.append("css")
        if "designAppTheme" not in content:
            # 合并 antd token：把 theme={appTheme} 扩展为合并的 token
            content = content.replace(
                "import { appTheme } from './theme.js';",
                "import { appTheme } from './theme.js';\nimport { designAppTheme, applyDesignTheme } from './ux-design.js';\napplyDesignTheme();",
            )
            content = content.replace(
                "theme={appTheme}",
                "theme={{ ...appTheme, token: { ...appTheme.token, ...designAppTheme } }}",
            )
            changed.append("theme")
        with open(main, "w", encoding="utf-8") as f:
            f.write(content)
        return True, "React 注入完成: " + ", ".join(changed) if changed else "React 已注入"
    else:
        main = os.path.join(target_src, "main.js")
        if not os.path.exists(main):
            return False, "未找到 main.js"
        with open(main, "r", encoding="utf-8") as f:
            content = f.read()
        changed = []
        if "./ux-design.css" not in content:
            content = content.replace(
                "import App from './App.vue';",
                "import App from './App.vue';\nimport './ux-design.css';",
            )
            changed.append("css")
        if "applyDesignTheme" not in content:
            content = content.replace(
                "import { applyTheme } from './theme.js';",
                "import { applyTheme } from './theme.js';\nimport { applyDesignTheme } from './ux-design.js';",
            )
            content = content.replace(
                "applyTheme();",
                "applyTheme();\napplyDesignTheme();",
            )
            changed.append("theme")
        with open(main, "w", encoding="utf-8") as f:
            f.write(content)
        return True, "Vue 注入完成: " + ", ".join(changed) if changed else "Vue 已注入"


# ---------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------

def detect_frontend(target):
    src = os.path.join(target, "src")
    if os.path.exists(os.path.join(src, "main.jsx")):
        return "react"
    if os.path.exists(os.path.join(src, "main.js")):
        return "vue"
    return "unknown"


def main():
    parser = argparse.ArgumentParser(description="注入 UX 定制设计系统到 mvp-prototype")
    parser.add_argument("audit", help="ux-audit.yaml 路径")
    parser.add_argument("--target", required=True, help="mvp-prototype 工程目录")
    parser.add_argument("--force", action="store_true", help="覆盖已有 ux-design 文件")
    args = parser.parse_args()

    if not os.path.exists(args.audit):
        print(f"[!] 找不到 ux-audit: {args.audit}")
        sys.exit(1)
    if not os.path.isdir(args.target):
        print(f"[!] 找不到 mvp-prototype 目录: {args.target}")
        sys.exit(1)

    audit = load_audit(args.audit)
    meta = audit.get("meta", {})
    dl = audit.get("designLanguage", {})
    typo = dl.get("typography", {})
    spacing = dl.get("spacing", {})
    radius = dl.get("radius", {})
    motion = dl.get("motion", {})

    target = os.path.abspath(args.target)
    src = os.path.join(target, "src")
    if not os.path.isdir(src):
        os.makedirs(src, exist_ok=True)

    css_content = build_design_css(dl, typo, spacing, radius, motion)
    js_content = build_design_js(dl, typo, spacing)

    css_out = os.path.join(src, "ux-design.css")
    js_out = os.path.join(src, "ux-design.js")
    if os.path.exists(css_out) and not args.force:
        # 保留已有覆盖层可选干净重建需求，这里直接递增覆盖
        pass
    with open(css_out, "w", encoding="utf-8") as f:
        f.write(css_content)
    with open(js_out, "w", encoding="utf-8") as f:
        f.write(js_content)

    frontend = detect_frontend(target)
    ok, msg = inject_main(src, frontend)

    print("=" * 60)
    print("UX-Optimizer · 注入报告")
    print("=" * 60)
    print(f"企业/场景 : {deep_get(meta, 'company', '?')} / {deep_get(meta, 'scenario', '?')}")
    print(f"业务域     : {deep_get(meta, 'businessDomain', '默认')}")
    print(f"产品 UI 模式: {deep_get(meta, 'mode', 'Modern SaaS 工作台')}")
    print(f"前端框架   : {frontend}")
    print(f"设计 token : {deep_get(dl.get('colors', {}), 'primary', '?')} (主色)")
    print(f"生成覆盖层 : ux-design.css / ux-design.js")
    print(f"入口注入   : {'成功 - ' + msg if ok else '注意 - ' + msg}")
    print("=" * 60)
    print(f"请在 mvp-prototype 中运行: npm run dev 后浏览器逐页检查定制设计还原度。")
    print("提示: 本注入为无侵入覆盖层，不影响业务逻辑与接口。")


if __name__ == "__main__":
    main()
