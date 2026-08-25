"""
build_ontology.py  ──  Agent Ontology Designer Build Engine
Usage: python3 scripts/build_ontology.py <input.yaml> <output.html>

Three-layer ontology visualization:
  Tab 1 · Object Relations  — entity cards + relationships + key distinctions
  Tab 2 · Action Boundaries — situation cards (evidence/valid/invalid/exceptions)
  Tab 3 · State Transitions — workstream state flow with SVG arrows + guardrails

Architecture mirrors blueprint-map-generator:
  1. Robust YAML parsing  — strips ```yaml fences automatically
  2. Data normalization    — defensive handling of all optional fields
  3. Jinja2 template engine — HTML/CSS fully in templates/ontology_layout.html
"""

import re
import sys
import os
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT   = os.path.dirname(SCRIPT_DIR)
TEMPLATE_DIR = os.path.join(SKILL_ROOT, "templates")

# ── Entity type metadata ──
ENTITY_TYPE_META = {
    "core":      {"label": "核心对象",  "color_class": "entity-core"},
    "reference": {"label": "参考对象",  "color_class": "entity-reference"},
    "event":     {"label": "事件对象",  "color_class": "entity-event"},
}

# ── Transition type metadata ──
TRANSITION_TYPE_META = {
    "normal":    {"label": "正常迁移",  "style": "solid"},
    "exception": {"label": "异常分支",  "style": "dashed"},
    "recovery":  {"label": "异常恢复",  "style": "dotted"},
}

# ── Mermaid label escaping ──
# Mermaid node labels are written as ["..."] / |...|. A literal `"` or `|` in the
# source YAML would break the diagram syntax. HTML entities (&#34;) do NOT help
# because the HTML parser decodes them back to `"` before mermaid reads textContent.
# Mermaid's own numeric entity syntax `#quot;` / `#124;` is decoded by mermaid
# itself and survives the HTML-parse round-trip.
def escape_mermaid_label(value) -> str:
    if value is None:
        return ""
    text = str(value)
    text = text.replace("|", "#124;").replace('"', "#quot;")
    return text


# Mermaid node ids must be alphanumeric-ish (letters/digits/_/-/.). Chinese chars and
# punctuation like `(`, `.` in a *position* can confuse the parser. Replace everything
# outside [A-Za-z0-9_-] with `_` and guard against ids starting with a digit.
def escape_mermaid_id(value) -> str:
    if value is None:
        return ""
    text = re.sub(r"[^A-Za-z0-9_-]", "_", str(value))
    if text and text[0].isdigit():
        text = "n" + text
    return text or "node"


# ══════════════════════════════════════════════════════════════════════════════
# 1. YAML PARSING  (robust: strip ``` fences)
# ══════════════════════════════════════════════════════════════════════════════
def load_yaml_robust(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    # Search for ```yaml ... ``` code block first
    match = re.search(r"```(?:yaml|yml)?\s*\n(.*?)\n\s*```", raw, re.DOTALL | re.IGNORECASE)
    if match:
        content = match.group(1)
    else:
        # Fallback to cleaning boundaries
        content = re.sub(r"^\s*```(?:yaml|yml)?\s*\n", "", raw, flags=re.MULTILINE)
        content = re.sub(r"\n\s*```\s*$", "", content, flags=re.MULTILINE)
    return yaml.safe_load(content.strip())


# ══════════════════════════════════════════════════════════════════════════════
# 2. DATA NORMALISERS (防御性编程)
# ══════════════════════════════════════════════════════════════════════════════
def ensure_str_list(val) -> list:
    if not val:
        return []
    if isinstance(val, str):
        return [val]
    if isinstance(val, list):
        return [str(v) for v in val]
    return [str(val)]


def ensure_obj_list(val) -> list:
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [val]


def safe_str(val, default="") -> str:
    if val is None:
        return default
    return str(val).strip()


def normalise_attribute(attr) -> dict:
    if isinstance(attr, str):
        return {
            "name":        attr.strip(),
            "type":        "string",
            "description": "",
            "enum_values": [],
        }
    if isinstance(attr, dict):
        return {
            "name":        safe_str(attr.get("name")),
            "type":        safe_str(attr.get("type"), "string"),
            "description": safe_str(attr.get("description")),
            "enum_values": ensure_str_list(attr.get("values")),
        }
    return {
        "name":        "",
        "type":        "string",
        "description": "",
        "enum_values": [],
    }


def normalise_entity(ent: dict) -> dict:
    etype = safe_str(ent.get("type"), "core").lower()
    if etype not in ENTITY_TYPE_META:
        etype = "core"
    meta = ENTITY_TYPE_META[etype]
    return {
        "id":               escape_mermaid_id(ent.get("id")),
        "raw_id":           safe_str(ent.get("id")),
        "name":             safe_str(ent.get("name")),
        "type":             etype,
        "type_label":       meta["label"],
        "color_class":      meta["color_class"],
        "description":      safe_str(ent.get("description")),
        "attributes":       [normalise_attribute(a) for a in ensure_obj_list(ent.get("attributes")) if isinstance(a, (dict, str))],
        "key_distinctions": ensure_str_list(ent.get("key_distinctions")),
    }


def normalise_relationship(rel: dict) -> dict:
    cardinality = safe_str(rel.get("cardinality"), "1:N")
    valid_cards = {"1:1", "1:N", "N:1", "N:N"}
    if cardinality not in valid_cards:
        cardinality = "1:N"
    return {
        "from_id":     escape_mermaid_id(rel.get("from")),
        "to_id":       escape_mermaid_id(rel.get("to")),
        "label":       safe_str(rel.get("label")),
        "cardinality": cardinality,
        "description": safe_str(rel.get("description")),
    }


def normalise_evidence(ev) -> dict:
    if isinstance(ev, str):
        return {"source": ev, "checks": ""}
    return {
        "source": safe_str(ev.get("source")),
        "checks": safe_str(ev.get("checks")),
    }


def normalise_invalid_action(ia) -> dict:
    if isinstance(ia, str):
        return {"action": ia, "reason": ""}
    return {
        "action": safe_str(ia.get("action")),
        "reason": safe_str(ia.get("reason")),
    }


def normalise_exception_trigger(et) -> dict:
    if isinstance(et, str):
        return {"condition": et, "action": ""}
    return {
        "condition": safe_str(et.get("condition")),
        "action":    safe_str(et.get("action")),
    }


def normalise_action_boundary(ab: dict) -> dict:
    return {
        "id":                   safe_str(ab.get("id")),
        "situation":            safe_str(ab.get("situation")),
        "situation_description": safe_str(ab.get("situation_description")),
        "required_evidence":    [normalise_evidence(e) for e in ensure_obj_list(ab.get("required_evidence"))],
        "valid_actions":        ensure_str_list(ab.get("valid_actions")),
        "invalid_actions":      [normalise_invalid_action(ia) for ia in ensure_obj_list(ab.get("invalid_actions"))],
        "exception_triggers":   [normalise_exception_trigger(et) for et in ensure_obj_list(ab.get("exception_triggers"))],
    }


def normalise_transition(tr: dict) -> dict:
    ttype = safe_str(tr.get("type"), "normal").lower()
    if ttype not in TRANSITION_TYPE_META:
        ttype = "normal"
    meta = TRANSITION_TYPE_META[ttype]
    return {
        "to_state":         escape_mermaid_id(tr.get("to_state")),
        "trigger_action":   safe_str(tr.get("trigger_action")),
        "required_evidence": safe_str(tr.get("required_evidence")),
        "type":             ttype,
        "type_label":       meta["label"],
        "style":            meta["style"],
    }


def normalise_state(st: dict) -> dict:
    return {
        "id":          escape_mermaid_id(st.get("id")),
        "raw_id":      safe_str(st.get("id")),
        "name":        safe_str(st.get("name")),
        "description": safe_str(st.get("description")),
        "transitions": [normalise_transition(t) for t in ensure_obj_list(st.get("transitions")) if isinstance(t, dict)],
        # data-driven flags, filled by resolve_state_names():
        "is_exception": False,
        "is_terminal":  False,
    }


def normalise_dependency(dep) -> dict:
    if isinstance(dep, str):
        return {"workstream": dep, "condition": "", "impact": ""}
    return {
        "workstream": safe_str(dep.get("workstream")),
        "condition":  safe_str(dep.get("condition")),
        "impact":     safe_str(dep.get("impact")),
    }


def normalise_workstream(ws: dict) -> dict:
    states = [normalise_state(s) for s in ensure_obj_list(ws.get("states")) if isinstance(s, dict)]

    # ── Resolve state ids → names and compute data-driven flags ──
    state_by_id = {s["id"]: s for s in states}
    for s in states:
        for tr in s["transitions"]:
            target = state_by_id.get(tr["to_state"])
            tr["to_state_name"] = target["name"] if target else tr["to_state"]
            # a state is an "exception state" if any incoming transition is type=exception
            if tr["type"] == "exception" and target is not None:
                target["is_exception"] = True
        # terminal: no outgoing transitions
        s["is_terminal"] = len(s["transitions"]) == 0

    return {
        "id":               safe_str(ws.get("id")),
        "name":             safe_str(ws.get("name")),
        "description":      safe_str(ws.get("description")),
        "anchor_objects":   [escape_mermaid_id(ao) for ao in ensure_str_list(ws.get("anchor_objects"))],
        "anchor_objects_names": [],
        "states":           states,
        "guardrails":       ensure_str_list(ws.get("guardrails")),
        "dependency_mapping": [normalise_dependency(d) for d in ensure_obj_list(ws.get("dependency_mapping"))],
    }


# ══════════════════════════════════════════════════════════════════════════════
# 3. AGENT PROMPT GENERATOR
# Generate a structured prompt snippet suitable for injection into Agent System Prompt
# ══════════════════════════════════════════════════════════════════════════════
def generate_agent_prompt(data: dict, entities: list, relationships: list, action_boundaries: list, workstreams: list) -> str:
    lines = []
    title = data.get("title", "业务本体")
    domain = data.get("domain", "")
    role = data.get("target_agent_role", "")
    scenario = data.get("scenario_description", "")

    lines.append(f"# 业务本体：{title}")
    if domain:
        lines.append(f"领域：{domain}")
    if role:
        lines.append(f"Agent 角色：{role}")
    if scenario:
        lines.append(f"场景：{scenario}")
    lines.append("")

    lines.append("## 1. 核心业务对象与概念边界")
    for ent in entities:
        lines.append(f"### {ent['name']} [{ent['type_label']}]")
        lines.append(f"- 定义：{ent['description']}")
        if ent["attributes"]:
            lines.append("- 属性定义：")
            for attr in ent["attributes"]:
                enum_desc = f"（可选值：{' / '.join(attr['enum_values'])}）" if attr['enum_values'] else ""
                desc = f" - {attr['description']}" if attr['description'] else ""
                lines.append(f"  * {attr['name']} ({attr['type']}){enum_desc}{desc}")
        if ent["key_distinctions"]:
            lines.append("- 关键概念边界（不可混淆）：")
            for kd in ent["key_distinctions"]:
                lines.append(f"  ⚠️ {kd}")
    lines.append("")

    if relationships:
        lines.append("## 2. 对象关系依赖（Relationships）")
        entity_lookup = {e["id"]: e["name"] for e in entities}
        for rel in relationships:
            from_name = rel.get("from_name") or entity_lookup.get(rel["from_id"], rel["from_id"])
            to_name = rel.get("to_name") or entity_lookup.get(rel["to_id"], rel["to_id"])
            card = rel.get("cardinality", "1:N")
            lines.append(f"- 【{from_name}】 --({rel.get('label')}, 基数 {card})--> 【{to_name}】")
            if rel.get("description"):
                lines.append(f"  说明：{rel.get('description')}")
        lines.append("")

    lines.append("## 3. 行动边界限制（情境 - 证据 - 合法/禁止动作）")
    for ab in action_boundaries:
        lines.append(f"### 情境：{ab['situation']}")
        if ab["situation_description"]:
            lines.append(f"描述：{ab['situation_description']}")
        if ab["required_evidence"]:
            lines.append("必须核实的证据：")
            for ev in ab["required_evidence"]:
                lines.append(f"  - [{ev['source']}] {ev['checks']}")
        if ab["valid_actions"]:
            lines.append("✅ 合法动作（允许执行）：")
            for va in ab["valid_actions"]:
                lines.append(f"  - {va}")
        if ab["invalid_actions"]:
            lines.append("❌ 禁止动作（严禁执行，防范错误假设）：")
            for ia in ab["invalid_actions"]:
                reason = f"（禁止原因：{ia['reason']}）" if ia["reason"] else ""
                lines.append(f"  - {ia['action']} {reason}")
        if ab["exception_triggers"]:
            lines.append("⚠️ 异常触发规则：")
            for et in ab["exception_triggers"]:
                lines.append(f"  - 当满足条件【{et['condition']}】 → 必须执行：{et['action']}")
    lines.append("")

    lines.append("## 4. 状态流转与全局护栏（Workstreams & States）")
    for ws in workstreams:
        lines.append(f"### 执行流（Workstream）：{ws['name']}")
        lines.append(f"描述：{ws['description']}")
        if ws["anchor_objects_names"]:
            lines.append(f"锚点对象：{'、'.join(ws['anchor_objects_names'])}")
        if ws["states"]:
            lines.append("状态节点及迁移路径：")
            for state in ws["states"]:
                lines.append(f"  - 状态：{state['name']} ({state['id']})")
                lines.append(f"    状态定义：{state['description']}")
                if state["transitions"]:
                    lines.append("    可用的状态转移路径：")
                    for tr in state["transitions"]:
                        lines.append(f"      * --[{tr['trigger_action']}] (核实证据: {tr['required_evidence']})--> 到达状态 {tr['to_state_name']} (性质: {tr['type_label']})")
        if ws["guardrails"]:
            lines.append("🔒 全局不可绕过护栏规则：")
            for gr in ws["guardrails"]:
                lines.append(f"  - {gr}")
        if ws["dependency_mapping"]:
            lines.append("🔗 跨流依赖关系：")
            for dep in ws["dependency_mapping"]:
                lines.append(f"  - 自身在该工作流时，若另一执行流 【{dep['workstream_name']}】 满足条件【{dep['condition']}】，则受到影响：{dep['impact']}")
    lines.append("")

    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════════════════════
# 4. MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 build_ontology.py <input.yaml> <output.html>")
        sys.exit(1)

    input_yaml, output_html = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.dirname(os.path.abspath(output_html)), exist_ok=True)

    # Load YAML
    try:
        data = load_yaml_robust(input_yaml)
    except yaml.YAMLError as e:
        print(f"❌ YAML parse error: {e}")
        sys.exit(1)

    if not isinstance(data, dict):
        print("❌ YAML root must be a mapping (dict).")
        sys.exit(1)

    # Normalise all layers
    entities        = [normalise_entity(e) for e in ensure_obj_list(data.get("entities")) if isinstance(e, dict)]
    relationships   = [normalise_relationship(r) for r in ensure_obj_list(data.get("relationships")) if isinstance(r, dict)]
    action_boundaries = [normalise_action_boundary(ab) for ab in ensure_obj_list(data.get("action_boundaries")) if isinstance(ab, dict)]
    workstreams     = [normalise_workstream(ws) for ws in ensure_obj_list(data.get("workstreams")) if isinstance(ws, dict)]

    # Build entity lookup for relationship labels
    entity_lookup = {e["id"]: e["name"] for e in entities}
    for rel in relationships:
        rel["from_name"] = entity_lookup.get(rel["from_id"], rel["from_id"])
        rel["to_name"]   = entity_lookup.get(rel["to_id"], rel["to_id"])

    # Build workstream lookup for dependency labels (needed by validation below)
    ws_lookup = {ws["id"]: ws["name"] for ws in workstreams}
    for ws in workstreams:
        for dep in ws["dependency_mapping"]:
            dep["workstream_name"] = ws_lookup.get(dep["workstream"], dep["workstream"])

    # ── Validation warnings: dangling references (typos would silently break visuals) ──
    warnings = []
    for rel in relationships:
        if rel["from_id"] not in entity_lookup:
            warnings.append(f"Relationship [{rel['label']}]: from '{rel['from_id']}' 不存在于 entities")
        if rel["to_id"] not in entity_lookup:
            warnings.append(f"Relationship [{rel['label']}]: to '{rel['to_id']}' 不存在于 entities")
    for ws in workstreams:
        for ao in ws["anchor_objects"]:
            if ao not in entity_lookup:
                warnings.append(f"Workstream [{ws['name']}] anchor_object '{ao}' 不存在于 entities")
        state_ids = {s["id"] for s in ws["states"]}
        for s in ws["states"]:
            for tr in s["transitions"]:
                if tr["to_state"] not in state_ids:
                    warnings.append(f"Workstream [{ws['name']}] state [{s['name']}] 迁移到不存在的状态 '{tr['to_state']}'")
        for dep in ws["dependency_mapping"]:
            if dep["workstream"] not in ws_lookup:
                warnings.append(f"Workstream [{ws['name']}] dependency 引用不存在的 workstream '{dep['workstream']}'")

    # Resolve workstream anchor object ids → entity names
    for ws in workstreams:
        ws["anchor_objects_names"] = [entity_lookup.get(ao, ao) for ao in ws["anchor_objects"]]

    # Generate Agent Prompt snippet (uses normalised data so names resolve)
    agent_prompt = generate_agent_prompt(data, entities, relationships, action_boundaries, workstreams)

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    # Render Jinja2
    env      = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=True)
    env.filters["mermaid_label"] = escape_mermaid_label
    template = env.get_template("ontology_layout.html")

    html = template.render(
        lang                = "zh-CN",
        title               = safe_str(data.get("title"), "Agent 本体设计"),
        domain              = safe_str(data.get("domain")),
        scenario_description = safe_str(data.get("scenario_description")),
        target_agent_role   = safe_str(data.get("target_agent_role")),
        generated_at        = datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        entities            = entities,
        relationships       = relationships,
        action_boundaries   = action_boundaries,
        workstreams         = workstreams,
        agent_prompt        = agent_prompt,
        raw_yaml            = raw_yaml_content,
    )

    with open(output_html, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅  Agent Ontology generated → {output_html}")
    print(f"    Entities         : {len(entities)}")
    print(f"    Relationships    : {len(relationships)}")
    print(f"    Action Boundaries: {len(action_boundaries)}")
    print(f"    Workstreams      : {len(workstreams)}")
    for ws in workstreams:
        print(f"    Workstream [{ws['name']}]: {len(ws['states'])} states, {len(ws['guardrails'])} guardrails")

    if warnings:
        print("")
        print("⚠️  Validation warnings (dangling references):")
        for w in warnings:
            print(f"    - {w}")


if __name__ == "__main__":
    main()
