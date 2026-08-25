#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import re
import yaml
from jinja2 import Environment, FileSystemLoader

def strip_markdown(text):
    """
    防呆机制：移除 LLM 可能会输出的 ```yaml ... ``` 代码块标记
    """
    text = text.strip()
    if text.startswith("```"):
        # Match ```yaml (or just ```) followed by content
        match = re.search(r"^```\w*\n(.*?)\n```$", text, re.DOTALL)
        if match:
            text = match.group(1).strip()
        else:
            # Fallback if closing ``` is missing
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
    return text

def ensure_list(value):
    """
    防呆机制：确保输入是 List，如果 LLM 直接输出字符串，则包装为 List
    如果为空则给定默认提示。
    """
    if value is None or value == "":
        return ["无数据"]
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        if len(value) == 0:
            return ["无数据"]
        return value
    return [str(value)]

def process_canvas_data(data):
    """
    对提取的 YAML 字典进行强制防呆与类型对齐。
    """
    # 标量
    clean_data = {
        "title": data.get("title", "AI 场景画布"),
        "description": data.get("description", "暂无描述"),
    }
    
    # 数组字段
    list_fields = [
        "userRoles", "userPains", "aiInput", "dataKnowledge",
        "workflow", "modelUsage", "aiOutput", "tools",
        "productType", "userGains"
    ]
    
    for field in list_fields:
        clean_data[field] = ensure_list(data.get(field, []))
        
    return clean_data

def compile_canvas(yaml_path, output_html_path):
    # 1. 读 YAML 文件
    with open(yaml_path, "r", encoding="utf-8") as f:
        raw_content = f.read()

    # 2. 剥离可能的 Markdown 包裹
    clean_yaml_str = strip_markdown(raw_content)

    # 3. 解析 YAML
    try:
        data = yaml.safe_load(clean_yaml_str)
    except Exception as e:
        print(f"❌ YAML 解析失败: {e}")
        print("请检查输入内容是否包含非法的 YAML 格式。")
        sys.exit(1)

    # 4. 数据防呆校验清洗
    canvas_data = process_canvas_data(data)

    # 5. 加载 Jinja2 模板
    script_dir = os.path.dirname(os.path.abspath(__file__))
    templates_dir = os.path.join(os.path.dirname(script_dir), "templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    
    try:
        template = env.get_template("canvas_layout.html")
    except Exception as e:
        print(f"❌ 找不到模板文件 canvas_layout.html，路径: {templates_dir}")
        sys.exit(1)

    # 6. 渲染
    html_content = template.render(
        canvas_data=canvas_data,
        raw_yaml=clean_yaml_str
    )

    # 7. 写回
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"✅ AI Canvas 编译成功！")
    print(f"📄 输出文件: {output_html_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python build_canvas.py <input.yaml> <output.html>")
        sys.exit(1)
        
    input_yaml = sys.argv[1]
    output_html = sys.argv[2]
    
    if not os.path.exists(input_yaml):
        print(f"❌ 未找到输入文件: {input_yaml}")
        sys.exit(1)
        
    compile_canvas(input_yaml, output_html)
