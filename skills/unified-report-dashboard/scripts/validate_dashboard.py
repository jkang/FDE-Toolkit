#!/usr/bin/env python3
"""
validate_dashboard.py - 校验统一报告仪表盘 YAML 是否符合本 skill 的编排规范。
确保后续生成时「做对」：公司级主线程顺序、AI场景定义归场景小节、不重复、不加阶段前缀、ROI 在 MVP 之后、引用文件存在。

Usage:
    python3 validate_dashboard.py <input.yaml> [--dir <项目根，默认 yaml 所在目录>]

退出码: 0 = 通过（可含 WARN），1 = 有 FAIL。
"""
import argparse, os, re, sys, yaml

def load(path):
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)

def nav_items(navigation):
    """返回 [(section_title, item, index_in_section)]"""
    out = []
    for nav in navigation:
        sec = nav.get("section") or ""
        items = nav.get("items") or nav.get("children") or []
        for i, item in enumerate(items):
            out.append((sec, item, i))
    return out

def norm_title(t):
    return re.sub(r"[\s·（()）\-—_]", "", t or "")

def is_company_section(sec):
    k = norm_title(sec)
    return any(w in k for w in ("场景规划", "战略与全景", "路线图"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--dir", default=None, help="项目根目录，用于校验 file 相对路径是否存在（默认= yaml 所在目录）")
    ap.add_argument("--skip-files", action="store_true", help="跳过 file 存在性校验（适用于含 [占位名] 的模板）")
    args = ap.parse_args()

    try:
        data = load(args.input)
    except yaml.YAMLError as e:
        print("YAML parse error:", e); return 1
    if not isinstance(data, dict):
        print("YAML 顶层应为 dict"); return 1

    base = args.dir or os.path.dirname(os.path.abspath(args.input))
    navigation = data.get("navigation") or []
    flat = nav_items(navigation)

    problems = []   # FAIL
    warns = []      # WARN

    def fail(m): problems.append(m)
    def warn(m): warns.append(m)

    section_titles = [n.get("section") for n in navigation if n.get("section")]
    has_company = any(is_company_section(s) for s in section_titles)
    scenario_sections = [s for s in section_titles if not is_company_section(s) and s]
    if not has_company:
        fail("缺少公司级「场景规划」区块（应含 战略与全景/场景规划/路线图 的导航分组）。")

    # 1) 公司级主线程顺序（价值流 → 现状流程 → 业务问题定义 → AI机会场景地图 → 优先级分析 → 里程碑计划）
    order_keys = ["价值流", "现状流程", "业务问题定义", "AI机会场景地图", "优先级", "里程碑"]
    order_code = {k: i for i, k in enumerate(order_keys)}
    seq = []
    for sec, item, idx in flat:
        if not is_company_section(sec):
            continue
        t = norm_title(item.get("title"))
        for k in order_keys:
            if k in t:
                seq.append((order_code[k], k, item.get("title")))
                break
    # 实际出现顺序必须是按 order_keys 递增
    for i in range(1, len(seq)):
        if seq[i][0] < seq[i - 1][0]:
            order_seq = " → ".join(s[1] for s in seq)
            fail(f"公司级「场景规划」区块顺序不对。应为：价值流 → 现状流程 → 业务问题定义 → AI机会场景地图 → 优先级分析 → 里程碑计划。当前实际：{order_seq}")
            break

    # 2) AI机会场景地图 只能出现一次（公司级），场景小节不得重复
    opp_titles = [t for sec, item, _ in flat if norm_title(item.get("title")) in ("AI机会场景地图", "AI机会场景地图")]
    # 用包含匹配更稳
    opp = [it.get("title") for sec, it, _ in flat if "AI机会场景地图" in norm_title(it.get("title"))]
    opp = [t for t in opp if t]
    if len(opp) > 1:
        fail(f"AI机会场景地图出现多次（{len(opp)} 次），只允许公司级一次：{opp}")
    if has_company and len(opp) < 1:
        warn("未找到公司级「AI机会场景地图」。")

    # 3) 机会点定义 / AI画布 必须落在场景小节（不是公司级区块），且作为该场景小节靠前（第一/第二）项
    scene_sec_titles = scenario_sections
    for sec, item, idx in flat:
        t = norm_title(item.get("title"))
        if is_company_section(sec) and ("机会点定义" in t or "AI画布" in t):
            fail(f"「{item.get('title')}」属 AI 场景定义，应放到具体场景小节（作为该场景第一/第二项），不应在公司级「场景规划」区块。")

    # 遍历每个场景小节：前两项应为 机会点定义/AI画布；
    seen_scene = set()
    for sec, item, idx in flat:
        if is_company_section(sec):
            continue
        seen_scene.add(sec)
        t = norm_title(item.get("title"))
        if idx == 0 and not ("机会点定义" in t and "AI画布" in t) and not ("AI画布" in t):
            # 允许第一项是 机会点定义 或 AI画布
            if "机会点定义" not in t and "AI画布" not in t:
                warn(f"场景小节「{sec}」第一项建议是「机会点定义 / AI画布（AI 场景定义）」，当前是「{item.get('title')}」。")

    # 4) 场景小节内不要加阶段前缀
    prefixes = ("挖知识", "建本体", "生智能", "评测", "理需求")
    for sec, item, idx in flat:
        if is_company_section(sec):
            continue
        t = norm_title(item.get("title"))
        for pf in prefixes:
            if t.startswith(pf):
                fail(f"场景小节「{sec}」项「{item.get('title')}」带了阶段前缀「{pf}」，请去掉（直接写产出名）。")

    # 5) ROI 核算应在 MVP 之后（同一场景小节内，MVP 规格/原型的 index < ROI index）
    for sec in scenario_sections:
        items = []
        for s, item, idx in flat:
            if s == sec:
                items.append((idx, item))
        mvp_idx = [idx for idx, it in items if "MVP" in norm_title(it.get("title"))]
        roi_idx = [idx for idx, it in items if "ROI" in norm_title(it.get("title"))]
        if roi_idx and mvp_idx and min(roi_idx) < max(mvp_idx):
            fail(f"场景小节「{sec}」：ROI 核算应在 MVP 之后（当前 ROI idx={min(roi_idx)} < MVP idx={max(mvp_idx)}）。")

    # 5.5) 封面 Executive Summary 弱提示
    if not data.get("executive_summary"):
        warn("未提供 executive_summary：封面「核心结论」区会隐藏，建议补充观点句，以走 Executive Summary 而非平铺卡片。")

    # 6) 引用文件存在（相对 yaml 目录或 --dir）
    seen = set()
    if not args.skip_files:
        refs = []
        for c in data.get("cards") or []:
            if c.get("file"): refs.append((c.get("id"), c.get("file")))
        for sec, item, idx in flat:
            if item.get("file"): refs.append((item.get("id") or item.get("title"), item.get("file")))
        for rid, f in refs:
            if f in seen: continue
            seen.add(f)
            p = os.path.join(base, f)
            if not os.path.exists(p):
                fail(f"引用文件不存在：{f}  ({rid})")

    # 输出
    print(f"校验：{args.input}")
    print(f"  导航分组：{len(navigation)} | 项：{len(flat)} | 引用文件：{len(seen)}")
    for w in warns: print("  [WARN]", w)
    for p in problems: print("  [FAIL]", p)
    if not problems:
        print(f"  RESULT: PASS{'（含 WARN）' if warns else ''}")
    else:
        print(f"  RESULT: FAIL ({len(problems)} 项)")
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main())
