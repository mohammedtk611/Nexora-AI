import os
from typing import Any, Dict
from jinja2 import Template

ADVISORY_HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
        .header { border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 25px; }
        .badge { background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
        .badge.medium { background-color: #f59e0b; }
        .badge.low { background-color: #10b981; }
        h1 { margin: 10px 0 5px 0; color: #0f172a; font-size: 24px; }
        .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 10px; margin-bottom: 10px; }
        p, li { font-size: 14px; line-height: 1.6; color: #334155; }
        ul { padding-left: 20px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-top: 10px; }
        .code-block { font-family: monospace; background: #0f172a; color: #f8fafc; padding: 10px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <span class="badge {{ severity | lower }}">{{ severity }} SEVERITY</span>
        <h1>{{ title }}</h1>
        <div class="meta">Target Audience: {{ target_audience }} | Prepared by: Revamp AI Intelligence Agent</div>
    </div>

    <div class="section">
        <div class="section-title">Threat Overview</div>
        <p>{{ threat_overview }}</p>
    </div>

    <div class="section">
        <div class="section-title">Affected Systems</div>
        <ul>
            {% for item in affected_systems %}
            <li>{{ item }}</li>
            {% endfor %}
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Indicators of Compromise (IoCs)</div>
        <div class="code-block">
{% for indicator in indicators %}
{{ indicator }}
{% endfor %}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Recommended Mitigation Steps</div>
        <ol>
            {% for step in mitigation_steps %}
            <li><strong>{{ step }}</strong></li>
            {% endfor %}
        </ol>
    </div>
</body>
</html>
"""

class PDFRenderer:
    def render_advisory_pdf(self, content: Dict[str, Any], output_path: str) -> str:
        template = Template(ADVISORY_HTML_TEMPLATE)
        html_out = template.render(
            title=content.get("title", "Security Advisory"),
            severity=content.get("severity", "HIGH"),
            target_audience=content.get("target_audience", "Technical"),
            threat_overview=content.get("threat_overview", "A severe security vulnerability has been detected."),
            affected_systems=content.get("affected_systems", ["Primary Network Gateway"]),
            indicators=content.get("indicators", ["192.168.1.100", "hash: 44d88612fea8a8f36de82e1278abb02f"]),
            mitigation_steps=content.get("mitigation_steps", ["Patch gateway software", "Isolate compromised IPs"])
        )

        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        try:
            from weasyprint import HTML
            HTML(string=html_out).write_pdf(output_path)
            return output_path
        except Exception:
            # Fallback to reportlab
            try:
                from reportlab.lib.pagesizes import letter
                from reportlab.pdfgen import canvas
                c = canvas.Canvas(output_path, pagesize=letter)
                c.drawString(50, 750, f"SECURITY ADVISORY: {content.get('title', 'Advisory')}")
                c.drawString(50, 730, f"Severity: {content.get('severity', 'HIGH')}")
                c.drawString(50, 700, "Threat Overview:")
                text_obj = c.beginText(50, 680)
                text_obj.textLines(content.get("threat_overview", "Overview content"))
                c.drawText(text_obj)
                c.save()
                return output_path
            except Exception as e:
                # Write HTML file as text fallback if PDF engine unavailable
                html_path = output_path.replace(".pdf", ".html")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(html_out)
                return html_path

pdf_renderer = PDFRenderer()
