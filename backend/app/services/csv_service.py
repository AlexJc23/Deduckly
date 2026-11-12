from app.services.report_helper import get_report_period
import csv
import re


def safe_csv_cell(value):
    if value is None:
        return ""
    if not isinstance(value, str):
        return value
    # Negative decimal amounts remain spreadsheet numbers. Formula-like
    # text, including strings with leading whitespace, is forced to text.
    if re.fullmatch(r"[+-]?[0-9]+(?:\.[0-9]+)?", value):
        return value
    if value.startswith(("\t", "\r", "\n")) or value.lstrip().startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def build_tax_report_csv(buffer, data):
    writer = csv.writer(buffer)

    def row(values):
        writer.writerow(map(safe_csv_cell, values))

    writer.writerow(["Deduckly Tax Report"])
    writer.writerow([])

    # User Info
    row(
        ["Report Period", get_report_period(data)]
    )
    row(["First Name", data["first_name"]])
    row(["Last Name", data["last_name"]])
    row(["Filing Status", data["filing_status"]])
    row(["Generated", data["generated_at_utc"]])

    row([])

    # Income
    row(["Income"])
    row(["Total Income", data["total_income"]])

    row([])

    # Expenses
    row(["Expenses"])
    row(["Total Expenses", data["total_expenses"]])
    row(
        ["Deductible Expenses", data["deductible_expense_total"]]
    )
    row(
        [
            "Non-Deductible Expenses",
            data["non_deductible_expense_total"],
        ]
    )
    row(
        ["Vehicle Expenses", data["vehicle_expense_total"]]
    )

    row([])

    # Mileage
    row(["Mileage"])
    row(["Business Miles", data["total_miles"]])
    row(
        ["Mileage Deduction", data["mileage_deduction"]]
    )

    row([])

    # Tax Summary
    row(["Tax Summary"])
    row(
        ["Total Deductions", data["total_deductions"]]
    )
    row(["Net Profit", data["net_profit"]])
    row(
        ["Taxable Income", data["taxable_income"]]
    )
    row(
        ["Estimated Tax Owed", data["estimated_tax_owed"]]
    )
    row(
        [
            "Estimated Tax Savings",
            data["estimated_tax_savings"],
        ]
    )

    row([])

    # Business Information
    row(["Business Information"])
    row(
        ["Business Type", data["business_type"]]
    )
    row(
        ["Tax Method", data["tax_method"]]
    )

    row(
        [
            "Largest Expense Category",
            data["largest_expense_category"] or "None",
        ]
    )

    row(
        [
            "Largest Expense Amount",
            data["largest_expense_amount"] or 0,
        ]
    )

    row([])

    # Expense Breakdown
    row(["Expense Breakdown"])
    row(
        [
            "Category",
            "Amount",
            "Count",
            "Business %",
        ]
    )

    if data["expense_breakdown"]:
        for category, details in data["expense_breakdown"].items():
            row(
                [
                    category.replace("_", " ").title(),
                    details["amount"],
                    details["count"],
                    details["business_percentage"],
                ]
            )
    else:
        row(["No expenses", 0, 0, "-"])

    row([])

    # Non-Deductible Breakdown
    row(["Non-Deductible Breakdown"])
    row(
        [
            "Category",
            "Amount",
            "Count",
            "Reason",
        ]
    )

    if data["non_deductible_breakdown"]:
        for category, details in data[
            "non_deductible_breakdown"
        ].items():
            row(
                [
                    category.replace("_", " ").title(),
                    details["amount"],
                    details["count"],
                    details["reason"],
                ]
            )
    else:
        row(
            ["None", 0, 0, "No non-deductible expenses"]
        )

    row([])
    row(["Important note", "Estimates based on recorded activity. Review with a qualified tax professional before filing."])
