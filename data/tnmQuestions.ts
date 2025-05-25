import { TnmQuestionCategory, TnmAnswers } from '../types';

export const tnmQuestionnaireData: TnmQuestionCategory[] = [
  {
    title: 'T - Tumeur Primitive',
    questions: [
      {
        id: 't_size',
        label: 'Taille de la tumeur (plus grande dimension) ?',
        type: 'select',
        options: [
          { label: 'Non spécifié', value: 'nsp' },
          { label: 'Tis (Carcinome in situ)', value: 'tis' },
          { label: 'T1a(mi) (Adénocarcinome à invasion minime)', value: 't1a_mi' },
          { label: 'T1a (≤ 1cm)', value: 't1a' },
          { label: 'T1b (> 1 cm et ≤ 2 cm)', value: 't1b' },
          { label: 'T1c (> 2 cm et ≤ 3 cm)', value: 't1c' },
          { label: 'T2a (> 3 cm et ≤ 4 cm)', value: 't2a' },
          { label: 'T2b (> 4 cm et ≤ 5 cm)', value: 't2b' },
          { label: 'T3 (> 5 cm et ≤ 7 cm)', value: 't3_size' },
          { label: 'T4 (> 7 cm)', value: 't4_size' },
        ],
      },
      {
        id: 't_bronche_souche',
        label: 'Envahissement d\'une bronche souche (quelle que soit la distance / carène, mais sans envahissement de la carène) ? (Critère T2)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_plevre_viscerale',
        label: 'Envahissement de la plèvre viscérale ? (Critère T2)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_atelectasie_pneumonie',
        label: 'Existence d\'une atélectasie ou pneumonie obstructive ? (Critère T2)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_nodules_meme_lobe',
        label: 'Associée à un(des) nodule(s) tumoral(aux) distinct(s) dans le MÊME lobe ? (Critère T3)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_envahissement_paroi_nerfphrenique_plevreparietale_pericarde',
        label: 'Envahissant directement : la paroi thoracique (incluant les tumeurs du sommet), le nerf phrénique, la plèvre pariétale ou le péricarde pariétal ? (Critère T3)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_nodules_diff_lobe_meme_poumon',
        label: 'Associée à des nodules tumoraux séparés dans deux lobes différents du MÊME poumon ? (Critère T4)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
      {
        id: 't_envahissement_mediastin_coeur_vaisseaux_trachee_carene_diaphragme_nerfrecurent_oesophage_vertebres',
        label: 'Envahissant directement : le médiastin, le cœur ou les gros vaisseaux, la trachée, ou la carène, le diaphragme, le nerf récurrent, l’œsophage, un(des) corps vertébral(ux) ? (Critère T4)',
        type: 'radio',
        options: [
          { label: 'Oui', value: 'oui' },
          { label: 'Non', value: 'non' },
          { label: 'Non Spécifié', value: 'nsp' },
        ],
      },
    ],
  },
  {
    title: 'N - Adénopathies Régionales',
    questions: [
      {
        id: 'n_status',
        label: 'Statut ganglionnaire régional ?',
        type: 'select',
        options: [
          { label: 'Non spécifié', value: 'nsp' },
          { label: 'Nx (Envahissement locorégional inconnu)', value: 'nx'},
          { label: 'N0 (Absence de métastase ganglionnaire régionale)', value: 'n0' },
          { label: 'N1 (Métastases ganglionnaires péribronchiques homolatérales et/ou hilaires homolatérales incluant une extension directe)', value: 'n1' },
          { label: 'N2 (Métastases dans les ganglions médiastinaux homolatéraux ou dans les ganglions sous-carénaires)', value: 'n2' },
          { label: 'N3 (Métastases ganglionnaires médiastinales controlatérales ou hilaires controlatérales ou scaléniques, sus-claviculaires homo- ou controlatérales)', value: 'n3' },
        ],
      },
      {
        id: 'n2_site_status',
        label: 'Si N2 : Atteinte ganglionnaire N2 unisite ou multisite ?',
        type: 'radio',
        options: [
          { label: 'Unisite', value: 'unisite' },
          { label: 'Multisite', value: 'multisite' },
          { label: 'Non Spécifié / Non Applicable', value: 'nsp' },
        ],
        condition: (answers) => answers.n_status === 'n2',
      },
      {
        id: 'n2_bulky_status',
        label: 'Si N2 : Adénopathie(s) N2 de type "bulky" (ex: >2.5cm, rupture capsulaire suspectée) ?',
        type: 'radio',
        options: [
          { label: 'Oui (Bulky)', value: 'oui' },
          { label: 'Non (Non-Bulky)', value: 'non' },
          { label: 'Non Spécifié / Non Applicable', value: 'nsp' },
        ],
        condition: (answers) => answers.n_status === 'n2',
      },
    ],
  },
  {
    title: 'M - Métastases à Distance',
    questions: [
      {
        id: 'm_status',
        label: 'Existence de métastases à distance ?',
        type: 'select',
        options: [
          { label: 'Non spécifié', value: 'nsp' },
          { label: 'M0 (Pas de métastase à distance)', value: 'm0' },
          { label: 'M1a (Nodule(s) tumoral(ux) séparés dans un lobe controlatéral, ou nodules pleuraux ou pleurésie maligne ou péricardite maligne)', value: 'm1a' },
          { label: 'M1b (Une seule métastase extrathoracique dans un seul système d’organe)', value: 'm1b' },
          { label: 'M1c (Plusieurs métastases extrathoraciques dans un seul ou plusieurs système(s) d’organes)', value: 'm1c' },
        ],
      },
    ],
  },
];