#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ux-optimizer · WCAG 对比度检查工具
========================================
校验前景/背景色（hex）的对比度是否达标。
用法:
    python3 contrast_check.py "#10213E" "#FFFFFF"          # 单对
    python3 contrast_check.py --file <colors.yaml>          # 批量（yaml: pairs: [ {fg,bg,name} ]）
"""
import sys
import argparse

def srgb_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_color):
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r = srgb_linear(int(h[0:2], 16))
    g = srgb_linear(int(h[2:4], 16))
    b = srgb_linear(int(h[4:6], 16))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def verdict(ratio, text_type="body"):
    thresh = 4.5 if text_type == "body" else 3.0
    return "PASS" if ratio >= thresh else "FAIL"

def main():
    ap = argparse.ArgumentParser(description="WCAG 对比度检查")
    ap.add_argument("fg", nargs="?", help="前景色 hex")
    ap.add_argument("bg", nargs="?", help="背景色 hex")
    ap.add_argument("--text", default="body", help="body|large (大号≥3:1)")
    ap.add_argument("--file", help="yaml 批量: pairs:[{fg,bg,name}]")
    args = ap.parse_args()

    if args.file:
        import yaml
        data = yaml.safe_load(open(args.file, encoding="utf-8"))
        print(f"{'对':<30}{'对比度':<10}{'结论':<8}")
        print("-" * 50)
        all_pass = True
        for p in data.get("pairs", []):
            r = contrast(p["fg"], p["bg"])
            v = verdict(r, args.text)
            if v == "FAIL":
                all_pass = False
            print(f"{p.get('name', f'{p['fg']}->{p['bg']}'):<30}{r:<10.2f}{v}")
        print("-" * 50)
        print("全部通过" if all_pass else "存在不达标项！")
        return 0 if all_pass else 1

    if not args.fg or not args.bg:
        print("用法: python3 contrast_check.py <fg> <bg> [--text body|large] 或 --file <yaml>")
        return 1
    fg, bg = args.fg, args.bg
    r = contrast(fg, bg)
    v = verdict(r, args.text)
    print(f"前景 {fg} / 背景 {bg}")
    print(f"对比度 = {r:.2f}:1  (阈值 {args.text}: {'4.5' if args.text=='body' else '3.0'})")
    print(f"结论 = {v}")
    return 0 if v == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())
