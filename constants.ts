import { TreeNode, Answers } from './types';

export const APP_TITLE = "Aide à la décision médicale en oncologie thoracique";
export const DEVELOPER_NAME = "Dr. Zouhair Souissi";
export const SOURCE_REFERENCE = "Référentiels Auvergne Rhône-Alpes en oncologie thoracique 2025";
export const SOURCE_REFERENCE_URL = "https://www.aura-onco.fr/referentiels/";

export const INITIAL_NODE_ID: string | null = null; 
export const MAX_DECISION_STEPS = 12; // Increased to accommodate operability assessment

export const DECISION_TREE_DATA: Record<string, TreeNode> = {
  'R_OCCULT_IN_SITU': {
    id: 'R_OCCULT_IN_SITU',
    type: 'recommendation',
    title: 'Carcinome Occulte / Stade 0 (Tis N0 M0)',
    description: 'Prise en charge spécifique pour carcinome occulte ou in situ.\nConsulter le référentiel complet pour les options de traitement (ex: surveillance, résection endoscopique, chirurgie limitée).\n\nOptions typiques pour Carcinome In Situ (Tis N0 M0) :\n- Surveillance étroite.\n- Résection endoscopique (photothérapie dynamique, électrocoagulation, cryothérapie, etc.).\n- Chirurgie limitée (ex: segmentectomie ou résection atypique) pour lésions accessibles.',
    details: 'Cette application ne détaille pas toutes les nuances de cette prise en charge spécifique. Une discussion RCP est recommandée.'
  },

  'Q_STAGE_IV_DISPATCHER': {
    id: 'Q_STAGE_IV_DISPATCHER',
    type: 'question',
    text: 'Stade IV Calculé. Veuillez préciser le statut moléculaire ou l\'histologie :',
    options: [
      { text: 'Mutation EGFR activatrice connue', value: 'egfr_known', nextId: 'FIG15_Q1_EGFR_MUTATION_TYPE' },
      { text: 'Réarrangement ALK connu', value: 'alk_known', nextId: 'FIG16_Q1_ALK_INITIAL_STATUS' },
      { text: 'Carcinome NON épidermoïde (EGFR/ALK WT ou inconnu)', value: 'hist_non_epidermoid', nextId: 'FIG12_Q1_PDL1_STATUS' },
      { text: 'Carcinome ÉPIDEMOÏDE (EGFR/ALK WT ou inconnu)', value: 'hist_epidermoid', nextId: 'FIG13_Q1_PDL1_STATUS' },
      { text: 'Autre / Incertain', value: 'other_uncertain_stage4', nextId: 'ERROR_NODE' }, 
    ]
  },

  // --- New Operability Assessment Mini-Tree ---
  'Q_OPERABILITY_VEMS_DLCO': {
    id: 'Q_OPERABILITY_VEMS_DLCO',
    type: 'question',
    text: 'Bilan d\'opérabilité : VEMS et DLCO (évalués en % de la valeur théorique) ?',
    options: [
      { text: 'VEMS ET DLCO > 80%', value: 'vems_dlco_gt80', nextId: 'Q_OPERABILITY_CARDIAC_COMORBID' },
      { text: 'Au moins un des deux < 80%', value: 'vems_dlco_lt80', nextId: 'Q_OPERABILITY_VO2MAX' },
      { text: 'Données non disponibles / Incertain', value: 'unknown', nextId: 'R_OPERABILITY_DISCUSSION_RCP' }, // Or point to a more general "discuss in RCP"
    ],
  },
  'Q_OPERABILITY_VO2MAX': {
    id: 'Q_OPERABILITY_VO2MAX',
    type: 'question',
    text: 'Bilan d\'opérabilité : Résultat du test d\'effort avec mesure de la VO2 max ?',
    options: [
      { text: 'VO2 max > 75% (> 20 ml/kg/min)', value: 'vo2max_gt75', nextId: 'Q_OPERABILITY_CARDIAC_COMORBID' },
      { text: '35% < VO2 max < 75% (10-20 ml/kg/min)', value: 'vo2max_35_75', nextId: 'R_OPERABILITY_DISCUSSION_RCP' }, // Simplified: leads to RCP discussion
      { text: 'VO2 max < 35% (< 10 ml/kg/min)', value: 'vo2max_lt35', nextId: 'R_PATIENT_INOPERABLE_FONCTIONNEL_RESP' },
      { text: 'Test non réalisé / Incertain', value: 'unknown_vo2max', nextId: 'R_OPERABILITY_DISCUSSION_RCP' },
    ],
  },
  'Q_OPERABILITY_CARDIAC_COMORBID': {
    id: 'Q_OPERABILITY_CARDIAC_COMORBID',
    type: 'question',
    text: 'Bilan d\'opérabilité : Le patient présente-t-il des facteurs de risque cardiaque majeurs (Tableau 4: Créat. >176µmol/L, cardiopathie ischémique, maladie cérébrovasculaire) OU une pneumonectomie est-elle envisagée AVEC un score de risque cardiaque jugé élevé (ex: >1 selon Tableau 4) OU d\'autres comorbidités sévères contre-indiquant la chirurgie ?',
    options: [
      { text: 'Oui (Risque élevé / Contre-indication majeure)', value: 'risque_eleve_ci', nextId: 'R_PATIENT_INOPERABLE_CARDIAQUE_COMORB' },
      { text: 'Non (Risque acceptable / Pas de CI majeure)', value: 'risque_acceptable', nextId: 'R_PATIENT_OPERABLE_FINAL' }, // This will be intercepted by the hook
    ],
  },
  'R_PATIENT_OPERABLE_FINAL': {
    id: 'R_PATIENT_OPERABLE_FINAL',
    type: 'recommendation',
    title: 'Patient Jugé Opérable Cliniquement',
    description: 'Le bilan d\'opérabilité suggère que le patient est apte à la chirurgie.\nRedirection vers les options thérapeutiques chirurgicales spécifiques à son stade TNM.',
    details: 'La décision finale de l\'intervention et son type exact restent sous la responsabilité de l\'équipe médico-chirurgicale en RCP.'
  },
  'R_PATIENT_INOPERABLE_FONCTIONNEL_RESP': {
    id: 'R_PATIENT_INOPERABLE_FONCTIONNEL_RESP',
    type: 'recommendation',
    title: 'Patient Jugé Inopérable (Fonction Respiratoire)',
    description: (answers) => `Le patient est jugé inopérable sur le plan fonctionnel respiratoire.\nPour un ${answers.calculatedStageGroup || 'stade précoce'}, envisager options non chirurgicales à visée curative (ex: Radiothérapie Stéréotaxique).\nPour un ${answers.calculatedStageGroup || 'stade plus avancé'}, discuter en RCP les alternatives (ex: Radio-chimiothérapie si Stade III).`,
    details: 'Redirection vers FIG8_R_INOPERABLE ou FIG10_Q1_PS_AGE selon le stade TNM initial.'
  },
    'R_PATIENT_INOPERABLE_CARDIAQUE_COMORB': {
    id: 'R_PATIENT_INOPERABLE_CARDIAQUE_COMORB',
    type: 'recommendation',
    title: 'Patient Jugé Inopérable (Risque Cardiaque / Comorbidités)',
    description: (answers) => `Le patient est jugé inopérable en raison de risques cardiaques élevés ou de comorbidités majeures.\nPour un ${answers.calculatedStageGroup || 'stade précoce'}, envisager options non chirurgicales à visée curative (ex: Radiothérapie Stéréotaxique).\nPour un ${answers.calculatedStageGroup || 'stade plus avancé'}, discuter en RCP les alternatives (ex: Radio-chimiothérapie si Stade III).`,
    details: 'Redirection vers FIG8_R_INOPERABLE ou FIG10_Q1_PS_AGE selon le stade TNM initial.'
  },
  'R_OPERABILITY_DISCUSSION_RCP': {
    id: 'R_OPERABILITY_DISCUSSION_RCP',
    type: 'recommendation',
    title: 'Bilan d\'Opérabilité Incomplet ou Limite',
    description: 'Les données du bilan d\'opérabilité sont incomplètes, incertaines ou limites.\nUne discussion approfondie en Réunion de Concertation Pluridisciplinaire (RCP) est indispensable pour évaluer le rapport bénéfice/risque d\'une chirurgie et envisager d\'éventuels examens complémentaires (ex: scintigraphie pulmonaire de ventilation/perfusion, estimation VEMS/DLCO post-opératoire).',
    details: 'La décision d\'opérabilité ne peut être finalisée avec les informations actuelles.'
  },
  // --- End of Operability Assessment ---

  'FIG8_Q1_OPERABLE': { 
    id: 'FIG8_Q1_OPERABLE',
    type: 'question',
    text: 'Patient opérable ? (Note: l\'opérabilité est généralement inférée pour le Stade I)',
    options: [
      { text: 'Oui, opérable', value: 'operable_oui', nextId: 'FIG8_Q2_CHIRURGIE_TYPE' },
      { text: 'Non, inopérable', value: 'operable_non', nextId: 'FIG8_R_INOPERABLE' },
    ],
  },
  'FIG8_Q2_CHIRURGIE_TYPE': {
    id: 'FIG8_Q2_CHIRURGIE_TYPE',
    type: 'question', 
    text: 'Chirurgie Indiquée pour Stade I (confirmé résécable par bilan TNM et opérable par bilan clinique).\n\nRecommandation: Lobectomie avec curage ganglionnaire OU segmentectomie pour les tumeurs de moins de 2cm et sous certaines conditions.\n\nProchaine étape: Évaluation de l\'exérèse post-chirurgie.',
    options: [ 
        { text: 'Évaluer l\'exérèse post-chirurgie', value: 'eval_exerese', nextId: 'FIG8_Q3_EXERESE_COMPLETE'}
    ]
  },
  'FIG8_Q3_EXERESE_COMPLETE': {
    id: 'FIG8_Q3_EXERESE_COMPLETE',
    type: 'question',
    text: 'Résultat de la chirurgie ?',
    options: [
      { text: 'Exérèse complète, pTis, pT1a-c N0 (Stade pIA)', value: 'complete_pIA', nextId: 'FIG8_R_SURVEILLANCE' },
      { text: 'Exérèse complète, pT2a, N0 (Stade pIB)', value: 'complete_pIB', nextId: 'FIG8_Q4_EGFR_pIB' },
      { text: 'Découverte pN1/N2 post op', value: 'pN1N2_postop', nextId: 'FIG8_R_PN1N2_POSTOP' },
      { text: 'Exérèse incomplète R1/Run', value: 'incomplete_R1Run', nextId: 'FIG8_R_INCOMPLETE_R1RUN' },
      { text: 'Exérèse incomplète R2', value: 'incomplete_R2', nextId: 'FIG8_R_INCOMPLETE_R2' },
    ],
  },
  'FIG8_R_INOPERABLE': {
    id: 'FIG8_R_INOPERABLE',
    type: 'recommendation',
    title: 'Patient Inopérable (Stade I-II Clinique) ou Tumeur Non Résécable Stade I-II',
    description: 'Le traitement de référence est la Radiothérapie stéréotaxique (SBRT) à visée curative.\nOption alternative pour petites tumeurs périphériques (<3cm) : Thermo-ablation (par exemple, radiofréquence, micro-ondes), à discuter en RCP.\nConsulter le référentiel pour les schémas de SBRT spécifiques (page 34-35 du guide).',
    details: 'Basé sur le bilan TNM initial ou le bilan d\'opérabilité.'
  },
  'FIG8_R_SURVEILLANCE': {
    id: 'FIG8_R_SURVEILLANCE',
    type: 'recommendation',
    title: 'Surveillance Simple Post-Chirurgie (Stade pIA)',
    description: 'Surveillance simple. Se référer au Tableau 12 du guide pour les modalités de surveillance.',
  },
  'FIG8_Q4_EGFR_pIB': {
    id: 'FIG8_Q4_EGFR_pIB',
    type: 'question',
    text: 'Mutation EGFR (Del19, L858R) présente ? (Pour pT2a,N0 - Stade pIB)',
    options: [
      { text: 'Oui', value: 'egfr_oui', nextId: 'FIG8_R_OSIMERTINIB_3ANS' },
      { text: 'Non', value: 'egfr_non', nextId: 'FIG8_R_SURVEILLANCE' },
    ],
  },
  'FIG8_R_OSIMERTINIB_3ANS': {
    id: 'FIG8_R_OSIMERTINIB_3ANS',
    type: 'recommendation',
    title: 'Traitement Adjuvant pour Stade pIB EGFR muté',
    description: 'Traitement adjuvant par Osimertinib (Tagrisso®) pendant 3 ans, à la dose de 80 mg une fois par jour.\nCette recommandation est basée sur l\'étude ADAURA pour les stades IB-IIIA réséqués avec mutation EGFR.',
  },
  'FIG8_R_PN1N2_POSTOP': {
    id: 'FIG8_R_PN1N2_POSTOP',
    type: 'recommendation',
    title: 'Découverte pN1/N2 Post-Op',
    description: 'La découverte d\'une atteinte ganglionnaire pN1 ou pN2 en post-opératoire reclasse le patient.\nRéorienter vers l\'évaluation et la prise en charge d\'un Stade II ou III (voir Figure 9 et suivantes).\nUne discussion RCP est indispensable pour définir la stratégie adjuvante optimale (chimiothérapie, thérapie ciblée si applicable).',
    details: 'Consulter le référentiel pour les options adjuvantes des stades pN1/pN2.'
  },
  'FIG8_R_INCOMPLETE_R1RUN': {
    id: 'FIG8_R_INCOMPLETE_R1RUN',
    type: 'recommendation',
    title: 'Exérèse Incomplète R1/Run',
    description: 'Une exérèse R1 (marges microscopiquement atteintes) ou Run (marges incertaines, ex: carcinome in situ sur tranche) nécessite une Discussion RCP pour déterminer la meilleure stratégie:\n- Reprise chirurgicale si possible.\n- Radiothérapie adjuvante sur le lit tumoral.\n- Chimiothérapie adjuvante (selon le stade pTNM final).',
  },
  'FIG8_R_INCOMPLETE_R2': {
    id: 'FIG8_R_INCOMPLETE_R2',
    type: 'recommendation',
    title: 'Exérèse Incomplète R2',
    description: 'Une exérèse R2 (marges macroscopiquement atteintes) indique une maladie résiduelle importante.\nLa stratégie standard est une Radio-chimiothérapie concomitante (similaire à la prise en charge d\'un stade IIIA non résécable).\nUne discussion RCP est indispensable.',
  },

  'FIG9_Q1_CATEGORY': { 
    id: 'FIG9_Q1_CATEGORY',
    type: 'question',
    text: 'Situation clinique pour Stades cII à cIIIB (TNM8) ? (Calculé comme Stade IIIA, résécabilité à confirmer)',
    options: [
      { text: 'Non éligibles à la chirurgie (Stades III - ex: IIIB/IIIC non résécable)', value: 'non_eligible_chir_st3', nextId: 'FIG10_Q1_PS_AGE' }, 
      { text: 'Résécable et opérable (Stade II et certains Stades IIIA - confirmé après évaluation multidisciplinaire et bilan d\'opérabilité)', value: 'resecable_operable', nextId: 'FIG9_Q2_MOLECULAR_RESECABLE' },
    ],
  },
  'FIG9_R_NON_OPERABLE_ST2': { 
    id: 'FIG9_R_NON_OPERABLE_ST2',
    type: 'recommendation',
    title: 'Non Opérable (Stades II - Patient inopérable cliniquement)',
    description: 'Radiothérapie en conditions stéréotaxiques. (Voir FIG8_R_INOPERABLE pour plus de détails)',
  },
  'FIG9_R_NON_ELIGIBLE_CHIR_ST3': {
    id: 'FIG9_R_NON_ELIGIBLE_CHIR_ST3',
    type: 'recommendation',
    title: 'Non Éligibles à la Chirurgie (Stades III non résécables)',
    description: 'Redirection vers l\'algorithme des stades III non résécables (voir Figure 10 à partir de FIG10_Q1_PS_AGE).',
  },
  'FIG9_Q2_MOLECULAR_RESECABLE': { 
    id: 'FIG9_Q2_MOLECULAR_RESECABLE',
    type: 'question',
    text: 'Patient résécable et opérable (Stade II ou IIIA déterminé par bilan TNM et bilan d\'opérabilité). Profil moléculaire et PDL1 ?',
    options: [
      { text: 'PDL1 <1% (EGFR/ALK WT)', value: 'pdl1_neg_wt', nextId: 'FIG9_RESEC_PDL1_NEG_WT' },
      { text: 'EGFR Del19/L858R', value: 'egfr_mut', nextId: 'FIG9_RESEC_EGFR_MUT' },
      { text: 'ALK réarrangé', value: 'alk_rearranged', nextId: 'FIG9_RESEC_ALK' },
      { text: 'PDL1 ≥ 1% (EGFR et ALK WT)', value: 'pdl1_pos_wt', nextId: 'FIG9_RESEC_PDL1_POS_WT' },
    ],
  },
  'FIG9_RESEC_PDL1_NEG_WT': {
    id: 'FIG9_RESEC_PDL1_NEG_WT',
    type: 'recommendation',
    title: 'Stade II-IIIA Résécable & Opérable, PDL1<1% (EGFR/ALK WT)',
    description: 'Option: Chimiothérapie pré-opératoire.\nChirurgie.\nEn l\'absence de traitement pré-opératoire: Chimiothérapie adjuvante Cisplatine + Vinorelbine x4.\nOptions (adjuvantes alternatives): cisplatine-pemetrexed 4 cycles dans les non-épidermoïdes; carboplatine paclitaxel si CI au cisplatine vinorelbine.',
  },
  'FIG9_RESEC_EGFR_MUT': {
    id: 'FIG9_RESEC_EGFR_MUT',
    type: 'recommendation',
    title: 'Stade II-IIIA Résécable & Opérable, EGFR Del19/L858R',
    description: 'Option: Chimiothérapie pré-opératoire.\nChirurgie.\nEn l\'absence de traitement pré-opératoire: Chimiothérapie adjuvante Cisplatine + Vinorelbine x4.\nOptions (adjuvantes alternatives): cisplatine-pemetrexed 4 cycles dans les non-épidermoïdes; carboplatine paclitaxel si CI au cisplatine vinorelbine.\nSUIVI DE: Osimertinib 3 ans (conformément à l\'étude ADAURA).',
  },
  'FIG9_RESEC_ALK': {
    id: 'FIG9_RESEC_ALK',
    type: 'recommendation',
    title: 'Stade II-IIIA Résécable & Opérable, ALK réarrangé',
    description: 'Chirurgie.\nSUIVI DE: Alectinib 2 ans (conformément à l\'étude ALINA).',
  },
  'FIG9_RESEC_PDL1_POS_WT': {
    id: 'FIG9_RESEC_PDL1_POS_WT',
    type: 'recommendation',
    title: 'Stade II-IIIA Résécable & Opérable, PDL1≥1% (EGFR/ALK WT)',
    description: 'Chimio-immunothérapie préopératoire: 3 cycles de nivolumab et chimiothérapie à base de sels de platine en AAP (Accès Précoce Post-AMM).\nChirurgie.\nEn l\'absence de traitement pré-opératoire: Chimiothérapie adjuvante Cisplatine + Vinorelbine 4 cycles.\nOptions (adjuvantes alternatives): cisplatine-pemetrexed 4 cycles dans les non-épidermoïdes; carboplatine paclitaxel si CI au cisplatine vinorelbine.',
  },

  // --- STADES CLINIQUES IIIA-IIIB non éligibles à la chirurgie et IIIC (TNM8) ---
  'FIG10_Q1_PS_AGE': {
    id: 'FIG10_Q1_PS_AGE',
    type: 'question',
    text: 'Performance Status (PS) et Âge du patient (Stades IIIA non résécable, IIIB, IIIC, ou Stades I/II jugés inopérables après bilan) ?',
    options: [
      { text: 'PS 0/1, Âge ≤ 70ans (Option: <75 ans)', value: 'ps01_age_le70', nextId: 'FIG10_PS01_AGE_LE70' },
      { text: 'PS 2 ou Âge > 70ans', value: 'ps2_age_gt70', nextId: 'FIG10_PS2_AGE_GT70' },
    ],
  },
  // ... (rest of FIG10, FIG11, FIG12, FIG13, FIG14, FIG15, FIG16, TAB12 nodes remain largely the same)
  // ... (ensure their entry points are correctly linked from the new operability assessment outcomes or from determineNextNodeIdFromTnm)
  
    'FIG10_PS01_AGE_LE70': {
    id: 'FIG10_PS01_AGE_LE70',
    type: 'question',
    text: 'Traitement initial pour PS 0/1, Âge ≤ 70ans: Association chimio-radiothérapie concomitante (cisplatine vinorelbine OU carboplatine paclitaxel).\nÉtape suivante: Évaluer la progression post-traitement.',
    options: [
        { text: 'Continuer à l\'évaluation post Radio-Chimiothérapie', value: 'continue_post_rct', nextId: 'FIG10_Q2_POST_RCT_PROGRESSION' }
    ]
  },
  'FIG10_PS2_AGE_GT70': {
    id: 'FIG10_PS2_AGE_GT70',
    type: 'question',
    text: 'Traitement initial pour PS 2 ou Âge > 70ans: Association chimio-radiothérapie séquentielle (carboplatine paclitaxel).\nÉtape suivante: Évaluer la progression post-traitement.',
     options: [
        { text: 'Continuer à l\'évaluation post Radio-Chimiothérapie', value: 'continue_post_rct', nextId: 'FIG10_Q2_POST_RCT_PROGRESSION' }
    ]
  },
  'FIG10_Q2_POST_RCT_PROGRESSION': {
    id: 'FIG10_Q2_POST_RCT_PROGRESSION',
    type: 'question',
    text: 'État après radio-chimiothérapie ?',
    options: [
      { text: 'Non progressif après radio-chimiothérapie ET PS≤1', value: 'non_progressif_ps_le1', nextId: 'FIG10_Q3_MOLECULAR_POST_RCT' },
      { text: 'Progressif OU PS > 1', value: 'progressif_ps_gt1', nextId: 'FIG10_R_PROGRESSIF_POST_RCT' },
    ],
  },
  'FIG10_R_PROGRESSIF_POST_RCT': {
      id: 'FIG10_R_PROGRESSIF_POST_RCT',
      type: 'recommendation',
      title: 'Progression ou PS > 1 Post Radio-Chimiothérapie',
      description: 'Prise en charge à discuter (ex: soins de support, ligne ultérieure si éligible).',
      details: 'Consulter le référentiel pour les options spécifiques.'
  },
  'FIG10_Q3_MOLECULAR_POST_RCT': {
    id: 'FIG10_Q3_MOLECULAR_POST_RCT',
    type: 'question',
    text: 'Statut moléculaire (après RCT non progressive, PS≤1) ?',
    options: [
      { text: 'EGFR Del19/L858R', value: 'egfr_mut', nextId: 'FIG10_R_OSIMERTINIB_POST_RCT' },
      { text: 'EGFR et ALK WT', value: 'egfr_alk_wt', nextId: 'FIG10_R_DURVALUMAB' },
    ],
  },
  'FIG10_R_OSIMERTINIB_POST_RCT': {
    id: 'FIG10_R_OSIMERTINIB_POST_RCT',
    type: 'recommendation',
    title: 'Post RCT, EGFR Del19/L858R',
    description: 'Osimertinib jusque progression ou toxicité.',
  },
  'FIG10_R_DURVALUMAB': {
    id: 'FIG10_R_DURVALUMAB',
    type: 'recommendation',
    title: 'Post RCT, EGFR et ALK WT',
    description: 'Durvalumab 12 mois (CPC pour les PDL1<1% et inconnus).\nEn cas de contre-indication ou inéligibilité au durvalumab: Surveillance.',
  },
  
  'FIG11_Q1_CN_RESECABLE': { // Entry point for Tumeurs de l'Apex T3/T4 PS 0-2 if TNM suggests potential resectability
    id: 'FIG11_Q1_CN_RESECABLE',
    type: 'question',
    text: 'Tumeur de l\'Apex (T3, T4 / PS 0-2) jugée "potentiellement résécable" par TNM et opérable par bilan clinique. Statut ganglionnaire (cN) et confirmation de résécabilité après discussion RCP?',
    options: [
      { text: 'cN0/1 et Confirmé Résécable en RCP', value: 'cn01_resec_oui', nextId: 'FIG11_R_CN01_RESEC_OUI'},
      { text: 'cN0/1 mais Jugé NON Résécable en RCP / Inconnu', value: 'cn01_resec_non_inconnu', nextId: 'FIG11_TRT_INDUCDION_APEX'}, // Merged non-resec and inconnu for Apex
      { text: 'cN2-3 irradiable (et donc non résécable pour Apex)', value: 'cn23_irradiable', nextId: 'FIG11_R_CN23_IRRADIABLE'},
    ]
  },
  'FIG11_R_CN01_RESEC_OUI': {
    id: 'FIG11_R_CN01_RESEC_OUI',
    type: 'recommendation',
    title: 'Tumeur Apex: cN0/1 et Résécable',
    description: 'Options: Chimio-immunothérapie préopératoire: 3 cycles de nivolumab et chimiothérapie à base de sels de platine en AAP.\nChirurgie.\nEn l\'absence de traitement pré-opératoire: Chimiothérapie adjuvante Cisplatine + Vinorelbine x4.'
  },
  'FIG11_TRT_INDUCDION_APEX': { // Combines paths for cN0/1 non-resec and Inconnu from original Fig 11
    id: 'FIG11_TRT_INDUCDION_APEX',
    type: 'question',
    text: 'Prise en charge pour Tumeur de l\'Apex (cN0/1 non résécable ou statut inconnu): Radiothérapie 46 Gy + Chimiothérapie concomitante.\nÉvaluer la résécabilité post-induction:',
    options: [
      {text: 'Résécable post-induction', value: 'resec_post_induc', nextId: 'FIG11_R_POST_INDUC_RESECABLE'},
      {text: 'NON résécable post-induction', value: 'nonresec_post_induc', nextId: 'FIG11_R_POST_INDUC_NONRESECABLE'},
    ]
  },
  'FIG11_R_POST_INDUC_RESECABLE': {
    id: 'FIG11_R_POST_INDUC_RESECABLE',
    type: 'recommendation',
    title: 'Post-Induction Tumeur Apex: Résécable',
    description: 'Chirurgie.\nOptions: Poursuite chimiothérapie, Poursuite radiothérapie.'
  },
  'FIG11_R_POST_INDUC_NONRESECABLE': {
    id: 'FIG11_R_POST_INDUC_NONRESECABLE',
    type: 'recommendation',
    title: 'Post-Induction Tumeur Apex: NON Résécable',
    description: 'Options: Poursuite radiothérapie, Poursuite chimiothérapie, 2ème ligne chimiothérapie.'
  },
  'FIG11_R_CN23_IRRADIABLE': {
    id: 'FIG11_R_CN23_IRRADIABLE',
    type: 'recommendation',
    title: 'Tumeur Apex: cN2-3 Irradiable',
    description: 'Cf. Algorithmes stades IIIA-IIIC (non résécables) -> FIG10_Q1_PS_AGE.'
  },

  'FIG12_Q0_HISTO_CONFIRM' : {
    id: 'FIG12_Q0_HISTO_CONFIRM',
    type: 'question',
    text: 'Confirmez-vous un carcinome NON épidermoïde SANS altération ciblable connue (Stade IV, 1ère ligne)?',
    options: [
      { text: 'Oui, confirmé', value: 'oui_confirme', nextId: 'FIG12_Q1_PDL1_STATUS' },
      { text: 'Non / Incertain', value: 'non_incertain', nextId: 'Q_STAGE_IV_DISPATCHER' }, 
    ],
  },
  'FIG12_Q1_PDL1_STATUS': {
    id: 'FIG12_Q1_PDL1_STATUS',
    type: 'question',
    text: 'Statut PD-L1 (Non-Épidermoïde, Stade IV, 1ère ligne) ?',
    options: [
      { text: 'PD-L1 ≥ 50%', value: 'pdl1_ge50', nextId: 'FIG12_Q2_PS_PDL1_GE50' },
      { text: 'PD-L1 < 50%', value: 'pdl1_lt50', nextId: 'FIG12_Q3_PS_PDL1_LT50' },
      { text: 'PS > 2', value: 'ps_gt2', nextId: 'FIG12_R_SOINS_SUPPORT' },
    ],
  },
  'FIG12_Q2_PS_PDL1_GE50': { id: 'FIG12_Q2_PS_PDL1_GE50', type: 'question', text: 'Performance Status (PS) et Âge (PD-L1 ≥ 50%) ?', options: [ { text: 'PS 0-1', value: 'ps01', nextId: 'FIG12_R_PDL1_GE50_PS01' }, { text: 'PS 2', value: 'ps2', nextId: 'FIG12_R_PDL1_GE50_PS2' },  { text: 'Âge ≥ 70 ans', value: 'age_ge70', nextId: 'FIG12_R_PDL1_GE50_AGE_GE70' }, ] },
  'FIG12_R_PDL1_GE50_PS01': { id: 'FIG12_R_PDL1_GE50_PS01', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1≥50%, PS 0-1', description: '- Atezolizumab²\n- Cemiplimab²\n- Pembrolizumab²\n- Platine-Pemetrexed¹-Pembrolizumab²\n\nSi contre-indication aux options ci-dessus, envisager options pour PS2.', details: '1. Suivie d\'une maintenance de continuation après 4 cycles de platine jusqu\'à progression ou toxicité inacceptable (en option pour gemcitabine).\n2. Poursuivie jusqu\'à progression, toxicité inacceptable, ou jusque 2 ans.\n*Option: Double maintenance de continuation par bevacizumab-pemetrexed jusqu\'à progression ou toxicité inacceptable.' },
  'FIG12_R_PDL1_GE50_PS2': { id: 'FIG12_R_PDL1_GE50_PS2', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1≥50%, PS 2 (ou CI aux options PS0-1)', description: '- Carboplatine paclitaxel (J1/22 ou hebdo)\n- Carboplatine pemetrexed\n- Carboplatine gemcitabine', details: 'Se référer aux notes 1, 2, * précédentes si applicable.' },
  'FIG12_R_PDL1_GE50_AGE_GE70': { id: 'FIG12_R_PDL1_GE50_AGE_GE70', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1≥50%, Âge ≥ 70 ans', description: '- Carboplatine - paclitaxel hebdomadaire\n- Si PS 0-1: atezolizumab, cemiplimab ou pembrolizumab²\n- Patients sélectionnés avec PS 0-1: Carboplatine-pemetrexed¹-pembrolizumab²', details: 'Se référer aux notes 1, 2, * précédentes si applicable.' },
  'FIG12_Q3_PS_PDL1_LT50': { id: 'FIG12_Q3_PS_PDL1_LT50', type: 'question', text: 'Performance Status (PS) et Âge (PD-L1 < 50%) ?', options: [ { text: 'PS 0-1', value: 'ps01', nextId: 'FIG12_R_PDL1_LT50_PS01' }, { text: 'PS 2', value: 'ps2', nextId: 'FIG12_R_PDL1_LT50_PS2' },  { text: 'Âge ≥ 70 ans', value: 'age_ge70', nextId: 'FIG12_R_PDL1_LT50_AGE_GE70' }, ] },
   'FIG12_R_PDL1_LT50_PS01': { id: 'FIG12_R_PDL1_LT50_PS01', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1<50%, PS 0-1', description: '- Platine-Pemetrexed¹-Pembrolizumab²\n\nSi contre-indication, options pour PS2:\n- cisplatine pemetrexed¹\n- cisplatine vinorelbine\n- cisplatine docetaxel\n- cisplatine gemcitabine¹\n- carboplatine paclitaxel\n- Ajout de bevacizumab*¹', details: '1. Suivie d\'une maintenance... \n2. Poursuivie jusqu\'à... \n*Option: Double maintenance...' },
  'FIG12_R_PDL1_LT50_PS2': { id: 'FIG12_R_PDL1_LT50_PS2', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1<50%, PS 2', description: '- Carboplatine paclitaxel (J1/22 ou hebdo)\n- Carboplatine pemetrexed\n- Carboplatine gemcitabine\nOptions:\n-Monothérapie par gemcitabine, vinorelbine\n-Ajout bevacizumab¹', details: '1. Suivie d\'une maintenance... \n*Option: Double maintenance...' },
  'FIG12_R_PDL1_LT50_AGE_GE70': { id: 'FIG12_R_PDL1_LT50_AGE_GE70', type: 'recommendation', title: 'Non-Épidermoïde, St IV, PD-L1<50%, Âge ≥ 70 ans', description: '- Carboplatine - paclitaxel hebdomadaire\n- Patients sélectionnés avec PS 0-1: Carboplatine-pemetrexed¹-pembrolizumab²\nOptions:\n-Monothérapie\n-Autres doublet à base de platine\n-Ajout de bevacizumab¹', details: '1. Suivie d\'une maintenance... \n2. Poursuivie jusqu\'à... \n*Option: Double maintenance...' },
  'FIG12_R_SOINS_SUPPORT': { id: 'FIG12_R_SOINS_SUPPORT', type: 'recommendation', title: 'PS > 2', description: 'Soins de support.', },

  'FIG13_Q0_HISTO_CONFIRM' : { id: 'FIG13_Q0_HISTO_CONFIRM', type: 'question', text: 'Confirmez-vous un carcinome ÉPIDERMOÏDE SANS altération ciblable connue (Stade IV, 1ère ligne)?', options: [ { text: 'Oui, confirmé', value: 'oui_confirme', nextId: 'FIG13_Q1_PDL1_STATUS' }, { text: 'Non / Incertain', value: 'non_incertain', nextId: 'Q_STAGE_IV_DISPATCHER' },  ], },
   'FIG13_Q1_PDL1_STATUS': {  id: 'FIG13_Q1_PDL1_STATUS', type: 'question', text: 'Statut PD-L1 (Épidermoïde, Stade IV, 1ère ligne) ?', options: [ { text: 'PD-L1 ≥ 50%', value: 'pdl1_ge50', nextId: 'FIG13_Q2_PS_PDL1_GE50' }, { text: 'PD-L1 < 50%', value: 'pdl1_lt50', nextId: 'FIG13_Q3_PS_PDL1_LT50' }, { text: 'PS > 2', value: 'ps_gt2', nextId: 'FIG12_R_SOINS_SUPPORT' },  ], },
  'FIG13_Q2_PS_PDL1_GE50': { id: 'FIG13_Q2_PS_PDL1_GE50', type: 'question', text:'PS et Âge (Épidermoïde, PD-L1 ≥ 50%)?', options: [ {text: 'PS 0-1', value: 'ps01', nextId:'FIG13_R_PDL1_GE50_PS01'}, {text: 'PS 2', value: 'ps2', nextId:'FIG13_R_PDL1_GE50_PS2'}, {text: 'Age ≥ 70', value: 'age_ge70', nextId:'FIG13_R_PDL1_GE50_AGE_GE70'}] },
  'FIG13_R_PDL1_GE50_PS01': {id: 'FIG13_R_PDL1_GE50_PS01', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1≥50%, PS 0-1', description:'-Atezolizumab²\n-Cemiplimab²\n-Pembrolizumab²\n-Carboplatine-paclitaxel-pembrolizumab²\nSi CI: options PS2.', details:'1. Maintenance... 2. Poursuite...'},
  'FIG13_R_PDL1_GE50_PS2': {id: 'FIG13_R_PDL1_GE50_PS2', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1≥50%, PS 2', description:'-Carboplatine paclitaxel (J1/22 ou hebdo)\n-Carboplatine gemcitabine', details:'1. Maintenance... 2. Poursuite...'},
  'FIG13_R_PDL1_GE50_AGE_GE70': {id: 'FIG13_R_PDL1_GE50_AGE_GE70', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1≥50%, Âge ≥70', description:'-Carboplatine paclitaxel hebdomadaire\n-Si PS 0-1: atezo/cemi/pembro²\n-Patients sélectionnés PS 0-1: Carbo-paclitaxel-pembro²', details:'1. Maintenance... 2. Poursuite...'},
  'FIG13_Q3_PS_PDL1_LT50': { id: 'FIG13_Q3_PS_PDL1_LT50', type: 'question', text:'PS et Âge (Épidermoïde, PD-L1 < 50%)?', options: [ {text: 'PS 0-1', value: 'ps01', nextId:'FIG13_R_PDL1_LT50_PS01'}, {text: 'PS 2', value: 'ps2', nextId:'FIG13_R_PDL1_LT50_PS2'}, {text: 'Age ≥ 70', value: 'age_ge70', nextId:'FIG13_R_PDL1_LT50_AGE_GE70'}] },
  'FIG13_R_PDL1_LT50_PS01': {id: 'FIG13_R_PDL1_LT50_PS01', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1<50%, PS 0-1', description:'-Carboplatine-paclitaxel-Pembrolizumab²\nSi CI: options PS2 (cisplatine vinorelbine, cisplatine docetaxel, cisplatine gemcitabine¹, carboplatine paclitaxel)', details:'1. Maintenance... 2. Poursuite...'},
  'FIG13_R_PDL1_LT50_PS2': {id: 'FIG13_R_PDL1_LT50_PS2', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1<50%, PS 2', description:'-Carboplatine paclitaxel (J1/22 ou hebdo)\n-Carboplatine gemcitabine\nOptions: Monothérapie par gemcitabine, vinorelbine', details:'1. Maintenance... 2. Poursuite...'},
  'FIG13_R_PDL1_LT50_AGE_GE70': {id: 'FIG13_R_PDL1_LT50_AGE_GE70', type: 'recommendation', title:'Épidermoïde, St IV, PD-L1<50%, Âge ≥70', description:'-Carboplatine paclitaxel hebdomadaire\n-Patients sélectionnés PS 0-1: Carbo-paclitaxel-pembro²\nOptions: Monothérapie par gemcitabine, vinorelbine; Autres doublet à base de platine', details:'1. Maintenance... 2. Poursuite...'},

  'FIG14_Q1_PREV_TREATMENT': { id: 'FIG14_Q1_PREV_TREATMENT', type: 'question', text: 'Traitement reçu en première ligne (Stade IV, 2nde ligne) ?', options: [ { text: 'Chimiothérapie + Immunothérapie', value: 'chemo_immuno', nextId: 'FIG14_Q2_PS_POST_CHEMOIMMUNO' }, { text: 'Immunothérapie seule', value: 'immuno_seule', nextId: 'FIG14_Q2_PS_POST_IMMUNOSEULE' }, { text: 'Chimiothérapie seule', value: 'chemo_seule', nextId: 'FIG14_R_POST_CHEMOSEULE' }, { text: 'PS > 2', value: 'ps_gt2', nextId: 'FIG12_R_SOINS_SUPPORT' },  { text: 'CMET surexprimé (IHC)?', value: 'cmet_overexpressed', nextId: 'FIG14_R_CMET_TELISOV'} ] },
  'FIG14_Q2_PS_POST_CHEMOIMMUNO': { id: 'FIG14_Q2_PS_POST_CHEMOIMMUNO', type: 'question', text: 'PS après Chimiothérapie + Immunothérapie?', options: [ {text: 'PS 0-1', value: 'ps01', nextId: 'FIG14_R_POST_CHEMOIMMUNO_PS01'}, {text: 'PS 2', value: 'ps2', nextId: 'FIG14_R_POST_CHEMOIMMUNO_PS2'}, ] },
  'FIG14_R_POST_CHEMOIMMUNO_PS01': { id: 'FIG14_R_POST_CHEMOIMMUNO_PS01', type: 'recommendation', title: '2nde Ligne post Chemo+Immuno, PS 0-1', description: 'C. Non-Epidermoïdes:\n -pemetrexed\n -paclitaxel-bevacizumab\nToutes histologies:\n -docetaxel\n -essais cliniques\n -toute autre molécule après avis de la RCP' },
  'FIG14_R_POST_CHEMOIMMUNO_PS2': { id: 'FIG14_R_POST_CHEMOIMMUNO_PS2', type: 'recommendation', title: '2nde Ligne post Chemo+Immuno, PS 2', description: 'Toutes histologies:\n -cisplatine vinorelbine\n -cisplatine docetaxel\n -cisplatine gemcitabine¹\n -carboplatine paclitaxel\nC. Non-Epidermoïdes:\n -cisplatine pemetrexed¹ + bevacizumab*¹', details: '1. Suivie d\'une maintenance...\n*Option: Double maintenance...' },
  'FIG14_Q2_PS_POST_IMMUNOSEULE': { id: 'FIG14_Q2_PS_POST_IMMUNOSEULE', type: 'question', text: 'PS et âge après Immunothérapie seule?', options: [ {text: 'PS 0-1', value: 'ps01', nextId: 'FIG14_R_POST_IMMUNOSEULE_PS01'},  {text: 'PS 2', value: 'ps2', nextId: 'FIG14_R_POST_IMMUNOSEULE_PS2'}, {text: 'Age >= 70 ans', value: 'age_ge70', nextId: 'FIG14_R_POST_IMMUNOSEULE_AGE_GE70'}, ] },
   'FIG14_R_POST_IMMUNOSEULE_PS01': {  id: 'FIG14_R_POST_IMMUNOSEULE_PS01', type: 'recommendation', title: '2nde Ligne post Immuno Seule, PS 0-1', description: 'Options thérapeutiques identiques à celles pour "Post Chemo+Immuno, PS 2":\nToutes histologies:\n -cisplatine vinorelbine\n -cisplatine docetaxel\n -cisplatine gemcitabine¹\n -carboplatine paclitaxel\nC. Non-Epidermoïdes:\n -cisplatine pemetrexed¹ + bevacizumab*¹', details: '1. Suivie d\'une maintenance...\n*Option: Double maintenance...' },
  'FIG14_R_POST_IMMUNOSEULE_PS2': { id: 'FIG14_R_POST_IMMUNOSEULE_PS2', type: 'recommendation', title: '2nde Ligne post Immuno Seule, PS 2', description: 'Toutes histologies:\n -carboplatine paclitaxel (J1/22 ou hebdo)\n -carboplatine gemcitabine\nC. Non-Epidermoïdes:\n -carboplatine pemetrexed\nOptions:\n -Monothérapie par gemcitabine, vinorelbine\n -Ajout bevacizumab¹²', details:'1. Suivie d\'une maintenance...\n2. Uniquement dans les non-épidermoïdes.' },
  'FIG14_R_POST_IMMUNOSEULE_AGE_GE70': { id: 'FIG14_R_POST_IMMUNOSEULE_AGE_GE70', type: 'recommendation', title: '2nde Ligne post Immuno Seule, Age >= 70 ans', description: '-carboplatine - paclitaxel hebdomadaire\nOptions:\n -Monothérapie\n -Autres doublet à base de platine\n -Ajout bevacizumab¹²', details:'1. Suivie d\'une maintenance...\n2. Uniquement dans les non-épidermoïdes.' },
  'FIG14_R_POST_CHEMOSEULE': { id: 'FIG14_R_POST_CHEMOSEULE', type: 'recommendation', title: '2nde Ligne post Chimiothérapie Seule', description: '-atezolizumab\n-nivolumab\n-pembrolizumab si PDL1 ≥ 1%' },
   'FIG14_R_CMET_TELISOV': { id: 'FIG14_R_CMET_TELISOV', type: 'recommendation', title: 'Option pour CMET surexprimé (IHC)', description: 'Option: Teliso-V en AAC' },

  'FIG15_Q1_EGFR_MUTATION_TYPE': { id: 'FIG15_Q1_EGFR_MUTATION_TYPE', type: 'question', text: 'Quel type de mutation EGFR activatrice (Stade Métastatique) ?', options: [ { text: 'G719X, L861Q, S768I, mutations combinées (multiples)', value: 'g719x_etc', nextId: 'FIG15_R_AFATINIB_OPTION_OSI' }, { text: 'L858R et Del-19', value: 'l858r_del19', nextId: 'FIG15_R_OSIMERTINIB_OPTIONS_L858R_DEL19' }, { text: 'T790M (en 1ère ligne ou progression)', value: 't790m', nextId: 'FIG15_R_OSIMERTINIB_T790M' }, { text: 'Insertion dans l\'exon 20', value: 'exon20_insertion', nextId: 'FIG15_R_CARBO_PEME_AMIVANTAMAB' }, ], },
  'FIG15_R_AFATINIB_OPTION_OSI': { id: 'FIG15_R_AFATINIB_OPTION_OSI', type: 'question', text:'Traitement: Afatinib. Option: Osimertinib.\nQue faire en cas de progression?',  options: [ {text: 'Évolution multifocale', value: 'multifocal', nextId: 'FIG15_PROG_MULTIFOCAL'}, {text: 'Évolution lente', value: 'slow', nextId: 'FIG15_PROG_LENTE'}, {text: 'Évolution oligométastatique', value: 'oligo', nextId: 'FIG15_PROG_OLIGO'}, ] },
  'FIG15_R_OSIMERTINIB_OPTIONS_L858R_DEL19': { id: 'FIG15_R_OSIMERTINIB_OPTIONS_L858R_DEL19', type: 'question', text:'Traitement: Osimertinib.\nOptions: Platine-Pemetrexed + osimertinib puis maintenance osimertinib-pemetrexed (notamment en cas de métastases cérébrales et chez les PS1) OU Amivantamab + Lazertinib (tolérance).\nQue faire en cas de progression?',  options: [ {text: 'Évolution multifocale', value: 'multifocal', nextId: 'FIG15_PROG_MULTIFOCAL'}, {text: 'Évolution lente', value: 'slow', nextId: 'FIG15_PROG_LENTE'}, {text: 'Évolution oligométastatique', value: 'oligo', nextId: 'FIG15_PROG_OLIGO'}, ] },
   'FIG15_R_OSIMERTINIB_T790M': { id: 'FIG15_R_OSIMERTINIB_T790M', type: 'question', text:'Traitement: Osimertinib si non donné en 1ère ligne.\nQue faire en cas de progression?',  options: [ {text: 'Évolution multifocale', value: 'multifocal', nextId: 'FIG15_PROG_MULTIFOCAL'}, {text: 'Évolution lente', value: 'slow', nextId: 'FIG15_PROG_LENTE'}, {text: 'Évolution oligométastatique', value: 'oligo', nextId: 'FIG15_PROG_OLIGO'}, ] },
  'FIG15_R_CARBO_PEME_AMIVANTAMAB': { id: 'FIG15_R_CARBO_PEME_AMIVANTAMAB', type: 'question', text:'Traitement: Option: Carboplatine-Pemetrexed + Amivantamab puis maintenance ami-pemetrexed en AAP.\nSuite:',  options: [ {text: 'Traitement identique au CBNPC WT', value: 'wt_like', nextId: 'FIG15_PROG_EXON20_WT_LIKE'}, {text: 'Essais clinique', value: 'trial', nextId: 'FIG15_PROG_EXON20_ESSAIS'}, ] },
  'FIG15_PROG_EXON20_WT_LIKE': {id: 'FIG15_PROG_EXON20_WT_LIKE', type: 'recommendation', title: 'Post TTT Exon 20', description: 'Traitement identique au CBNPC WT. Si progression -> Essais clinique. Ou Idem CBNPC WT sinon.'},
  'FIG15_PROG_EXON20_ESSAIS': {id: 'FIG15_PROG_EXON20_ESSAIS', type: 'recommendation', title: 'Post TTT Exon 20', description: 'Essais clinique. Si progression -> Idem CBNPC WT sinon.'},
  'FIG15_PROG_MULTIFOCAL': {id: 'FIG15_PROG_MULTIFOCAL', type: 'recommendation', title: 'Progression Multifocale (EGFR muté)', description: 'Re-biopsie (tissus ou sang).\n-Essais cliniques\n-Traitement adapté au mécanisme de résistance identifié\n-Traitement identique au CBNPC WT (sans immunothérapie)\n-Option: Carboplatine + Pemetrexed + Amivantamab'},
  'FIG15_PROG_LENTE': {id: 'FIG15_PROG_LENTE', type: 'recommendation', title: 'Progression Lente (EGFR muté)', description: '-Discuter d\'une poursuite de l\'ITK si bénéfice clinique.'},
  'FIG15_PROG_OLIGO': {id: 'FIG15_PROG_OLIGO', type: 'recommendation', title: 'Progression Oligométastatique (EGFR muté)', description: '-Discuter d\'un traitement local du site M+ et poursuite de l\'ITK\n-Eviter la radiothérapie panencéphalique'},

  'FIG16_Q1_ALK_INITIAL_STATUS': { id: 'FIG16_Q1_ALK_INITIAL_STATUS', type: 'question', text: 'Situation initiale pour ALK réarrangé (Stade Métastatique) ?\nTraitement de référence: Lorlatinib (Alectinib ou Brigatinib en cas de contre-indication ou toxicité).', options: [ { text: 'Résistance primaire', value: 'resistance_primaire', nextId: 'FIG16_R_RESISTANCE_PRIMAIRE' }, { text: 'Progression sous traitement', value: 'progression', nextId: 'FIG16_Q2_PROGRESSION_TYPE_ALK' }, ], },
  'FIG16_R_RESISTANCE_PRIMAIRE': {id:'FIG16_R_RESISTANCE_PRIMAIRE', type:'recommendation', title:'Résistance Primaire (ALK)', description:'Vérifier Observance & interactions (dont thérapies non conventionnelles).'},
  'FIG16_Q2_PROGRESSION_TYPE_ALK': { id: 'FIG16_Q2_PROGRESSION_TYPE_ALK', type: 'question', text:'Type de progression sous traitement ALK ?',  options: [ {text: 'Évolution multifocale', value: 'multifocal', nextId: 'FIG16_Q3_MULTIFOCAL_PREV_TKI'}, {text: 'Évolution lente', value: 'slow', nextId: 'FIG16_PROG_LENTE_ALK'}, {text: 'Évolution oligométastatique', value: 'oligo', nextId: 'FIG16_PROG_OLIGO_ALK'}, ] },
  'FIG16_Q3_MULTIFOCAL_PREV_TKI': { id: 'FIG16_Q3_MULTIFOCAL_PREV_TKI', type: 'question', text:'Traitement TKI antérieur lors de progression multifocale (ALK)?\nAction: Rebiopsie / ADN Circulant.', options: [ {text: 'Après Alectinib ou Brigatinib', value: 'post_alec_briga', nextId: 'FIG16_R_MULTIFOCAL_POST_ALEC_BRIGA'}, {text: 'Après Lorlatinib', value: 'post_lorla', nextId: 'FIG16_R_MULTIFOCAL_POST_LORLA'}, ] },
  'FIG16_R_MULTIFOCAL_POST_ALEC_BRIGA': {id:'FIG16_R_MULTIFOCAL_POST_ALEC_BRIGA', type:'recommendation', title:'Prog. Multifocale post Alectinib/Brigatinib (ALK)', description:'-Traitement adapté au mécanisme de résistance après avis en RCP\n-Lorlatinib'},
  'FIG16_R_MULTIFOCAL_POST_LORLA': {id:'FIG16_R_MULTIFOCAL_POST_LORLA', type:'recommendation', title:'Prog. Multifocale post Lorlatinib (ALK)', description:'-Traitement adapté au mécanisme de résistance après avis en RCP\n-Chimiothérapie : doublet à base de sels de platine et pemetrexed +/- bevacizumab et sans immunothérapie\n-Essais cliniques\n-Toute autre après avis d\'une RCP.', details:'¥ Ne permet pas de détecter les fusions ou transformation histologique.'},
  'FIG16_PROG_LENTE_ALK': {id:'FIG16_PROG_LENTE_ALK', type:'recommendation', title:'Progression Lente (ALK)', description:'-Discuter d\'une poursuite de l\'ITK si bénéfice clinique'},
  'FIG16_PROG_OLIGO_ALK': {id:'FIG16_PROG_OLIGO_ALK', type:'recommendation', title:'Progression Oligométastatique (ALK)', description:'-Discuter d\'un traitement local du site M+ et poursuite de l\'ITK\n-Eviter la radiothérapie pan-encéphalique'},

  'TAB12_Q1_CONTEXT': { id: 'TAB12_Q1_CONTEXT', type: 'question', text: 'Situation clinique pour la surveillance ?', options: [ { text: 'CBNPC opéré de stades 1 et 2', value: 'op_stade12', nextId: 'TAB12_R_OP_STADE12' }, { text: 'CBNPC RT stéréotaxique', value: 'rt_stereo', nextId: 'TAB12_R_RT_STEREO' }, { text: 'CBNPC de stades III (opérés et non-opérés)', value: 'stade3_op_nonop', nextId: 'TAB12_R_STADE3' }, { text: 'CBNPC stade IV', value: 'stade4', nextId: 'TAB12_R_STADE4' }, ], },
  'TAB12_R_OP_STADE12': { id: 'TAB12_R_OP_STADE12', type: 'recommendation', title:'Surveillance: CBNPC opéré stades 1 et 2', description: 'J15: -\nS8/9: -\nM3: -\nM6: T*\nM9: -\nM12: TA¹\nM18: T*\n2 ans: TA¹\n3 ans: T\n4 ans: T\n5 ans: T\n/an ou /2ans$: T', details: 'T: Scanner Thoracique – A: Scanner Abdominal – C: Imagerie Cérébrale – Ci: Imagerie des cibles connues – ¹: injection de produit de contraste iodé\n*Ou radiographie thoracique\n$: Arrêt à discuter en cas d\'altération significative de l\'état général et/ou cognitif du patient et/ou survenue de comorbidités sévères.' },
  'TAB12_R_RT_STEREO': { id: 'TAB12_R_RT_STEREO', type: 'recommendation', title:'Surveillance: CBNPC RT stéréotaxique', description: 'J15: -\nS8/9: -\nM3: T\nM6: -\nM9: T\nM12: TA¹\nM18: T\n2 ans: TA¹\n3 ans: T\n4 ans: T\n5 ans: T\n/an ou /2ans$: T', details: 'T: Scanner Thoracique – A: Scanner Abdominal – C: Imagerie Cérébrale – Ci: Imagerie des cibles connues – ¹: injection de produit de contraste iodé\n$: Arrêt à discuter en cas d\'altération significative de l\'état général et/ou cognitif du patient et/ou survenue de comorbidités sévères.' },
  'TAB12_R_STADE3': { id: 'TAB12_R_STADE3', type: 'recommendation', title:'Surveillance: CBNPC stades III (opérés et non-opérés)', description: 'J15: T#\nS8/9: -\nM3: T\nM6: TA¹C\nM9: T#\nM12: TA¹C\nM18: T\n2 ans: TA¹C\n3 ans: T\n4 ans: T\n5 ans: T\n/an ou /2ans$: T', details: 'T: Scanner Thoracique – A: Scanner Abdominal – C: Imagerie Cérébrale – Ci: Imagerie des cibles connues – ¹: injection de produit de contraste iodé\n#: En cas de traitement par durvalumab\n$: Arrêt à discuter en cas d\'altération significative de l\'état général et/ou cognitif du patient et/ou survenue de comorbidités sévères.' },
  'TAB12_R_STADE4': { id: 'TAB12_R_STADE4', type: 'recommendation', title:'Surveillance: CBNPC stade IV', description: 'J15: -\nS8/9: TA¹(C)Ciμ\nM3: TA¹(C)Ci\nM6: TA¹(C)Ci\nM9: TA¹(C)Ci\nM12: TA¹(C)Ci\nM18: TA¹(C)Ci\nAu-delà: Ci / 3 mois et à chaque changement de ligne.\nImagerie cérébrale (IRM) systématique pour les patients ALK/EGFR sous ITK.\nPossibilité d\'élargir à /6mois à partir de 2ans sous ITK/immunothérapie.', details: 'T: Scanner Thoracique – A: Scanner Abdominal – C: Imagerie Cérébrale – Ci: Imagerie des cibles connues – ¹: injection de produit de contraste iodé\nμ: Première évaluation précoce en cas de traitement par immunothérapie (8 à 9 semaines selon la molécule utilisée), puis/3 mois.\n$: Arrêt à discuter en cas d\'altération significative de l\'état général et/ou cognitif du patient et/ou survenue de comorbidités sévères.' },

  'ERROR_NODE': {
    id: 'ERROR_NODE',
    type: 'recommendation',
    title: 'Erreur / Chemin non défini',
    description: 'Le chemin de décision sélectionné n\'est pas complètement défini ou une erreur est survenue. Veuillez recommencer ou consulter le référentiel complet.',
  }
};