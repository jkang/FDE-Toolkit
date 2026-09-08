#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
agentic-workflow-designer · YAML → HTML 编译引擎

将 LLM 推演的 Agentic 工作流 YAML（meta / scenarioKpis / designPrinciples /
capabilities[含 PlantUML 序列图源码]）编译为纯静态、高颜值的单文件 HTML：
每个 AI 能力一个 Tab，PlantUML 源码通过 plantuml server 渲染为 SVG 内嵌展示。

用法:
    python3 build_agentic.py <input.yaml> <output.html>
"""

import os
import re
import sys
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


def extract_puml(value):
    """提取并校验 PlantUML 源码：剥代码块、补 @startuml/@enduml 边界。"""
    if value is None:
        return ""
    raw = str(value).strip()
    # 剥掉 ```plantuml / ``` 围栏
    raw = re.sub(r"^```\w*\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw).strip()
    # 确保边界闭合
    if "@startuml" not in raw:
        raw = "@startuml\n" + raw
    if "@enduml" not in raw:
        raw = raw + "\n@enduml"
    return raw


def process_kpi(k):
    if not isinstance(k, dict):
        return {"id": "", "name": str(k), "baseline": "", "target": "",
                "metric": "", "linkedCapabilities": []}
    linked = k.get("linkedCapabilities") or []
    if isinstance(linked, str):
        linked = [linked]
    return {
        "id": ensure_str(k.get("id")),
        "name": ensure_str(k.get("name"), "未命名 KPI"),
        "baseline": ensure_str(k.get("baseline")),
        "target": ensure_str(k.get("target")),
        "metric": ensure_str(k.get("metric")),
        "linkedCapabilities": linked if isinstance(linked, list) else [],
    }


def process_agent(a):
    if not isinstance(a, dict):
        return {"name": str(a), "role": "", "model": "", "tools": [], "memory": ""}
    return {
        "name": ensure_str(a.get("name"), "未命名 Agent"),
        "role": ensure_str(a.get("role")),
        "model": ensure_str(a.get("model")),
        "tools": clean_text_array(a.get("tools", []), "无工具依赖"),
        "memory": ensure_str(a.get("memory")),
    }


def process_failure(f):
    if not isinstance(f, dict):
        return {"trigger": str(f), "action": "", "type": ""}
    return {
        "trigger": ensure_str(f.get("trigger")),
        "action": ensure_str(f.get("action")),
        "type": ensure_str(f.get("type")),
    }


def process_highlight(h):
    if not isinstance(h, dict):
        return {"segment": str(h), "highlight": "#DBEAFE", "kpiReason": ""}
    return {
        "segment": ensure_str(h.get("segment"), "关键段"),
        "highlight": ensure_str(h.get("highlight"), "#DBEAFE"),
        "kpiReason": ensure_str(h.get("kpiReason")),
    }


def process_capability(c):
    """单个能力防呆清洗，保证模板渲染不崩。"""
    if not isinstance(c, dict):
        return None
    agentic = c.get("agenticDesign") or {}
    if not isinstance(agentic, dict):
        agentic = {}
    trigger = c.get("trigger") or {}
    if not isinstance(trigger, dict):
        trigger = {}
    goal = c.get("goal") or {}
    if not isinstance(goal, dict):
        goal = {}
    journey_ref = c.get("journeyRef") or {}
    if not isinstance(journey_ref, dict):
        journey_ref = {}
    pattern = ensure_str(agentic.get("pattern"), "pipeline")

    return {
        "id": ensure_str(c.get("id")),
        "name": ensure_str(c.get("name"), "未命名能力"),
        "journeyRef": {
            "stages": clean_text_array(journey_ref.get("stages", []), "跨旅程"),
            "actions": clean_text_array(journey_ref.get("actions", []), "贯穿执行"),
        },
        "type": ensure_str(c.get("type"), "reasoning"),
        "trigger": {
            "userAction": ensure_str(trigger.get("userAction")),
            "inputData": ensure_str(trigger.get("inputData")),
            "systemContext": ensure_str(trigger.get("systemContext")),
        },
        "goal": {
            "output": ensure_str(goal.get("output")),
            "kpiImpact": ensure_str(goal.get("kpiImpact")),
            "kpiRef": ensure_str(goal.get("kpiRef")),
        },
        "agenticDesign": {
            "pattern": pattern,
            "agents": [process_agent(a) for a in ensure_list(agentic.get("agents", []), {})],
            "whyPattern": ensure_str(agentic.get("whyPattern")),
            "kpiLink": ensure_str(agentic.get("kpiLink")),
        },
        "puml": extract_puml(c.get("puml")),
        "highlightLegend": [process_highlight(h) for h in ensure_list(c.get("highlightLegend", []), {})],
        "guardrails": clean_text_array(c.get("guardrails", []), "无显式护栏"),
        "failure": [process_failure(f) for f in ensure_list(c.get("failure", []), {})],
    }


def build_kpi_matrix(kpis, capabilities):
    """KPI ↔ 能力 映射矩阵行（capability 维度）。"""
    rows = []
    for cap in capabilities:
        cap_id = cap["id"]
        cells = []
        for kpi in kpis:
            cells.append({
                "kpi_id": kpi["id"],
                "kpi_name": kpi["name"],
                "linked": cap_id in kpi["linkedCapabilities"] or cap_id == kpi.get("kpiRef", ""),
            })
        rows.append({"cap": cap, "cells": cells})
    return rows


def compile_agentic(yaml_path, output_html_path):
    with open(yaml_path, "r", encoding="utf-8") as f:
        raw_content = f.read()

    yaml_str = strip_markdown(raw_content)
    try:
        data = yaml.safe_load(yaml_str)
    except yaml.YAMLError as exc:
        print(f"❌ YAML 解析失败: {exc}")
        sys.exit(1)

    if not data or "capabilities" not in data:
        print("❌ 数据格式不合法：缺少顶级字段 'capabilities'。")
        sys.exit(1)

    # ---- 数据防呆清洗 ----
    title = ensure_str(data.get("title"), "Agentic 工作流设计")
    meta = data.get("meta") or {}
    if not isinstance(meta, dict):
        meta = {}
    meta = {
        "mode": ensure_str(meta.get("mode"), "agentic-workflow"),
        "source": ensure_str(meta.get("source"), "来源未标注"),
        "scenarioName": ensure_str(meta.get("scenarioName")),
        "architecture": ensure_str(meta.get("architecture")),
    }
    kpis = [process_kpi(k) for k in ensure_list(data.get("scenarioKpis", []), {})]
    principles = clean_text_array(data.get("designPrinciples", []), "遵循 AI4PM 全局设计原则")

    caps = [c for c in (process_capability(c) for c in data.get("capabilities", [])) if c is not None]
    # 丢弃无 id 的能力，防 Tab 崩溃
    caps = [c for c in caps if c["id"]]
    if not caps:
        print("❌ 数据格式不合法：capabilities 为空或缺少 id。")
        sys.exit(1)

    # 校验 PUML 完整性
    for cap in caps:
        if not cap["puml"]:
            print(f"⚠️ 能力 {cap['id']} 缺少 puml，该 Tab 将显示源码占位。")

    kpi_matrix = build_kpi_matrix(kpis, caps)

    # ---- 渲染 ----
    script_dir = os.path.dirname(os.path.abspath(__file__))
    templates_dir = os.path.join(os.path.dirname(script_dir), "templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template("agentic_layout.html")

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    html_content = template.render(
        title=title,
        meta=meta,
        kpis=kpis,
        principles=principles,
        capabilities=caps,
        kpi_matrix=kpi_matrix,
        generated_at=now_str,
    )

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ Agentic 工作流编译成功！")
    print(f"📄 输出文件: {output_html_path}")
    print(f"🧩 能力数: {len(caps)}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 build_agentic.py <input.yaml> <output.html>")
        sys.exit(1)
    input_yaml = sys.argv[1]
    output_html = sys.argv[2]
    if not os.path.exists(input_yaml):
        print(f"❌ 未找到输入文件: {input_yaml}")
        sys.exit(1)
    compile_agentic(input_yaml, output_html)
