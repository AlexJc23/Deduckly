from typing import Annotated, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
Economy = Annotated[float, Field(gt=0, le=1000, allow_inf_nan=False)]
class VehicleData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    year: int = Field(ge=1886, le=2200)
    make: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    trim: str | None = Field(default=None, max_length=200)
    fuel_type: Literal['gasoline','diesel','hybrid','electric','other']
    city_mpg: Economy | None = None
    highway_mpg: Economy | None = None
    combined_mpg: Economy | None = None
    custom_mpg: Economy | None = None
    kwh_per_100_miles: Economy | None = None
    epa_id: str | None = Field(default=None, pattern=r'^\d{1,20}$')
    is_default: bool = False
class VehicleWrite(VehicleData):
    expected_version: int = Field(ge=0)
    operation_id: UUID
    deleted: bool = False
class VehicleResponse(VehicleData):
    model_config = ConfigDict(from_attributes=True)
    id: str
    version: int
    deleted: bool
