"""
API routers for Internavi backend
"""
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlmodel import Session, select, func, or_
from typing import Optional, List
from pydantic import BaseModel
from database import get_session
from models import School

router = APIRouter(prefix="/api", tags=["api"])


class QuizMatchRequest(BaseModel):
    """Request model for quiz matching"""
    study_level: str
    preferred_location: str
    budget_range: str
    program_interest: str
    admission_preference: str


@router.get("/schools", response_model=dict)
async def get_schools(
    state: Optional[str] = Query(None, description="Filter by state (e.g., 'CA', 'NY')"),
    school_type: Optional[str] = Query(None, description="Filter by school type (Public, Private)"),
    locale: Optional[str] = Query(None, description="Filter by locale (City, Suburban, Rural, Town)"),
    min_tuition: Optional[float] = Query(None, description="Minimum tuition (in-state)"),
    max_tuition: Optional[float] = Query(None, description="Maximum tuition (in-state)"),
    sort_by: Optional[str] = Query("name", description="Sort by field (name, tuition_in_state, admission_rate, etc.)"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc, desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session)
):
    """
    Get list of schools with filtering and sorting support
    """
    # Build query
    query = select(School)
    
    # Apply filters
    if state:
        query = query.where(School.state == state.upper())
    if school_type:
        query = query.where(School.school_type == school_type)
    if locale:
        query = query.where(School.locale == locale)
    if min_tuition is not None:
        query = query.where(School.tuition_in_state >= min_tuition)
    if max_tuition is not None:
        query = query.where(School.tuition_in_state <= max_tuition)
    
    # Get total count
    count_query = select(func.count()).select_from(School)
    if state:
        count_query = count_query.where(School.state == state.upper())
    if school_type:
        count_query = count_query.where(School.school_type == school_type)
    if locale:
        count_query = count_query.where(School.locale == locale)
    if min_tuition is not None:
        count_query = count_query.where(School.tuition_in_state >= min_tuition)
    if max_tuition is not None:
        count_query = count_query.where(School.tuition_in_state <= max_tuition)
    
    total = session.exec(count_query).one()
    
    # Apply sorting
    sort_field = getattr(School, sort_by, None)
    if sort_field is None:
        sort_field = School.name
    
    if sort_order.lower() == "desc":
        query = query.order_by(sort_field.desc())
    else:
        query = query.order_by(sort_field.asc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    schools = session.exec(query).all()
    
    return {
        "schools": schools,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/quiz-match", response_model=dict)
async def quiz_match(
    request: QuizMatchRequest,
    session: Session = Depends(get_session)
):
    """
    Match schools based on quiz inputs using simplified conditional scoring logic
    Returns top 3-5 schools ranked by match score
    """
    # Extract request parameters
    study_level = request.study_level
    preferred_location = request.preferred_location
    budget_range = request.budget_range
    program_interest = request.program_interest
    admission_preference = request.admission_preference
    
    # Get all schools
    query = select(School)
    all_schools = session.exec(query).all()
    
    if not all_schools:
        raise HTTPException(status_code=404, detail="No schools found in database")
    
    # Score each school
    scored_schools = []
    
    for school in all_schools:
        score = 0
        reasons = []
        
        # 1. Study Level Matching (simplified - check degree type)
        if study_level.lower() in ["undergraduate", "undergrad"]:
            if school.degree_type and "4" in str(school.degree_type):
                score += 20
                reasons.append("4-year program available")
        elif study_level.lower() == "graduate":
            if school.degree_type and "4" in str(school.degree_type):
                score += 20
                reasons.append("Graduate programs available")
        elif study_level.lower() == "high school":
            score += 10  # All schools are potential options
        
        # 2. Location Matching
        if preferred_location.lower() != "any":
            if school.state and preferred_location.upper() in school.state.upper():
                score += 25
                reasons.append(f"Located in {school.state}")
            elif school.locale:
                location_map = {
                    "urban": ["City"],
                    "suburban": ["Suburban"],
                    "rural": ["Rural", "Town"]
                }
                preferred_locale = location_map.get(preferred_location.lower(), [])
                if school.locale in preferred_locale:
                    score += 15
                    reasons.append(f"{school.locale} setting")
        
        # 3. Budget Matching
        if budget_range and school.tuition_in_state is not None:
            budget_ranges = {
                "low": (0, 15000),
                "medium": (15000, 35000),
                "high": (35000, float('inf'))
            }
            min_budget, max_budget = budget_ranges.get(budget_range.lower(), (0, float('inf')))
            if min_budget <= school.tuition_in_state <= max_budget:
                score += 25
                reasons.append(f"Tuition: ${school.tuition_in_state:,.0f}")
            elif school.tuition_in_state < min_budget:
                score += 15  # Below budget is still good
                reasons.append(f"Below budget: ${school.tuition_in_state:,.0f}")
        
        # 4. Program Interest (simplified - check if school has programs)
        if program_interest.lower() != "any":
            # For MVP, we'll give points if school has program data
            # In a full implementation, we'd check specific programs
            if school.programs_offered:
                score += 15
                reasons.append("Programs available")
            else:
                score += 5  # Still a potential match
        
        # 5. Admission Preference
        if admission_preference and school.admission_rate is not None:
            if admission_preference.lower() == "selective":
                if school.admission_rate < 0.5:  # Less than 50% acceptance
                    score += 15
                    reasons.append(f"Selective: {school.admission_rate*100:.1f}% acceptance")
            elif admission_preference.lower() == "moderate":
                if 0.3 <= school.admission_rate <= 0.7:
                    score += 15
                    reasons.append(f"Moderate: {school.admission_rate*100:.1f}% acceptance")
            elif admission_preference.lower() == "open":
                if school.admission_rate > 0.7:
                    score += 15
                    reasons.append(f"Open: {school.admission_rate*100:.1f}% acceptance")
            elif admission_preference.lower() == "any":
                score += 10
        
        # Bonus points for schools with good outcomes
        if school.completion_rate and school.completion_rate > 0.7:
            score += 5
        if school.earnings_after_10yrs and school.earnings_after_10yrs > 50000:
            score += 5
        
        scored_schools.append({
            "school": school,
            "score": score,
            "reasons": reasons
        })
    
    # Sort by score (descending) and take top 5
    scored_schools.sort(key=lambda x: x["score"], reverse=True)
    top_schools = scored_schools[:5]
    
    # Filter out schools with score 0 (no matches)
    top_schools = [s for s in top_schools if s["score"] > 0]
    
    if not top_schools:
        raise HTTPException(
            status_code=404,
            detail="No schools matched your criteria. Try adjusting your preferences."
        )
    
    # Return top 3-5 schools
    return {
        "schools": [s["school"] for s in top_schools],
        "matches": [
            {
                "school_id": s["school"].id,
                "match_score": s["score"],
                "match_reasons": s["reasons"]
            }
            for s in top_schools
        ]
    }

