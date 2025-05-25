import { useState, useCallback, useMemo, useEffect } from 'react';
import { TreeNode, Answers, HistoryItem, DecisionOption, TnmAnswers, StageDetail } from '../types';
import { DECISION_TREE_DATA, MAX_DECISION_STEPS } from '../constants';

interface UseDecisionTreeLogicReturn {
  currentNode: TreeNode | null;
  answers: Answers;
  history: HistoryItem[];
  progress: number;
  isRecommendation: boolean;
  handleAnswer: (questionId: string, option: DecisionOption) => void;
  goBack: () => void;
  restart: () => void;
}

export const useDecisionTreeLogic = (
  initialNodeId: string | null, 
  tnmData: TnmAnswers | null, // Kept for general context if needed
  targetSurgicalNodeIfOperable: string | null,
  calculatedStageInfo: StageDetail | null
): UseDecisionTreeLogicReturn => {
  const [currentId, setCurrentId] = useState<string | null>(initialNodeId);
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setCurrentId(initialNodeId);
    // Store initial stage info in answers if needed for dynamic text in operability nodes
    const initialAnswers: Answers = {};
    if (calculatedStageInfo) {
      initialAnswers.calculatedStageGroup = calculatedStageInfo.group;
      initialAnswers.calculatedStage = calculatedStageInfo.stage;
    }
    setAnswers(initialAnswers);
    setHistory([]);
  }, [initialNodeId, calculatedStageInfo]);


  const currentNode = useMemo(() => {
    if (!currentId) return null;
    return DECISION_TREE_DATA[currentId] || DECISION_TREE_DATA['ERROR_NODE'] || null;
  }, [currentId]);

  const isRecommendation = useMemo(() => currentNode?.type === 'recommendation', [currentNode]);

  const handleAnswer = useCallback((questionId: string, option: DecisionOption) => {
    const newAnswers = { ...answers, [questionId]: option.value };
    setAnswers(newAnswers);
    
    const historyEntry: HistoryItem = { nodeId: questionId, answersSnapshot: { ...answers } }; 
    setHistory(prevHistory => [...prevHistory, historyEntry]);
    
    let nextNode = option.nextId;

    // Special handling for operability assessment completion
    if (questionId === 'Q_OPERABILITY_CARDIAC_COMORBID' && option.value === 'risque_acceptable') {
      if (targetSurgicalNodeIfOperable) {
        nextNode = targetSurgicalNodeIfOperable;
      } else {
        console.error("Operability confirmed, but no target surgical node defined!");
        nextNode = 'ERROR_NODE';
      }
    } else if (questionId === 'Q_OPERABILITY_VEMS_DLCO' && option.value === 'unknown') {
        nextNode = 'R_OPERABILITY_DISCUSSION_RCP';
    } else if (questionId === 'Q_OPERABILITY_VO2MAX' && (option.value === 'vo2max_35_75' || option.value === 'unknown_vo2max')) {
        nextNode = 'R_OPERABILITY_DISCUSSION_RCP';
    }
    // Route to non-surgical if operability assessment results in inoperable
    else if (questionId === 'Q_OPERABILITY_CARDIAC_COMORBID' && option.value === 'risque_eleve_ci' ) {
        if (calculatedStageInfo?.group === 'Stade I' || calculatedStageInfo?.group === 'Stade II') {
            nextNode = 'FIG8_R_INOPERABLE'; // Or a more generic inoperable node for early stage
        } else if (calculatedStageInfo?.group === 'Stade III') {
            nextNode = 'FIG10_Q1_PS_AGE'; // Non-resectable Stage III pathway
        } else {
            nextNode = 'FIG10_Q1_PS_AGE'; // Default for other cases deemed inoperable
        }
    } else if (questionId === 'Q_OPERABILITY_VO2MAX' && option.value === 'vo2max_lt35' ) {
         if (calculatedStageInfo?.group === 'Stade I' || calculatedStageInfo?.group === 'Stade II') {
            nextNode = 'R_PATIENT_INOPERABLE_FONCTIONNEL_RESP'; 
        } else if (calculatedStageInfo?.group === 'Stade III') {
            nextNode = 'FIG10_Q1_PS_AGE'; 
        } else {
            nextNode = 'FIG10_Q1_PS_AGE';
        }
    }


    setCurrentId(nextNode);
  }, [answers, targetSurgicalNodeIfOperable, calculatedStageInfo]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const previousHistoryItem = history[history.length - 1];
      setCurrentId(previousHistoryItem.nodeId);
      setAnswers(previousHistoryItem.answersSnapshot); 
      setHistory(prevHistory => prevHistory.slice(0, -1));
    }
  }, [history]);

  const restart = useCallback(() => {
    setCurrentId(initialNodeId); 
    const initialAnswersReset: Answers = {};
    if (calculatedStageInfo) {
      initialAnswersReset.calculatedStageGroup = calculatedStageInfo.group;
      initialAnswersReset.calculatedStage = calculatedStageInfo.stage;
    }
    setAnswers(initialAnswersReset);
    setHistory([]);
  }, [initialNodeId, calculatedStageInfo]);

  const progress = useMemo(() => {
    if (isRecommendation || !initialNodeId) return 1; 
    return Math.min(history.length / MAX_DECISION_STEPS, 1); 
  }, [history, isRecommendation, initialNodeId]);

  return {
    currentNode,
    answers,
    history,
    progress,
    isRecommendation,
    handleAnswer,
    goBack,
    restart,
  };
};