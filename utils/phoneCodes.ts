export interface PhoneCode {
  label: string;
  code: string;
  flag: string;
}

export const PHONE_CODES: PhoneCode[] = [
  { label: 'Algérie',             code: '+213', flag: '🇩🇿' },
  { label: 'France',              code: '+33',  flag: '🇫🇷' },
  { label: 'Belgique',            code: '+32',  flag: '🇧🇪' },
  { label: 'Allemagne',           code: '+49',  flag: '🇩🇪' },
  { label: 'Royaume-Uni',         code: '+44',  flag: '🇬🇧' },
  { label: 'Espagne',             code: '+34',  flag: '🇪🇸' },
  { label: 'Pays-Bas',            code: '+31',  flag: '🇳🇱' },
  { label: 'Suisse',              code: '+41',  flag: '🇨🇭' },
  { label: 'Italie',              code: '+39',  flag: '🇮🇹' },
  { label: 'Canada',              code: '+1',   flag: '🇨🇦' },
  { label: 'États-Unis',          code: '+1',   flag: '🇺🇸' },
  { label: 'Australie',           code: '+61',  flag: '🇦🇺' },
  { label: 'Émirats arabes unis', code: '+971', flag: '🇦🇪' },
  { label: 'Qatar',               code: '+974', flag: '🇶🇦' },
  { label: 'Turquie',             code: '+90',  flag: '🇹🇷' },
  { label: 'Suède',               code: '+46',  flag: '🇸🇪' },
  { label: 'Portugal',            code: '+351', flag: '🇵🇹' },
  { label: 'Norvège',             code: '+47',  flag: '🇳🇴' },
  { label: 'Danemark',            code: '+45',  flag: '🇩🇰' },
  { label: 'Finlande',            code: '+358', flag: '🇫🇮' },
  { label: 'Autriche',            code: '+43',  flag: '🇦🇹' },
  { label: 'Grèce',               code: '+30',  flag: '🇬🇷' },
  { label: 'Maroc',               code: '+212', flag: '🇲🇦' },
  { label: 'Tunisie',             code: '+216', flag: '🇹🇳' },
];
