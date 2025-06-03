
import React from 'react';
import { PatientData, TNMDetails } from '../types';
import { ICONS, STAGE_OPTIONS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Stethoscope } from 'lucide-react';

interface StagingStepProps {
  patientData: PatientData;
  onDataChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  onToggleTNMCalculator: () => void;
  isTNMComplete: boolean;
}

export const StagingStep: React.FC<StagingStepProps> = ({ patientData, onDataChange, onToggleTNMCalculator, isTNMComplete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-700" />
          Stadification et Bilan d'Extension
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-slate-600 mb-1">Stade global initial (CBPC)</label>
          <select
            id="stage"
            value={patientData.stage}
            onChange={(e) => onDataChange('stage', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white"
          >
            {STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <p className="text-xs text-slate-500 mt-1">Ce stade peut être affiné par la classification TNM détaillée.</p>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-semibold text-slate-700 mb-3">Classification TNM (8ème édition)</h4>
          {patientData.tnmDetails.finalStage ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                Classification TNM enregistrée : 
                <strong className="text-lg ml-1">{patientData.tnmDetails.calculatedT} {patientData.tnmDetails.calculatedN} {patientData.tnmDetails.calculatedM}</strong>
                , Stade: <strong className="text-lg">{patientData.tnmDetails.finalStage}</strong>.
              </p>
              <button 
                onClick={onToggleTNMCalculator}
                className="mt-1 text-teal-600 hover:text-teal-800 font-medium underline text-sm"
              >
                Modifier la classification TNM
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleTNMCalculator}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <ICONS.TNMCalculator className="h-5 w-5" />
              Ouvrir le Calculateur TNM Détaillé
            </button>
          )}
          {!isTNMComplete && !patientData.tnmDetails.finalStage && (
             <p className="text-xs text-amber-600 mt-2">La classification TNM détaillée est recommandée pour préciser le stade.</p>
           )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-semibold text-slate-700 mb-3">Bilan d'Extension Complémentaire</h4>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="extensionBilan"
                type="checkbox"
                checked={patientData.extensionBilan}
                onChange={(e) => onDataChange('extensionBilan', e.target.checked)}
                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-slate-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="extensionBilan" className="font-medium text-slate-700">Bilan d'extension complet réalisé ?</label>
              <p className="text-slate-500">Inclut TEP-FDG et IRM cérébrale si un traitement local est envisagé (Stades I-III).</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
    