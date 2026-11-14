export type QuestionType = 'single-choice' | 'multi-choice' | 'number' | 'gender';

export interface QuestionOption {
  value: string;
  label: string;
  helper?: string;
}

export interface Question {
  id: keyof AssessmentAnswers;
  step: number;
  type: QuestionType;
  label: string;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  required: boolean;
  options?: QuestionOption[];
}

export interface FormStepConfig {
  step: number;
  title: string;
  subtitle: string;
}

export interface AssessmentAnswers {
  goal: string[];
  history: string;
  gender: 'male' | 'female' | '';
  age: number | '';
  height_cm: number | '';
  weight_kg: number | '';
  eating_out: string;
  sugar_snacking: string;
  afternoon_energy: string;
  sleep_quality: string;
  activity_level: string;
  readiness: string;
}

export interface ContactInfo {
  nickname: string;
  igUsername: string;
  whatsapp?: string;
  honeypot?: string;
}

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';

export interface SubScores {
  nutrition: number;
  energy: number;
  recovery: number;
  activity: number;
}

export interface AnalysisResult {
  bmi: number;
  bmiCategory: string;
  proteinRange: string;
  overallScore: number;
  subScores: SubScores;
  insights: string[];
  leadPriority: LeadPriority;
}

export interface SubmissionPayload {
  submittedAt: string;
  appVersion: string;
  contact: ContactInfo;
  answers: AssessmentAnswers;
  analysis: AnalysisResult;
  source: 'instagram-bio' | 'direct';
}
