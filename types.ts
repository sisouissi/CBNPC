
import { LucideIcon } from 'lucide-react';

export enum StepId {
  Evaluation = 'evaluation',
  Staging = 'staging',
  Treatment = 'treatment',
  Results = 'results',
}

export enum RecommendationType {
  Warning = 'warning',
  Success = 'success',
  Info = 'info',
}

export enum G8AnswerKey {
  Appetite = 'appetite',
  WeightLoss = 'weightLoss',
  Mobility = 'mobility',
  Neuropsychological = 'neuropsychological',
  Bmi = 'bmi',
  Medications = 'medications',
  HealthComparison = 'healthComparison',
  Age = 'g8Age', // Renamed to avoid conflict with patientData.age
}

export type G8Answers = {
  [K in G8AnswerKey]: string;
};

export interface TNMDetails {
  tumorSize: string;
  tumorCharacteristics: string; // Comma-separated list of characteristics
  lymphNodes: string;
  metastases: string;
  calculatedT: string;
  calculatedN: string;
  calculatedM: string;
  finalStage: string;
}

export interface PatientData {
  age: string;
  ps: string; // Performance Status
  stage: string; // I-III or IV (overall stage, can be refined by TNM)
  extensionBilan: boolean;
  responseStatus: string; // 'naive', 'hautement-sensible', 'sensible', 'resistant', 'refractaire'
  previousTreatment: string; // 'naive' or description of previous treatment
  brainMets: boolean;
  egfrMutation: boolean;
  g8Score: string; // Calculated G8 score
  g8Answers: G8Answers;
  tnmDetails: TNMDetails;
}

export interface Step {
  id: StepId;
  title: string;
  icon: LucideIcon;
}

export interface Recommendation {
  type: RecommendationType;
  category: string;
  text: string;
}

export interface G8QuestionOption {
  value: string;
  label: string;
}

export interface G8Question {
  key: G8AnswerKey;
  question: string;
  options: G8QuestionOption[];
}

export interface TNMOption {
  value: string;
  label: string;
}
    