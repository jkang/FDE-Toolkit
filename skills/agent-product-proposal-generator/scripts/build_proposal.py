#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent 产品方案 · 结构校验器
用法:
    python3 build_proposal.py <Agent产品方案.md>
作用:
    按「质量校验 Checklist」检查生成的 Agent 产品方案 Markdown 是否结构齐全、要素完整。
    输出一份 PASS/FAIL 清单报告。校验项仅覆盖结构与字段齐全性，不评判内容质量。
依赖: 仅标准库。
"""
import sys
import re
from pathlib import Path


SECTIONS = [
    "## 1 总览", "## 2 产品定位", "## 3 产品形态架构图", "## 4 原型演示故事线",
    "## 5 业务功能与 UI 组件清单", "## 6 Agent 行为设计",
    "## 7 SKP 5 类规则消费门禁", "## 8 待确认问题清单",
]

FOUR_COMPONENTS = ["产品定位一句话", "非目标", "主要使用者", "Agent 人格"]
BEHAVIOR_SUB = ["### 6.1", "### 6.2", "### 6.3", "### 6.4"]
RULE_TYPES = ["决策模型类", "模版范例类", "术语字典类", "关键信息提取要点", "关联关系类"]
REQ_INTERACTIONS = [
    "#1 流式输出", "#2 工具调用可视化", "#3 思考过程可折叠", "#4 内联组件", "#5 HITL 拦截",
    "#6 撤销回滚", "#7 出处引用", "#8 状态徽章", "#9 错误态", "#10 空态",
]


def check(cond: bool, label: str, detail: str = "") -> tuple:
    return (cond, label, detail)


def main(path_str: str) -> int:
    p = Path(path_str)
    if not p.exists():
        print(f"[FAIL] 找不到文件: {p}")
        return 1
    text = p.read_text(encoding="utf-8")
    lines = text.splitlines()
    blob = text
    results = []

    # 1. 八大段
    for sec in SECTIONS:
        found = any(sec in l for l in lines)
        results.append(check(found, f"段存在", f"{sec}"))
        if not found:
            # 允许 "## 1 总览" 等由表格标题占位，但一般应是标题行
            pass

    # 2. 四件套
    for fc in FOUR_COMPONENTS:
        results.append(check(fc in blob, "四件套字段", fc))

    # 3. mermaid 块
    results.append(check("```mermaid" in blob, "架构图", "含 ```mermaid 代码块"))
    results.append(check(("入口" in blob and "主交互" in blob and "周边支撑" in blob and "相邻产品" in blob),
                         "架构图三区+相邻产品", "入口区/主交互区/周边支撑区/相邻产品"))

    # 4. 故事线（≥4 条，每条约 5 要素表）
    story_heads = [l for l in lines if re.match(r"^### 故事线 \d+", l)]
    results.append(check(len(story_heads) >= 4, "故事线条数", f"共 {len(story_heads)} 条（应 ≥4）"))
    for col in ["业务价值高光", "对应阶段", "演示剧本", "UI 组件", "业务内容来源"]:
        results.append(check(col in blob, "故事线要素", col))

    # 5. 功能表 + 必备交互 10 项
    for col in ["功能名", "一句话价值", "绑定角色", "渲染层", "触发方式", "UI 组件", "上游来源"]:
        results.append(check(col in blob, "功能表列", col))
    for req in REQ_INTERACTIONS:
        results.append(check(req in blob, "必备交互", req))

    # 6. Agent 行为 6.1~6.4
    for sub in BEHAVIOR_SUB:
        results.append(check(sub in blob, "Agent 行为小节", sub))

    # 7. 五类规则门禁
    for rt in RULE_TYPES:
        results.append(check(rt in blob, "五类规则门禁", rt))

    # 8. 待确认问题（表 + ≥2）
    q_rows = [l for l in lines if re.match(r"^\|\s*\d+\s*\|", l)]
    results.append(check(len(q_rows) >= 2, "待确认问题数", f"表格行 {len(q_rows)} 行（应 ≥2，含明细）"))
    results.append(check("## 8 待确认问题清单" in blob, "第8章", "待确认问题清单"))

    # 汇总
    total = len(results)
    passed = sum(1 for c, *_ in results if c)
    print(f"{'='*60}")
    print(f"校验报告: {p.name}  |  通过 {passed}/{total}")
    print(f"{'='*60}")
    for ok, label, detail in results:
        prefix = "PASS" if ok else "FAIL"
        print(f"[{prefix}] {label:<14} {detail}")

    print(f"\n{'结论: 通过' if passed == total else '结论: 有未通过项，请补齐后再交付'}")
    return 0 if passed == total else 2


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    sys.exit(main(sys.argv[1]))
