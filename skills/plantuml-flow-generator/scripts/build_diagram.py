import sys
import os

from jinja2 import Environment, FileSystemLoader

def normalize_puml(puml_code: str) -> str:
    normalized = puml_code.replace('\r\n', '\n').replace('\r', '\n').strip()

    # Guard against samples pasted as a single line with escaped newlines.
    if '\\n' in normalized:
        normalized = normalized.replace('\\n', '\n')

    return normalized

def generate_html(puml_code, output_path):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(script_dir, '..', 'templates')
    
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('preview_layout.html')
    normalized_puml = normalize_puml(puml_code)
    
    html_content = template.render(
        PUML_CODE=normalized_puml,
        raw_puml=normalized_puml
    )
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 build_diagram.py input.puml output.html")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        puml = f.read()
    
    generate_html(puml, output_file)
    print(f"Successfully generated {output_file}")
