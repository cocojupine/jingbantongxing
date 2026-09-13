"""Extract the supplied post-trip questionnaire, including its five-star rating."""
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "file/行后问卷.docx"
TARGET = ROOT / "鲸伴同行-demo-发布包/feedback/source.mjs"
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}
with ZipFile(SOURCE) as archive:
    document = ET.fromstring(archive.read("word/document.xml"))

questions = []
section = "venue"
for paragraph in document.findall(".//w:p", NS):
    text = "".join(node.text or "" for node in paragraph.findall(".//w:t", NS)).strip()
    if text == "三、线上平台满意度":
        section = "platform"
    question = re.match(r"^(\d+)\.\s*(.+)", text)
    option = re.match(r"^([A-F])\.\s*(.+)", text)
    if question:
        questions.append({
            "id": f"{section}_{question[1]}",
            "section": "场馆体验" if section == "venue" else "线上平台满意度",
            "text": question[2],
            "options": [],
        })
    elif option:
        questions[-1]["options"].append({"value": option[1], "label": option[2]})
    stars = paragraph.findall('.//a:prstGeom[@prst="star5"]', NS)
    if stars and questions:
        questions[-1]["ratingMax"] = len(stars)

if len(questions) != 14 or sum(len(q["options"]) for q in questions) != 44:
    raise ValueError("The source question structure changed; review before syncing.")
if questions[-1].get("ratingMax") != 5:
    raise ValueError("Expected the source's five-star satisfaction rating.")
TARGET.write_text(
    "// Generated from file/行后问卷.docx by scripts/sync-feedback-source.py.\n"
    + "export const sourceSha256 = " + json.dumps(sha256(SOURCE.read_bytes()).hexdigest()) + ";\n"
    + "export const sourceQuestions = " + json.dumps(questions, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)
print("Synchronized 14 source questions, 44 options and the five-star rating.")
