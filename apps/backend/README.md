# Internavi Backend

FastAPI backend for the Internavi Student Section MVP.

## Setup

1. **Create Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.template .env
   # Edit .env and add your College Scorecard API key
   # Get your API key from: https://api.data.gov/signup/
   ```

4. **Start PostgreSQL database:**
   ```bash
   # From project root
   docker-compose up -d
   ```

5. **Initialize database:**
   ```bash
   python -c "from database import init_db; init_db()"
   ```

6. **Ingest data from College Scorecard API:**
   ```bash
   python ingest_data.py
   ```

7. **Run the FastAPI server:**
   ```bash
   # Make sure virtual environment is activated first!
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload
   ```
   
   **Important:** Always activate the virtual environment before running uvicorn, otherwise you'll get `ModuleNotFoundError`.

The API will be available at `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

