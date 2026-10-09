from fastapi import HTTPException
from sqlalchemy.orm import Session, lazyload
from app.models import User
from app.models.vehicle import UserVehicle
from app.schemas.v1.vehicle import VehicleWrite

def save_vehicle(db: Session, owner: int, identity: str, data: VehicleWrite):
    try:
        # Serialize all profile/default changes with the same owner lock as account deletion.
        user = db.query(User).options(lazyload("*")).filter_by(id=owner).with_for_update().one_or_none()
        if user is None or not user.is_active:
            raise HTTPException(401, "Inactive account")
        row = db.query(UserVehicle).filter_by(id=identity, user_id=owner).one_or_none()
        if row and row.operation_id == str(data.operation_id):
            db.commit()
            return row
        if (row and (row.deleted or row.version != data.expected_version)) or (not row and data.expected_version != 0):
            raise HTTPException(409, "Vehicle changed on another device; pending changes retained")
        if not row:
            # UUID collision never reveals or updates another owner's profile.
            if db.get(UserVehicle, identity):
                raise HTTPException(409, "Vehicle identity unavailable")
            row = UserVehicle(id=identity, user_id=owner)
        if data.is_default and not data.deleted:
            db.query(UserVehicle).filter(UserVehicle.user_id == owner, UserVehicle.id != identity,
                UserVehicle.is_default.is_(True)).update({UserVehicle.is_default: False}, synchronize_session=False)
            db.flush()
        for key, value in data.model_dump(exclude={'operation_id','expected_version'}).items():
            setattr(row, key, value)
        db.add(row)
        row.is_default = data.is_default and not data.deleted
        row.version = data.expected_version + 1
        row.operation_id = str(data.operation_id)
        db.commit()
        db.refresh(row)
        return row
    except Exception:
        db.rollback()
        raise
