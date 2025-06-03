
import React, { useState, useCallback, useEffect } from 'react';
import { PatientData, StepId, Recommendation, G8Answers, TNMDetails, G8AnswerKey, RecommendationType } from './types';
import { STEPS, INITIAL_PATIENT_DATA_G8ANSWERS, INITIAL_PATIENT_DATA_TNMDETAILS } from './constants';
import { StepNavigation } from './components/StepNavigation';
import { EvaluationStep } from './components/EvaluationStep';
import { StagingStep } from './components/StagingStep';
import { TreatmentStep } from './components/TreatmentStep';
import { ResultsStep } from './components/ResultsStep';
import { G8Calculator } from './components/G8Calculator';
import { TNMCalculator } from './components/TNMCalculator';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const initialPatientData: PatientData = {
  age: '',
  ps: '',
  stage: '', // I-III or IV
  extensionBilan: false,
  responseStatus: '', // 'naive', 'hautement-sensible', 'sensible', 'resistant', 'refractaire'
  previousTreatment: '', // 'naive' or other
  brainMets: false,
  egfrMutation: false,
  g8Score: '',
  g8Answers: { ...INITIAL_PATIENT_DATA_G8ANSWERS },
  tnmDetails: { ...INITIAL_PATIENT_DATA_TNMDETAILS },
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepId>(StepId.Evaluation);
  const [patientData, setPatientData] = useState<PatientData>(initialPatientData);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showG8Calculator, setShowG8Calculator] = useState<boolean>(false);
  const [showTNMCalculator, setShowTNMCalculator] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  const updatePatientData = useCallback(<K extends keyof PatientData>(field: K, value: PatientData[K]) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateG8Answer = useCallback((key: G8AnswerKey, value: string) => {
    setPatientData(prev => ({
      ...prev,
      g8Answers: { ...prev.g8Answers, [key]: value }
    }));
  }, []);

  const updateTNMDetail = useCallback(<K extends keyof TNMDetails>(key: K, value: TNMDetails[K]) => {
    setPatientData(prev => ({
      ...prev,
      tnmDetails: { ...prev.tnmDetails, [key]: value }
    }));
  }, []);
  
  const calculateG8Score = useCallback((answers: G8Answers): number => {
    let total = 0;
    Object.values(answers).forEach(value => {
      if (value !== '' && !isNaN(parseFloat(value))) {
        total += parseFloat(value);
      }
    });
    return total;
  }, []);


  const generateRecommendations = useCallback(() => {
    const recs: Recommendation[] = [];
    
    let g8ScoreToUse: number | null = null;
    if (patientData.g8Score && patientData.g8Score.trim() !== '') {
        g8ScoreToUse = parseFloat(patientData.g8Score);
    } else {
        const hasAnyG8Answer = Object.values(patientData.g8Answers).some(ans => ans !== '');
        if (hasAnyG8Answer) {
            g8ScoreToUse = calculateG8Score(patientData.g8Answers);
        }
    }

    const effectiveStage = patientData.tnmDetails.finalStage 
      ? (patientData.tnmDetails.finalStage.includes('IV') ? 'IV' : 'I-III') 
      : patientData.stage;

    // Évaluation gériatrique
    if (patientData.age && parseInt(patientData.age) >= 70) {
      if (g8ScoreToUse !== null) {
          if (g8ScoreToUse <= 14) {
            recs.push({
              type: RecommendationType.Warning,
              category: 'Évaluation Gériatrique (Score G8)',
              text: `Score G8 = ${g8ScoreToUse.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}/17 (≤14) : Patient fragile ou à risque. Une évaluation oncogériatrique approfondie est OBLIGATOIRE avant de débuter tout traitement anticancéreux.`
            });
          } else { // score > 14
            recs.push({
              type: RecommendationType.Success,
              category: 'Évaluation Gériatrique (Score G8)',
              text: `Score G8 = ${g8ScoreToUse.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}/17 (>14) : Patient a priori en bon état général sur le plan gériatrique. Traitement standard envisageable sous réserve des autres comorbidités et du PS.`
            });
          }
      } else { // g8ScoreToUse is null
         recs.push({
              type: RecommendationType.Info,
              category: 'Évaluation Gériatrique (Score G8)',
              text: `Score G8 non calculé. Pour les patients de 70 ans et plus, le score G8 est fortement recommandé pour évaluer la fragilité.`
            });
      }
    }

    // Bilan d'extension
    recs.push({
      type: RecommendationType.Info,
      category: 'Bilan d\'Extension Standard',
      text: 'Bilan initial standard : Examen clinique complet, bilan biologique (NFS, plaquettes, ionogramme sanguin avec calcémie, créatininémie, bilan hépatique complet, LDH). Fibroscopie bronchique avec biopsies. Imagerie : TDM thoraco-abdomino-pelvien injecté. Imagerie cérébrale (IRM ou TDM injecté).'
    });

    if (effectiveStage === 'I-III' && !patientData.extensionBilan) {
      recs.push({
        type: RecommendationType.Warning,
        category: 'Bilan d\'Extension Complémentaire (Stades Limités)',
        text: 'Pour les CBPC de stade limité (I-III) candidats à un traitement curatif : TEP au 18F-FDG et IRM cérébrale sont recommandés pour optimiser la stadification et guider la stratégie thérapeutique.'
      });
    }
    
    // Recommandations thérapeutiques
    if (effectiveStage === 'IV') {
      recs.push({
        type: RecommendationType.Info,
        category: 'Traitement CBPC Stade IV (Métastatique) - Principes',
        text: 'L\'objectif principal est palliatif, visant à contrôler la maladie, soulager les symptômes et améliorer la qualité de vie. L\'inclusion dans des essais cliniques est à encourager.'
      });

      const isFitForImmunotherapy = (g8ScoreToUse === null && (!patientData.age || parseInt(patientData.age) < 70)) || (g8ScoreToUse !== null && g8ScoreToUse > 14);


      if (patientData.previousTreatment === 'naive' || patientData.responseStatus === 'naive') {
        recs.push({
          type: RecommendationType.Success,
          category: 'Traitement 1ère Ligne (Stade IV)',
          text: `STANDARD (PS 0-2${(patientData.age && parseInt(patientData.age) >= 70) ? (isFitForImmunotherapy ? ", G8 > 14" : ", G8 ≤ 14") : ""}) : Chimiothérapie à base de sel de platine (cisplatine ou carboplatine) + étoposide (J1-J3) + immunothérapie (atézolizumab ou durvalumab) pendant 4 cycles, suivie d\'une maintenance par immunothérapie seule.`
        });
        recs.push({
          type: RecommendationType.Info,
          category: 'Schémas Chimiothérapie + Immunothérapie (1ère Ligne)',
          text: 'Ex: Carboplatine AUC 5 J1 + Étoposide 100mg/m² J1-J3 + Atézolizumab 1200mg IV (ou 1875mg SC) J1, q3S x4 cycles, puis Atézolizumab maintenance. Alternative avec Durvalumab disponible.'
        });
        if ((patientData.ps && parseInt(patientData.ps) > 2) || !isFitForImmunotherapy && (patientData.age && parseInt(patientData.age) >= 70) ) {
          recs.push({
            type: RecommendationType.Warning,
            category: 'Contre-Indication/Adaptation (1ère Ligne)',
            text: 'Si PS > 2, patient fragile (G8 ≤ 14 et âge ≥ 70) ou contre-indication à l\'immunothérapie : Chimiothérapie seule (cisplatine/carboplatine + étoposide, 4-6 cycles) ou monothérapie (étoposide oral, carboplatine hebdomadaire) ou meilleurs soins de support. Discuter en RCP.'
          });
        }
      } else { // 2ème ligne et plus
        recs.push({
          type: RecommendationType.Info,
          category: 'Traitement 2ème Ligne et Plus (Stade IV)',
          text: `Le choix dépend de la sensibilité à la 1ère ligne de chimiothérapie (Intervalle Libre Sans Traitement - ILST). Patient avec statut de réponse: ${patientData.responseStatus || 'Non spécifié'}`
        });
        if (patientData.responseStatus === 'hautement-sensible' || patientData.responseStatus === 'sensible') { 
          recs.push({
            type: RecommendationType.Success,
            category: 'Traitement 2ème Ligne (Patient Sensible/Hautement Sensible)',
            text: 'Réintroduction de la chimiothérapie de 1ère ligne (sel de platine + étoposide) si ILST > 3-6 mois. Topotécan IV ou oral est une option validée.'
          });
        } else if (patientData.responseStatus === 'resistant' || patientData.responseStatus === 'refractaire') { 
          recs.push({
            type: RecommendationType.Warning,
            category: 'Traitement 2ème Ligne (Patient Résistant/Réfractaire)',
            text: 'Options limitées : Topotécan, Lurbinectédine (si disponible via AAC/ATU), CAV (Cyclophosphamide, Doxorubicine, Vincristine). Essais cliniques à privilégier. Soins de support optimisés.'
          });
        }
        recs.push({
          type: RecommendationType.Info,
          category: 'Option Lurbinectédine (2ème ligne et +)',
          text: 'Lurbinectédine (3,2mg/m² IV q3S) est une option en cas d\'échec d\'une 1ère ligne à base de platine (accès compassionnel/ATU selon pays).'
        });
      }
    } 
    else if (effectiveStage === 'I-III') {
      const isFitForConcurrentRCT = (patientData.ps && parseInt(patientData.ps) <= 1) && 
                                  ((g8ScoreToUse === null && (!patientData.age || parseInt(patientData.age) < 70)) || (g8ScoreToUse !== null && g8ScoreToUse > 14));
      recs.push({
        type: RecommendationType.Info,
        category: 'Traitement CBPC Stade Limité (I-III) - Principes',
        text: 'L\'objectif est curatif. L\'association radio-chimiothérapie concomitante est le standard pour les patients en bon état général (PS 0-1).'
      });
      recs.push({
        type: RecommendationType.Success,
        category: `Traitement Standard (Stade Limité, PS 0-1${(patientData.age && parseInt(patientData.age) >= 70) ? (isFitForConcurrentRCT ? ", G8 > 14" : "") : ""})`,
        text: 'Radio-chimiothérapie (RCT) concomitante suivie d\'une immunothérapie adjuvante par durvalumab pendant 1 an (étude PACIFIC).'
      });
      recs.push({
        type: RecommendationType.Info,
        category: 'Modalités RCT Concomitante (Stade Limité)',
        text: 'Chimiothérapie : Cisplatine + Étoposide (4 cycles). Radiothérapie thoracique : classiquement 45 Gy en 30 fractions (bifractionné) ou 60-66 Gy en 30-33 fractions (monofractionné), début idéalement avec le 1er ou 2ème cycle de chimiothérapie.'
      });
       recs.push({
        type: RecommendationType.Success,
        category: 'Immunothérapie Adjuvante (Stade Limité)',
        text: 'Durvalumab : 10 mg/kg IV q2S ou 1500mg IV q4S pendant 12 mois, à débuter dans les 42 jours post-RCT si absence de progression.'
      });
      if (!isFitForConcurrentRCT || (patientData.ps && parseInt(patientData.ps) > 1) || (patientData.age && parseInt(patientData.age) >= 75)) {
        recs.push({
          type: RecommendationType.Warning,
          category: 'Adaptation (Stade Limité - Patient Fragile/PS ≥ 2/Âgé)',
          text: 'Chez les patients âgés (≥75 ans), fragiles (G8 ≤ 14 et âge ≥ 70) ou PS ≥ 2 : RCT séquentielle (chimiothérapie puis radiothérapie) ou radiothérapie exclusive peuvent être discutées. L\'immunothérapie adjuvante est alors moins établie. Décision en RCP.'
        });
      }
      if ((!patientData.ps || parseInt(patientData.ps) <= 1) && (!patientData.age || parseInt(patientData.age) < 70)) { // ICP for younger, fit patients
         recs.push({
            type: RecommendationType.Info,
            category: 'Irradiation Cérébrale Prophylactique (ICP) - Option (Stade Limité)',
            text: 'ICP à discuter chez les patients en bonne réponse après RCT (PS 0-1, âge < 70 ans) : 25 Gy en 10 fractions. Diminue le risque de métastases cérébrales mais impact sur qualité de vie à considérer. Décision au cas par cas.'
        });
      }
    } else { // Stage not I-III or IV
        recs.push({
            type: RecommendationType.Warning,
            category: 'Stade Non Défini ou Incomplet',
            text: `Le stade du patient (actuellement "${effectiveStage || 'Non renseigné'}") n\'est pas clairement défini comme limité (I-III) ou métastatique (IV). Veuillez compléter/vérifier les informations de stadification pour obtenir des recommandations précises.`
        });
    }

    if (patientData.egfrMutation) {
      recs.push({
        type: RecommendationType.Warning,
        category: 'Cas Particulier : Transformation CBPC sur CBNPC EGFR muté',
        text: 'En cas de transformation d\'un CBNPC EGFR muté en CBPC : Chimiothérapie type CBPC (Platine + Étoposide). La place de l\'immunothérapie est débattue (RCP). Poursuite du TKI EGFR anti-EGFR peut être discutée si la composante CBNPC persiste ou si mutation EGFR toujours présente. Essais cliniques à rechercher.'
      });
    }
    
    if (patientData.brainMets) {
        recs.push({
            type: RecommendationType.Info,
            category: 'Prise en Charge des Métastases Cérébrales',
            text: 'Radiothérapie cérébrale (in toto ou stéréotaxique selon nombre et taille des lésions) et corticothérapie. Le traitement systémique doit aussi être adapté pour une bonne pénétration cérébrale si possible.'
        });
    }

    recs.push({
      type: RecommendationType.Info,
      category: 'Soins de Support Essentiels',
      text: 'Gestion des symptômes, support nutritionnel, prise en charge psycho-sociale, G-CSF en prophylaxie (secondaire si neutropénie fébrile, primaire si haut risque). Aide au sevrage tabagique OBLIGATOIRE.'
    });
    recs.push({
      type: RecommendationType.Info,
      category: 'Surveillance Post-Thérapeutique',
      text: 'Rythme adapté à la situation clinique et au stade. Typiquement : TDM thoraco-abdomino-pelvien +/- imagerie cérébrale tous les 3-4 mois les 2-3 premières années, puis espacement progressif. Attention au risque de seconds cancers (poumon, ORL).'
    });

    setRecommendations(recs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData, calculateG8Score]); // calculateG8Score is stable due to useCallback

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStepId = STEPS[currentIndex + 1].id;
      setCurrentStep(nextStepId);
      // Recommendations will be generated by useEffect when currentStep becomes Results
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };
  
  const handleStepClick = (stepId: StepId) => {
    const targetIndex = STEPS.findIndex(s => s.id === stepId);
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);

    // Allow navigation to already completed steps, current step, or any previous step.
    if (targetIndex <= currentIndex || completedSteps.has(stepId)) {
        setCurrentStep(stepId);
        // useEffect will handle generating recommendations if navigating to Results step and they aren't there.
    }
  };

  const applyG8Score = (score: number) => {
    updatePatientData('g8Score', score.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }));
    setShowG8Calculator(false);
  };

  const applyTNMStage = (calculatedStage: { T: string, N: string, M: string, stage: string }) => {
    setPatientData(prev => ({
      ...prev,
      tnmDetails: {
        ...prev.tnmDetails,
        calculatedT: calculatedStage.T,
        calculatedN: calculatedStage.N,
        calculatedM: calculatedStage.M,
        finalStage: calculatedStage.stage
      },
      // Update overall stage based on detailed TNM if TNM is complete and valid
      stage: (calculatedStage.stage && calculatedStage.stage !== "Stade Incomplet") 
             ? (calculatedStage.stage.includes('IV') ? 'IV' : 'I-III') 
             : prev.stage // Keep previous stage if TNM is incomplete
    }));
    setShowTNMCalculator(false);
  };

  const resetApp = () => {
    setPatientData(initialPatientData);
    setRecommendations([]);
    setCurrentStep(StepId.Evaluation);
    setShowG8Calculator(false);
    setShowTNMCalculator(false);
    setCompletedSteps(new Set());
  };

  // Check if G8 is considered complete: either score is directly entered, or all answers are provided.
  const isG8ConsideredComplete = !!patientData.g8Score || Object.values(patientData.g8Answers).every(ans => ans !== '');
  // Check if TNM is considered complete: finalStage is present and not "Stade Incomplet".
  const isTNMConsideredComplete = !!patientData.tnmDetails.finalStage && patientData.tnmDetails.finalStage !== "Stade Incomplet";


  const renderCurrentStep = () => {
    if (showG8Calculator) {
      return <G8Calculator 
                g8Answers={patientData.g8Answers} 
                onAnswerChange={updateG8Answer}
                onSubmit={applyG8Score}
                onCancel={() => setShowG8Calculator(false)}
             />;
    }
    if (showTNMCalculator) {
      return <TNMCalculator 
                tnmDetails={patientData.tnmDetails}
                onDetailChange={updateTNMDetail}
                onSubmit={applyTNMStage}
                onCancel={() => setShowTNMCalculator(false)}
             />;
    }

    switch (currentStep) {
      case StepId.Evaluation:
        return <EvaluationStep patientData={patientData} onDataChange={updatePatientData} onToggleG8Calculator={() => setShowG8Calculator(true)} isG8Complete={isG8ConsideredComplete} />;
      case StepId.Staging:
        return <StagingStep patientData={patientData} onDataChange={updatePatientData} onToggleTNMCalculator={() => setShowTNMCalculator(true)} isTNMComplete={isTNMConsideredComplete} />;
      case StepId.Treatment:
        return <TreatmentStep patientData={patientData} onDataChange={updatePatientData} />;
      case StepId.Results:
        return <ResultsStep recommendations={recommendations} patientData={patientData} />;
      default:
        return <p>Étape inconnue.</p>;
    }
  };
  
  useEffect(() => {
    if (currentStep === StepId.Results && recommendations.length === 0) {
        generateRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // generateRecommendations removed from deps as it depends on patientData, which is broad. Triggering only on currentStep change to Results.

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-sky-800 sm:text-5xl">
          Aide à la Décision Thérapeutique <span className="text-teal-600">CBPC</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Prise en charge du Carcinome Broncho-Pulmonaire à Petites Cellules
        </p>
      </header>

      <main className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <StepNavigation currentStepId={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps}/>
        
        <div className="mt-8">
          {renderCurrentStep()}
        </div>

        {(!showG8Calculator && !showTNMCalculator) && (
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={resetApp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 order-1 sm:order-none"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <ChevronLeft className="h-5 w-5" />
                Précédent
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex === STEPS.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Suivant
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-slate-500 space-y-1">
        <p>© 2025 CBPC Decision Support Tool, développé par Dr Zouhair Souissi</p>
        <p>Cet outil ne se substitue pas à l'avis médical professionnel ni aux recommandations des sociétés savantes.</p>
        <p>Application inspirée de la 21ème édition des Référentiels Auvergne Rhône-Alpes en oncologie thoracique 2025.</p>
      </footer>
    </div>
  );
};

export default App;
