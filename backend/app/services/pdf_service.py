from decimal import Decimal
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import LongTable, Paragraph, SimpleDocTemplate, Spacer, TableStyle

from app.services.report_helper import get_report_period


INK = colors.HexColor("#102334")
MUTED = colors.HexColor("#475569")
LINE = colors.HexColor("#DCE5EF")
STRIPE = colors.HexColor("#F3F7FB")
GREEN = "#15803D"
RED = "#B91C1C"
NOTE = "Estimates based on recorded activity. Review with a qualified tax professional before filing."


def money(value):
    return "Unavailable" if value is None else f"{'-' if Decimal(str(value)) < 0 else ''}${abs(Decimal(str(value))):,.2f}"


def label(value):
    return str(value).replace("_", " ").title() if value is not None else "Unavailable"


def build_pdf(buffer, period, subtitle, sections, notes=()):
    document = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=44, rightMargin=44,
                                 topMargin=48, bottomMargin=48, title="Deduckly Report")
    body = ParagraphStyle("Body", fontName="Helvetica", fontSize=10, leading=14, textColor=INK, splitLongWords=True)
    number = ParagraphStyle("Number", parent=body, alignment=TA_RIGHT)
    title = ParagraphStyle("Title", parent=body, fontName="Helvetica-Bold", fontSize=27, leading=32, spaceAfter=6)
    metadata = ParagraphStyle("Metadata", parent=body, textColor=MUTED, spaceAfter=8)
    heading = ParagraphStyle("Heading", parent=body, fontName="Helvetica-Bold", fontSize=15, leading=19,
                             spaceBefore=18, spaceAfter=8, keepWithNext=True)
    head_cell = ParagraphStyle("Table heading", parent=body, fontName="Helvetica-Bold", textColor=colors.white)

    def cell(value, style):
        return Paragraph(escape(str(value)).replace("\n", "<br/>"), style)

    story = [cell("Deduckly Report", title), cell(period, metadata), cell(subtitle, metadata)]
    for name, headers, rows, fractions in sections:
        if not rows:
            continue
        table_rows = [[cell(name, heading), *([""] * (len(headers) - 1))],
                      [cell(h, head_cell) for h in headers]]
        for row in rows:
            parsed = []
            for value in row:
                # Monetary summary values carry a direction as well as a signed label.
                if isinstance(value, tuple):
                    value, tone = value
                    parsed.append(Paragraph(f'<font color="{tone}">{escape(value)}</font>', number) if tone else cell(value, number))
                else:
                    parsed.append(cell(value, body))
            table_rows.append(parsed)
        table = LongTable(table_rows, colWidths=[document.width * part for part in fractions],
                          repeatRows=2, spaceBefore=12)
        table.setStyle(TableStyle([
            ("SPAN", (0, 0), (-1, 0)),
            ("BACKGROUND", (0, 1), (-1, 1), INK),
            ("ROWBACKGROUNDS", (0, 2), (-1, -1), [colors.white, STRIPE]),
            ("LINEBELOW", (0, 2), (-1, -1), 0.4, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(table)
    story.append(cell("Assumptions and limitations", heading))
    for text in [*notes, NOTE]:
        story.append(cell(text, body))
        story.append(Spacer(1, 6))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.line(44, 36, letter[0] - 44, 36)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 9)
        canvas.drawString(44, 23, "Deduckly  /  Recorded activity and estimates")
        canvas.drawRightString(letter[0] - 44, 23, f"Page {doc.page}")
        canvas.restoreState()

    document.build(story, onFirstPage=footer, onLaterPages=footer)


def amount(value, cost=False):
    number = Decimal(str(value)) if value is not None else Decimal(0)
    positive = number < 0 if cost else number > 0
    tone = (GREEN if positive else RED) if number else None
    return money(value), tone


def metrics(title, rows):
    return title, ("Metric", "Value"), [(key, value if isinstance(value, tuple) else (value, None)) for key, value in rows], (0.73, 0.27)


def build_tax_report_pdf(buffer, data):
    expense_rows = [(label(category), money(item["amount"]), item["count"])
                    for category, item in data["deductible_breakdown"].items()]
    sections = [
        metrics("Recorded activity", [
            ("Total Income", amount(data["total_income"])),
            ("Total Expenses", amount(data["total_expenses"], cost=True)),
            ("Business Miles", f"{data['total_miles']:,.2f}"),
            ("Vehicle Expenses", money(data["vehicle_expense_total"])),
        ]),
        metrics("Deductions and tax estimates", [
            ("Mileage Deduction", money(data["mileage_deduction"])),
            ("Deductible Expenses", money(data["deductible_expense_total"])),
            ("Non-Deductible Expenses", money(data["non_deductible_expense_total"])),
            ("Total Deductions", money(data["total_deductions"])),
            ("Income after deductions", amount(data["net_profit"])),
            ("Taxable Income", money(data["taxable_income"])),
            ("Estimated Tax Owed", amount(data["estimated_tax_owed"], cost=True)),
            ("Estimated Tax Savings", amount(data["estimated_tax_savings"])),
        ]),
        metrics("Business information", [
            ("Business Type", label(data["business_type"])),
            ("Filing Status", label(data["filing_status"])),
            ("Largest Expense Category", label(data.get("largest_expense_category"))),
            ("Largest Expense Amount", money(data.get("largest_expense_amount"))),
        ]),
        ("Deductible expense breakdown", ("Category", "Amount", "Entries"),
         expense_rows or [("No deductible expenses", "$0.00", 0)], (0.55, 0.28, 0.17)),
    ]
    build_pdf(buffer, get_report_period(data), f"{data['first_name']} {data['last_name']} | {label(data['tax_method'])}",
              sections, [f"Generated (UTC): {data['generated_at_utc']}"])


def build_vehicle_report_pdf(buffer, data):
    methods = {vehicle["method"] for vehicle in data["vehicle_rows"]}
    method = "Methods vary by vehicle" if len(methods) > 1 else label(next(iter(methods), data["tax_method"]))
    sections = [
        metrics("Recorded activity", [
            ("Recorded income", amount(data["total_income"])),
            ("Recorded expenses", amount(data["total_expenses"], cost=True)),
            ("Business miles", data["total_miles"]),
            ("Personal miles", data["personal_miles"]),
        ]),
        metrics("Deductions and tax estimates", [
            ("Estimated deductions" if data["calculation_complete"] else "Estimated deduction subtotal (incomplete)", money(data["total_deductions"])),
            ("Business parking and tolls", money(data["parking_tolls"])),
            ("Other business deductions", money(data["non_vehicle_deductions"])),
            ("Income after deductions", amount(data.get("net_profit"))),
            ("Estimated income tax", amount(data.get("estimated_tax_owed"), cost=True)),
            ("Estimated reduction from deductions", amount(data.get("estimated_tax_savings"))),
        ]),
        ("Vehicle breakdown", ("Vehicle and method", "Miles", "Business use", "Vehicle estimates"),
         [(f"{v['vehicle_name']}\n{label(v['method'])}\nEligibility: {label(v['eligibility'])}",
           f"{v['business_miles']} business\n{v['personal_miles']} personal",
           "Unavailable" if v["business_use_percentage"] is None else f"{v['business_use_percentage']}%",
           f"Standard: {money(v['standard'])}\nActual: {money(v['actual'])}")
          for v in data["vehicle_rows"]], (0.35, 0.18, 0.18, 0.29)),
        ("IRS mileage rates", ("Effective start", "Effective end", "Rate per mile", "Business miles"),
         [(r["effective_start"], r["effective_end"], f"${r['rate']}", r["miles"]) for r in data["rate_periods"]],
         (0.26, 0.26, 0.24, 0.24)),
        ("Income and expense trends", ("Month", "Income", "Expenses"),
         [(r["period"], money(r["income"]), money(r["expenses"])) for r in data.get("trends", [])], (0.38, 0.31, 0.31)),
    ]
    build_pdf(buffer, f"{data['start_date']} to {data['end_date']}", method, sections, data["caveats"])
