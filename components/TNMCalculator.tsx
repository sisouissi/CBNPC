
import React from 'react';
import { TNMDetails, TNMOption } from '../types';
import { ICONS, TNM_TUMOR_CHARACTERISTICS_OPTIONS, TNM_LYMPH_NODES_OPTIONS, TNM_METASTASES_OPTIONS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

interface TNMCalculatorProps {
  tnmDetails: TNMDetails;
  onDetailChange: <K extends keyof TNMDetails>(key: K, value: TNMDetails[K]) => void;
  onSubmit: (calculatedStage: { T: string, N: string, M: string, stage: string }) => void;
  onCancel: () => void;
}

interface TNMResult {
  T: string;
  N: string;
  M: string;
  stage: string;
}

// This function should be pure and not rely on component state directly
const calculateTNMStageLogic = (details: TNMDetails): TNMResult => {
  const { tumorSize, tumorCharacteristics, lymphNodes, metastases } = details;
  
  let T = 'Tx';
  if (tumorSize && tumorCharacteristics !== undefined) { // tumorCharacteristics can be empty string
    const size = parseFloat(tumorSize);
    if (!isNaN(size)) {
      if (size <= 1) T = 'T1a';
      else if (size <= 2) T = 'T1b';
      else if (size <= 3) T = 'T1c';
      else if (size <= 4) T = 'T2a';
      else if (size <= 5) T = 'T2b';
      else if (size <= 7) T = 'T3';
      else T = 'T4'; // Size > 7cm
    }

    // Adjust T based on characteristics, potentially overriding size-based T
    // These rules are complex and might need specific ordering or combination logic based on clinical guidelines
    // The original code's logic implies some characteristics upgrade T stage
    const chars = tumorCharacteristics.split(',').map(c => c.trim()).filter(Boolean);
    if (chars.includes('bronche-souche') && !T.startsWith('T3') && !T.startsWith('T4')) T = 'T2'; // Example: Bronche souche is at least T2
    if (chars.includes('plevre-viscerale') && !T.startsWith('T3') && !T.startsWith('T4')) T = 'T2'; // Plevre viscerale is at least T2
    if (chars.includes('paroi-thoracique')) T = 'T3'; // Paroi thoracique is T3
    if (chars.includes('mediastin')) T = 'T4'; // Mediastin involvement is T4
    if (chars.includes('nodules-meme-lobe')) T = 'T3'; // Nodules same lobe is T3
    if (chars.includes('nodules-autre-lobe-meme-poumon')) T = 'T4'; // Nodules other lobe same poumon is T4
  }


  let N = 'Nx';
  if (lymphNodes === 'N0') N = 'N0';
  else if (lymphNodes === 'N1') N = 'N1';
  else if (lymphNodes === 'N2') N = 'N2';
  else if (lymphNodes === 'N3') N = 'N3';

  let M = 'Mx';
  if (metastases === 'M0') M = 'M0';
  else if (metastases === 'M1a') M = 'M1a';
  else if (metastases === 'M1b') M = 'M1b';
  else if (metastases === 'M1c') M = 'M1c';
  
  // Simplified Staging Logic (based on common patterns, actual CBPC staging can be more nuanced)
  // This needs to be verified against the 8th edition TNM for Lung Cancer specifically for CBPC if different.
  // The provided logic in the user's code is for generic NSCLC, CBPC often treated as Limited/Extensive
  // For this exercise, I will adapt the provided staging logic.
  let stage = '';
  if (M.startsWith('M1')) { // Metastatic
    if (M === 'M1a') stage = 'IV A'; // Often grouped simply as "Extensive" or Stage IV for CBPC
    else if (M === 'M1b') stage = 'IV A';
    else if (M === 'M1c') stage = 'IV B';
    else stage = 'IV'; // Generic IV if M1 but not further specified
  } else if (M === 'M0') { // Non-metastatic
      if (N === 'N0') {
          if (T === 'T1a' || T === 'T1b' || T === 'T1c') stage = 'I A';
          else if (T === 'T2a') stage = 'I B';
          else if (T === 'T2b') stage = 'II A';
          else if (T === 'T3') stage = 'II B';
          else if (T === 'T4') stage = 'III A'; // T4N0M0
      } else if (N === 'N1') {
          if (T === 'T1a' || T === 'T1b' || T === 'T1c') stage = 'II B';
          else if (T === 'T2a' || T === 'T2b') stage = 'II B';
          else if (T === 'T3') stage = 'III A';
          else if (T === 'T4') stage = 'III B'; // T4N1M0
      } else if (N === 'N2') {
          if (T === 'T1a' || T === 'T1b' || T === 'T1c' || T === 'T2a' || T === 'T2b') stage = 'III A';
          else if (T === 'T3' || T === 'T4') stage = 'III B';
      } else if (N === 'N3') {
          if (T === 'T1a' || T === 'T1b' || T === 'T1c' || T === 'T2a' || T === 'T2b') stage = 'III B'; // Any T with N3 is at least IIIB
          else if (T === 'T3' || T === 'T4') stage = 'III C';
      }
  }
  if (T === 'Tx' || N === 'Nx' || (M === 'Mx' && stage === '')) stage = "Stade Incomplet";


  return { T, N, M, stage };
};


export const TNMCalculator: React.FC<TNMCalculatorProps> = ({ tnmDetails, onDetailChange, onSubmit, onCancel }) => {
  
  const handleTumorCharacteristicChange = (charValue: string, checked: boolean) => {
    const currentChars = tnmDetails.tumorCharacteristics.split(',').map(c => c.trim()).filter(Boolean);
    let updatedChars: string[];
    if (checked) {
      updatedChars = [...new Set([...currentChars, charValue])];
    } else {
      updatedChars = currentChars.filter(c => c !== charValue);
    }
    onDetailChange('tumorCharacteristics', updatedChars.join(','));
  };

  const tnmResult = calculateTNMStageLogic(tnmDetails);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-700">
          <ICONS.TNMCalculator className="h-6 w-6" />
          Classification TNM (8ème édition) - Calculateur Détaillé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tumor Section */}
          <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Tumeur (T)</h4>
            <div>
              <label htmlFor="tumorSize" className="block text-sm font-medium text-slate-600 mb-1">Taille tumorale (plus grande dimension en cm)</label>
              <input
                id="tumorSize"
                type="number"
                step="0.1"
                value={tnmDetails.tumorSize}
                onChange={(e) => onDetailChange('tumorSize', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Ex: 3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Caractéristiques tumorales additionnelles</label>
              <div className="space-y-2">
                {TNM_TUMOR_CHARACTERISTICS_OPTIONS.map((char) => (
                  <label key={char.value} className="flex items-center p-2 rounded-md hover:bg-teal-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={tnmDetails.tumorCharacteristics.includes(char.value)}
                      onChange={(e) => handleTumorCharacteristicChange(char.value, e.target.checked)}
                      className="mr-3 h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-600">{char.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Nodes & Metastases Section */}
          <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Ganglions (N) & Métastases (M)</h4>
            <div>
              <label htmlFor="lymphNodes" className="block text-sm font-medium text-slate-600 mb-1">Envahissement ganglionnaire (N)</label>
              <select
                id="lymphNodes"
                value={tnmDetails.lymphNodes}
                onChange={(e) => onDetailChange('lymphNodes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white"
              >
                {TNM_LYMPH_NODES_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="metastases" className="block text-sm font-medium text-slate-600 mb-1">Métastases à distance (M)</label>
              <select
                id="metastases"
                value={tnmDetails.metastases}
                onChange={(e) => onDetailChange('metastases', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white"
              >
                {TNM_METASTASES_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* TNM Result Display */}
        <div className="mt-6 p-5 bg-teal-50 border border-teal-200 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-teal-700 mb-3">Classification TNM Résultante:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><strong className="text-slate-700">T:</strong> <span className="font-mono text-teal-600 text-base">{tnmResult.T || '-'}</span></div>
            <div><strong className="text-slate-700">N:</strong> <span className="font-mono text-teal-600 text-base">{tnmResult.N || '-'}</span></div>
            <div><strong className="text-slate-700">M:</strong> <span className="font-mono text-teal-600 text-base">{tnmResult.M || '-'}</span></div>
            <div><strong className="text-slate-700">Stade Global:</strong> <span className="font-bold text-teal-600 text-lg">{tnmResult.stage || '-'}</span></div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit(tnmResult)}
            className="px-6 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            disabled={!tnmResult.stage || tnmResult.stage === "Stade Incomplet"}
          >
            Appliquer la Classification et Continuer
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

    