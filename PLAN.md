## 🚀 Internavi Student Section MVP Implementation Plan

**Stack:** Astro + Shadcn UI + FastAPI + PostgreSQL
**Architecture:** pnpm Monorepo

---

## Phase 1: Foundation and Data Architecture (MVP Core)

The goal is to set up the environments, create the pnpm monorepo structure, and establish a fully working data pipeline.

### Step 1: Initialize pnpm Monorepo Structure

1.  **Initialize Monorepo:** Ensure pnpm is installed globally, then initialize the monorepo at the project root by creating a `pnpm-workspace.yaml` file.
2.  **Define Workspaces:** Configure `pnpm-workspace.yaml` to include: `apps/*` (for frontend and backend) and `packages/*` (for shared code).
3.  **Create Workspace Folders:**
    * `apps/frontend`: For the **Astro** application.
    * `apps/backend`: For the **FastAPI** application.
    * `packages/ui`: For shared **Shadcn UI** components and Tailwind configuration.
    * `packages/shared`: For shared code, especially **TypeScript model contracts**.
4.  **Install Node Dependencies:** Use `pnpm install` at the root level to install initial Node packages.

### Step 2: PostgreSQL and FastAPI Setup

1.  **Database Setup:** Spin up a local **PostgreSQL** instance (via Docker).
2.  **FastAPI Project Initialization:** Initialize the FastAPI project (`apps/backend`) and install Python dependencies (e.g., using venv/poetry): `fastapi`, `uvicorn`, `psycopg2-binary`, and **SQLModel**.
3.  **Define SQLModel Schema and Contract:**
    * Create the core `School` model in `apps/backend/models.py` using **SQLModel**.
    * Mirror these models as TypeScript interfaces/types in `packages/shared/types.ts` for end-to-end type safety.
4.  **Data Ingestion:** Create a script within `apps/backend` to fetch data from the **College Scorecard API** and insert it into the local PostgreSQL database.

### Step 3: FastAPI API Endpoints (Core Data Services)

1.  **School Listing API:** Create a FastAPI endpoint, `GET /api/schools`, to query PostgreSQL and return the full list of school data as JSON, supporting query parameters for **filtering** and **sorting**.
2.  **Quiz Matching API (MVP Logic):** Create the primary endpoint, `POST /api/quiz-match`, that accepts the five quiz inputs. Implement the **simplified conditional scoring logic** and return the top 3-5 schools as a ranked JSON array.

---

## Phase 2: Frontend Implementation and Styling

The goal is to build the core pages and integrate the UI components using pnpm's local package linking.

### Step 4: Astro and Shadcn UI Setup

1.  **Astro Initialization:** Initialize the Astro project (`apps/frontend`), add the **React Integration** (`@astrojs/react`), and **Tailwind CSS**.
2.  **Shadcn Monorepo Setup:** Configure the Shadcn CLI to install components into the local package: `packages/ui`.
3.  **Local Package Linking:** Ensure `packages/ui` and `packages/shared` can be imported into `apps/frontend` using package names defined in their respective `package.json` files.
4.  **Component Scaffolding:** Use the Shadcn CLI to add core components to `packages/ui`: `Button`, `Card`, `Select`, `Input`, and `Dialog`.

### Step 5: Implement User Flow (Steps A-C)

1.  **Hero Section (Astro):** Build the static `index.astro` page with the Hero Section (A. Hero Section) and the CTA button.
2.  **Step 1: Choose Study Level (Astro):** Create the section with three interactive buttons (High School / Undergraduate / Graduate), using components from `packages/ui`.
3.  **Step 2: Choose Path (React Island):** Build the split layout as a **React Component** (for interactivity) within Astro, making it an **Astro Island** for performance.

### Step 6: Data Integration

1.  **Quiz UI (React/Shadcn):** Build the five quiz input fields. Use the **TypeScript models** from `packages/shared` for type-checking. Call the FastAPI endpoint: `POST /api/quiz-match`.
2.  **Results Display (Astro SSR):** Configure Astro to use **Server-Side Rendering (SSR)** for the `/results` page. The Astro server function calls the FastAPI API *before* rendering the HTML to display the school cards.

---

## Phase 3: Final MVP Features and SEO

The goal is to complete the core requirements and deployment prep.

### Step 7: Explore and Support Pages

1.  **Explore All Schools Page (Astro/React):** Create the `/explore` page using SSR to fetch the full school list. Use a lightweight **React Island** for the interactive filtering/sorting controls, making asynchronous calls to the API.
2.  **Support Options:** Implement the **Scholarship Help** and **Visa Guidance** sections (D. Step 3) with forms or links.

### Step 8: Deployment and Cursor Configuration

1.  **Cursor Rules:** Create a **Project Rule** to define the monorepo structure and the specific `pnpm run` commands for the Astro build/dev and the Python commands for FastAPI.
2.  **Deployment Prep:** Configure deployment scripts to run both the **FastAPI Uvicorn server** and the **Astro/Node server**. The deployment will use `pnpm install --frozen-lockfile` to ensure dependency consistency.