"""Word sample CVs for the upload tests. Called by build.cjs. Every person and employer is made up."""
import sys, zipfile
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_TAB_ALIGNMENT

out = sys.argv[1]

# --- A US resume laid out in a table: dates in the left cell, the role in the right. All-caps headings.
d = Document()
p = d.add_paragraph(); r = p.add_run("PRIYA NAIR"); r.bold = True; r.font.size = Pt(20)
d.add_paragraph("San Francisco, CA • (415) 555-0132 • priya.nair@example.com • linkedin.com/in/priyanair")
def caps(text):
    p = d.add_paragraph(); r = p.add_run(text); r.bold = True; r.font.size = Pt(12)
caps("SUMMARY")
d.add_paragraph("Product designer with seven years of experience in consumer finance apps. Led the redesign of a checkout used by 2 million people a month.")
caps("PROFESSIONAL EXPERIENCE")
t = d.add_table(rows=0, cols=2)
def role(dates, title, employer, place, bullets):
    cells = t.add_row().cells
    cells[0].text = dates
    cells[1].text = ""
    p = cells[1].paragraphs[0]; r = p.add_run(title); r.bold = True
    cells[1].add_paragraph(f"{employer}, {place}")
    for b in bullets:
        cells[1].add_paragraph(b, style="List Bullet")
role("05/2021 – Present", "Senior Product Designer", "Lumen Pay Inc.", "San Francisco, CA", ["Led the checkout redesign, raising completed payments from 71% to 79%", "Run weekly research sessions with eight customers", "Mentor three junior designers"])
role("08/2018 – 04/2021", "Product Designer", "Cardinal Bank", "Oakland, CA", ["Designed the first mobile onboarding flow, used by 300,000 new customers", "Built the design system with two engineers"])
role("06/2017 – 07/2018", "Design Intern", "Northbay Studio LLC", "Remote", ["Produced wireframes for five client projects"])
caps("EDUCATION")
t2 = d.add_table(rows=0, cols=2)
c = t2.add_row().cells; c[0].text = "2013 – 2017"; c[1].text = "B.A. in Cognitive Science, University of California, Berkeley — GPA: 3.8/4.0"
caps("SKILLS")
d.add_paragraph("Design: Figma, prototyping, user research, design systems")
d.add_paragraph("Technical: HTML, CSS, basic SQL")
caps("AWARDS")
d.add_paragraph("Webby Honoree, Financial Services category (2022)")
d.save(f"{out}/priya-nair.table.docx")

# --- A graduate CV: name and contact in the page header, Word heading styles, list styles, education first.
d = Document()
h = d.sections[0].header
h.paragraphs[0].text = "Tom Reilly"
h.add_paragraph("14 Canal Street, Nottingham NG1 7EH | tom.reilly@example.com | 07700 900377")
d.add_heading("Personal Statement", level=1)
d.add_paragraph("Final-year economics student looking for a graduate analyst role. I enjoy working with data and explaining what it means to people who are not specialists.")
d.add_heading("Education", level=1)
p = d.add_paragraph(); p.add_run("University of Nottingham").bold = True; p.add_run("\tSeptember 2022 – Expected June 2025")
p.paragraph_format.tab_stops.add_tab_stop(Pt(450), WD_TAB_ALIGNMENT.RIGHT)
d.add_paragraph("BSc Economics (predicted 2:1)")
d.add_paragraph("Dissertation on regional house prices, using ONS data for 2010 to 2023", style="List Bullet")
d.add_paragraph("Modules include Econometrics, Public Finance and Behavioural Economics", style="List Bullet")
p = d.add_paragraph(); p.add_run("Bilborough Sixth Form College").bold = True; p.add_run("\t2020 – 2022")
d.add_paragraph("A-Levels: Maths (A), Economics (A), Geography (B)")
d.add_heading("Work Experience", level=1)
p = d.add_paragraph(); p.add_run("Sales Assistant, Hartley’s Books").bold = True; p.add_run("\tJune 2023 – Present")
d.add_paragraph("I work weekends on the shop floor and the till. I trained four new starters on the stock system and I run the Saturday children’s story hour, which now brings in about 30 families a week.")
p = d.add_paragraph(); p.add_run("Summer Intern, Trent Valley Council").bold = True; p.add_run("\tSummer 2024")
d.add_paragraph("Analysed bus passenger numbers for the transport team", style="List Bullet")
d.add_paragraph("Presented findings to the head of service", style="List Bullet")
d.add_heading("Positions of Responsibility", level=1)
p = d.add_paragraph(); p.add_run("Treasurer, Economics Society").bold = True; p.add_run("\t2023 – 2024")
d.add_paragraph("Managed a budget of £4,000 and 12 events", style="List Bullet")
d.add_heading("Skills", level=1)
d.add_paragraph("Excel, Stata, R, PowerPoint, public speaking")
d.add_heading("Interests", level=1)
d.add_paragraph("Five-a-side football, chess, baking")
d.add_paragraph("Date of birth: 3 May 2004")
d.add_heading("References", level=1)
d.add_paragraph("References available on request")
d.save(f"{out}/tom-reilly.graduate.docx")

# --- The XML Word itself writes, with its habits: one word split across runs, a content control, a text box
# stored twice, a hyperlink whose text is not its address, tracked changes, a symbol bullet, a line break.
W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:v="urn:schemas-microsoft-com:vml"'
def run(text, bold=False, size=None):
    props = ("<w:b/>" if bold else "") + (f'<w:sz w:val="{size}"/>' if size else "")
    return f'<w:r><w:rPr>{props}</w:rPr><w:t xml:space="preserve">{text}</w:t></w:r>'
def para(inner, style=None, num=False):
    ppr = (f'<w:pStyle w:val="{style}"/>' if style else "") + ('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' if num else "")
    return f"<w:p><w:pPr>{ppr}</w:pPr>{inner}</w:p>"
box = '<w:txbxContent>' + para(run("sofia.marino@example.com")) + para(run("Glasgow")) + '</w:txbxContent>'
body = "".join([
    para(run("So", True, 44) + '<w:proofErr w:type="spellStart"/>' + run("fia Mar", True, 44) + run("ino", True, 44)
         + f'<w:r><mc:AlternateContent><mc:Choice Requires="wps"><w:drawing><wps:txbx>{box}</wps:txbx></w:drawing></mc:Choice><mc:Fallback><w:pict><v:textbox>{box}</v:textbox></w:pict></mc:Fallback></mc:AlternateContent></w:r>'),
    para('<w:hyperlink r:id="rId5">' + run("LinkedIn profile") + '</w:hyperlink>'),
    para(run("Experience"), style="Heading1"),
    para(run("Operations Co", True) + run("ordinator", True) + '<w:r><w:tab/></w:r>' + run("Sept 2019 ") + run("– ") + run("to date")),
    '<w:sdt><w:sdtPr/><w:sdtContent>' + para(run("Clyde Freight Services Ltd") + '<w:r><w:br/></w:r>' + run("Glasgow")) + '</w:sdtContent></w:sdt>',
    para(run("Schedule 40 drivers a day across three depots"), num=True),
    para(run("Cut late deliveries ") + '<w:del w:id="1" w:author="x"><w:r><w:delText>by half</w:delText></w:r></w:del><w:ins w:id="2" w:author="x">' + run("from 12% to 5% in a year") + '</w:ins>', num=True),
    para('<w:r><w:sym w:font="Symbol" w:char="F0B7"/></w:r>' + run(" Trained six new coordinators &amp; wrote the depot handbook")),
    para(run("Education"), style="Heading1"),
    para(run("HND Business, City of Glasgow College, 2017")),
    para(run("Key Skills"), style="Heading1"),
    para(run("Route planning; rota management; Microsoft Excel")),
])
document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {W}><w:body>{body}<w:sectPr/></w:body></w:document>'
styles = f'<?xml version="1.0" encoding="UTF-8"?><w:styles {W}><w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style></w:styles>'
rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://www.linkedin.com/in/sofia-marino-ops/" TargetMode="External"/></Relationships>'
types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
top = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
with zipfile.ZipFile(f"{out}/sofia-marino.word-quirks.docx", "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", types); z.writestr("_rels/.rels", top)
    z.writestr("word/document.xml", document); z.writestr("word/styles.xml", styles); z.writestr("word/_rels/document.xml.rels", rels)
