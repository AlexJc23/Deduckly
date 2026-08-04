import { ExpenseCategory } from "@/features/expenses/types/expense";

export const EXPENSE_CATEGORY_LABELS: Record<
  ExpenseCategory,
  string
> = {
  advertising: "Advertising",
  bank_fees: "Bank Fees",
  commissions_fees: "Commissions & Fees",
  contract_labor: "Contract Labor",

  education: "Education",

  equipment: "Equipment",
  office_supplies: "Office Supplies",

  software: "Software",
  phone: "Phone",
  internet: "Internet",

  vehicle: "Vehicle",
  fuel: "Fuel",
  car_wash: "Car Wash",
  vehicle_maintenance: "Vehicle Maintenance",
  vehicle_repairs: "Vehicle Repairs",
  vehicle_insurance: "Vehicle Insurance",
  vehicle_registration: "Vehicle Registration",
  parking_tolls: "Parking & Tolls",

  travel: "Travel",
  lodging: "Lodging",
  airfare: "Airfare",

  meals: "Meals",

  rent: "Rent",
  utilities: "Utilities",

  insurance: "Insurance",

  licenses_permits: "Licenses & Permits",

  professional_services: "Professional Services",
  legal_fees: "Legal Fees",
  accounting: "Accounting",

  postage_shipping: "Postage & Shipping",

  interest: "Interest",

  taxes_fees: "Taxes & Fees",

  marketing: "Marketing",

  memberships_subscriptions:
    "Memberships & Subscriptions",

  home_office: "Home Office",

  repairs_maintenance:
    "Repairs & Maintenance",

  other: "Other",
};