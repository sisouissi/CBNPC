import { TnmAnswers, StageDetail } from '../types';

// Helper to map T_SIZE from form to a numerical T category (1-4) for easier comparison
// This is a simplified interpretation for staging logic. Detailed T definitions are complex.
const getSimplifiedTValue = (t_size: TnmAnswers['t_size']): number => {
  if (t_size === 'tis' || t_size === 't1a_mi' || t_size === 't1a' || t_size === 't1b' || t_size === 't1c') return 1;
  if (t_size === 't2a' || t_size === 't2b') return 2;
  if (t_size === 't3_size') return 3;
  if (t_size === 't4_size') return 4;
  return 0; // for nsp or unhandled
};

// Determines the effective T stage (e.g., "T1a", "T2b", "T3", "T4") based on all T-related answers
export const getEffectiveTStage = (answers: TnmAnswers): string => {
  // T4 conditions (highest precedence)
  if (answers.t_envahissement_mediastin_coeur_vaisseaux_trachee_carene_diaphragme_nerfrecurent_oesophage_vertebres === 'oui' ||
      answers.t_nodules_diff_lobe_meme_poumon === 'oui' ||
      answers.t_size === 't4_size') {
    return 'T4';
  }

  // T3 conditions
  if (answers.t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde === 'oui' ||
      answers.t_nodules_meme_lobe === 'oui' ||
      answers.t_size === 't3_size') {
    return 'T3';
  }

  // T2 conditions
  const hasT2Features = answers.t_bronche_souche === 'oui' || 
                        answers.t_plevre_viscerale === 'oui' || 
                        answers.t_atelectasie_pneumonie === 'oui';

  if (answers.t_size === 't2b') { 
    return 'T2b'; 
  }
  if (answers.t_size === 't2a') { 
    return 'T2a';
  }

  if (hasT2Features) {
    if (answers.t_size === 't1a' || answers.t_size === 't1a_mi' || answers.t_size === 't1b' || answers.t_size === 't1c' || answers.t_size === 'tis' || answers.t_size === 'nsp') {
        return 'T2a';
    }
  }
  
  if (answers.t_size === 't1c') return 'T1c';
  if (answers.t_size === 't1b') return 'T1b';
  if (answers.t_size === 't1a') return 'T1a';
  if (answers.t_size === 't1a_mi') return 'T1a(mi)';
  if (answers.t_size === 'tis') return 'Tis';
  
  return 'Tx'; 
};


export const getNStage = (answers: TnmAnswers): string => {
  if (answers.n_status === 'nsp' || answers.n_status === 'nx') return 'Nx';
  return answers.n_status.toUpperCase(); 
};

export const getMStage = (answers: TnmAnswers): string => {
  if (answers.m_status === 'nsp') return 'Mx'; 
  return answers.m_status.toUpperCase(); 
};

export const calculateStageInfo = (answers: TnmAnswers): StageDetail => {
  const t = getEffectiveTStage(answers);
  const n = getNStage(answers);
  const m = getMStage(answers);
  let isResectableTumor: boolean = false;
  let resectabilityStatus: StageDetail['resectabilityStatus'] = 'Non applicable (M1 ou Tis/Occulte)';

  if (m === 'M0' || m === 'MX') {
    const isPancoastT3 = (t === 'T3' && answers.t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde === 'oui');
    // const isT4Invasion = answers.t_envahissement_mediastin_coeur_vaisseaux_trachee_carene_diaphragme_nerfrecurent_oesophage_vertebres === 'oui';
    // const isT4Nodules = answers.t_nodules_diff_lobe_meme_poumon === 'oui';
    // const isBulkyN2 = answers.n2_bulky_status === 'oui';
    // const isMultisiteN2 = answers.n2_site_status === 'multisite';

    if (n === 'N0' || n === 'N1') {
      if (t === 'T1a(mi)' || t === 'T1a' || t === 'T1b' || t === 'T1c' || t === 'T2a' || t === 'T2b' || (t === 'T3' && !isPancoastT3)) {
        isResectableTumor = true; resectabilityStatus = 'Résécable';
      } else if (isPancoastT3 || t === 'T4') {
        isResectableTumor = true; resectabilityStatus = 'Potentiellement résécable'; // Apex or T4 by size/other invasion
      } else {
        resectabilityStatus = 'Non résécable'; // Should not happen for N0/N1 if T is low
      }
    } else if (n === 'N2') {
      const isBulkyN2 = answers.n2_bulky_status === 'oui';
      const isMultisiteN2 = answers.n2_site_status === 'multisite';

      if (isPancoastT3 || t === 'T4') {
        isResectableTumor = false; resectabilityStatus = 'Non résécable';
      } else if (!isBulkyN2 && !isMultisiteN2) { // N2 non-bulky, unisite
        isResectableTumor = true; resectabilityStatus = 'Résécable'; // Applies to T1/T2
        if (t === 'T3') { // For T3 non-pancoast with N2 non-bulky unisite
            resectabilityStatus = 'Potentiellement résécable'; // Page 26 implies T3N2 unisite is potentially resectable
        }
      } else if (isBulkyN2 || isMultisiteN2) { // N2 bulky OR multisite (or both) with T1-T3
         isResectableTumor = true; resectabilityStatus = 'Potentiellement résécable';
      } else {
         isResectableTumor = false; resectabilityStatus = 'Non résécable'; // Fallback for N2 if not fitting above
      }
    } else if (n === 'N3') {
      isResectableTumor = false; resectabilityStatus = 'Non résécable';
    } else { // Nx
       resectabilityStatus = 'Non résécable'; // Cannot determine resectability with Nx
    }
     if (t === 'Tis' || t === 'Tx') { // Occult/Tis are special cases
        isResectableTumor = false; // Operability assessment isn't the primary concern here in the same way
        resectabilityStatus = 'Non applicable (M1 ou Tis/Occulte)';
    }

  } else { // M1 disease
      isResectableTumor = false;
      resectabilityStatus = 'Non applicable (M1 ou Tis/Occulte)';
  }
  
  if (m === 'M1A' || m === 'M1B') return { stage: 'IVA', group: 'Stade IV', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
  if (m === 'M1C') return { stage: 'IVB', group: 'Stade IV', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };

  if (t === 'Tx' && n === 'N0' && m === 'M0') return { stage: 'Occulte', group: 'Occulte', rawT: t, rawN: n, rawM: m, isResectableTumor: false, resectabilityStatus: 'Non applicable (M1 ou Tis/Occulte)' };
  if (t === 'Tis' && n === 'N0' && m === 'M0') return { stage: '0', group: 'Stade 0', rawT: t, rawN: n, rawM: m, isResectableTumor: false, resectabilityStatus: 'Non applicable (M1 ou Tis/Occulte)' };

  if (n === 'N0' && m === 'M0') {
    if (t === 'T1a(mi)' || t === 'T1a') return { stage: 'IA1', group: 'Stade I', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T1b') return { stage: 'IA2', group: 'Stade I', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T1c') return { stage: 'IA3', group: 'Stade I', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T2a') return { stage: 'IB', group: 'Stade I', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T2b') return { stage: 'IIA', group: 'Stade II', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T3') return { stage: 'IIB', group: 'Stade II', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T4') return { stage: 'IIIA', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
  }

  if (n === 'N1' && m === 'M0') {
    if (t === 'T1a(mi)' || t === 'T1a' || t === 'T1b' || t === 'T1c' || t === 'T2a' || t === 'T2b') return { stage: 'IIB', group: 'Stade II', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T3') return { stage: 'IIIA', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T4') return { stage: 'IIIA', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
  }

  if (n === 'N2' && m === 'M0') {
    if (t === 'T1a(mi)' || t === 'T1a' || t === 'T1b' || t === 'T1c' || t === 'T2a' || t === 'T2b') return { stage: 'IIIA', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T3' || t === 'T4') return { stage: 'IIIB', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
  }

  if (n === 'N3' && m === 'M0') {
    if (t === 'T1a(mi)' || t === 'T1a' || t === 'T1b' || t === 'T1c' || t === 'T2a' || t === 'T2b') return { stage: 'IIIB', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
    if (t === 'T3' || t === 'T4') return { stage: 'IIIC', group: 'Stade III', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
  }
  
  return { stage: 'Inconnu', group: 'Stade Inconnu', rawT: t, rawN: n, rawM: m, isResectableTumor: isResectableTumor, resectabilityStatus: resectabilityStatus };
};

interface NextNodeResult {
  initialNodeId: string;
  targetSurgicalNodeIfOperable?: string | null;
}

export const determineNextNodeIdFromTnm = (tnmData: TnmAnswers, stageInfo: StageDetail): NextNodeResult => {
  const { group, isResectableTumor, rawT, rawN, stage } = stageInfo;
  let targetSurgicalNode: string | null = null;

  if (group === 'Occulte' || stage === '0') {
    return { initialNodeId: 'R_OCCULT_IN_SITU' };
  }
  if (group === 'Stade IV') {
    return { initialNodeId: 'Q_STAGE_IV_DISPATCHER' };
  }

  if (stageInfo.rawM !== 'M0' && stageInfo.rawM !== 'MX') {
      return { initialNodeId: 'Q_STAGE_IV_DISPATCHER' };
  }
  
  // Determine target surgical node if tumor is resectable
  if (isResectableTumor) {
    const isPancoastT3 = rawT === 'T3' && tnmData.t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde === 'oui';
    if (isPancoastT3 && (rawN === 'N0' || rawN === 'N1')) {
        targetSurgicalNode = 'FIG11_R_CN01_RESEC_OUI'; // Simplified, assuming this path implies surgery
    } else if (rawT === 'T4' && (rawN === 'N0' || rawN === 'N1') && tnmData.t_envahissement_paroi_nerfphrenique_plevreparietale_pericarde === 'oui') { // Approximating Pancoast T4
        targetSurgicalNode = 'FIG11_R_CN01_RESEC_OUI'; 
    }
     else if (group === 'Stade I') {
      targetSurgicalNode = 'FIG8_Q2_CHIRURGIE_TYPE';
    } else if (group === 'Stade II' || (group === 'Stade III' && (stage === 'IIIA' || stage === 'IIIB'))) { // IIIB potentially resectable might go here
      targetSurgicalNode = 'FIG9_Q2_MOLECULAR_RESECABLE';
    }
  }


  if (isResectableTumor && targetSurgicalNode) {
    return { initialNodeId: 'Q_OPERABILITY_VEMS_DLCO', targetSurgicalNodeIfOperable: targetSurgicalNode };
  } else if (!isResectableTumor) {
    if (group === 'Stade III') {
      return { initialNodeId: 'FIG10_Q1_PS_AGE' }; 
    }
    if (group === 'Stade I' || group === 'Stade II') {
        // Patient with early stage but non-resectable tumor (e.g. T4N0, not Pancoast)
        // or N2 bulky/multisite with small T that made it "non-resectable"
        // This path should also consider non-surgical curative options like SBRT for Stage I/II if inoperable for other reasons.
        // For now, if not resectable based on TNM, and not Stage III, go to FIG8_R_INOPERABLE (for Stage I-like) or FIG10 for more advanced.
        // This part might need refinement depending on why it's non-resectable.
        // If strictly due to TNM (e.g. certain T4 or N2 configurations that are classified Stage II but are non-resectable as per table p26)
        // then FIG10 for "non-eligible à la chirurgie" might be appropriate.
        // If it's stage I/II and deemed "non-resectable" by the table, it's likely very advanced T or N.
        // Let's route to FIG8_R_INOPERABLE if it's group I/II and non-resectable for robust SBRT consideration
        return { initialNodeId: 'FIG8_R_INOPERABLE' };
    }
  }
  
  return { initialNodeId: 'ERROR_NODE' }; 
};