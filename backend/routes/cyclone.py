from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.database.models import Cyclone


router = APIRouter(prefix="/cyclones", tags=["Cyclones"])


@router.get("")
def list_cyclones(db: Session = Depends(get_db)):
	cyclones = db.query(Cyclone).order_by(Cyclone.timestamp.desc()).all()
	return [
		{
			"id": cyclone.id,
			"name": cyclone.name,
			"timestamp": cyclone.timestamp.isoformat() if cyclone.timestamp else None,
			"location": None,
		}
		for cyclone in cyclones
	]
