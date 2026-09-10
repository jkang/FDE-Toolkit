"""
build_tech_architecture.py  ──  Agent Tech Architecture Build Engine
Usage: python3 scripts/build_tech_architecture.py <input.yaml> <output.html>

把「Agent 落地技术架构」YAML 编译为交互式 HTML：
  · 顶部图例（类型 → 颜色）
  · 编排 Agent（唯一规划者：主循环 + 记忆）
  · 按意图调度的 N 个 Skill，每个 Skill = 一张 mermaid 纵向逻辑流程图
  · 共享底座（本体 R/W + MCP + KB）
  · 异常池 + 失败兜底表 + KPI 锚定 + 护栏

约定：
  · 节点正文只写业务动作；补充信息用小号灰字括号（写入 nodes[].note）。
  · nodes[].type 见 references/component_library.md。
  · 标签内如需 `>` 请写 `&gt;`；只允许使用 `<br/>` 与 `<span class=s>…</span>` 两种 HTML。
"""

import os
import re
import sys
import yaml
from jinja2 import Environment, FileSystemLoader

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

# type -> mermaid classDef (fill / stroke / color / extra)
TYPE_STYLE = {
    "op":        ("#FFFFFF", "#607D8B", "#37474F", ""),
    "det":       ("#E8F5E9", "#2E7D32", "#1B5E20", ""),
    "small":     ("#E1F5FE", "#0288D1", "#01579B", ""),
    "llm":       ("#EDE7F6", "#5E35B1", "#311B92", ""),
    "rag":       ("#FFF3E0", "#EF6C00", "#E65100", ""),
    "mcp":       ("#ECEFF1", "#546E7A", "#263238", ""),
    "onto":      ("#E0F2F1", "#00695C", "#004D40", ""),
    "hitl":      ("#FFEBEE", "#C62828", "#B71C1C", ""),
    "eval":      ("#FFFDE7", "#F9A825", "#F57F17", ""),
    "loop":      ("#F3E5F5", "#8E24AA", "#4A148C", "stroke-dasharray:5 3"),
    "exception": ("#FCE4EC", "#AD1457", "#880E4F", ""),
    "out":       ("#E8EAF6", "#3949AB", "#1A237E", ""),
}
DIAMOND_TYPES = {"hitl", "eval"}
STADIUM_TYPES = {"out"}


def load_yaml_robust(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    m = re.search(r"```(?:yaml|yml)?\s*\n(.*?)\n\s*```", raw, re.DOTALL | re.IGNORECASE)
    content = m.group(1) if m else raw
    return yaml.safe_load(content.strip())


def s(val, default=""):
    return default if val is None else str(val).strip()


def as_list(val):
    if not val:
        return []
    if isinstance(val, str):
        return [val]
    return list(val)


def as_dict_list(val, key):
    """把「字符串列表 / 单字符串 / 字典列表」统一成字典列表；字符串落到 key 字段。"""
    out = []
    for item in as_list(val):
        if isinstance(item, dict):
            out.append(item)
        elif isinstance(item, str):
            out.append({key: item})
    return out


def esc_label(value):
    """Mermaid label 安全转义（保留 <br/> 与 <span class=s>）。"""
    text = s(value)
    return text.replace("|", "#124;").replace('"', "#quot;")


def esc_id(value):
    text = re.sub(r"[^A-Za-z0-9_-]", "_", s(value))
    if text and text[0].isdigit():
        text = "n" + text
    return text or "node"


def node_label(node):
    main = esc_label(node.get("label", ""))
    note = esc_label(node.get("note", ""))
    if note:
        return f'{main}<br/><span class=s>({note})</span>'
    return main


def build_mermaid(skill, warnings):
    """把一个 Skill 的 nodes/edges 编译为 mermaid flowchart TB 文本。"""
    raw_nodes = skill.get("nodes") or []
    raw_edges = skill.get("edges") or []
    sid = s(skill.get("id")) or s(skill.get("name")) or "skill"

    # 防御：非字典节点剔除
    nodes = []
    node_ids = set()
    for n in as_list(raw_nodes):
        if not isinstance(n, dict):
            warnings.append(f"[{sid}] 跳过非字典节点：{n!r}")
            continue
        nid = esc_id(n.get("id", ""))
        if not nid or nid == "node":
            warnings.append(f"[{sid}] 节点缺少合法 id：{n!r}")
            continue
        nodes.append(n)
        node_ids.add(nid)

    lines = ["flowchart TB"]
    used_types = set()
    for n in nodes:
        nid = esc_id(n.get("id", ""))
        t = s(n.get("type", "op")) or "op"
        if t not in TYPE_STYLE:
            warnings.append(f"[{sid}] 节点 {nid} 的未知 type={t}，已按 op 渲染")
        used_types.add(t if t in TYPE_STYLE else "op")
        label = node_label(n)
        tt = t if t in TYPE_STYLE else "op"
        if t in DIAMOND_TYPES:
            lines.append(f'  {nid}{{"{label}"}}:::{tt}')
        elif t in STADIUM_TYPES:
            lines.append(f'  {nid}(["{label}"]):::{tt}')
        else:
            lines.append(f'  {nid}["{label}"]:::{tt}')

    for e in as_list(raw_edges):
        if not isinstance(e, dict):
            warnings.append(f"[{sid}] 跳过非字典边：{e!r}")
            continue
        frm, to = esc_id(e.get("from", "")), esc_id(e.get("to", ""))
        if not frm or not to:
            continue
        if frm not in node_ids or to not in node_ids:
            warnings.append(f"[{sid}] 边 {frm}→{to} 引用了不存在的节点，已跳过")
            continue
        label = esc_label(e.get("label", ""))
        style = s(e.get("style", "solid")) or "solid"
        arrow = "-.->" if style == "dashed" else "-->"
        mid = f"|{label}|" if label else ""
        lines.append(f"  {frm} {arrow}{mid} {to}")

    for t in sorted(used_types):
        fill, stroke, color, extra = TYPE_STYLE.get(t, TYPE_STYLE["op"])
        tail = f",{extra}" if extra else ""
        lines.append(f"  classDef {t} fill:{fill},stroke:{stroke},color:{color}{tail}")

    return "\n".join(lines)


def normalise(data):
    if not isinstance(data, dict):
        data = {}
    warnings = []
    meta = data.get("meta") or {}
    agent = data.get("agent") or {}
    skills = data.get("skills") or []
    for sk in skills:
        if not isinstance(sk, dict):
            continue
        sk["mermaid"] = build_mermaid(sk, warnings)
        sk.setdefault("type", "skill")
        sk["is_subagent"] = s(sk.get("type")) == "subagent"
    skills = [sk for sk in skills if isinstance(sk, dict)]

    # 共享底座与列表字段统一为「列表/字典」，防字符串被逐字符渲染
    sb = data.get("sharedBase") or {}
    if not isinstance(sb, dict):
        sb = {"ontology": {"title": "本体（确定性底座）", "note": str(sb)}}
    for key in ("ontology", "mcp", "kb"):
        blk = sb.get(key)
        if isinstance(blk, dict):
            for f in ("read", "write", "calls"):
                blk[f] = as_list(blk.get(f))
        elif isinstance(blk, str):
            sb[key] = {"title": key, "note": blk}

    agent["memory"] = as_list(agent.get("memory"))
    data["meta"] = meta
    data["agent"] = agent
    data["skills"] = skills
    data["n_skills"] = max(1, len(skills))
    data["routing"] = as_dict_list(data.get("routing"), "intent")
    data["sharedBase"] = sb
    data["failureTable"] = as_dict_list(data.get("failureTable"), "trigger")
    data["kpi"] = as_dict_list(data.get("kpi"), "name")
    data["guardrails"] = as_dict_list(data.get("guardrails"), "rule")
    data["notes"] = as_dict_list(data.get("notes"), "text")
    data["warnings"] = warnings
    return data


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/build_tech_architecture.py <input.yaml> <output.html>")
        sys.exit(1)
    in_path, out_path = sys.argv[1], sys.argv[2]
    data = normalise(load_yaml_robust(in_path))

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False)
    template = env.get_template("tech_arch_layout.html")
    html = template.render(**data)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[OK] compiled -> {out_path}")
    print(f"     skills: {data['n_skills']}  route: {s(data['meta'].get('route'))}")
    for w in data["warnings"]:
        print(f"     [warn] {w}")


if __name__ == "__main__":
    main()
