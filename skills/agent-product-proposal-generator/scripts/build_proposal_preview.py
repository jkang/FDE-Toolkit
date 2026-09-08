#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent 产品方案 · Markdown → 自包含 HTML 预览
用法:
    python3 build_proposal_preview.py <Agent产品方案.md> <输出.html>
作用:
    读取产品方案 Markdown，渲染为单文件、可被 iframe 内嵌的 HTML 预览。
    - Markdown 用 marked（CDN）在客户端解析；< / & 按 agent.md 规则预转义，避免误判成 HTML。
    - mermaid 流程块用 mermaid（CDN）渲染成图。
    - 样式对齐 Refresher Workshop 主题（深海军蓝/紫 accent、圆角、浅色底）。
依赖: 仅标准库；运行端为浏览器加载 marked + mermaid CDN。
"""
import sys
import json
from pathlib import Path


PREVIEW_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} · 预览</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {{
  --ow-primary:#10213E; --ow-accent:#625D9C; --ow-cerulean:#5DB2E2;
  --ow-green:#00524C; --ow-pink:#F5ACB8; --ow-bg:#F5F5F6; --ow-card:#ffffff;
  --ow-text:#10213E; --ow-text-l:#4a5568; --ow-muted:#8b95a5; --ow-border:#dfe4ea;
}}
* {{ box-sizing:border-box; }}
html,body {{ margin:0; padding:0; background:var(--ow-bg); color:var(--ow-text);
  font-family:"Noto Sans SC","Inter",-apple-system,"PingFang SC","Microsoft YaHei",sans-serif; }}
.ow-toolbar {{ position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:10px;
  background:linear-gradient(135deg,#10213E,#1d3a5c); color:#fff; padding:12px 18px;
  box-shadow:0 4px 14px rgba(16,33,62,.18); }}
.ow-toolbar .t {{ font-weight:700; font-size:15px; flex:1; }}
.ow-toolbar a, .ow-toolbar button {{ background:rgba(255,255,255,.14); color:#fff; border:1px solid rgba(255,255,255,.25);
  border-radius:100px; padding:6px 14px; font-size:12.5px; text-decoration:none; cursor:pointer; }}
.ow-toolbar a:hover, .ow-toolbar button:hover {{ background:var(--ow-accent); }}
#content {{ max-width:1040px; margin:0 auto; padding:28px 34px 60px; background:var(--ow-card);
  min-height:100vh; box-shadow:0 5px 22px rgba(16,33,62,.06); }}
#content h1 {{ font-size:22px; color:var(--ow-primary); border-bottom:2px solid var(--ow-accent);
  padding-bottom:10px; margin:8px 0 16px; }}
#content h2 {{ font-size:18px; color:var(--ow-primary); margin:26px 0 12px;
  padding-left:10px; border-left:4px solid var(--ow-accent); line-height:1.3; }}
#content h3 {{ font-size:15px; color:var(--ow-primary); margin:18px 0 10px; }}
#content p {{ line-height:1.8; color:var(--ow-text-l); margin:10px 0; }}
#content blockquote {{ margin:12px 0; padding:12px 16px; background:#f6f8fc; border-left:3px solid var(--ow-cerulean);
  border-radius:8px; color:var(--ow-text-l); font-size:13px; line-height:1.7; }}
#content blockquote p {{ margin:4px 0; }}
#content ul, #content ol {{ padding-left:22px; color:var(--ow-text-l); line-height:1.8; }}
#content li {{ margin:4px 0; }}
#content code {{ background:#eef1f5; color:var(--ow-accent); border-radius:5px; padding:1px 6px;
  font-family:"SFMono-Regular",Consolas,monospace; font-size:13px; }}
#content pre {{ background:#10213E; color:#e6ebf5; border-radius:10px; padding:14px 16px; overflow:auto;
  font-size:13px; line-height:1.6; }}
#content pre code {{ background:transparent; color:inherit; padding:0; }}
#content table {{ width:100%; border-collapse:collapse; margin:14px 0; font-size:13px; }}
#content thead th {{ background:#10213E; color:#fff; text-align:left; padding:9px 12px; font-weight:600; }}
#content tbody td {{ padding:9px 12px; border-bottom:1px solid var(--ow-border); color:var(--ow-text-l); }}
#content tbody tr:hover td {{ background:#f6f8fc; }}
#content .mermaid {{ background:#fbfcfe; border:1px solid var(--ow-border); border-radius:12px;
  padding:16px; margin:16px 0; text-align:center; }}
@media (max-width:720px) {{ #content {{ padding:18px; }} }}
</style>
</head>
<body>
<div class="ow-toolbar">
  <span class="t">{title}</span>
  <button onclick="copyMd()">复制 Markdown</button>
  <a href="{src}" target="_blank" rel="noopener">打开 .md 原文</a>
</div>
<div id="content"><p style="color:#8b95a5">加载中…</p></div>
<script src="https://cdn.jsdelivr.net/npm/marked@11/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
const SRC = {md_json};
function copyMd() {{
  const ta = document.createElement('textarea');
  ta.value = SRC; document.body.appendChild(ta); ta.select();
  try {{ document.execCommand('copy'); }} catch(e) {{}}
  document.body.removeChild(ta);
}}
function renderMermaid() {{
  if (!window.mermaid) return;
  document.querySelectorAll('code.language-mermaid').forEach(function(code) {{
    const text = code.textContent;
    const wrap = code.parentElement;
    const div = document.createElement('div');
    div.className = 'mermaid'; div.textContent = text;
    wrap.replaceWith(div);
  }});
  mermaid.initialize({{ startOnLoad:false, theme:'base',
    themeVariables:{{ fontFamily:'"Noto Sans SC","Inter",sans-serif', primaryColor:'#eef2fc',
      primaryBorderColor:'#6b7eef', primaryTextColor:'#1e2233', lineColor:'#9aa6e8',
      clusterBkg:'#f5f7fd', clusterBorder:'#dfe5fa', tertiaryColor:'#ffffff' }} }});
  mermaid.run({{ nodes: document.querySelectorAll('.mermaid') }});
}}
window.addEventListener('DOMContentLoaded', function() {{
  const content = document.getElementById('content');
  const html = marked.parse(SRC, {{ gfm:true, breaks:true }});
  content.innerHTML = html;
  renderMermaid();
}});
</script>
</body>
</html>
"""


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    md_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    if not md_path.exists():
        print(f"[FAIL] 找不到 Markdown: {md_path}")
        return 1
    raw = md_path.read_text(encoding="utf-8")
    title = md_path.name
    # 按 agent.md 规则，在【非代码围栏】处把 < 与 & 预转义，避免 marked 误判为原始 HTML。
    # 但在 ``` 围栏内（如 mermaid / 代码）保持原样——转义会污染 mermaid 标签里的 "&&/D&D" 等字符。
    safe = _escape_markdown(raw)
    md_json = json.dumps(safe, ensure_ascii=False)
    src_rel = md_path.name
    html = PREVIEW_TEMPLATE.format(title=title, md_json=md_json, src=src_rel)
    out_path.write_text(html, encoding="utf-8")
    print(f"[OK] 已生成预览: {out_path}")
    return 0


def _escape_markdown(text):
    """非代码围栏处转义 & 与 <；``` 围栏（mermaid/代码）保持不变。"""
    out = []
    in_fence = False
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
        else:
            # 先 & 后 <，避免二次逃逸
            out.append(line.replace("&", "&amp;").replace("<", "&lt;"))
    return "\n".join(out)


if __name__ == "__main__":
    sys.exit(main())
