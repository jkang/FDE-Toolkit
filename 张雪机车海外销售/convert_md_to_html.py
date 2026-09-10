#!/usr/bin/env python3
"""Simple Markdown to HTML converter for Zhangxue report."""

import re

def md_to_html(md_text):
    html = md_text
    
    # Escape HTML entities
    html = html.replace('&', '&amp;')
    html = html.replace('<', '&lt;')
    html = html.replace('>', '&gt;')
    
    # Headers
    html = re.sub(r'^###### (.+)$', r'<h6>\1</h6>', html, flags=re.MULTILINE)
    html = re.sub(r'^##### (.+)$', r'<h5>\1</h5>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    
    # Italic
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Code inline
    html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)
    
    # Horizontal rule
    html = re.sub(r'^---+$', '<hr>', html, flags=re.MULTILINE)
    
    # Tables
    lines = html.split('\n')
    result = []
    in_table = False
    table_rows = []
    
    for line in lines:
        if '|' in line and not line.startswith('#') and not line.startswith('<h'):
            cells = [cell.strip() for cell in line.split('|')]
            cells = [c for c in cells if c]  # Remove empty
            if cells and not all(set(c) <= set('-:| ') for c in cells):
                if not in_table:
                    in_table = True
                    table_rows = []
                table_rows.append(cells)
            else:
                # Separator line, skip
                continue
        else:
            if in_table:
                # Output table
                if table_rows:
                    result.append('<table>')
                    result.append('<thead><tr>')
                    for cell in table_rows[0]:
                        result.append(f'<th>{cell}</th>')
                    result.append('</tr></thead>')
                    if len(table_rows) > 1:
                        result.append('<tbody>')
                        for row in table_rows[1:]:
                            result.append('<tr>')
                            for cell in row:
                                result.append(f'<td>{cell}</td>')
                            result.append('</tr>')
                        result.append('</tbody>')
                    result.append('</table>')
                in_table = False
                table_rows = []
            result.append(line)
    
    # Handle table at end
    if in_table and table_rows:
        result.append('<table>')
        result.append('<thead><tr>')
        for cell in table_rows[0]:
            result.append(f'<th>{cell}</th>')
        result.append('</tr></thead>')
        if len(table_rows) > 1:
            result.append('<tbody>')
            for row in table_rows[1:]:
                result.append('<tr>')
                for cell in row:
                    result.append(f'<td>{cell}</td>')
                result.append('</tr>')
            result.append('</tbody>')
        result.append('</table>')
    
    html = '\n'.join(result)
    
    # Lists
    lines = html.split('\n')
    result = []
    in_ul = False
    in_ol = False
    
    for line in lines:
        ul_match = re.match(r'^\s*[-\*] (.+)$', line)
        ol_match = re.match(r'^\s*(\d+)\. (.+)$', line)
        
        if ul_match:
            if not in_ul:
                in_ul = True
                result.append('<ul>')
            result.append(f'<li>{ul_match.group(1)}</li>')
        elif ol_match:
            if not in_ol:
                in_ol = True
                result.append('<ol>')
            result.append(f'<li>{ol_match.group(2)}</li>')
        else:
            if in_ul:
                in_ul = False
                result.append('</ul>')
            if in_ol:
                in_ol = False
                result.append('</ol>')
            result.append(line)
    
    if in_ul:
        result.append('</ul>')
    if in_ol:
        result.append('</ol>')
    
    html = '\n'.join(result)
    
    # Blockquotes
    html = re.sub(r'^\> (.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
    
    # Paragraphs (wrap non-tag lines)
    lines = html.split('\n')
    result = []
    para_buffer = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if para_buffer:
                result.append('<p>' + ' '.join(para_buffer) + '</p>')
                para_buffer = []
            result.append('')
        elif stripped.startswith('<') and not stripped.startswith('<code>'):
            if para_buffer:
                result.append('<p>' + ' '.join(para_buffer) + '</p>')
                para_buffer = []
            result.append(line)
        else:
            para_buffer.append(stripped)
    
    if para_buffer:
        result.append('<p>' + ' '.join(para_buffer) + '</p>')
    
    html = '\n'.join(result)
    
    return html

# Read markdown file
with open('/Users/superkkk/MyCoding/AIDiscoveryAgent/张雪机车_海外销售战略与北极星指标分析报告.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert
html_body = md_to_html(md_content)

# Wrap in full HTML with dark theme
html_template = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>张雪机车海外销售战略与北极星指标分析报告</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            color: #e2e8f0;
            line-height: 1.8;
            padding: 40px 20px;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255,255,255,0.03);
            border-radius: 16px;
            padding: 48px;
            border: 1px solid rgba(255,255,255,0.1);
        }}
        h1 {{
            font-size: 32px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        h2 {{
            font-size: 24px;
            font-weight: 700;
            color: #60a5fa;
            margin-top: 40px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(96, 165, 250, 0.3);
        }}
        h3 {{
            font-size: 20px;
            font-weight: 600;
            color: #34d399;
            margin-top: 28px;
            margin-bottom: 12px;
        }}
        h4 {{
            font-size: 17px;
            font-weight: 600;
            color: #a78bfa;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        p {{
            margin-bottom: 16px;
            color: #cbd5e1;
        }}
        strong {{
            color: #fbbf24;
            font-weight: 600;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            overflow: hidden;
        }}
        th {{
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }}
        td {{
            padding: 10px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 14px;
        }}
        tr:hover td {{
            background: rgba(255,255,255,0.03);
        }}
        ul, ol {{
            margin: 16px 0;
            padding-left: 24px;
        }}
        li {{
            margin-bottom: 8px;
            color: #cbd5e1;
        }}
        ul li::marker {{
            color: #3b82f6;
        }}
        blockquote {{
            border-left: 4px solid #3b82f6;
            padding-left: 16px;
            margin: 20px 0;
            color: #94a3b8;
            font-style: italic;
        }}
        hr {{
            border: none;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin: 32px 0;
        }}
        code {{
            background: rgba(255,255,255,0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 13px;
            color: #f472b6;
        }}
        .highlight {{
            background: rgba(245, 158, 11, 0.15);
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }}
        .highlight strong {{
            color: #fbbf24;
        }}
        @media (max-width: 768px) {{
            .container {{ padding: 24px; }}
            h1 {{ font-size: 24px; }}
            h2 {{ font-size: 20px; }}
            table {{ font-size: 12px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        {html_body}
    </div>
</body>
</html>'''

# Write HTML file
output_path = '/Users/superkkk/MyCoding/AIDiscoveryAgent/张雪机车_海外销售战略与北极星指标分析报告.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_template)

print(f"Converted to HTML: {output_path}")
