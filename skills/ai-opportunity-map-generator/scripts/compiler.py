import sys
import os
import yaml
import re
from jinja2 import Template
import datetime

def clean_yaml_block(text):
    text = text.strip()
    # Remove markdown code blocks if present
    match = re.search(r'```(?:yaml)?(.*?)```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text

def compile_map(yaml_path, html_path):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    yaml_str = clean_yaml_block(raw_content)
    try:
        data = yaml.safe_load(yaml_str)
    except yaml.YAMLError as exc:
        print(f"Error parsing YAML: {exc}")
        sys.exit(1)
        
    if not data or 'stages' not in data:
        print("Invalid data format. Missing 'stages'.")
        sys.exit(1)

    # Process data for template
    stages = data.get('stages', [])
    for stage in stages:
        steps = stage.get('steps', [])
        for step in steps:
            # Ensure lists
            step['repetitive_tasks'] = step.get('repetitive_tasks', [])
            step['cognitive_tasks'] = step.get('cognitive_tasks', [])
            step['ai_opportunities'] = step.get('ai_opportunities', [])
            
            # Map types to css classes
            for opp in step['ai_opportunities']:
                opp_type = opp.get('type', 'repetitive')
                opp['class'] = f"theme-{opp_type}"
                opp['badge_class'] = f"badge-{opp_type}"
                opp['type_label'] = {
                    'repetitive': '重复性',
                    'cognitive': '高认知',
                    'longtail': '长尾场景',
                    'innovation': '流程创新'
                }.get(opp_type, 'AI场景')

    title = data.get('title', 'AI 机会场景地图')
    
    # Load Template
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    template_path = os.path.join(base_dir, 'templates', 'map_layout.html')
    
    if not os.path.exists(template_path):
        print(f"Template not found at {template_path}")
        sys.exit(1)
        
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
        
    template = Template(template_content)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    html_result = template.render(
        title=title,
        stages=stages,
        generated_at=now_str,
        raw_yaml=yaml_str
    )
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_result)
        
    print(f"✅ Generated {html_path} successfully.")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python compiler.py <input.yaml> <output.html>")
        sys.exit(1)
    compile_map(sys.argv[1], sys.argv[2])
