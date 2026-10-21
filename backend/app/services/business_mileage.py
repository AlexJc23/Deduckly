"""IRS business rates by inclusive effective date. Never extrapolate an unpublished year.
Sources: https://www.irs.gov/tax-professionals/standard-mileage-rates
2026 second half: Announcement 2026-11. Amounts are dollars per mile.
"""
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
RATES = [(date(y,1,1), Decimal(v)) for y,v in [(2010,'.50'),(2011,'.51'),(2012,'.555'),(2013,'.565'),(2014,'.56'),(2015,'.575'),(2016,'.54'),(2017,'.535'),(2018,'.545'),(2019,'.58'),(2020,'.575'),(2021,'.56'),(2022,'.585'),(2023,'.655'),(2024,'.67'),(2025,'.70'),(2026,'.725')]] + [(date(2011,7,1),Decimal('.555')),(date(2022,7,1),Decimal('.625')),(date(2026,7,1),Decimal('.760'))]
RATES.sort()
def money(value): return Decimal(str(value)).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
def rate_for(day):
    if not 2010 <= day.year <= 2026: return None
    return next((rate for start,rate in reversed(RATES) if start <= day),None)
def deduction(miles, day):
    rate=rate_for(day)
    return None if rate is None else money(Decimal(str(miles))*rate)

def period_for(day):
    """Inclusive effective interval; never extend a rate past a published year."""
    if rate_for(day) is None:
        return None
    start = next(start for start, _ in reversed(RATES) if start <= day)
    following = next((start for start, _ in RATES if start > day), date(day.year + 1, 1, 1))
    return start, min(following - timedelta(days=1), date(day.year, 12, 31))
