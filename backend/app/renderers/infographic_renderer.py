import os
from typing import Any, Dict

class InfographicRenderer:
    def render_infographic(self, data: Dict[str, Any], output_path: str) -> Dict[str, Any]:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Generate SVG representation
        metrics = data.get("metrics", [])
        timeline = data.get("timeline", [])
        threat_flow = data.get("threat_flow", [])
        
        title_text = f"{data.get('core_topic', 'EXECUTIVE INTELLIGENCE').upper()[:40]} INFOGRAPHIC"
        scope_point = data.get('indicators', [data.get('core_topic', 'Operational Telemetry')])[0] if data.get('indicators') else 'Operational Baseline'
        
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0f172a" rx="12"/>
  <text x="40" y="50" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="bold">{title_text}</text>
  <line x1="40" y1="70" x2="760" y2="70" stroke="#38bdf8" stroke-width="2"/>
  
  <g transform="translate(40, 100)">
    <rect width="220" height="120" fill="#1e293b" rx="8" stroke="#334155"/>
    <text x="20" y="40" fill="#94a3b8" font-size="14">Priority Level</text>
    <text x="20" y="80" fill="#ef4444" font-size="28" font-weight="bold">{data.get('severity', 'HIGH')}</text>
  </g>
  
  <g transform="translate(290, 100)">
    <rect width="220" height="120" fill="#1e293b" rx="8" stroke="#334155"/>
    <text x="20" y="40" fill="#94a3b8" font-size="14">Affected Areas / Scope</text>
    <text x="20" y="80" fill="#38bdf8" font-size="28" font-weight="bold">{len(data.get('affected_systems', []))}</text>
  </g>

  <g transform="translate(540, 100)">
    <rect width="220" height="120" fill="#1e293b" rx="8" stroke="#334155"/>
    <text x="20" y="40" fill="#94a3b8" font-size="14">Indicators &amp; Codes</text>
    <text x="20" y="80" fill="#f59e0b" font-size="28" font-weight="bold">{len(data.get('indicators', []))}</text>
  </g>

  <text x="40" y="270" fill="#f8fafc" font-size="18" font-weight="bold">Operational Assessment &amp; Scope</text>
  <rect x="40" y="290" width="720" height="240" fill="#1e293b" rx="8" stroke="#334155"/>
  <text x="60" y="330" fill="#cbd5e1" font-size="14">• Core Focus: {data.get('core_topic', 'Executive Analysis')}</text>
  <text x="60" y="370" fill="#cbd5e1" font-size="14">• Primary Anchor: {scope_point}</text>
  <text x="60" y="410" fill="#cbd5e1" font-size="14">• Assessment: {data.get('impact_summary', 'Structured analysis completed')[:75]}</text>
  <text x="60" y="450" fill="#cbd5e1" font-size="14">• Operational Status: Active Response Underway</text>
</svg>"""

        svg_file = output_path.replace(".json", ".svg")
        with open(svg_file, "w", encoding="utf-8") as f:
            f.write(svg_content)

        return {
            "json_data": data,
            "svg_path": svg_file
        }

infographic_renderer = InfographicRenderer()
