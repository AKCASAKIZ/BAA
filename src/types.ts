export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingSources?: Array<{ uri: string; title: string }>;
}

export interface MilkOption {
  id: string;
  name: string;
  desc: string;
  effect: string;
  icon: string;
}

export interface CountryConfig {
  id: string;
  name: string;
  localName: string;
  flag: string;
  themeColor: string;      // e.g., "emerald"
  accentColor: string;     // e.g., "lime"
  bgColor: string;         // Hex code or Class
  placeName: string;       // e.g., "Baa Sütevi, İstanbul"
  propType: 'fez' | 'hapi' | 'kalpak' | 'clover' | 'chef' | 'none';
  propColor: string;
  introduction: string;
  milkOptions: MilkOption[];
}
