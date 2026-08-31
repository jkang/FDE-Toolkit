import yaml
import os
import argparse
from jinja2 import Environment, FileSystemLoader

def calculate_scores(uc):
    usage_freq = uc.get('usageFrequency') or uc.get('usage_frequency') or 3
    benefit_product = uc.get('userCount', 3) * usage_freq * uc.get('businessValue', 3)
    
    cost_sum = (uc.get('dataComplexity', 3) + uc.get('aiDesignComplexity', 3) + 
                uc.get('integrationComplexity', 3) + uc.get('knowledgeComplexity', 3))
    
    priority_score = round(benefit_product / cost_sum, 2) if cost_sum != 0 else 0
    
    # Averages for grid positioning (5x5)
    benefit_avg = (uc.get('userCount', 3) + usage_freq + uc.get('businessValue', 3)) / 3
    cost_avg = cost_sum / 4
    
    return priority_score, benefit_avg, cost_avg

def get_badge_color(id_str):
    colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', 
        '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', 
        '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
    ]
    try:
        import re
        n = int(re.sub(r'\D', '', str(id_str)))
    except:
        n = 0
    return colors[n % len(colors)]

def get_cell_color(row, col):
    if row >= 4 and col <= 2: return '#f0fdf4' # Quick Win
    if row >= 4 and col >= 4: return '#fffbeb' # Big Bet
    if row <= 2 and col <= 2: return '#f8fafc' # Fill-in
    if row <= 2 and col >= 4: return '#fef2f2' # Avoid
    if row == 3 or col == 3: return '#fffcf0'
    return '#f9fafb'

def compile_matrix(yaml_path, output_path=None):
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Process use cases
    use_cases = data.get('useCases', [])
    for uc in use_cases:
        p_score, b_avg, c_avg = calculate_scores(uc)
        uc['benefitAvg'] = round(b_avg, 2)
        uc['costAvg'] = round(c_avg, 2)
        uc['priorityScore'] = p_score
        uc['gridRow'] = min(5, max(1, round(b_avg)))
        uc['gridCol'] = min(5, max(1, round(c_avg)))
        uc['badgeColor'] = get_badge_color(uc.get('id', '0'))

    # Sort by priority score for Top 10
    use_cases.sort(key=lambda x: x['priorityScore'], reverse=True)
    top_10 = use_cases[:10]

    # Group by scenario type for roadmap
    roadmap = []
    type_groups = {}
    for uc in use_cases:
        uc_type = uc.get('type') or uc.get('category') or '核心场景'
        if uc_type not in type_groups:
            type_groups[uc_type] = []
        type_groups[uc_type].append(uc)
    for uc_type, items in type_groups.items():
        roadmap.append({
            'type': uc_type,
            'count': len(items),
            'avgScore': round(sum(x['priorityScore'] for x in items) / len(items), 2)
        })
    roadmap.sort(key=lambda x: x['avgScore'], reverse=True)

    # Generate insights based on matrix distribution
    quick_wins = [uc for uc in use_cases if uc['gridRow'] >= 4 and uc['gridCol'] <= 2]
    big_bets = [uc for uc in use_cases if uc['gridRow'] >= 4 and uc['gridCol'] >= 4]
    insights = []
    if quick_wins:
        insights.append(f"Quick Wins（高收益/低成本）共 {len(quick_wins)} 个场景（如「{quick_wins[0].get('name', '')}」），建议立即启动并作为 MVP 进行验证。")
    else:
        insights.append("Quick Wins（高收益/低成本）区域暂无场景，建议从「收益优先」角度补充评估候选场景。")
    if big_bets:
        insights.append(f"Big Bets（高收益/高成本）区域有 {len(big_bets)} 个场景，虽然投入较大但具备长期战略价值，需分阶段进行技术储备。")
    else:
        insights.append("Big Bets（高收益/高成本）区域暂无场景，战略级投入需另行论证。")
    if roadmap:
        insights.append(f"当前业务主要集中在 <strong>{roadmap[0]['type']}</strong> 领域，平均优先级 {roadmap[0]['avgScore']}，表现出较高的 ROI。")

    # Prepare matrix grid data
    matrix_data = {} # (row, col) -> [items]
    for uc in use_cases:
        key = (uc['gridRow'], uc['gridCol'])
        if key not in matrix_data:
            matrix_data[key] = []
        matrix_data[key].append(uc)

    # Setup Jinja2
    template_dir = os.path.join(os.path.dirname(__file__), '../templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('matrix_layout.html')

    # Render
    with open(yaml_path, 'r', encoding='utf-8') as f:
        raw_yaml = f.read()

    html_content = template.render(
        title=data.get('title', 'AI Scenario Priority Matrix'),
        use_cases=use_cases,
        top_10=top_10,
        matrix_data=matrix_data,
        roadmap=roadmap,
        insights=insights,
        get_cell_color=get_cell_color,
        raw_yaml=raw_yaml
    )

    if not output_path:
        output_path = yaml_path.replace('.yaml', '.html').replace('.yml', '.html')

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Successfully compiled matrix to: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Compile AI Matrix YAML to HTML')
    parser.add_argument('input', help='Path to input YAML file')
    parser.add_argument('output', nargs='?', default=None,
                        help='Path to output HTML file (default: <input>.html)')
    args = parser.parse_args()
    compile_matrix(args.input, args.output)
