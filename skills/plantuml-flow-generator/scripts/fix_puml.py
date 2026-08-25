import re
import sys
import os

# Standard premium style pack
PREMIUM_STYLES = """
' Premium Design Defaults
skinparam shadowing false
skinparam roundcorner 8
skinparam dpi 150
skinparam DefaultFontName "Inter", "Segoe UI", sans-serif
skinparam sequenceArrowColor #6366F1
skinparam sequenceLifeLineBorderColor #CBD5E1
skinparam activityShape octagon
skinparam activityBorderColor #6366F1
skinparam activityBarColor #6366F1
"""

def fix_plantuml_syntax(code: str) -> str:
    if not code:
        return code

    # 1. Fix spacing around color codes in control flow
    # Patterns like: alt#Pink[text], loop#Gold[text]
    code = re.sub(r'(alt|loop|else|opt|group)#([A-Za-z0-9]+)(\s*\[)', r'\1 #\2 \3', code)
    code = re.sub(r'(alt|loop|else|opt|group)(\s*)#([A-Za-z0-9]+)(\s*\[)', r'\1 #\3 \4', code)

    # 2. Fix missing spaces in note color definitions
    code = re.sub(r'(note\s+(?:left|right|top|bottom)(?:\s+of\s+\w+)?)(\s*)#([A-Za-z0-9]+):', r'\1 #\3: ', code)

    # 3. Fix newlines in note statements
    lines = code.split('\n')
    processed_lines = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Check if this line starts with a note statement
        if re.match(r'^note\s+(?:left|right|top|bottom|over)(?:\s+of\s+[\w\s,]+)?\s*:', line, re.IGNORECASE):
            note_content = line
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if not next_line:
                    if j + 1 < len(lines):
                        line_after = lines[j+1].strip()
                        if line_after.startswith('@enduml') or \
                           re.match(r'^(actor|participant|note|alt|else|opt|loop|end|@|==)', line_after, re.IGNORECASE) or \
                           re.search(r'(->|-->|->>|-->>)', line_after) or \
                           'activate' in line_after or 'deactivate' in line_after:
                            break
                    j += 1
                    continue
                if next_line.startswith('@enduml'):
                    break
                if re.match(r'^(actor|participant|note|alt|else|opt|loop|end|@|==)', next_line, re.IGNORECASE) or \
                   re.search(r'(->|-->|->>|-->>)', next_line) or \
                   'activate' in next_line or 'deactivate' in next_line:
                    break
                note_content += " " + next_line
                j += 1
            
            # Clean up note content
            note_content = note_content.replace('\\n', ' ')
            note_content = re.sub(r'\s+', ' ', note_content).strip()
            processed_lines.append(note_content)
            i = j
        else:
            processed_lines.append(lines[i])
            i += 1
    
    code = '\n'.join(processed_lines)

    # 4. Fix line breaks in message content
    msg_lines = code.split('\n')
    for idx, line in enumerate(msg_lines):
        trimmed = line.strip()
        if ':' in trimmed and any(x in trimmed for x in ['->', '-->', '->>', '-->>']) and 'note' not in trimmed.lower():
            parts = trimmed.split(':', 1)
            if len(parts) >= 2:
                content = parts[1].strip()
                clean_content = content.replace('\\n', ' ')
                clean_content = re.sub(r'\s+', ' ', clean_content).strip()
                msg_lines[idx] = parts[0] + ": " + clean_content
    
    fixedCode = '\\n'.join(msg_lines)

    # 5. Inject Premium Styles if not present
    if "skinparam" not in fixedCode.lower():
        if "@startuml" in fixedCode:
            fixedCode = fixedCode.replace("@startuml", f"@startuml\n{PREMIUM_STYLES}")
    
    return fixedCode

def extract_puml(content: str) -> str:
    # Remove markdown code blocks if any
    content = re.sub(r'^```(?:puml|plantuml)?\s*([\s\S]*?)```\s*$', r'\1', content, flags=re.MULTILINE)
    
    # Extract between @startuml and @enduml
    match = re.search(r'(@startuml[\s\S]*?@enduml)', content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return content.strip()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 fix_puml.py input.puml output.puml")
        sys.exit(1)
    
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        content = f.read()
    
    puml = extract_puml(content)
    fixed = fix_plantuml_syntax(puml)
    
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        f.write(fixed)
