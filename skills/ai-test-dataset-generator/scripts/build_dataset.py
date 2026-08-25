import sys
import yaml
import os
from jinja2 import Environment, FileSystemLoader

def build_dataset(input_yaml, output_html):
    """
    Compiles a structured YAML dataset into a premium HTML report.
    """
    if not os.path.exists(input_yaml):
        print(f"Error: Input file '{input_yaml}' not found.")
        return

    # Load YAML data
    try:
        with open(input_yaml, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            if not data or not isinstance(data, dict):
                raise ValueError("YAML is empty or invalid format.")
    except Exception as e:
        print(f"Error loading YAML: {e}")
        return

    # Setup Jinja2 environment
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(os.path.dirname(script_dir), 'templates')
    
    if not os.path.exists(template_dir):
        print(f"Error: Template directory not found at {template_dir}")
        return

    env = Environment(loader=FileSystemLoader(template_dir))
    
    try:
        template = env.get_template('dataset_layout.html')
    except Exception as e:
        print(f"Error loading template 'dataset_layout.html': {e}")
        return

    # Read raw yaml for embedding
    with open(input_yaml, "r", encoding="utf-8") as f:
        raw_yaml_content = f.read()

    # Render template
    try:
        html_content = template.render(data=data, raw_yaml=raw_yaml_content)
    except Exception as e:
        print(f"Error rendering template: {e}")
        return

    # Ensure output directory exists
    output_dir = os.path.dirname(os.path.abspath(output_html))
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Save to file
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"🚀 Success! Dataset report generated: {output_html}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("\nUsage: python3 build_dataset.py <input.yaml> <output.html>")
        print("Example: python3 scripts/build_dataset.py examples/example.yaml report.html\n")
    else:
        build_dataset(sys.argv[1], sys.argv[2])
