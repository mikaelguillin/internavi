/**
 * Shared TypeScript types for Internavi
 * These types mirror the SQLModel schemas in the backend for end-to-end type safety
 */

export interface School {
  id?: number;

  // Basic Information
  name: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  website?: string | null;

  // School Type and Characteristics
  school_type?: string | null;
  degree_type?: string | null;
  locale?: string | null;

  // Admissions
  admission_rate?: number | null;
  sat_avg?: number | null;
  act_avg?: number | null;

  // Cost
  tuition_in_state?: number | null;
  tuition_out_of_state?: number | null;

  // Student Body
  student_size?: number | null;
  undergrad_size?: number | null;

  // Outcomes
  completion_rate?: number | null;
  earnings_after_10yrs?: number | null;

  // Programs and Fields of Study
  programs_offered?: string | null;

  // API Metadata
  unit_id?: string | null;
  ope_id?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface SchoolListResponse {
  schools: School[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface QuizMatchRequest {
  study_level: string;
  preferred_location: string;
  budget_range: string;
  program_interest: string;
  admission_preference: string;
}

export interface QuizMatchResponse {
  schools: School[];
  match_score?: number;
}
