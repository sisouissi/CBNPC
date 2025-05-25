
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuestionDisplay } from './components/QuestionDisplay';
import { RecommendationDisplay } from './components/RecommendationDisplay';
import { StyledButton } from './components/StyledButton';
import { ProgressBar } from './components/ProgressBar';
import { TnmQuestionnaire } from './components/TnmQuestionnaire';
import { HomeScreen } from './components/HomeScreen'; 
import { useDecisionTreeLogic } from './hooks/useDecisionTreeLogic';
import { QuestionNode, RecommendationNode, TnmAnswers, initialTnmAnswers, StageDetail, Answers } from './types';
import { MAX_DECISION_STEPS } from './constants';
import { determineNextNodeIdFromTnm, calculateStageInfo } from './utils/tnmStaging';

// SVG Icons (Fluent UI style would be ideal, Heroicons are a good fallback)
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( // Slightly smaller for Fluent
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5V21A.75.75 0 003.75 21H8.25v-5.25h7.5v5.25H19.5A.75.75 0 0020.25 21V10.5M15.75 19.5V10.5L12 7.5l-3.75 3V19.5" />
</svg>
);

const ArrowPathIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<'home' | 'tnm' | 'main'>('home'); 
  const [tnmData, setTnmData] = useState<TnmAnswers>(initialTnmAnswers); 
  const [calculatedStageInfo, setCalculatedStageInfo] = useState<StageDetail | null>(null);
  const [initialNodeIdForTree, setInitialNodeIdForTree] = useState<string | null>(null);
  const [targetSurgicalNodeIfOperable, setTargetSurgicalNodeIfOperable] = useState<string | null>(null);

  const {
    currentNode,
    answers,
    history,
    progress,
    isRecommendation,
    handleAnswer,
    goBack,
    restart: restartDecisionTreeLogic,
  } = useDecisionTreeLogic(initialNodeIdForTree, tnmData, targetSurgicalNodeIfOperable, calculatedStageInfo);

  useEffect(() => {
    if (screen !== 'main' && initialNodeIdForTree) {
      setInitialNodeIdForTree(null); 
      setCalculatedStageInfo(null);
      setTargetSurgicalNodeIfOperable(null);
    }
  }, [screen, initialNodeIdForTree]);

  const handleStartEvaluation = () => {
    setTnmData(initialTnmAnswers); 
    setCalculatedStageInfo(null);
    setInitialNodeIdForTree(null);
    setTargetSurgicalNodeIfOperable(null);
    setScreen('tnm');
  };

  const handleTnmComplete = (data: TnmAnswers) => {
    setTnmData(data);
    const stageInfo = calculateStageInfo(data);
    setCalculatedStageInfo(stageInfo);
    const { initialNodeId, targetSurgicalNodeIfOperable: targetNode } = determineNextNodeIdFromTnm(data, stageInfo);
    setInitialNodeIdForTree(initialNodeId);
    setTargetSurgicalNodeIfOperable(targetNode || null);
    setScreen('main');
  };

  const handleGoHome = () => {
    setTnmData(initialTnmAnswers); 
    setCalculatedStageInfo(null);
    setInitialNodeIdForTree(null); 
    setTargetSurgicalNodeIfOperable(null);
    setScreen('home');
  };
  
  const restartTreeWithCurrentTnm = () => {
    if (tnmData) { 
      const stageInfo = calculatedStageInfo || calculateStageInfo(tnmData); 
      const { initialNodeId, targetSurgicalNodeIfOperable: targetNode } = determineNextNodeIdFromTnm(tnmData, stageInfo);
      setInitialNodeIdForTree(initialNodeId); 
      setTargetSurgicalNodeIfOperable(targetNode || null);
    } else {
      handleGoHome(); 
    }
  };
  
  if (screen === 'home') {
    return <HomeScreen onStartEvaluation={handleStartEvaluation} />;
  }

  if (screen === 'tnm') {
    return <TnmQuestionnaire onComplete={handleTnmComplete} initialData={tnmData} onGoHome={handleGoHome} />;
  }
  
  if (screen === 'main' && initialNodeIdForTree && calculatedStageInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-background">
        <Header />
        <main className="flex-grow container mx-auto max-w-2xl w-full p-4 sm:p-6 md:p-8">
          <div className="bg-neutral-surface shadow-md rounded-lg p-6 sm:p-8">
            {calculatedStageInfo && (
              <div className="mb-6 p-3 bg-primary-light border border-primary rounded-md text-center">
                <p className="text-base text-primary-dark font-semibold"> {/* Increased font size */}
                  Stade TNM Calculé: <strong className="font-bold text-lg">{calculatedStageInfo.stage}</strong> {/* Increased font size */}
                  (T: {calculatedStageInfo.rawT}, N: {calculatedStageInfo.rawN}, M: {calculatedStageInfo.rawM})
                </p>
                <p className="text-sm text-primary-dark opacity-80">{calculatedStageInfo.group}</p> {/* Increased font size */}
                <p className="text-sm text-primary-dark opacity-80"> {/* Increased font size */}
                  Statut Résécabilité (TNM): <span className="font-medium">{calculatedStageInfo.resectabilityStatus}</span>
                </p>
              </div>
            )}
            {currentNode ? (
              <>
                {!isRecommendation && (
                   <ProgressBar 
                      progress={progress} 
                      currentStep={Math.min(history.length + 1, MAX_DECISION_STEPS)} 
                      totalSteps={MAX_DECISION_STEPS} 
                    />
                )}
                {currentNode.type === 'question' && (
                  <QuestionDisplay
                    questionNode={currentNode as QuestionNode}
                    onAnswer={handleAnswer}
                  />
                )}
                {currentNode.type === 'recommendation' && (
                  <RecommendationDisplay
                    recommendationNode={currentNode as RecommendationNode}
                    answers={{...answers, calculatedStageGroup: calculatedStageInfo?.group, calculatedStage: calculatedStageInfo?.stage} as Answers}
                  />
                )}
                <div className="mt-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  {history.length > 0 && (
                    <StyledButton 
                      onClick={goBack} 
                      variant="secondary" 
                      className="sm:flex-1"
                      iconLeft={<ChevronLeftIcon />}
                      size="md"
                    >
                      Précédent
                    </StyledButton>
                  )}
                  <StyledButton 
                    onClick={handleGoHome}
                    variant="secondary" 
                    className="sm:flex-1"
                    iconLeft={<HomeIcon />}
                     size="md"
                  >
                    Accueil
                  </StyledButton>
                </div>
                  {isRecommendation && (
                      <StyledButton
                          onClick={restartTreeWithCurrentTnm}
                          variant="ghost"
                          className="mt-4 w-full"
                           iconLeft={<ArrowPathIcon />}
                           size="md"
                      >
                          Recommencer (garder TNM)
                      </StyledButton>
                  )}
              </>
            ) : (
              <p className="text-center text-text-secondary py-10">Chargement de l'arbre de décision pour le stade {calculatedStageInfo?.stage || 'calculé'}...</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return <HomeScreen onStartEvaluation={handleStartEvaluation} />;
};

export default App;
