"""
Data ingestion script for College Scorecard API
Fetches school data and inserts into PostgreSQL database
"""
import os
import httpx
import asyncio
from sqlmodel import Session, select
from database import engine, init_db
from models import School
from dotenv import load_dotenv

load_dotenv()

COLLEGE_SCORECARD_API_KEY = os.getenv("COLLEGE_SCORECARD_API_KEY")
COLLEGE_SCORECARD_BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"


def map_college_scorecard_to_school(api_data: dict) -> School:
    """
    Map College Scorecard API response to School model
    """
    school_data = api_data.get("school", {})
    latest_data = api_data.get("latest", {})
    
    # Extract basic information
    name = school_data.get("name", "Unknown")
    city = school_data.get("city")
    state = school_data.get("state")
    zip_code = school_data.get("zip")
    website = school_data.get("school_url")
    
    # School characteristics
    school_type = school_data.get("ownership")
    degree_type = None
    if school_data.get("degrees_awarded", {}).get("predominant"):
        degree_type = str(school_data.get("degrees_awarded", {}).get("predominant"))
    
    locale = None
    if school_data.get("locale"):
        locale_map = {11: "City", 12: "City", 13: "City", 21: "Suburban", 22: "Suburban", 23: "Suburban", 31: "Rural", 32: "Rural", 33: "Rural", 41: "Town", 42: "Town", 43: "Town"}
        locale = locale_map.get(school_data.get("locale"))
    
    # Admissions
    admission_rate = latest_data.get("admissions", {}).get("admission_rate", {}).get("overall")
    sat_avg = latest_data.get("admissions", {}).get("sat_scores", {}).get("average", {}).get("overall")
    act_avg = latest_data.get("admissions", {}).get("act_scores", {}).get("midpoint", {}).get("cumulative")
    
    # Cost
    tuition_in_state = latest_data.get("cost", {}).get("tuition", {}).get("in_state")
    tuition_out_of_state = latest_data.get("cost", {}).get("tuition", {}).get("out_of_state")
    
    # Student body
    student_size = latest_data.get("student", {}).get("size")
    undergrad_size = latest_data.get("student", {}).get("enrollment", {}).get("undergrad_12_month")
    
    # Outcomes
    completion_rate = latest_data.get("completion", {}).get("completion_rate_4yr_150nt")
    earnings_after_10yrs = latest_data.get("earnings", {}).get("10_yrs_after_entry", {}).get("median")
    
    # Programs (simplified - could be expanded)
    programs_offered = None
    
    # Metadata
    unit_id = str(school_data.get("id")) if school_data.get("id") else None
    ope_id = school_data.get("ope6_id")
    
    return School(
        name=name,
        city=city,
        state=state,
        zip=zip_code,
        website=website,
        school_type=school_type,
        degree_type=degree_type,
        locale=locale,
        admission_rate=admission_rate,
        sat_avg=sat_avg,
        act_avg=act_avg,
        tuition_in_state=tuition_in_state,
        tuition_out_of_state=tuition_out_of_state,
        student_size=student_size,
        undergrad_size=undergrad_size,
        completion_rate=completion_rate,
        earnings_after_10yrs=earnings_after_10yrs,
        programs_offered=programs_offered,
        unit_id=unit_id,
        ope_id=ope_id
    )


async def fetch_schools_from_api(api_key: str, page: int = 0, per_page: int = 100):
    """
    Fetch schools from College Scorecard API
    """
    params = {
        "api_key": api_key,
        "page": page,
        "per_page": per_page,
        "fields": "id,school.name,school.city,school.state,school.zip,school.school_url,school.ownership,school.degrees_awarded.predominant,school.locale,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.admissions.act_scores.midpoint.cumulative,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.student.size,latest.student.enrollment.undergrad_12_month,latest.completion.completion_rate_4yr_150nt,latest.earnings.10_yrs_after_entry.median,school.ope6_id"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(COLLEGE_SCORECARD_BASE_URL, params=params)
        response.raise_for_status()
        return response.json()


async def ingest_schools(max_schools: int = 1000):
    """
    Main ingestion function
    Fetches schools from API and inserts into database
    """
    if not COLLEGE_SCORECARD_API_KEY:
        print("ERROR: COLLEGE_SCORECARD_API_KEY not set in environment variables")
        print("Please set it in .env file or as an environment variable")
        return
    
    print("Initializing database...")
    init_db()
    
    print(f"Starting data ingestion (max {max_schools} schools)...")
    
    page = 0
    per_page = 100
    total_inserted = 0
    
    with Session(engine) as session:
        while total_inserted < max_schools:
            try:
                print(f"Fetching page {page}...")
                data = await fetch_schools_from_api(COLLEGE_SCORECARD_API_KEY, page, per_page)
                
                results = data.get("results", [])
                if not results:
                    print("No more results from API")
                    break
                
                for api_school in results:
                    if total_inserted >= max_schools:
                        break
                    
                    try:
                        school = map_college_scorecard_to_school(api_school)
                        
                        # Check if school already exists by unit_id
                        if school.unit_id:
                            existing = session.exec(
                                select(School).where(School.unit_id == school.unit_id)
                            ).first()
                            if existing:
                                print(f"Skipping duplicate: {school.name}")
                                continue
                        
                        session.add(school)
                        total_inserted += 1
                        
                        if total_inserted % 50 == 0:
                            session.commit()
                            print(f"Inserted {total_inserted} schools...")
                    
                    except Exception as e:
                        print(f"Error processing school: {e}")
                        continue
                
                session.commit()
                page += 1
                
                # Rate limiting - be respectful to the API
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"Error fetching page {page}: {e}")
                break
    
    print(f"Data ingestion complete! Inserted {total_inserted} schools.")


if __name__ == "__main__":
    # Run ingestion with a reasonable limit for MVP
    asyncio.run(ingest_schools(max_schools=500))

