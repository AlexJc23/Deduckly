"""Licensed-provider seam. No provider, key, or paid account is enabled."""
from datetime import datetime, timezone, timedelta
from typing import Protocol, Literal
from pydantic import BaseModel, Field

class FuelQuote(BaseModel):
    price: float = Field(gt=0, le=100, allow_inf_nan=False)
    unit: Literal['USD/US-gallon', 'USD/kWh']
    fuel_type: Literal['gasoline','diesel','hybrid','electric']
    source: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=150)
    observed_at: datetime

class FuelPriceProvider(Protocol):
    def lookup(self, postal_code: str, fuel_type: str) -> FuelQuote | None: ...

# A licensed adapter can be injected here after terms, redistribution rights and
# grade/coverage/freshness are verified. Credentials must remain server-side.
provider: FuelPriceProvider | None = None

def local_price(postal_code: str, fuel_type: str):
    if provider is None:
        return {'status':'unavailable', 'quote':None}
    try:
        quote = provider.lookup(postal_code, fuel_type)
        if quote is None: return {'status':'unavailable', 'quote':None}
        quote = FuelQuote.model_validate(quote)
        age = datetime.now(timezone.utc) - quote.observed_at.astimezone(timezone.utc)
        unit = 'USD/kWh' if fuel_type == 'electric' else 'USD/US-gallon'
        if quote.observed_at.tzinfo is None or age < timedelta(0) or age > timedelta(hours=24) or quote.unit != unit or quote.fuel_type != fuel_type:
            return {'status':'unavailable', 'quote':None}
        return {'status':'available', 'quote':quote.model_dump(mode='json')}
    except Exception:
        # Provider errors must never expose credentials or block manual analysis.
        return {'status':'unavailable', 'quote':None}
