
import React from 'react';
import { Recommendation, RecommendationType, PatientData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { AlertTriangle, CheckCircle as SuccessCircle, Info, CheckCircle } from 'lucide-react'; // Using CheckCircle for main title

interface ResultsStepProps {
  recommendations: Recommendation[];
  patientData: PatientData; // For displaying summary if needed
}

const RecommendationIcon: React.FC<{ type: RecommendationType }> = ({ type }) => {
  switch (type) {
    case RecommendationType.Warning:
      return <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />;
    case RecommendationType.Success:
      return <SuccessCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />;
    case RecommendationType.Info:
      return <Info className="h-5 w-5 text-sky-500 mr-3 flex-shrink-0" />;
    default:
      return null;
  }
};

export const ResultsStep: React.FC<ResultsStepProps> = ({ recommendations, patientData }) => {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-emerald-700" />
            Recommandations Thérapeutiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Aucune recommandation générée. Veuillez vérifier les données saisies ou contacter un support.</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    if (category.toLowerCase().includes('gériatrique')) return 'bg-pink-100 border-pink-300';
    if (category.toLowerCase().includes('bilan')) return 'bg-indigo-100 border-indigo-300';
    if (category.toLowerCase().includes('traitement') || category.toLowerCase().includes('thérapeutique')) return 'bg-cyan-100 border-cyan-300';
    if (category.toLowerCase().includes('support') || category.toLowerCase().includes('surveillance')) return 'bg-lime-100 border-lime-300';
    return 'bg-slate-100 border-slate-300';
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
            Synthèse et Recommandations Thérapeutiques
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-slate-600 mb-6">
                Les recommandations suivantes sont basées sur les informations fournies et les directives générales.
                Elles ne remplacent pas une discussion en Réunion de Concertation Pluridisciplinaire (RCP) ni le jugement clinique du médecin.
            </p>
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Résumé Patient:</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 pl-2 mb-4">
                    <li>Âge: {patientData.age || 'N/A'} ans, PS: {patientData.ps !== '' ? patientData.ps : 'N/A'}</li>
                    {patientData.g8Score && <li>Score G8: {patientData.g8Score}/17</li>}
                    <li>Stade initial: {patientData.stage || 'N/A'}</li>
                    {patientData.tnmDetails.finalStage && <li>TNM: {patientData.tnmDetails.calculatedT} {patientData.tnmDetails.calculatedN} {patientData.tnmDetails.calculatedM} ({patientData.tnmDetails.finalStage})</li>}
                    <li>Traitement antérieur: {patientData.previousTreatment === 'naive' ? 'Naïf' : 'Déjà traité'}</li>
                    {patientData.previousTreatment !== 'naive' && <li>Réponse C1: {patientData.responseStatus || 'N/A'}</li>}
                </ul>
            </div>
        </CardContent>
      </Card>

      {recommendations.map((rec, index) => (
        <Card key={index} className={`border-l-4 ${
            rec.type === RecommendationType.Warning ? 'border-amber-500 bg-amber-50' :
            rec.type === RecommendationType.Success ? 'border-green-500 bg-green-50' :
            'border-sky-500 bg-sky-50'
          } shadow-md hover:shadow-lg transition-shadow`}
        >
          <CardContent className="flex items-start">
            <RecommendationIcon type={rec.type} />
            <div>
              <h4 className={`text-md font-semibold mb-1 ${
                  rec.type === RecommendationType.Warning ? 'text-amber-700' :
                  rec.type === RecommendationType.Success ? 'text-green-700' :
                  'text-sky-700'
                }`}>{rec.category}
              </h4>
              <p className="text-sm text-slate-600">{rec.text}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
