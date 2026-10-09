"""Public DOE/EPA adapter. Never interpret EV MPGe as gasoline MPG."""
import time
import threading
import httpx
from fastapi import HTTPException
_cache = {}
_lock = threading.Lock()
BASE = 'https://www.fueleconomy.gov/ws/rest/'

def fetch(path, params=None):
    key = (path, tuple(sorted((params or {}).items())))
    with _lock:
        item = _cache.get(key)
        if item and time.monotonic() - item[0] < 86400:
            return item[1]
    try:
        response = httpx.get(BASE + path, params=params, headers={'Accept':'application/json'}, timeout=8)
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, dict):
            raise ValueError('Invalid catalog')
    except (httpx.HTTPError, ValueError):
        raise HTTPException(503, 'Vehicle lookup unavailable; use manual entry')
    with _lock:
        if len(_cache) >= 256:
            _cache.clear()
        _cache[key] = (time.monotonic(), result)
    return result

def menu(kind, year=None, make=None, model=None):
    params = {k:v for k,v in dict(year=year, make=make, model=model).items() if v is not None}
    items = fetch('vehicle/menu/' + kind, params).get('menuItem', [])
    if isinstance(items, dict): items = [items]
    return [{'text':str(i['text']), 'value':str(i['value'])} for i in items]

def vehicle(identity):
    data = fetch('vehicle/' + str(identity))
    fuel = data.get('fuelType1', '')
    alternative = data.get('atvType', data.get('atvtype', ''))
    # PHEVs / mixed fuels require explicit manual mode selection; never assume a blend.
    if data.get('fuelType2'):
        kind = 'other'
    elif fuel == 'Electricity': kind = 'electric'
    elif fuel == 'Diesel': kind = 'diesel'
    elif 'Gasoline' in fuel: kind = 'hybrid' if alternative == 'Hybrid' else 'gasoline'
    else: kind = 'other'
    def number(key):
        try:
            value = float(data.get(key, 0))
            return value if 0 < value <= 1000 else None
        except (TypeError, ValueError): return None
    result = dict(year=int(data['year']), make=data['make'], model=data['model'],
        trim=' / '.join(str(data[k]) for k in ('trany','drive','eng_dscr') if data.get(k))[:200],
        fuel_type=kind, epa_id=str(identity), is_default=False,
        city_mpg=None, highway_mpg=None, combined_mpg=None, custom_mpg=None, kwh_per_100_miles=None)
    if kind in ('gasoline','diesel','hybrid'):
        result.update(city_mpg=number('city08'), highway_mpg=number('highway08'), combined_mpg=number('comb08'))
    if kind == 'electric': result['kwh_per_100_miles'] = number('combE')
    return result
