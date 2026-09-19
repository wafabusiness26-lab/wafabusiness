export const ALGER_COMMUNES = [
  'Aïn Bénian',
  'Aïn Taya',
  'Algiers Centre (Alger Centre)',
  'Baba Hassen',
  'Bab El Oued',
  'Bab Ezzouar',
  'Bachedjerah',
  'Baraki',
  'Ben Aknoun',
  'Beni Messous',
  'Birkhadem',
  'Bir Mourad Raïs',
  'Birtouta',
  'Bologhine',
  'Bordj El Bahri',
  'Bordj El Kiffan',
  'Bourouba',
  'Bouzaréah',
  'Casbah',
  'Chéraga',
  'Dar El Beïda',
  'Dely Ibrahim',
  'Djesser Kasentina',
  'Draria',
  'Douera',
  'El Achour',
  'El Biar',
  'El Hammamet',
  'El Harrach',
  'El Madania',
  'El Magharia',
  'El Marsa',
  'El Mouradia',
  "H'raoua",
  'Hussein Dey',
  'Hydra',
  'Khraicia',
  'Kouba',
  'Mahelma',
  'Mohammedia',
  'Oued Koriche',
  'Oued Smar',
  'Ouled Chebel',
  'Ouled Fayet',
  'Rahmania',
  'Raïs Hamidou',
  'Reghaïa',
  'Rouïba',
  'Sidi M\'Hamed',
  'Sidi Moussa',
  'Souidania',
  'Staoueli',
  'Tessala El Merdja',
  'Zéralda'
] as const;

export type AlgerCommune = typeof ALGER_COMMUNES[number];

export const ADMIN_CONTACT = {
  name: 'Coordination TataWafa Alger',
  phone: '0782 37 43 37',
  phoneDisplay: '+213 (0) 782 37 43 37',
  whatsapp: 'https://wa.me/213782374337',
  email: 'wafabusiness26@gmail.com',
  address: 'Didouche Mourad, Alger Centre, Wilaya d\'Alger',
  workingHours: '7j/7 de 08:00 à 21:00'
};

export const CATEGORIES_CONFIG = {
  babysitting: {
    id: 'babysitting',
    title: 'Garde d\'Enfants (Babysitting)',
    shortTitle: 'Garde d\'enfants',
    desc: 'Nounous attentionnées, garde périscolaire, sorties d\'école, soirées et weekends.',
    subcategories: [
      'Garde ponctuelle (Soirée / Weekend)',
      'Sortie d\'école & Goûter',
      'Garde à temps plein (Nourrissons & Bébés)',
      'Garde partagée entre deux familles'
    ],
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    color: 'indigo'
  },
  teaching: {
    id: 'teaching',
    title: 'Cours Particuliers & Soutien Scolaire',
    shortTitle: 'Soutien scolaire',
    desc: 'Enseignants qualifiés pour le Primaire, CEM et Lycée (Maths, Physique, Langues, Sciences).',
    subcategories: [
      'Primaire (Toutes matières & Aide aux devoirs)',
      'CEM / BEM (Mathématiques, Physique, Français, Arabe)',
      'Lycée / BAC (Maths, Sciences, Physique-Chimie, Philosophie)',
      'Apprentissage des langues (Français, Anglais)'
    ],
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    color: 'emerald'
  }
};

export const SAFETY_PILLARS = [
  {
    title: '1. Zéro Document Sensible sur le Web',
    desc: 'Aucune pièce d\'identité, passeport ou document confidentiel n\'est hébergé sur internet. La protection de votre vie privée est totale.',
    icon: 'ShieldLock'
  },
  {
    title: '2. Vérification Physique en Main Propre',
    desc: 'Chaque prestataire rencontre notre équipe en personne à Alger pour présenter sa carte d\'identité biométrique originale et ses justificatifs de compétences.',
    icon: 'UserCheck'
  },
  {
    title: '3. Coordination Téléphonique Humaine',
    desc: 'Pas d\'algorithme impersonnel : un coordinateur vous appelle personnellement pour valider le créneau, les tarifs et les besoins spécifiques de votre famille.',
    icon: 'PhoneCall'
  },
  {
    title: '4. Paiement Direct en Espèces (DA)',
    desc: 'Aucune carte bancaire requise sur le site. Vous réglez directement le prestataire en dinars algériens, de main à main, à la fin de la séance ou du mois.',
    icon: 'Coins'
  }
];

export const LEGALIZATION_NOTICE = "Chaque photocopie présentée par le prestataire doit obligatoirement être une copie conforme légalisée par l'APC (Mairie). Aucune copie simple non tamponnée n'est acceptée.";

export const PHYSICAL_CHECKLIST = [
  "Photocopie légalisée de la pièce d'identité (CNI biométrique ou passeport en cours de validité)",
  "Extrait de naissance récent (12S ou état civil)",
  "Fiche familiale d'état civil (ou fiche individuelle pour célibataire)",
  "Certificat de résidence récent dans la Wilaya d'Alger",
  "Casier judiciaire — adultes (Bulletin N°3 vierge récent délivré par la justice)",
  "3 photos d'identité récentes",
  "Photocopie légalisée du diplôme ou certificat de scolarité"
] as const;

export const VERIFICATION_DOCUMENTS_DETAILED = [
  {
    key: 'id_card_verified' as const,
    number: 1,
    title: "Photocopie de la pièce d'identité",
    subtitle: "Photocopie légalisée de la CNI biométrique ou passeport en cours de validité",
    badge: "Copie légalisée",
    icon: 'badge'
  },
  {
    key: 'birth_certificate_verified' as const,
    number: 2,
    title: "Extrait de naissance",
    subtitle: "Extrait d'acte de naissance officiel récent (12S ou état civil)",
    badge: "Document officiel",
    icon: 'cake'
  },
  {
    key: 'family_record_verified' as const,
    number: 3,
    title: "Fiche familiale",
    subtitle: "Fiche familiale d'état civil (ou fiche individuelle pour célibataire)",
    badge: "État civil",
    icon: 'group'
  },
  {
    key: 'residence_certificate_verified' as const,
    number: 4,
    title: "Certificat de résidence",
    subtitle: "Justificatif récent de résidence dans l'une des 57 communes d'Alger",
    badge: "Wilaya d'Alger",
    icon: 'home_pin'
  },
  {
    key: 'criminal_record_verified' as const,
    number: 5,
    title: "Casier judiciaire — adultes",
    subtitle: "Bulletin N°3 récent vierge délivré par les autorités judiciaires",
    badge: "Justice (B3)",
    icon: 'gavel'
  },
  {
    key: 'photos_verified' as const,
    number: 6,
    title: "3 photos d'identité",
    subtitle: "3 photographies d'identité récentes couleur au format officiel",
    badge: "3 exemplaires",
    icon: 'photo_camera'
  },
  {
    key: 'diploma_verified' as const,
    number: 7,
    title: "Diplôme ou certificat de scolarité",
    subtitle: "Photocopie légalisée du diplôme d'État, titre universitaire ou certificat de scolarité",
    badge: "Copie légalisée",
    icon: 'school'
  }
] as const;

export const TARIFS_INDICATIFS = {
  babysitting: [
    { type: 'Garde ponctuelle en soirée', tarif: '1 500 à 2 500 DA / Séance' },
    { type: 'Sortie d\'école (2h par jour)', tarif: '15 000 à 25 000 DA / Mois' },
    { type: 'Garde complète en journée (Nourrisson)', tarif: '35 000 à 50 000 DA / Mois' }
  ],
  teaching: [
    { type: 'Primaire & Aide aux devoirs', tarif: '1 500 à 2 000 DA / Séance (1h30)' },
    { type: 'CEM & Préparation au BEM', tarif: '2 000 à 3 000 DA / Séance (2h)' },
    { type: 'Lycée & Préparation au BAC', tarif: '2 500 à 4 000 DA / Séance (2h)' }
  ]
};

export const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne la mise en relation sur TataWafa ?',
    a: 'Vous choisissez un prestataire dans votre commune d\'Alger et soumettez votre demande avec vos créneaux souhaités. Notre coordinateur reçoit votre demande en direct, contacte le prestataire, puis vous appelle au téléphone pour confirmer l\'intervention.'
  },
  {
    q: 'Pourquoi les documents ne sont-ils pas téléversés sur le site ?',
    a: 'Pour protéger les données personnelles et garantir une sécurité maximale aux familles, nous refusons de stocker des pièces d\'identité sur le cloud. L\'administrateur inspecte physiquement le dossier complet de 7 pièces (photocopies obligatoirement légalisées par l\'APC) de main à main avant d\'attribuer le badge de certification.'
  },
  {
    q: 'Comment s\'effectue le paiement ?',
    a: 'Le paiement est 100% direct et en espèces (Dinars Algériens - DA). Vous réglez directement le prestataire à votre domicile à la séance ou à la fin du mois selon l\'accord convenu.'
  },
  {
    q: 'Comment devenir prestataire sur TataWafa ?',
    a: 'Il vous suffit de créer votre compte et de remplir votre annonce de service (sans aucun document en ligne). L\'administrateur vous appellera ensuite pour fixer un rendez-vous à Alger et vérifier votre dossier officiel de 7 pièces légalisées en personne.'
  },
  {
    q: 'Que faire en cas d\'imprévu ou de désistement ?',
    a: 'Vous pouvez joindre immédiatement l\'administrateur par téléphone ou WhatsApp au 0782 37 43 37. Nous intervenons immédiatement pour réorganiser le planning ou vous proposer un autre prestataire qualifié.'
  }
];
