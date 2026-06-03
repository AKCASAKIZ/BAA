import { CountryConfig } from './types';

export const COUNTRIES: CountryConfig[] = [
  {
    id: 'tr',
    name: 'Türkiye',
    localName: 'Baa Sütevi, İstanbul',
    flag: '🇹🇷',
    themeColor: 'from-amber-950 via-amber-900 to-emerald-950',
    accentColor: 'text-amber-400 border-amber-500/30 hover:bg-amber-950/40 bg-amber-950/20',
    bgColor: '#170c02',
    placeName: 'Sırdaş İstanbul Sokağı',
    propType: 'fez',
    propColor: '#9e0018',
    introduction: 'İstanbul’un yağmurlu, loş bir sokağı... Baa, bakır cezvede bal ve tarçını ısıtırken göz kırpıyor. Yanık ahşap kokusu ve huzurlu bir dert ortaklığı...',
    milkOptions: [
      {
        id: 'bal_sut',
        name: 'Ballı Ilık Süt',
        desc: 'Süzme çiçek balı ve ılık sütten süzülen geleneksel şifa.',
        effect: 'Gevşeme, rahat uyku ve boğaz ağrılarına şifa verir.',
        icon: '🍯'
      },
      {
        id: 'salep_sut',
        name: 'Cezve Salep Sütü',
        desc: 'Hakiki orkide kökü tozu ve bol tarçın rendeli süt.',
        effect: 'Ruhu ısıtır, zihni dinlendirir, huzurlu dert ortaklığı sunar.',
        icon: '☕'
      },
      {
        id: 'kefir_tr',
        name: 'Damla Sakızlı Kefir',
        desc: 'Eski usulle mayalanmış, sakız esintili buz gibi taze kefir.',
        effect: 'Bünyeyi zinde tutar, zihin yorgunluğunu anında giderir.' ,
        icon: '🥛'
      }
    ]
  },
  {
    id: 'jp',
    name: 'Japonya',
    localName: 'Baa-An Kyoto',
    flag: '🇯🇵',
    themeColor: 'from-stone-900 via-zinc-900 to-sky-950',
    accentColor: 'text-sky-400 border-sky-500/30 hover:bg-sky-950/40 bg-sky-950/20',
    bgColor: '#0f1118',
    placeName: 'Sagano Bambu Seremonisi',
    propType: 'hapi',
    propColor: '#1d3557',
    introduction: 'Kyoto’nun meltem esintili bambu ormanlarından bir çay odası... Baa, happi önlüğüyle matcha çırparken sessizliği ve Zen sükunetini paylaşıyor.',
    milkOptions: [
      {
        id: 'matcha_soy',
        name: 'Uji Matcha Sütü',
        desc: 'Geleneksel taş değirmen yeşil çayı ile taze köpürtülmüş süt.',
        effect: 'Derin konsantrasyon, zihin açıklığı ve sakin dinginlik sağlar.',
        icon: '🍵'
      },
      {
        id: 'amazake_ginger',
        name: 'Zencefilli Amazake',
        desc: 'Fermente pirinç özüyle tatlandırılmış, taze zencefilli ılık şölen.',
        effect: 'İçsel enerjiyi (Ki) canlandırır, üşümeyi engeller ve ruhu sakinleştirir.',
        icon: '🍶'
      },
      {
        id: 'sakura_vanilla',
        name: 'Sakura Aromalı Süt',
        desc: 'Tatlı kiraz çiçeği özleri ve vanilya çubuğu infüzyonu.',
        effect: 'Görsel ve ruhsal dinginlik verir, stres seviyesini tabana çeker.',
        icon: '🌸'
      }
    ]
  },
  {
    id: 'kg',
    name: 'Kırgızistan',
    localName: 'Altın Yurta, Isık Göl',
    flag: '🇰🇬',
    themeColor: 'from-teal-950 via-emerald-950 to-stone-950',
    accentColor: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 bg-emerald-950/20',
    bgColor: '#02120e',
    placeName: 'Yayla Ateşi Başı',
    propType: 'kalpak',
    propColor: '#ffffff',
    introduction: 'Karlı dağların koynundaki Isık Göl kıyısında, keçe duvarlı sıcacık bir kımız yurdu... Baa Kalpağıyla ocağı harlarken size bozkırın şarkılarını fısıldıyor.',
    milkOptions: [
      {
        id: 'yak_bal',
        name: 'Bozkır Yak Sütü',
        desc: 'Yoğun yayla yak sütü, süzme kekik balı ile kaynatılır.',
        effect: 'Kuvvet verir, bozkırın dayanıklılığını ve asaletini aşılar.',
        icon: '🏔️'
      },
      {
        id: 'kumis_fresh',
        name: 'Yayık Kımız Sütü',
        desc: 'Hafif mayhoş, köpüklü, gücü tescilli meşhur geleneksel kımız.',
        effect: 'Metabolizmayı hızlandırır, göğsü açar, canlandırıcı etki yapar.',
        icon: '🏹'
      },
      {
        id: 'steppe_tea',
        name: 'Tuzlu Moğol Çayı',
        desc: 'Bozkır çay yaprakları, koyun sütü, biraz un ve tereyağı karışımı.',
        effect: 'Tarihi yorgunlukları yok eder, soğuk havalarda sarsılmaz bir güç verir.',
        icon: '🍵'
      }
    ]
  },
  {
    id: 'ie',
    name: 'İrlanda',
    localName: 'Baa Galway Creamery',
    flag: '🇮🇪',
    themeColor: 'from-emerald-950 via-emerald-900 to-neutral-950',
    accentColor: 'text-green-400 border-green-500/30 hover:bg-green-950/40 bg-green-950/20',
    bgColor: '#010c05',
    placeName: 'Kelt Rüzgarları Pub\'ı',
    propType: 'clover',
    propColor: '#1b4332',
    introduction: 'Alev çıtırdayan şöminenin başında, kelt ritimleriyle süslü yeşil neşe bahçesi... Neşeli İrlandalı Baa, şapkasıyla neşe saçıp kadim Kelt efsaneleri anlatıyor.',
    milkOptions: [
      {
        id: 'celtic_malt',
        name: 'Maltlı Arpa Sütü',
        desc: 'Fırınlanmış malt özünün taze süt kremasıyla enfes buluşması.',
        effect: 'Yüksek mineral ve vitamin deposu, bedene neşe ve dinçlik pompalar.',
        icon: '🌾'
      },
      {
        id: 'irish_sweet_foam',
        name: 'İrlanda Karamel Köpüğü',
        desc: 'Karamel esansı ve fıstık aromalı köpüklü sıcak yulaf sütü (Alkolsüz).',
        effect: 'Endorfin salgılatır, sohbetin neşesini katlayarak yüz güldürür.',
        icon: '🍀'
      },
      {
        id: 'heather_honey_sut',
        name: 'Yabani Funda Sütü',
        desc: 'Kelt dağlarının yabani funda çiçekleri demlenerek kaynatılmış süt.',
        effect: 'Bağışıklığı kalkan gibi korur, uyku öncesi sakinlik sunar.',
        icon: '🩺'
      }
    ]
  },
  {
    id: 'it',
    name: 'İtalya',
    localName: 'Caffè della Pecora',
    flag: '🇮🇹',
    themeColor: 'from-rose-950 via-stone-900 to-zinc-950',
    accentColor: 'text-rose-400 border-rose-500/30 hover:bg-rose-950/40 bg-rose-950/20',
    bgColor: '#120205',
    placeName: 'Toskana Sanat Kahvesi',
    propType: 'chef',
    propColor: '#e63946',
    introduction: 'Güneşin kavurduğu zeytin bahçelerine bakan, espresso kokulu klasik İtalyan sanat kahvesi. Enerjik Baa, fularıyla "Ciao!" deyip sanattan bahisler açıyor.',
    milkOptions: [
      {
        id: 'amaretto_almond',
        name: 'Sicilya Badem Sütü',
        desc: 'Eski usul ezilmiş acıbadem ve aromatik sütten serin içecek.',
        effect: 'Kalbi korur, nefis kokusu ve aromasıyla zihne zerafet getirir.',
        icon: '🌰'
      },
      {
        id: 'espresso_fdf',
        name: 'Sütlü Espresso Shot',
        desc: 'Koyu İtalyan çekirdeğinden süzülen taze espresso ve köpüklü süt.',
        effect: 'Anında dopamin sağlar, dikkati en üst mertebeye çıkarır.',
        icon: '☕'
      },
      {
        id: 'vanilla_cacao',
        name: 'Madagaskar Çikolatalı Süt',
        desc: 'Kakao çekirdekleri, damla çikolata ve hakiki bourbon vanilyalı taze süt.',
        effect: 'Mutluluk hormonu salgılatır, melankoliye birebir gelir.',
        icon: '🍫'
      }
    ]
  }
];
