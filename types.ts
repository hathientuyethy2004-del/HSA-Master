
export enum Section {
  QUANTITATIVE = 'QUANTITATIVE', // Phần 1: Tư duy định lượng
  VERBAL = 'VERBAL',             // Phần 2: Tư duy định tính
  SCIENCE_ENGLISH = 'SCIENCE_ENGLISH' // Phần 3: Khoa học hoặc Tiếng Anh
}

export enum Subject {
  MATH = 'MATH',
  LITERATURE = 'LITERATURE',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  HISTORY = 'HISTORY',
  GEOGRAPHY = 'GEOGRAPHY',
  ENGLISH = 'ENGLISH'
}

export type QuestionType = 'MCQ' | 'FILL_IN';

export enum PracticeMode {
  FULL_EXAM = 'FULL_EXAM',
  FILL_IN_ONLY = 'FILL_IN_ONLY'
}

export interface Question {
  id: string;
  type: QuestionType;
  section: Section;
  subject: Subject;
  context?: string; 
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
}

export interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
}

export interface HistoryRecord {
  id: string;
  date: number;
  section: Section;
  score: number;
  correctCount: number;
  totalQuestions: number;
  analysis?: AnalysisResult;
  mode: PracticeMode;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isFinished: boolean;
  timeLeft: number;
  questions: Question[];
  section: Section;
  selectedSubjects?: Subject[];
  mode: PracticeMode;
  analysis?: AnalysisResult;
}
