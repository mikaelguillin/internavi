from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class School(SQLModel, table=True):
    """School model representing institutions from College Scorecard API"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Basic Information
    name: str = Field(index=True)
    city: Optional[str] = None
    state: Optional[str] = Field(default=None, index=True)
    zip: Optional[str] = None
    website: Optional[str] = None
    
    # School Type and Characteristics
    school_type: Optional[str] = None  # Public, Private, etc.
    degree_type: Optional[str] = None  # 4-year, 2-year, etc.
    locale: Optional[str] = None  # City, Suburban, Rural, etc.
    
    # Admissions
    admission_rate: Optional[float] = None
    sat_avg: Optional[int] = None
    act_avg: Optional[int] = None
    
    # Cost
    tuition_in_state: Optional[float] = None
    tuition_out_of_state: Optional[float] = None
    
    # Student Body
    student_size: Optional[int] = None
    undergrad_size: Optional[int] = None
    
    # Outcomes
    completion_rate: Optional[float] = None
    earnings_after_10yrs: Optional[float] = None
    
    # Programs and Fields of Study (stored as JSON string or comma-separated)
    programs_offered: Optional[str] = None
    
    # API Metadata
    unit_id: Optional[str] = Field(default=None, unique=True, index=True)  # College Scorecard unit_id
    ope_id: Optional[str] = None  # OPE ID for federal student aid
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

