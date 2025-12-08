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


def safe_float(value):
    """Safely convert value to float, returning None if conversion fails"""
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_int(value):
    """Safely convert value to int, returning None if conversion fails"""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def get_nested_value(data: dict, *keys):
    """Helper to get nested dictionary values, trying both flat and nested structures"""
    # Try flat key first (e.g., "school.name")
    flat_key = ".".join(keys)
    if flat_key in data:
        return data[flat_key]
    
    # Try nested structure (e.g., data["school"]["name"])
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current


def map_college_scorecard_to_school(api_data: dict) -> School:
    """
    Map College Scorecard API response to School model
    Handles both flat keys (like "school.name") and nested structures
    """
    # Extract basic information
    name = get_nested_value(api_data, "school", "name") or get_nested_value(api_data, "school.name") or "Unknown"
    city = get_nested_value(api_data, "school", "city") or get_nested_value(api_data, "school.city")
    state = get_nested_value(api_data, "school", "state") or get_nested_value(api_data, "school.state")
    zip_code = get_nested_value(api_data, "school", "zip") or get_nested_value(api_data, "school.zip")
    if zip_code is not None:
        zip_code = str(zip_code)
    website = get_nested_value(api_data, "school", "school_url") or get_nested_value(api_data, "school.school_url")
    
    # School characteristics
    school_type = get_nested_value(api_data, "school", "ownership") or get_nested_value(api_data, "school.ownership")
    degree_type = get_nested_value(api_data, "school", "degrees_awarded", "predominant") or get_nested_value(api_data, "school.degrees_awarded.predominant")
    if degree_type is not None:
        degree_type = str(degree_type)
    
    locale_code = get_nested_value(api_data, "school", "locale") or get_nested_value(api_data, "school.locale")
    locale = None
    if locale_code is not None:
        locale_map = {11: "City", 12: "City", 13: "City", 21: "Suburban", 22: "Suburban", 23: "Suburban", 31: "Rural", 32: "Rural", 33: "Rural", 41: "Town", 42: "Town", 43: "Town"}
        locale = locale_map.get(locale_code)
    
    # Admissions (convert to appropriate types)
    admission_rate = safe_float(get_nested_value(api_data, "latest", "admissions", "admission_rate", "overall") or get_nested_value(api_data, "latest.admissions.admission_rate.overall"))
    sat_avg = safe_int(get_nested_value(api_data, "latest", "admissions", "sat_scores", "average", "overall") or get_nested_value(api_data, "latest.admissions.sat_scores.average.overall"))
    act_avg = safe_int(get_nested_value(api_data, "latest", "admissions", "act_scores", "midpoint", "cumulative") or get_nested_value(api_data, "latest.admissions.act_scores.midpoint.cumulative"))
    
    # Cost (convert to float)
    tuition_in_state = safe_float(get_nested_value(api_data, "latest", "cost", "tuition", "in_state") or get_nested_value(api_data, "latest.cost.tuition.in_state"))
    tuition_out_of_state = safe_float(get_nested_value(api_data, "latest", "cost", "tuition", "out_of_state") or get_nested_value(api_data, "latest.cost.tuition.out_of_state"))
    
    # Student body (convert to int)
    student_size = safe_int(get_nested_value(api_data, "latest", "student", "size") or get_nested_value(api_data, "latest.student.size"))
    undergrad_size = safe_int(get_nested_value(api_data, "latest", "student", "enrollment", "undergrad_12_month") or get_nested_value(api_data, "latest.student.enrollment.undergrad_12_month"))
    
    # Outcomes (convert to float)
    completion_rate = safe_float(get_nested_value(api_data, "latest", "completion", "completion_rate_4yr_150nt") or get_nested_value(api_data, "latest.completion.completion_rate_4yr_150nt"))
    # Try different possible field names for earnings
    earnings_after_10yrs = safe_float(
        get_nested_value(api_data, "latest", "earnings", "10_yrs_after_entry", "median") or
        get_nested_value(api_data, "latest.earnings.10_yrs_after_entry.median") or
        get_nested_value(api_data, "latest", "earnings", "_10_yrs_after_entry", "median")
    )
    
    # Programs (simplified - could be expanded)
    programs_offered = None
    
    # Metadata
    unit_id = api_data.get("id") or get_nested_value(api_data, "id")
    if unit_id is not None:
        unit_id = str(unit_id)
    ope_id = get_nested_value(api_data, "school", "ope6_id") or get_nested_value(api_data, "school.ope6_id")
    if ope_id is not None:
        ope_id = str(ope_id)
    
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


async def fetch_schools_from_api(api_key: str, page: int = 0, per_page: int = 100, max_retries: int = 3):
    """
    Fetch schools from College Scorecard API with retry logic
    """
    # Field list - using verified field names from College Scorecard API
    # Some fields may cause 500 errors, so we try without fields first if needed
    fields = [
        "id",
        "school.name",
        "school.city",
        "school.state",
        "school.zip",
        "school.school_url",
        "school.ownership",
        "school.degrees_awarded.predominant",
        "school.locale",
        "latest.admissions.admission_rate.overall",
        "latest.admissions.sat_scores.average.overall",
        "latest.admissions.act_scores.midpoint.cumulative",
        "latest.cost.tuition.in_state",
        "latest.cost.tuition.out_of_state",
        "latest.student.size",
        "latest.student.enrollment.undergrad_12_month",
        "latest.completion.completion_rate_4yr_150nt",
        "school.ope6_id"
        # "latest.earnings.10_yrs_after_entry.median" - commented out, may cause API errors
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(max_retries):
            try:
                # Try with fields first
                params = {
                    "api_key": api_key,
                    "page": page,
                    "per_page": per_page,
                    "fields": ",".join(fields)
                }
                
                response = await client.get(COLLEGE_SCORECARD_BASE_URL, params=params)
                
                if response.status_code == 200:
                    return response.json()
                
                # If 500 error and not last attempt, try without fields parameter
                if response.status_code == 500 and attempt < max_retries - 1:
                    print(f"API returned 500 error, retrying without fields parameter (attempt {attempt + 1}/{max_retries})...")
                    params_no_fields = {
                        "api_key": api_key,
                        "page": page,
                        "per_page": per_page
                    }
                    response = await client.get(COLLEGE_SCORECARD_BASE_URL, params=params_no_fields)
                    
                    if response.status_code == 200:
                        print("Successfully fetched data without fields parameter")
                        return response.json()
                
                # Better error handling to see what the API is returning
                error_text = response.text
                print(f"API Error {response.status_code}: {error_text[:500]}")
                try:
                    error_json = response.json()
                    print(f"Error details: {error_json}")
                except:
                    pass
                
                # If it's a client error (4xx), don't retry
                if 400 <= response.status_code < 500:
                    response.raise_for_status()
                
                # For server errors, wait before retrying
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    print(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    response.raise_for_status()
                    
            except httpx.HTTPError as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"HTTP error occurred: {e}. Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    raise
        
        raise Exception("Failed to fetch data after all retry attempts")


async def ingest_schools():
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
    
    print("Starting data ingestion...")
    
    page = 0
    per_page = 100
    total_inserted = 0
    
    with Session(engine) as session:
        while True:
            try:
                print(f"Fetching page {page}...")
                data = await fetch_schools_from_api(COLLEGE_SCORECARD_API_KEY, page, per_page)
                
                results = data.get("results", [])
                if not results:
                    print("No more results from API")
                    break
                
                for api_school in results:
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
    # Run ingestion
    asyncio.run(ingest_schools())

