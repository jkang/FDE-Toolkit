#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prototype-generator · HTML 单文件原型编译引擎
============================================
读取 mvp_spec.yaml（frontend: html），编译为**可双击打开的单文件交互 HTML 原型**：
  - 无外链 / 无构建 / 无后端：内联 CSS + JS + Mock 数据，离线即可演示
  - pages[].route → hash 路由；pages[].actions[].name → 命中 aiMocks/businessMocks
  - 元素白名单与 React/Vue 路径完全一致（见 references/mvp_prompts.md）

用法:
    python3 build_html_prototype.py <mvp_spec.yaml> [--case X] [--scenario Y] [--output path.html] [--force]
"""

import os
import sys
import json
import argparse
import datetime
from html import escape

from jinja2 import Environment, FileSystemLoader

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scaffold_mvp import (  # noqa: E402
    parse_spec, normalize, find_model_mock,
    ensure_list, ensure_str, page_action_button,
)

# ---------------------------------------------------------------
# 基础工具
# ---------------------------------------------------------------

TAG_COLOR = {
    "success": "success", "processing": "processing", "warning": "warning",
    "error": "error", "default": "default",
    "blue": "blue", "arcoblue": "blue", "geekblue": "geekblue", "cyan": "cyan",
    "gold": "gold", "orange": "orange", "volcano": "red", "red": "red",
    "green": "green", "lime": "lime", "purple": "purple", "magenta": "magenta",
}


def js_json(obj):
    """内联进 <script> 的 JSON（转义 </ 防提前闭合脚本标签）"""
    return json.dumps(obj, ensure_ascii=False).replace("</", "<\\/")


def attr(s):
    return escape(ensure_str(s), quote=True)


def txt(s):
    return escape(ensure_str(s))


def tag_html(value, color):
    return f'<span class="tag tag-{TAG_COLOR.get(color, "default")}">{txt(value)}</span>'


# ---------------------------------------------------------------
# 元素渲染（与 mvp_prompts.md 元素白名单一一对应）
# ---------------------------------------------------------------

def render_table_html(columns, rows):
    cols = ensure_list(columns)
    th = "".join(f'<th>{txt(c.get("title", c.get("key", "")))}</th>' for c in cols)
    body = []
    for row in ensure_list(rows):
        tds = []
        for c in cols:
            key = c.get("key", "")
            val = row.get(key, "")
            tagmap = c.get("tag") or {}
            color = None
            for k, v in tagmap.items():
                if str(k) == str(val):
                    color = v
                    break
            if color is not None:
                tds.append(f"<td>{tag_html(val, color)}</td>")
            else:
                tds.append(f"<td>{txt(val)}</td>")
        body.append("<tr>" + "".join(tds) + "</tr>")
    return (f'<table class="tbl"><thead><tr>{th}</tr></thead>'
            f'<tbody>{"".join(body)}</tbody></table>')


def render_section(el, page, spec, uid, bindings):
    etype = el.get("type")
    pid = page["id"]

    if etype == "steps":
        items = [i if isinstance(i, str) else i.get("title", "")
                 for i in ensure_list(el.get("items"))]
        cur = int(el.get("current", 0) or 0)
        lis = []
        for i, it in enumerate(items):
            cls = "step done" if i < cur else ("step active" if i == cur else "step")
            lis.append(f'<div class="{cls}"><span class="step-dot">{i + 1}</span>'
                       f'<span class="step-t">{txt(it)}</span></div>')
        return f'<div class="card"><div class="steps">{"".join(lis)}</div></div>'

    if etype == "statRow":
        cells = []
        for st in ensure_list(el.get("stats")):
            cells.append(
                f'<div class="stat"><div class="stat-label">{txt(st.get("label", ""))}</div>'
                f'<div class="stat-value">{txt(st.get("value", ""))}'
                f'<span class="stat-suffix">{txt(st.get("suffix", ""))}</span></div></div>')
        return f'<div class="stat-row">{"".join(cells)}</div>'

    if etype == "uploadCard":
        action = el.get("action")
        title = el.get("title", "文件上传")
        accept = el.get("accept", "")
        hint = el.get("hint", "")
        btn = ""
        if action:
            key = f"{pid}::{action}"
            text = page_action_button(page, action)
            btn = (f'<button class="btn btn-primary" data-run="{attr(key)}" '
                   f'data-action="{attr(action)}" data-payload="file" data-load="{attr(key)}">'
                   f'{txt(text)}</button>')
        return (f'<div class="card"><div class="card-title">{txt(title)}</div>'
                f'<label class="uploader">'
                f'<input type="file" accept="{attr(accept)}" hidden onchange="'
                f"var c=this.closest('.card');"
                f"c.querySelector('.upload-name').textContent=this.files[0]?this.files[0].name:'';\">"
                f'<div class="upload-ico">&#8679;</div>'
                f'<div class="upload-text">点击或拖拽文件到此处上传</div>'
                f'<div class="upload-hint">{txt(hint)}</div>'
                f'<div class="upload-name"></div>'
                f'</label>{btn}</div>')

    if etype == "aiResultCard":
        title = el.get("title", "AI 结果")
        bind = el.get("bind")
        if not bind:
            return (f'<div class="card"><div class="card-title">{txt(title)}</div>'
                    f'<div class="empty">无数据</div></div>')
        uid["n"] += 1
        el_id = f"res-{uid['n']}"
        bindings.append({
            "key": f"{pid}::{bind}", "kind": "aiCard", "elId": el_id,
            "render": ensure_str(el.get("render"), "auto"),
            "columns": ensure_list(el.get("columns")),
        })
        return (f'<div class="card"><div class="card-title">{txt(title)}</div>'
                f'<div class="result" id="{el_id}">'
                f'<div class="empty">触发操作后展示结果</div></div></div>')

    if etype == "table":
        data_ref = el.get("data")
        if isinstance(data_ref, str) and data_ref.startswith("mock:"):
            rows = find_model_mock(spec, data_ref.split(":", 1)[1])
        elif isinstance(data_ref, list):
            rows = data_ref
        else:
            rows = []
        return (f'<div class="card"><div class="card-title">{txt(el.get("title", "数据"))}</div>'
                f'{render_table_html(el.get("columns"), rows)}</div>')

    if etype == "buttonRow":
        btns = []
        for b in ensure_list(el.get("buttons")):
            text = b.get("text", "操作")
            cls = "btn btn-primary" if b.get("type") == "primary" else "btn"
            action = ensure_str(b.get("action"))
            if action.startswith("navigate:"):
                route = action.split(":", 1)[1]
                btns.append(f'<button class="{cls}" data-nav="{attr(route)}">{txt(text)}</button>')
            else:
                key = f"{pid}::{action}"
                btns.append(f'<button class="{cls}" data-run="{attr(key)}" '
                            f'data-action="{attr(action)}" data-payload="none" '
                            f'data-load="{attr(key)}">{txt(text)}</button>')
        return f'<div class="btn-row">{"".join(btns)}</div>'

    if etype == "alert":
        desc = el.get("description", "")
        d = f'<div class="alert-desc">{txt(desc)}</div>' if desc else ""
        return (f'<div class="alert alert-{attr(el.get("level", "info"))}">'
                f'<div class="alert-msg">{txt(el.get("message", ""))}</div>{d}</div>')

    if etype == "timeline":
        lis = []
        for it in ensure_list(el.get("items")):
            if isinstance(it, dict):
                t, color = it.get("title", ""), it.get("color", "blue")
            else:
                t, color = str(it), "blue"
            lis.append(f'<li class="tl-item"><span class="tl-dot tl-{TAG_COLOR.get(color, "blue")}">'
                       f'</span><span>{txt(t)}</span></li>')
        return f'<div class="card"><ul class="timeline">{"".join(lis)}</ul></div>'

    if etype == "tagRow":
        tags = []
        for t in ensure_list(el.get("tags")):
            if isinstance(t, dict):
                tags.append(tag_html(t.get("text", ""), t.get("color", "default")))
            else:
                tags.append(tag_html(str(t), "default"))
        return f'<div class="tag-row">{"".join(tags)}</div>'

    if etype == "chatPanel":
        action = el.get("action")
        title = el.get("title", "AI 对话助手")
        if not action:
            return f'<div class="card"><div class="card-title">{txt(title)}</div></div>'
        uid["n"] += 1
        el_id = f"chat-{uid['n']}"
        key = f"{pid}::{action}"
        bindings.append({"key": key, "kind": "chat", "elId": el_id})
        chips = ""
        sugg = ensure_list(el.get("suggestions"))
        if sugg:
            cs = []
            for s in sugg:
                text = s.get("text", str(s)) if isinstance(s, dict) else str(s)
                cs.append(f'<button class="chip" data-run="{attr(key)}" '
                          f'data-action="{attr(action)}" data-payload="fixed" '
                          f'data-message="{attr(text)}" data-load="{attr(key)}">{txt(text)}</button>')
            chips = f'<div class="chat-sugg"><span class="sugg-label">推荐指令：</span>{"".join(cs)}</div>'
        ph = el.get("placeholder", "输入你的问题…")
        return (f'<div class="card"><div class="card-title">{txt(title)}</div>'
                f'<div class="chat-area" id="{el_id}">'
                f'<div class="empty">与 AI 助手对话，获取推荐操作</div></div>'
                f'<div class="chat-input"><input type="text" placeholder="{attr(ph)}" />'
                f'<button class="btn btn-primary" data-run="{attr(key)}" '
                f'data-action="{attr(action)}" data-payload="message" data-load="{attr(key)}">'
                f'发送</button></div>{chips}</div>')

    if etype == "formCard":
        action = el.get("action")
        rows = []
        for f in ensure_list(el.get("fields")):
            key = f.get("key", "")
            label = f.get("label", key)
            ftype = f.get("type", "text")
            val = f.get("value", f.get("default", ""))
            if ftype == "select":
                opts = []
                for o in ensure_list(f.get("options")):
                    if isinstance(o, dict):
                        ov = o.get("value", o)
                        ol = o.get("label", o.get("value", o))
                    else:
                        ov = ol = o
                    sel = " selected" if str(ov) == str(val) else ""
                    opts.append(f'<option value="{attr(ov)}"{sel}>{txt(ol)}</option>')
                ctrl = f'<select data-field="{attr(key)}">{"".join(opts)}</select>'
            elif ftype == "date":
                ctrl = f'<input type="date" data-field="{attr(key)}" value="{attr(val)}" />'
            else:
                ctrl = f'<input type="text" data-field="{attr(key)}" value="{attr(val)}" />'
            rows.append(f'<div class="form-row"><label class="form-label">{txt(label)}</label>{ctrl}</div>')
        btn = ""
        if action:
            key = f"{pid}::{action}"
            btn = (f'<button class="btn btn-primary" data-run="{attr(key)}" '
                   f'data-action="{attr(action)}" data-payload="form" data-load="{attr(key)}">提交</button>')
        return (f'<div class="card"><div class="card-title">{txt(el.get("title", "表单"))}</div>'
                f'<div class="form">{"".join(rows)}</div>{btn}</div>')

    return ""


def render_page(spec, page, uid, bindings):
    pid = page["id"]
    out = [f'<section class="page" data-route="{attr(page["route"])}" data-id="{attr(pid)}">',
           '<div class="page-head">',
           f'<h2 class="page-title">{txt(page.get("title", pid))}</h2>']
    if page.get("description"):
        out.append(f'<p class="page-desc">{txt(page["description"])}</p>')
    out.append("</div>")
    for el in ensure_list(page.get("sections")):
        out.append(render_section(el, page, spec, uid, bindings))
    out.append("</section>")
    return "\n".join(out)


# ---------------------------------------------------------------
# Mock 数据 & 绑定关系
# ---------------------------------------------------------------

def build_mock_data(spec):
    data = {}
    for ai in ensure_list(spec.get("aiMocks")):
        data[ensure_str(ai.get("name"))] = {
            "latency": ai.get("latency", 500), "response": ai.get("response")}
    for bm in ensure_list(spec.get("businessMocks")):
        data[ensure_str(bm.get("name"))] = {
            "latency": bm.get("latency", 300), "response": bm.get("response")}
    # apiRoutes.name → 目标 Mock（兼容路由名与 Mock 名不一致的情况）
    for r in ensure_list(spec.get("apiRoutes")):
        target = ensure_str(r.get("target"))
        rname = ensure_str(r.get("name"))
        if target.startswith("ai:") or target.startswith("business:"):
            ref = target.split(":", 1)[1]
            if ref in data:
                data.setdefault(rname, data[ref])
        elif target == "compose":
            merged = {}
            for c in ensure_list(r.get("compose")):
                base = data.get(ensure_str(c.get("method")), {})
                merged[ensure_str(c.get("key", c.get("method", "")))] = base.get("response")
            data[rname] = {"latency": 400, "response": merged}
    return data


def build_bindings_map(bindings):
    out = {}
    for b in bindings:
        key = b["key"]
        out.setdefault(key, []).append({k: v for k, v in b.items() if k != "key"})
    return out


# ---------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------

def resolve_output(args, spec):
    meta = spec["meta"]
    if args.output:
        return args.output
    if args.case and args.scenario:
        return os.path.join(args.case, args.scenario, f"{args.case}-{args.scenario}-MVP原型.html")
    if args.case:
        return os.path.join(args.case, f"{args.case}-MVP原型.html")
    name = ensure_str(meta.get("projectName") or meta.get("productName"), "mvp-prototype")
    return f"{name}-MVP原型.html"


def main():
    parser = argparse.ArgumentParser(description="HTML 单文件原型编译引擎")
    parser.add_argument("spec", help="mvp_spec.yaml 路径")
    parser.add_argument("--case", default=None, help="客户/案例目录名")
    parser.add_argument("--scenario", default=None, help="场景子目录名")
    parser.add_argument("--output", default=None, help="显式输出 HTML 路径")
    parser.add_argument("--force", action="store_true", help="覆盖已存在文件")
    args = parser.parse_args()

    spec_data = parse_spec(args.spec)
    spec = normalize(spec_data)
    meta = spec["meta"]
    if meta["frontend"] != "html":
        print(f"⚠️ meta.frontend={meta['frontend']}（非 html）；仍按 HTML 单文件渲染，建议在 mvp_spec 中改为 html。")

    out_path = os.path.abspath(resolve_output(args, spec))
    if os.path.exists(out_path) and not args.force:
        print(f"❌ 输出文件已存在: {out_path}（使用 --force 覆盖）")
        sys.exit(1)

    uid = {"n": 0}
    bindings = []
    pages_body = "\n".join(render_page(spec, p, uid, bindings) for p in spec["pages"])
    bindings_map = build_bindings_map(bindings)
    mock_data = build_mock_data(spec)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    templates_dir = os.path.join(os.path.dirname(base_dir), "templates")
    env = Environment(loader=FileSystemLoader(templates_dir), autoescape=False)
    template = env.get_template("html_prototype_layout.html.j2")

    html_out = template.render(
        productName=meta["productName"],
        businessDomain=meta["businessDomain"],
        primary=meta["primary"],
        accent=meta["accent"],
        brand_initial=(meta["productName"] or "M")[:1],
        personas=spec["personas"],
        pages=spec["pages"],
        pages_body=pages_body,
        mock_json=js_json(mock_data),
        bindings_json=js_json(bindings_map),
        generated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
    )

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html_out)

    print(f"✅ HTML 单文件原型编译成功 → {out_path}")
    print(f"   页面: {len(spec['pages'])} 个 | Mock 接口: {len(mock_data)} 个 | 交互绑定: {len(bindings)} 处")
    print("   打开: 双击该 HTML 文件即可（离线、免构建）")


if __name__ == "__main__":
    main()
