export type GiftPack = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  includes: string[];
  estimatedDays: string;
};

export const GIFT_PACKS: GiftPack[] = [
  {
    id: 'marriage',
    name: 'Pack Mariage',
    emoji: '💍',
    tagline: 'Célébrez le grand jour',
    description:
      `Offrez un moment inoubliable aux mariés. Ce pack regroupe tout ce qu'il faut pour marquer l'occasion avec élégance depuis l'étranger.`,
    color: '#F59E0B',
    includes: ['Bouquet de fleurs', 'Coffret dragées et gâteaux', 'Boîtes cadeaux personnalisées', 'Carte de voeux manuscrite'],
    estimatedDays: '3–5',
  },
  {
    id: 'newborn',
    name: 'Pack Nouveau-né',
    emoji: '👶',
    tagline: 'Accueillez le nouveau venu',
    description:
      `Un pack pensé pour célébrer l'arrivée d'un bébé avec les essentiels dont la famille a besoin dès les premiers jours.`,
    color: '#EC4899',
    includes: ['Ensemble vêtements bébé (0–3 mois)', 'Couverture brodée', `Jouets d'éveil doux`, 'Produits de soin bébé'],
    estimatedDays: '3–5',
  },
  {
    id: 'home',
    name: 'Pack Maison',
    emoji: '🏠',
    tagline: 'Équipez le foyer',
    description:
      `Aidez votre famille à s'installer ou à renouveler son équipement avec des appareils électroménagers et accessoires essentiels.`,
    color: '#3B82F6',
    includes: ['Appareil électroménager au choix', 'Ustensiles de cuisine', 'Linge de maison', 'Livraison et installation'],
    estimatedDays: '5–7',
  },
  {
    id: 'anniversary',
    name: 'Pack Anniversaire',
    emoji: '🎊',
    tagline: 'Surprenez vos proches',
    description:
      `Une surprise mémorable pour un anniversaire ou une occasion spéciale. Laissez vos proches se sentir aimés malgré la distance.`,
    color: '#8B5CF6',
    includes: ['Gâteau personnalisé', 'Ballons et décorations', 'Coffret parfum ou bijoux', 'Message vidéo digital'],
    estimatedDays: '2–4',
  },
  {
    id: 'birthday',
    name: 'Pack Fête',
    emoji: '🎂',
    tagline: 'Faites la fête ensemble',
    description:
      `Tout ce qu'il faut pour organiser une belle célébration en famille, même à des milliers de kilomètres.`,
    color: '#EF4444',
    includes: ['Gâteau au choix', 'Décoration de table', 'Boîtes cadeaux', 'Cotillons et accessoires de fête'],
    estimatedDays: '2–4',
  },
  {
    id: 'ramadan',
    name: 'Pack Ramadan',
    emoji: '🌙',
    tagline: 'Partagez la baraka',
    description:
      `Des cadeaux traditionnels pour accompagner les vôtres durant le mois béni. Dattes, gâteaux et essentiels du Ramadan livrés chez eux.`,
    color: '#059669',
    includes: ['Plateau de dattes Deglet Nour', 'Assortiment de gâteaux traditionnels', 'Bougies et décoration', 'Coffret thé et tisanes'],
    estimatedDays: '2–4',
  },
];
