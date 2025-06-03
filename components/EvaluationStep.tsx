
import React from 'react';
import { PatientData, G8AnswerKey } from '../types';
import { ICONS, PS_OPTIONS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { User } from 'lucide-react';

interface EvaluationStepProps {
  patientData: PatientData;
  onDataChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  onToggleG8Calculator: () => void;
  isG8Complete: boolean;
}

export const EvaluationStep: React.FC<EvaluationStepProps> = ({ patientData, onDataChange, onToggleG8Calculator, isG8Complete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-sky-700" />
          Informations Générales du Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1">Âge du patient (années)</label>
            <input
              type="number"
              id="age"
              value={patientData.age}
              onChange={(e) => onDataChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="Ex: 72"
            />
          </div>
          <div>
            <label htmlFor="ps" className="block text-sm font-medium text-slate-600 mb-1">Performance Status (OMS/ECOG)</label>
            <select
              id="ps"
              value={patientData.ps}
              onChange={(e) => onDataChange('ps', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            >
              {PS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-semibold text-slate-700 mb-3">Évaluation Gériatrique (Score G8)</h4>
          {patientData.g8Score ? (
             <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Score G8 enregistré : <strong className="text-lg">{patientData.g8Score}/17</strong>. 
                <button 
                    onClick={onToggleG8Calculator}
                    className="ml-2 text-sky-600 hover:text-sky-800 font-medium underline text-sm"
                >
                    Modifier le score G8
                </button>
             </div>
          ) : (
            <button
                onClick={onToggleG8Calculator}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
                <ICONS.G8Calculator className="h-5 w-5" />
                Ouvrir le Calculateur de Score G8
            </button>
          )}
           {!isG8Complete && !patientData.g8Score && (
             <p className="text-xs text-amber-600 mt-2">Le calcul du score G8 est recommandé, surtout pour les patients âgés de 70 ans et plus.</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
};
    