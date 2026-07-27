from app.services.report_helper import get_report_period
import csv


def build_tax_report_csv(buffer, data):
    writer = csv.writer(buffer)

    writer.writerow(["Deduckly Tax Report"])
    writer.writerow([])

    # User Info
    writer.writerow(
        ["Report Period", get_report_period(data)]
    )
    writer.writerow(["First Name", data["first_name"]])
    writer.writerow(["Last Name", data["last_name"]])
    writer.writerow(["Filing Status", data["filing_status"]])
    writer.writerow(["Generated", data["generated_at_utc"]])

    writer.writerow([])

    # Income
    writer.writerow(["Income"])
    writer.writerow(["Total Income", data["total_income"]])

    writer.writerow([])

    # Expenses
    writer.writerow(["Expenses"])
    writer.writerow(["Total Expenses", data["total_expenses"]])
    writer.writerow(
        ["Deductible Expenses", data["deductible_expense_total"]]
    )
    writer.writerow(
        [
            "Non-Deductible Expenses",
            data["non_deductible_expense_total"],
        ]
    )
    writer.writerow(
        ["Vehicle Expenses", data["vehicle_expense_total"]]
    )

    writer.writerow([])

    # Mileage
    writer.writerow(["Mileage"])
    writer.writerow(["Total Miles", data["total_miles"]])
    writer.writerow(
        ["Mileage Deduction", data["mileage_deduction"]]
    )

    writer.writerow([])

    # Tax Summary
    writer.writerow(["Tax Summary"])
    writer.writerow(
        ["Total Deductions", data["total_deductions"]]
    )
    writer.writerow(["Net Profit", data["net_profit"]])
    writer.writerow(
        ["Taxable Income", data["taxable_income"]]
    )
    writer.writerow(
        ["Estimated Tax Owed", data["estimated_tax_owed"]]
    )
    writer.writerow(
        [
            "Estimated Tax Savings",
            data["estimated_tax_savings"],
        ]
    )

    writer.writerow([])

    # Business Information
    writer.writerow(["Business Information"])
    writer.writerow(
        ["Business Type", data["business_type"]]
    )
    writer.writerow(
        ["Tax Method", data["tax_method"]]
    )

    writer.writerow(
        [
            "Largest Expense Category",
            data["largest_expense_category"] or "None",
        ]
    )

    writer.writerow(
        [
            "Largest Expense Amount",
            data["largest_expense_amount"] or 0,
        ]
    )

    writer.writerow([])

    # Expense Breakdown
    writer.writerow(["Expense Breakdown"])
    writer.writerow(
        [
            "Category",
            "Amount",
            "Count",
            "Business %",
        ]
    )

    if data["expense_breakdown"]:
        for category, details in data["expense_breakdown"].items():
            writer.writerow(
                [
                    category.replace("_", " ").title(),
                    details["amount"],
                    details["count"],
                    details["business_percentage"],
                ]
            )
    else:
        writer.writerow(["No expenses", 0, 0, "-"])

    writer.writerow([])

    # Non-Deductible Breakdown
    writer.writerow(["Non-Deductible Breakdown"])
    writer.writerow(
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
            writer.writerow(
                [
                    category.replace("_", " ").title(),
                    details["amount"],
                    details["count"],
                    details["reason"],
                ]
            )
    else:
        writer.writerow(
            ["None", 0, 0, "No non-deductible expenses"]
        )
