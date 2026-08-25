#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ai-product-journey-generator · YAML → HTML 编译引擎

将 LLM 推演的 To-be Journey YAML（personas / scenarios / stages）
编译为纯静态、高颜值的单文件 HTML 泳道图。

用法:
    python3 build_to_be.py <input.yaml> <output.html>
"""

import os
import sys
import re
import datetime
import yaml
from jinja2 import Environment, FileSystemLoader


def strip_markdown(text):
    """防呆：移除 LLM 可能输出的 ```yaml ... ``` 代码块标记"""
    text = text.strip()
    if text.startswith("```"):
        match = re.search(r"^```\w*\n(.*?)\n```$", text, re.DOTALL)
        if match:
            return match.group(1).strip()
        lines = text.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        return "\n".join(lines).strip()
    return text


def ensure_list(value, placeholder="无数据"):
    """防呆：确保输入是 List，字符串则包装为 List，空则给占位提示。"""
    if value is None or value == "":
        return [placeholder]
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        if len(value) == 0:
            return [placeholder]
        return value
    return [str(value)]


def ensure_str(value, default=""):
    if value is None:
        return default
    return str(value)


def clean_text_array(value, placeholder="无数据"):
    """清洗字符串列表，剔除 LLM 强行填补的无效占位词。"""
    res = []
    for item in ensure_list(value, placeholder):
        s = str(item).strip()
        if not s:
            continue
        cleaned = re.sub(r"[^\w]", "", s.lower())
        if cleaned in ("无", "没", "空", "none", "null", "暂无", "没有", "无数据", "暂无数据",
                       "无明显", "无输入", "无明显输入", "暂无输入", "无明显痛点"):
            continue
        if re.match(r"^(无|没|空|暂无)", s) and len(s) < 8:
            continue
        res.append(s)
    return res


def process_user_inputs(value):
    """userInputs: list of {type,name,format,example,content} 或字符串列表。"""
    items = []
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                items.append({
                    "type": ensure_str(item.get("type"), "输入"),
                    "name": ensure_str(item.get("name")),
                    "format": ensure_str(item.get("format")),
                    "example": ensure_str(item.get("example")),
                    "content": ensure_str(item.get("content")),
                })
            else:
                items.append({"type": "输入", "name": str(item), "format": "",
                              "example": "", "content": ""})
    elif value:
        items.append({"type": "输入", "name": str(value), "format": "",
                      "example": "", "content": ""})
    return items


def process_ai_interaction(value):
    """aiInteraction: {aiAction, suggestions[]} 或字符串。"""
    if isinstance(value, dict):
        return {
            "aiAction": ensure_str(value.get("aiAction")),
            "suggestions": clean_text_array(value.get("suggestions", []), "暂无推荐指令"),
        }
    if value:
        return {"aiAction": str(value), "suggestions": []}
    return {"aiAction": "", "suggestions": []}


def process_persona(p):
    """persona 防呆：确保 dataProfile 子结构完整。"""
    if not isinstance(p, dict):
        return {"name": str(p), "role": "", "department": "", "background": "",
                "goals": [], "painPoints": [], "dataProfile": {}}
    profile = p.get("dataProfile") or {}
    if not isinstance(profile, dict):
        profile = {}
    return {
        "id": ensure_str(p.get("id")),
        "name": ensure_str(p.get("name"), "未命名"),
        "role": ensure_str(p.get("role")),
        "department": ensure_str(p.get("department")),
        "background": ensure_str(p.get("background")),
        "goals": clean_text_array(p.get("goals", []), "暂无目标"),
        "painPoints": clean_text_array(p.get("painPoints", []), "暂无痛点"),
        "dataProfile": {
            "typicalValues": clean_text_array(profile.get("typicalValues", []), "暂无"),
            "frequency": ensure_str(profile.get("frequency"), "中频"),
            "commonErrors": clean_text_array(profile.get("commonErrors", []), "暂无"),
        },
    }


def process_scenario(s):
    if not isinstance(s, dict):
        return {"id": "", "name": str(s), "personaId": "", "trigger": "",
                "businessData": [], "goal": ""}
    return {
        "id": ensure_str(s.get("id")),
        "name": ensure_str(s.get("name"), "未命名场景"),
        "personaId": ensure_str(s.get("personaId")),
        "trigger": ensure_str(s.get("trigger")),
        "businessData": clean_text_array(s.get("businessData", []), "暂无数据"),
        "goal": ensure_str(s.get("goal")),
    }


def process_action(a):
    aiusecase = a.get("aiusecase") if isinstance(a, dict) else None
    return {
        "name": ensure_str(a.get("name"), "未命名行为"),
        "owner": ensure_str(a.get("owner"), "用户"),
        "touchpoints": ensure_str(a.get("touchpoints")),
        "thoughts": clean_text_array(a.get("thoughts", []), "暂无想法"),
        "userInputs": process_user_inputs(a.get("userInputs", [])),
        "aiInteraction": process_ai_interaction(a.get("aiInteraction", {})),
        "visibleData": clean_text_array(a.get("visibleData", []), "暂无数据展示"),
        "designNotes": clean_text_array(a.get("designNotes", []), "暂无设计要点"),
    }


def build_handoff(data, stages):
    """原型衔接要点：优先使用 YAML handoff 覆盖，否则从旅程自动汇总。"""
    ho = data.get("handoff") or {}
    if not isinstance(ho, dict):
        ho = {}

    # 页面清单：自动从触点去重汇总
    auto_pages = []
    for stage in stages:
        for action in stage["actions"]:
            tp = action["touchpoints"]
            if tp and tp not in auto_pages:
                auto_pages.append(tp)
    pages = clean_text_array(ho.get("pages", []), None) if ho.get("pages") else auto_pages
    if not pages:
        pages = ["按旅程泳道逐一演示"]

    # 数据实体：从 userInputs 汇总 "name (format)"
    auto_entities = []
    for stage in stages:
        for action in stage["actions"]:
            for ui in action["userInputs"]:
                label = ui["name"] + (f" ({ui['format']})" if ui["format"] else "")
                if label and label not in auto_entities:
                    auto_entities.append(label)
    entities = clean_text_array(ho.get("dataEntities", []), None) if ho.get("dataEntities") else auto_entities
    if not entities:
        entities = ["旅程中各步骤的用户输入数据"]

    # 推荐指令库：从全部 suggestions 去重汇总
    auto_sugg = []
    for stage in stages:
        for action in stage["actions"]:
            for s in action["aiInteraction"]["suggestions"]:
                if s and s not in auto_sugg:
                    auto_sugg.append(s)
    suggestions = clean_text_array(ho.get("suggestions", []), None) if ho.get("suggestions") else auto_sugg
    if not suggestions:
        suggestions = ["对话中推荐的操作指令"]

    paths = clean_text_array(ho.get("paths", []), "主路径：按旅程泳道顺序演示")
    if not paths:
        paths = ["主路径：按旅程泳道顺序演示"]

    return {"pages": pages, "dataEntities": entities,
            "suggestions": suggestions, "paths": paths}


def compile_to_be(yaml_path, output_html_path):
    with open(yaml_path, "r", encoding="utf-8") as f:
        raw_content = f.read()

    yaml_str = strip_markdown(raw_content)
    try:
        data = yaml.safe_load(yaml_str)
    except yaml.YAMLError as exc:
        print(f"❌ YAML 解析失败: {exc}")
        sys.exit(1)

    if not data or "stages" not in data:
        print("❌ 数据格式不合法：缺少顶级字段 'stages'。")
        sys.exit(1)

    # ---- 数据防呆清洗 ----
    title = ensure_str(data.get("title"), "To-be 旅程设计")
    meta = data.get("meta") or {}
    if not isinstance(meta, dict):
        meta = {}
    meta = {
        "mode": ensure_str(meta.get("mode"), "to-be"),
        "source": ensure_str(meta.get("source"), "来源未标注"),
        "scenarioName": ensure_str(meta.get("scenarioName")),
        "productType": ensure_str(meta.get("productType")),
    }
    personas = [process_persona(p) for p in ensure_list(data.get("personas", []), {})]
    scenarios = [process_scenario(s) for s in ensure_list(data.get("scenarios", []), {})]

    # 丢弃没有 actions 的无意义阶段，防崩溃
    raw_stages = data.get("stages", [])
    stages = []
    for s in raw_stages:
        if isinstance(s, dict) and s.get("actions"):
            actions = [process_action(a) for a in s["actions"]]
            stages.append({"name": ensure_str(s.get("name"), "阶段"), "actions": actions})

    if not stages:
        print("❌ 数据格式不合法：所有阶段均缺少 actions。")
        sys.exit(1)

    # ---- 泳道布局计算 ----
    ACTION_BOX_WIDTH = 170
    ACTION_BOX_SPACING = 16
    total_pixel_width = 0
    stage_widths = []
    for stage in stages:
        num = len(stage["actions"]) if stage["actions"] else 1
        w = num * (ACTION_BOX_WIDTH + ACTION_BOX_SPACING)
        stage_widths.append(w)
        total_pixel_width += w

    if total_pixel_width == 0:
        total_pixel_width = 1

    current_x_offset = 0
    has_ai_detail = False
    for s_idx, stage in enumerate(stages):
        actions = stage["actions"]
        stage["width_px"] = stage_widths[s_idx]
        stage["left_pct"] = (current_x_offset / total_pixel_width) * 100
        stage["width_pct"] = (stage_widths[s_idx] / total_pixel_width) * 100
        stage["safe_name"] = stage["name"]
        is_last_stage = (s_idx == len(stages) - 1)

        for a_idx, action in enumerate(actions):
            center = current_x_offset + a_idx * (ACTION_BOX_WIDTH + ACTION_BOX_SPACING) + ACTION_BOX_WIDTH / 2
            action["x_pct"] = (center / total_pixel_width) * 100
            action["is_first"] = (a_idx == 0)
            action["is_last"] = (a_idx == len(actions) - 1)
            action["is_final"] = (is_last_stage and a_idx == len(actions) - 1)
            if action["userInputs"] or action["aiInteraction"]["aiAction"] or action["visibleData"]:
                has_ai_detail = True

        current_x_offset += stage_widths[s_idx]

    handoff = build_handoff(data, stages)

    # ---- 渲染 ----
    script_dir = os.path.dirname(os.path.abspath(__file__))
    templates_dir = os.path.join(os.path.dirname(script_dir), "templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template("to_be_layout.html")

    canvas_min_width = total_pixel_width + 220
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html_content = template.render(
        title=title,
        meta=meta,
        personas=personas,
        scenarios=scenarios,
        stages=stages,
        handoff=handoff,
        has_ai_detail=has_ai_detail,
        ACTION_BOX_WIDTH=ACTION_BOX_WIDTH,
        total_canvas_width=canvas_min_width,
        generated_at=now_str,
    )

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ To-be 旅程编译成功！")
    print(f"📄 输出文件: {output_html_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_to_be.py <input.yaml> <output.html>")
        sys.exit(1)
    input_yaml = sys.argv[1]
    output_html = sys.argv[2]
    if not os.path.exists(input_yaml):
        print(f"❌ 未找到输入文件: {input_yaml}")
        sys.exit(1)
    compile_to_be(input_yaml, output_html)
