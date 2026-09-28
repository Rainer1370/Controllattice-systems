from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT = Path("public/downloads/control-lattice-machine-failure-evidence-checklist.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

navy = HexColor("#061924")
cyan = HexColor("#19C8D2")
gold = HexColor("#D7B46B")
ink = HexColor("#102A34")
muted = HexColor("#4F6871")
line = HexColor("#CEDDE0")
paper = HexColor("#F5F8F9")

pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuBold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

styles = getSampleStyleSheet()
title = ParagraphStyle("Title", parent=styles["Title"], fontName="DejaVuBold", fontSize=23, leading=26, textColor=navy, alignment=TA_LEFT, spaceAfter=5)
subtitle = ParagraphStyle("Subtitle", parent=styles["BodyText"], fontName="DejaVu", fontSize=9.2, leading=12.5, textColor=muted, spaceAfter=10)
section = ParagraphStyle("Section", parent=styles["Heading2"], fontName="DejaVuBold", fontSize=11.4, leading=13.5, textColor=navy, spaceBefore=5, spaceAfter=4)
item = ParagraphStyle("Item", parent=styles["BodyText"], fontName="DejaVu", fontSize=8.1, leading=10.7, textColor=ink)
small = ParagraphStyle("Small", parent=styles["BodyText"], fontName="DejaVu", fontSize=7.1, leading=9, textColor=muted)

doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=.55*inch, leftMargin=.55*inch, topMargin=.5*inch, bottomMargin=.48*inch, title="Machine Failure Evidence Checklist", author="Control Lattice Systems")

def checkbox(text):
    return Table([["□", Paragraph(text, item)]], colWidths=[.22*inch, 6.95*inch], style=TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"), ("FONT", (0,0), (0,0), "DejaVuBold", 10),
        ("TEXTCOLOR", (0,0), (0,0), cyan), ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 4), ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1.5),
    ]))

groups = [
    ("1. Freeze the moment before reset", [
        "Record the exact local time and timezone. Photograph or screenshot the operator display before acknowledging or clearing anything.",
        "Record operating mode, sequence step, machine state, recipe/configuration, active user, and current product or experiment.",
        "Preserve the first-out trip, initiating interlock, and every active permissive - not only the final alarm cascade.",
    ]),
    ("2. Compare intent with reality", [
        "Capture commanded values and corresponding readbacks for motion, power, valves, pumps, temperatures, pressures, flows, and timing.",
        "Identify values that were stale, invalid, disconnected, saturated, limited, or outside expected tolerance.",
        "Record controller state, PLC/IOC/application health, communications status, and relevant process exit codes.",
    ]),
    ("3. Preserve sequence and timing", [
        "Export event, alarm, historian, IOC/PLC, application, and operating-system logs for an agreed window before and after the event.",
        "Confirm clock synchronization and note timestamp resolution. Alarm-list order alone does not prove causality.",
        "Capture packet, frame, trigger, scan, cycle, retry, timeout, and dropped-sample counters where applicable.",
    ]),
    ("4. Capture physical and organizational context", [
        "Record environmental and utility conditions: temperature, humidity, cooling, vacuum, power, network, vibration, and facility state.",
        "Record recent maintenance, software/configuration changes, substitutions, calibrations, overrides, and unusual operator actions.",
        "Ask what was heard, seen, smelled, felt, or manually changed. Separate observation from interpretation.",
    ]),
    ("5. Package the evidence", [
        "Create one incident ID and collect screenshots, exports, notes, versions, and relevant files under that identifier.",
        "Write the expected sequence, observed sequence, first confirmed divergence, recovery action, and whether the failure repeated.",
        "Preserve the raw evidence. Make transformed data, filtering, exclusions, and assumptions explicit and reproducible.",
    ]),
]

story = []
brand = Table([[Paragraph("<b>CONTROL</b><font color='#19C8D2'><b>LATTICE</b></font><br/><font size='7' color='#8A713E'>SYSTEMS</font>", item), Paragraph("FIELD RESOURCE 01", small)]], colWidths=[5.7*inch, 1.45*inch], style=TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(1,0),(1,0),"RIGHT"),("BOTTOMPADDING",(0,0),(-1,-1),8),("LINEBELOW",(0,0),(-1,-1),1,cyan)]))
story += [brand, Spacer(1, .11*inch), Paragraph("Machine Failure Evidence Checklist", title), Paragraph("Capture useful evidence before resetting, restarting, changing configuration, or allowing the failure state to disappear.", subtitle)]
for heading, items in groups:
    block = [Paragraph(heading, section)] + [checkbox(x) for x in items]
    story.append(KeepTogether(block))
story += [Spacer(1, .06*inch), Table([[Paragraph("<b>Detection is not diagnosis.</b> An alarm tells you where the machine noticed a problem. Diagnosis requires sequence, state, timing, commands, readbacks, interlocks, context, and physics.", item)]], colWidths=[7.15*inch], style=TableStyle([("BACKGROUND",(0,0),(-1,-1),paper),("BOX",(0,0),(-1,-1),1,gold),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)])), Spacer(1,.05*inch), Paragraph("Control Lattice Systems | controllattice.com | The Observable Machine by Rob Rainer", small)]

doc.build(story)
print(OUT)
