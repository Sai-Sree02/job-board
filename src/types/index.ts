export type UserRole = 'candidate' | 'employer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  company_name: string | null;
  bio: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company_name: string;
  location: string;
  type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  skills: string[];
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer?: Profile;
}

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: Job;
  candidate?: Profile;
}
