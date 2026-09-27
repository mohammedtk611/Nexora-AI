import os
from typing import Any, Dict, List

class PPTXRenderer:
    def render_presentation(self, slides_data: List[Dict[str, Any]], output_path: str) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        try:
            from pptx import Presentation
            from pptx.util import Inches, Pt
            from pptx.dml.color import RGBColor

            prs = Presentation()
            
            # Title slide
            title_slide_layout = prs.slide_layouts[0]
            slide = prs.slides.add_slide(title_slide_layout)
            title = slide.shapes.title
            subtitle = slide.placeholders[1]
            title.text = "Cybersecurity Intelligence Briefing"
            subtitle.text = "Revamp AI Intelligence Report"

            # Content slides
            blank_layout = prs.slide_layouts[1]
            for idx, slide_info in enumerate(slides_data, start=1):
                slide = prs.slides.add_slide(blank_layout)
                shapes = slide.shapes
                title_shape = shapes.title
                body_shape = shapes.placeholders[1]

                title_shape.text = slide_info.get("title", f"Slide {idx}")
                tf = body_shape.text_frame
                tf.clear()

                bullets = slide_info.get("bullets", [])
                for b_idx, bullet in enumerate(bullets):
                    if b_idx == 0:
                        p = tf.paragraphs[0]
                    else:
                        p = tf.add_paragraph()
                    p.text = bullet
                    p.font.size = Pt(18)
                    p.font.color.rgb = RGBColor(30, 41, 59)

            prs.save(output_path)
            return output_path
        except Exception as e:
            # Fallback txt file if python-pptx fails
            txt_path = output_path.replace(".pptx", ".txt")
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(f"Presentation Slides (Error rendering PPTX: {e}):\n\n")
                for s in slides_data:
                    f.write(f"Slide: {s.get('title')}\n")
                    for b in s.get("bullets", []):
                        f.write(f"  - {b}\n")
                    f.write("\n")
            return txt_path

pptx_renderer = PPTXRenderer()
