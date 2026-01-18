export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswers: OptionKey[];
}

export const quizQuestions: Question[] = [
  {
    id: 1,
    question: "Qui est habilité à prendre des arrêtés ?",
    options: {
      a: "le Secrétaire général du Gouvernement",
      b: "le Gouverneur de région",
      c: "le Maire",
      d: "le Directeur de cabinet"
    },
    correctAnswers: ['b', 'c']
  },
  {
    id: 2,
    question: "Qui est le premier responsable de la Fonction publique burkinabè ?",
    options: {
      a: "le Président du Faso",
      b: "le Chef du Gouvernement",
      c: "le Directeur général de l'AGRE",
      d: "le Ministre en charge de la Fonction publique"
    },
    correctAnswers: ['b']
  },
  {
    id: 3,
    question: "Qui a dit : « Vis comme si tu devais mourir demain. Apprends comme si tu devais vivre toujours » ?",
    options: {
      a: "Mère Teresa",
      b: "Aimé Césaire",
      c: "Mohandas Gandhi",
      d: "Amadou Hampâté Bâ"
    },
    correctAnswers: ['c']
  },
  {
    id: 4,
    question: "Parmi ces continents, lequel possède le plus de pays ?",
    options: {
      a: "Amérique",
      b: "Europe",
      c: "Afrique",
      d: "Asie"
    },
    correctAnswers: ['c']
  },
  {
    id: 5,
    question: "Combien de jours après la publication d'une loi au Journal Officiel celle-ci entre-t-elle en vigueur ?",
    options: {
      a: "6 jours francs",
      b: "7 jours francs",
      c: "8 jours francs",
      d: "9 jours francs"
    },
    correctAnswers: ['c']
  },
  {
    id: 6,
    question: "La toute première projection du film « Sira » a eu lieu :",
    options: {
      a: "lors du 73e Festival international du film de Berlin",
      b: "lors du 28e Festival panafricain du cinéma et de la télévision de Ouagadougou",
      c: "le 21 février 2023",
      d: "le 28 février 2023"
    },
    correctAnswers: ['a']
  },
  {
    id: 7,
    question: "Qui a joué le rôle de « Sira » dans le film du même nom ?",
    options: {
      a: "Nathalie Vairac",
      b: "Ruth Werner",
      c: "Nafissatou Cissé",
      d: "Oumou Bâ"
    },
    correctAnswers: ['c']
  },
  {
    id: 8,
    question: "La mesure de publicité des décisions individuelles prend la forme :",
    options: {
      a: "d'une publication",
      b: "d'une notification",
      c: "d'un affichage",
      d: "d'un communiqué"
    },
    correctAnswers: ['b']
  },
  {
    id: 9,
    question: "La description des postes de travail permet :",
    options: {
      a: "une gestion rationnelle et efficace des ressources humaines",
      b: "de licencier des travailleurs",
      c: "de minimiser les conflits de compétence",
      d: "de réduire les heures de travail"
    },
    correctAnswers: ['a', 'c']
  },
  {
    id: 10,
    question: "Qui ratifie les traités et accords internationaux ?",
    options: {
      a: "le Président de l'Assemblée nationale",
      b: "le Premier ministre",
      c: "le Président du Faso",
      d: "le Ministre des Affaires étrangères"
    },
    correctAnswers: ['c']
  },
  {
    id: 11,
    question: "Lorsque le Président du Faso est empêché de façon temporaire de remplir ses fonctions, ses pouvoirs sont provisoirement exercés par :",
    options: {
      a: "le Président de l'Assemblée nationale",
      b: "le Premier ministre",
      c: "le Président du Conseil constitutionnel",
      d: "le Secrétaire général du Gouvernement"
    },
    correctAnswers: ['b']
  },
  {
    id: 12,
    question: "En cas de vacance de la présidence de la Transition, l'intérim est assuré par :",
    options: {
      a: "le Premier ministre",
      b: "le Président de l'ALT",
      c: "le Président du Conseil constitutionnel",
      d: "le Secrétaire général du Gouvernement"
    },
    correctAnswers: ['a']
  },
  {
    id: 13,
    question: "Parmi les éléments constitutifs de l'État, on a :",
    options: {
      a: "les forces armées",
      b: "le territoire",
      c: "les pouvoirs locaux",
      d: "l'Assemblée nationale"
    },
    correctAnswers: ['b']
  },
  {
    id: 14,
    question: "Qui assure le contrôle de l'action gouvernementale ?",
    options: {
      a: "Le Président du Faso",
      b: "Le Premier ministre",
      c: "Le Parlement",
      d: "Le Conseil Constitutionnel"
    },
    correctAnswers: ['c']
  },
  {
    id: 15,
    question: "Le fonctionnaire burkinabè peut prendre une disponibilité pour :",
    options: {
      a: "convenance personnelle",
      b: "rejoindre son conjoint",
      c: "élever un enfant de moins de cinq ans",
      d: "exercer un mandat syndical"
    },
    correctAnswers: ['a', 'b', 'c', 'd']
  },
  {
    id: 16,
    question: "La Fonction publique hospitalière est consacrée au Burkina par la :",
    options: {
      a: "Loi 013-98",
      b: "Loi 055-2004",
      c: "Loi 056-2017",
      d: "Loi 081-2015"
    },
    correctAnswers: ['c']
  },
  {
    id: 17,
    question: "Lorsqu'un ministre apporte un message de son Président à un Chef d'État étranger, ce message est :",
    options: {
      a: "un message spécial",
      b: "un message de créance",
      c: "un message d'accréditation",
      d: "une correspondance spéciale"
    },
    correctAnswers: ['a']
  },
  {
    id: 18,
    question: "L'accord de siège est conclu entre :",
    options: {
      a: "deux États",
      b: "deux OIG",
      c: "un État et une OIG",
      d: "un État et une ONG"
    },
    correctAnswers: ['c']
  },
  {
    id: 19,
    question: "L'auteur de « Défense et illustration de la langue française » est :",
    options: {
      a: "Joachim du Bellay",
      b: "Michel de Montaigne",
      c: "Anatole France",
      d: "François Rabelais"
    },
    correctAnswers: ['a']
  },
  {
    id: 20,
    question: "Donnez l'auteur et le genre de l'œuvre intitulée « Trois prétendants ... un mari » :",
    options: {
      a: "Adiza Sanoussi",
      b: "Guillaume Oyônô Mbia",
      c: "un roman",
      d: "une pièce théâtrale"
    },
    correctAnswers: ['a', 'd']
  }
];