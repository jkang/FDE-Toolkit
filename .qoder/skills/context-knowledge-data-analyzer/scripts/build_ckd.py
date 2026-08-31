import sys
import yaml
import os
from jinja2 import Environment, FileSystemLoader

def build_ckd(input_yaml, output_html):
    # Load YAML data
    with open(input_yaml, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Setup Jinja2 environment
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(os.path.dirname(script_dir), 'templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('ckd_layout.html')

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    # Render template
    html_content = template.render(data=data, raw_yaml=raw_yaml_content)

    # Save to file
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Successfully generated CKD Analysis Report: {output_html}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 build_ckd.py <input.yaml> <output.html>")
    else:
        build_ckd(sys.argv[1], sys.argv[2])
