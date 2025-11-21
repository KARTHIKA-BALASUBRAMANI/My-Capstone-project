export enum AgentType {
  ARCHITECT = 'ARCHITECT',
  PROFESSOR = 'PROFESSOR',
  EXAMINER = 'EXAMINER',
  NONE = 'NONE'
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  estimatedTime: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  agent?: AgentType; // Which agent generated this
  groundingUrls?: Array<{ title: string; uri: string }>;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export interface AgentState {
  isThinking: boolean;
  currentAgent: AgentType;
  statusMessage: string;
}