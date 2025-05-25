export interface DecisionOption {
  text: string;
  nextId: string;
  value: string; 
}

export interface QuestionNode {
  id: string;
  type: 'question';
  text: string;
  options: DecisionOption[];
}

export interface RecommendationNode {
  id: string;
  type: 'recommendation';
  title: string;
  description: string | ((answers: Answers) => string);
  details?: string;
}

export type TreeNode = QuestionNode | RecommendationNode;

export interface Answers {
  [questionId: string]: string; // Stores the 'value' of the chosen option for each question
  targetSurgicalNode?: string; // Used to carry the intended surgical node after operability assessment
}

export interface HistoryItem {
  nodeId: string; 
  answersSnapshot: Answers; 
}

// --- TNM Questionnaire Types ---
export interface TnmQuestionOption {
  label: string;
  value: string;
}

export interface TnmQuestion {
  id: keyof TnmAnswers;
  label: string;
  type: 'radio' | 'select'; // Could be extended with 'checkbox' for multiple selections if needed
  options: TnmQuestionOption[];
  condition?: (answers: Partial<TnmAnswers>) => boolean; // For conditional questions
}

export interface TnmQuestionCategory {
  title: string;
  questions: TnmQuestion[];
}

export interface TnmAnswers {
  // T - Tumeur
  t_size: 'tis' | 't1a_mi' | 't1a' | 't1b' | 't1c' | 't2a' | 't2b' | 't3_size' | 't4_size' | 'nsp'; // Actual values from select
  t_bronche_souche: 'oui' | 'non' | 'nsp';
  t_plevre_viscerale: 'oui' | 'non' | 'nsp';
  t_atelectasie_pneumonie: 'oui' | 'non' | 'nsp';
  t_nodules_meme_lobe: 'oui' | 'non' | 'nsp'; // T3 characteristic
  t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde: 'oui' | 'non' | 'nsp'; // T3 characteristic (can include Pancoast-like T3)
  t_nodules_diff_lobe_meme_poumon: 'oui' | 'non' | 'nsp'; // T4 characteristic
  t_envahissement_mediastin_coeur_vaisseaux_trachee_carene_diaphragme_nerfrecurent_oesophage_vertebres: 'oui' | 'non' | 'nsp'; // T4 characteristic

  // N - Adénopathies
  n_status: 'n0' | 'n1' | 'n2' | 'n3' | 'nx' | 'nsp';
  n2_site_status: 'unisite' | 'multisite' | 'nsp'; 
  n2_bulky_status: 'oui' | 'non' | 'nsp'; 

  // M - Métastases
  m_status: 'm0' | 'm1a' | 'm1b' | 'm1c' | 'nsp';
}

export const initialTnmAnswers: TnmAnswers = {
  t_size: 'nsp',
  t_bronche_souche: 'nsp',
  t_plevre_viscerale: 'nsp',
  t_atelectasie_pneumonie: 'nsp',
  t_nodules_meme_lobe: 'nsp',
  t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde: 'nsp',
  t_nodules_diff_lobe_meme_poumon: 'nsp',
  t_envahissement_mediastin_coeur_vaisseaux_trachee_carene_diaphragme_nerfrecurent_oesophage_vertebres: 'nsp',
  n_status: 'nsp',
  n2_site_status: 'nsp',
  n2_bulky_status: 'nsp',
  m_status: 'nsp',
};

export interface StageDetail {
  stage: string; 
  group: string; 
  rawT: string;
  rawN: string;
  rawM: string;
  isResectableTumor?: boolean; 
  resectabilityStatus: 'Résécable' | 'Potentiellement résécable' | 'Non résécable' | 'Non applicable (M1 ou Tis/Occulte)';
}