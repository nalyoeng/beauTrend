"""Report generation and storage endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Report
from ..schemas import ReportCreate, ReportOut
from ..services.report_generation import build_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(payload: ReportCreate, db: Session = Depends(get_db)) -> Report:
    """Generate and persist a report for the selected products."""

    return build_report(
        db,
        title=payload.title,
        author=payload.author,
        product_ids=payload.product_ids,
        include_forecast=payload.include_forecast,
        horizon=payload.horizon,
    )


@router.get("", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db)) -> list[Report]:
    """List previously generated reports, newest first."""

    return list(
        db.scalars(select(Report).order_by(Report.id.desc())).unique()
    )


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)) -> Report:
    """Fetch one generated report."""

    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
