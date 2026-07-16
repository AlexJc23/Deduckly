from enum import Enum

class TripPlatform(str, Enum):
    UBER_EATS = "uber_eats"
    SPARK = "spark"
    DOORDASH = "doordash"
    LYFT = "lyft"
    UBER = "uber"
    GRUBHUB = "grubhub"
    INSTACART = "instacart"
    AMAZON_FLEX = "amazon_flex"
    SHIPT = "shipt"
    OTHER = "other"
    PERSONAL = "personal"

class TripCategory(str, Enum):
    BUSINESS = "business"
    PERSONAL = "personal"

class BusinessType(str, Enum):
    GIG_DRIVER = "gig_driver"
    FREELANCER = "freelancer"
    SMALL_BUSINESS = "small_business"
    CONTRACTOR = "contractor"
    OTHER = "other"

class TaxMethod(str, Enum):
    STANDARD_MILEAGE = "standard_mileage"
    ACTUAL_EXPENSES = "actual_expenses"

class IncomeType(str, Enum):
    GIG_PLATFORM = "gig_platform"
    BUSINESS = "business"
    EMPLOYMENT = "employment"
    PASSIVE = "passive"
    OTHER = "other"

class ExpenseCategory(str, Enum):
    ADVERTISING = "advertising"
    BANK_FEES = "bank_fees"
    COMMISSIONS_FEES = "commissions_fees"
    CONTRACT_LABOR = "contract_labor"

    EDUCATION = "education"

    EQUIPMENT = "equipment"
    OFFICE_SUPPLIES = "office_supplies"

    SOFTWARE = "software"
    PHONE = "phone"
    INTERNET = "internet"

    VEHICLE = "vehicle"
    FUEL = "fuel"
    CAR_WASH = "car_wash"
    VEHICLE_MAINTENANCE = "vehicle_maintenance"
    VEHICLE_REPAIRS = "vehicle_repairs"
    VEHICLE_INSURANCE = "vehicle_insurance"
    VEHICLE_REGISTRATION = "vehicle_registration"
    PARKING_TOLLS = "parking_tolls"


    TRAVEL = "travel"
    LODGING = "lodging"
    AIRFARE = "airfare"

    MEALS = "meals"

    RENT = "rent"
    UTILITIES = "utilities"

    INSURANCE = "insurance"

    LICENSES_PERMITS = "licenses_permits"

    PROFESSIONAL_SERVICES = "professional_services"
    LEGAL_FEES = "legal_fees"
    ACCOUNTING = "accounting"

    POSTAGE_SHIPPING = "postage_shipping"

    INTEREST = "interest"

    TAXES_FEES = "taxes_fees"

    MARKETING = "marketing"

    MEMBERSHIPS_SUBSCRIPTIONS = "memberships_subscriptions"

    HOME_OFFICE = "home_office"

    REPAIRS_MAINTENANCE = "repairs_maintenance"

    OTHER = "other"

    
class FilingStatus(str, Enum):
    single = "single"
    married_filing_jointly = "married_filing_jointly"
    married_filing_separately = "married_filing_separately"
    head_of_household = "head_of_household"
    qualifying_surviving_spouse = "qualifying_surviving_spouse"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
