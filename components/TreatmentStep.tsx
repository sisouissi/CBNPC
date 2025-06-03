
import React from 'react';
import { PatientData } from '../types';
import { RESPONSE_STATUS_OPTIONS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Activity } from 'lucide-react';

interface TreatmentStepProps {
  patientData: PatientData;
  onDataChange: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
}

export const TreatmentStep: React.FC<TreatmentStepProps> = ({ patientData, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-700" />
          Informations Relatives au Traitement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="previousTreatment" className="block text-sm font-medium text-slate-600 mb-1">Statut de traitement antérieur</label>
          <select
            id="previousTreatment"
            value={patientData.previousTreatment}
            onChange={(e) => {
              onDataChange('previousTreatment', e.target.value);
              // If naive, also set responseStatus to naive, otherwise clear it for selection
              if (e.target.value === 'naive') {
                onDataChange('responseStatus', 'naive');
              } else if (patientData.responseStatus === 'naive') {
                 onDataChange('responseStatus', ''); // Clear if changing from naive to something else
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
          >
            <option value="">Sélectionner le statut...</option>
            <option value="naive">Naïf de tout traitement (1ère ligne)</option>
            <option value="treated">Déjà traité (2ème ligne ou plus)</option>
          </select>
        </div>

        {patientData.previousTreatment === 'treated' && (
          <div>
            <label htmlFor="responseStatus" className="block text-sm font-medium text-slate-600 mb-1">Réponse au traitement antérieur (pour 2ème ligne et +)</label>
            <select
              id="responseStatus"
              value={patientData.responseStatus}
              onChange={(e) => onDataChange('responseStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white"
            >
              {RESPONSE_STATUS_OPTIONS.map(opt => {
                if(opt.value === 'naive') return null; // Don't show 'naive' here
                return <option key={opt.value} value={opt.value}>{opt.label}</option>
              })}
            </select>
             <p className="text-xs text-slate-500 mt-1">C1 = chimiothérapie de 1ère ligne.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="flex items-start">
                <div className="flex items-center h-5">
                <input
                    id="brainMets"
                    type="checkbox"
                    checked={patientData.brainMets}
                    onChange={(e) => onDataChange('brainMets', e.target.checked)}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-slate-300 rounded"
                />
                </div>
                <div className="ml-3 text-sm">
                <label htmlFor="brainMets" className="font-medium text-slate-700">Présence de métastases cérébrales ?</label>
                </div>
            </div>

            <div className="flex items-start">
                <div className="flex items-center h-5">
                <input
                    id="egfrMutation"
                    type="checkbox"
                    checked={patientData.egfrMutation}
                    onChange={(e) => onDataChange('egfrMutation', e.target.checked)}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-slate-300 rounded"
                />
                </div>
                <div className="ml-3 text-sm">
                <label htmlFor="egfrMutation" className="font-medium text-slate-700">Mutation EGFR (si CBNPC transformé en CBPC) ?</label>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
};
    