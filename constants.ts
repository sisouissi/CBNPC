
import { Step, G8Question, G8AnswerKey, TNMOption, StepId } from './types';
import { User, Stethoscope, Activity, CheckCircle, Layers, Calculator } from 'lucide-react';

export const STEPS: Step[] = [
  { id: StepId.Evaluation, title: 'Évaluation Patient', icon: User },
  { id: StepId.Staging, title: 'Stadification (TNM)', icon: Stethoscope },
  { id: StepId.Treatment, title: 'Informations Traitement', icon: Activity },
  { id: StepId.Results, title: 'Recommandations', icon: CheckCircle },
];

export const G8_QUESTIONS: G8Question[] = [
  {
    key: G8AnswerKey.Appetite,
    question: 'Le patient a-t-il perdu l\'appétit ? A-t-il mangé moins ces 3 derniers mois par manque d\'appétit, problèmes digestifs, difficultés de mastication ou de déglutition ?',
    options: [
      { value: '0', label: 'Perte d\'appétit sévère' },
      { value: '1', label: 'Perte d\'appétit modérée' },
      { value: '2', label: 'Pas de perte d\'appétit' },
    ],
  },
  {
    key: G8AnswerKey.WeightLoss,
    question: 'Perte de poids récente (< 3 mois)',
    options: [
      { value: '0', label: 'Perte de poids > 3 kg' },
      { value: '1', label: 'Ne sait pas' },
      { value: '2', label: 'Perte de poids entre 1 et 3 kg' },
      { value: '3', label: 'Pas de perte de poids' },
    ],
  },
  {
    key: G8AnswerKey.Mobility,
    question: 'Motricité',
    options: [
      { value: '0', label: 'Du lit au fauteuil' },
      { value: '1', label: 'Autonome à l\'intérieur' },
      { value: '2', label: 'Sort du domicile' },
    ],
  },
  {
    key: G8AnswerKey.Neuropsychological,
    question: 'Problèmes neuropsychologiques',
    options: [
      { value: '0', label: 'Démence ou dépression sévère' },
      { value: '1', label: 'Démence modérée' },
      { value: '2', label: 'Pas de problème psychologique' },
    ],
  },
  {
    key: G8AnswerKey.Bmi,
    question: 'Indice de masse corporelle (poids/(taille)² en kg/m²)',
    options: [
      { value: '0', label: 'IMC < 19' },
      { value: '1', label: 'IMC 19 à < 21' },
      { value: '2', label: 'IMC 21 à < 23' },
      { value: '3', label: 'IMC ≥ 23' },
    ],
  },
  {
    key: G8AnswerKey.Medications,
    question: 'Le patient prend-il plus de 3 médicaments par jour ?',
    options: [
      { value: '0', label: 'Oui' },
      { value: '1', label: 'Non' },
    ],
  },
  {
    key: G8AnswerKey.HealthComparison,
    question: 'Le patient se sent-il en meilleure ou en moins bonne santé que la plupart des personnes de son âge ?',
    options: [
      { value: '0', label: 'Moins bonne' },
      { value: '0.5', label: 'Ne sait pas' },
      { value: '1', label: 'Aussi bonne' },
      { value: '2', label: 'Meilleure' },
    ],
  },
  {
    key: G8AnswerKey.Age, // Corresponds to g8Age in G8Answers
    question: 'Âge (pour score G8)',
    options: [
      { value: '0', label: '> 85 ans' },
      { value: '1', label: '80-85 ans' },
      { value: '2', label: '< 80 ans' },
    ],
  },
];

export const TNM_TUMOR_CHARACTERISTICS_OPTIONS: TNMOption[] = [
  { value: 'bronche-souche', label: 'Envahissement bronche souche (sans carène)' },
  { value: 'plevre-viscerale', label: 'Envahissement plèvre viscérale' },
  { value: 'paroi-thoracique', label: 'Envahissement paroi thoracique' },
  { value: 'mediastin', label: 'Envahissement médiastin' },
  { value: 'nodules-meme-lobe', label: 'Nodules distincts même lobe' },
  { value: 'nodules-autre-lobe-meme-poumon', label: 'Nodules autre lobe même poumon' }
];

export const TNM_LYMPH_NODES_OPTIONS: TNMOption[] = [
  { value: '', label: 'Sélectionner N...' },
  { value: 'N0', label: 'N0 - Pas de métastase ganglionnaire régionale' },
  { value: 'N1', label: 'N1 - Ganglions péri-bronchiques et/ou hilaires homolatéraux' },
  { value: 'N2', label: 'N2 - Ganglions médiastinaux homolatéraux et/ou sous-carénaires' },
  { value: 'N3', label: 'N3 - Ganglions médiastinaux controlatéraux, hilaires controlatéraux, scaléniques ou sus-claviculaires homolatéraux ou controlatéraux' },
];

export const TNM_METASTASES_OPTIONS: TNMOption[] = [
  { value: '', label: 'Sélectionner M...' },
  { value: 'M0', label: 'M0 - Pas de métastase à distance' },
  { value: 'M1a', label: 'M1a - Nodules tumoraux distincts dans un lobe controlatéral ; tumeur avec nodules pleuraux ou péricardiques ou épanchement pleural ou péricardique malin' },
  { value: 'M1b', label: 'M1b - Métastase extra-thoracique unique dans un seul organe' },
  { value: 'M1c', label: 'M1c - Métastases extra-thoraciques multiples dans un ou plusieurs organes' },
];

export const INITIAL_PATIENT_DATA_G8ANSWERS = {
  [G8AnswerKey.Appetite]: '',
  [G8AnswerKey.WeightLoss]: '',
  [G8AnswerKey.Mobility]: '',
  [G8AnswerKey.Neuropsychological]: '',
  [G8AnswerKey.Bmi]: '',
  [G8AnswerKey.Medications]: '',
  [G8AnswerKey.HealthComparison]: '',
  [G8AnswerKey.Age]: '',
};

export const INITIAL_PATIENT_DATA_TNMDETAILS = {
  tumorSize: '',
  tumorCharacteristics: '',
  lymphNodes: '',
  metastases: '',
  calculatedT: '',
  calculatedN: '',
  calculatedM: '',
  finalStage: ''
};

export const ICONS = {
  G8Calculator: Calculator,
  TNMCalculator: Layers,
};

export const PS_OPTIONS: TNMOption[] = [
  { value: '', label: 'Sélectionner PS...' },
  { value: '0', label: '0 - Activité normale' },
  { value: '1', label: '1 - Symptômes légers, capable d\'effectuer des travaux légers' },
  { value: '2', label: '2 - Ambulatoire, incapable de travailler, alité <50% du temps' },
  { value: '3', label: '3 - Symptomatique, alité >50% du temps, soins personnels limités' },
  { value: '4', label: '4 - Alité en permanence, totalement dépendant' },
];

export const STAGE_OPTIONS: TNMOption[] = [
   { value: '', label: 'Sélectionner stade global...' },
   { value: 'I-III', label: 'I-III (Limité)' },
   { value: 'IV', label: 'IV (Métastatique)' },
];

export const RESPONSE_STATUS_OPTIONS: TNMOption[] = [
  { value: '', label: 'Sélectionner statut réponse...' },
  { value: 'naive', label: 'Naïf de traitement (1ère ligne)' },
  { value: 'hautement-sensible', label: 'Hautement sensible (réponse > 3 mois après arrêt C1)' },
  { value: 'sensible', label: 'Sensible (réponse < 3 mois après arrêt C1 ou progression pendant C1 mais réponse initiale)' },
  { value: 'resistant', label: 'Résistant (progression pendant C1)' },
  { value: 'refractaire', label: 'Réfractaire (pas de réponse à C1)' },
];
    