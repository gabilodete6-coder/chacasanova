import { GiftItem, HouseInfo, InspirationPhoto, ColorSwatch, TexturesConfig } from '../types';

export const initialTexturesConfig: TexturesConfig = {
  bambuImage: './9741231-textura-de-madeira-de-bambu-natural-gratis-foto.jpg',
  inoxImage: './inox.jpg',
};

export const initialHouseInfo: HouseInfo = {
  coupleNames: 'Gabrielle & Wehington',
  eventDate: 'Sábado, 17 de Outubro • 16h',
  location: 'Condomínio Jade • R. Geraldo Pereira de Brito, 75',
  welcomeMessage: 'Estamos muito felizes em compartilhar esse momento tão especial com você! Preparamos esta lista com muito carinho para equipar nosso novo lar. Fique à vontade para escolher o item que desejar e comprar onde preferir. Deixamos abaixo a nossa paleta de cores, caso queira segui-la ao escolher o seu presente.',
};

export const initialCategories: string[] = [
  'Cozinha',
  'Cama & Banho',
  'Eletros',
  'Decoração',
  'Área de Serviço',
];

export const paletteColors: ColorSwatch[] = [
  {
    name: 'Branco',
    colorCode: '#FFFFFF',
    textColor: '#1A1A1A',
    borderColor: '#BDC3C7',
    description: 'Bases leves e luminosas',
  },
  {
    name: 'Preto',
    colorCode: '#1A1A1A',
    textColor: '#FFFFFF',
    borderColor: '#1A1A1A',
    description: 'Contrastes e acabamentos modernos',
  },
  {
    name: 'Azul Marinho Acinzentado',
    colorCode: '#34495E',
    textColor: '#FFFFFF',
    borderColor: '#34495E',
    description: 'Toque de sofisticação e calma',
  },
  {
    name: 'Bambu',
    colorCode: '#D2B48C',
    textColor: '#1A1A1A',
    borderColor: '#C5A059',
    description: 'Aconchego natural e acolhimento',
  },
  {
    name: 'Inox',
    colorCode: '#BDC3C7',
    textColor: '#1A1A1A',
    borderColor: '#95A5A6',
    description: 'Eletros e detalhes metálicos',
  },
];

export const initialInspirations: InspirationPhoto[] = [
  {
    id: 'insp-1',
    title: 'Cozinha & Bancada de Madeira',
    room: 'Cozinha',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'insp-2',
    title: 'Sala de Estar & Tons Neutros',
    room: 'Sala de Estar',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'insp-3',
    title: 'Mesa Posta & Detalhes em Bambu',
    room: 'Sala de Jantar',
    imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'insp-4',
    title: 'Quarto & Iluminação Aconchegante',
    room: 'Quarto',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'insp-5',
    title: 'Eletros Inox & Cantinho do Café',
    room: 'Cozinha',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
  },
];

export const initialGifts: GiftItem[] = [
  // COZINHA
  {
    id: 'gift-1',
    name: 'Jogo de Panelas Cerâmica Antiaderente (5 Peças)',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1584990347449-a2e6f4776e01?auto=format&fit=crop&w=800&q=80',
    description: 'Conjunto em tons neutros com cabos efeito madeira.',
    isReserved: false,
  },
  {
    id: 'gift-2',
    name: 'Conjunto de Potes Herméticos de Vidro com Tampa de Bambu',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    description: 'Potes de vidro borossilicato com vedação hermética em tampa de bambu.',
    isReserved: false,
  },
  {
    id: 'gift-3',
    name: 'Aparelho de Jantar 20 Peças em Cerâmica Off-White',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
    description: 'Pratos rasos, fundos, sobremesa e xícaras de cerâmica.',
    isReserved: false,
  },
  {
    id: 'gift-4',
    name: 'Kit de Utensílios de Cozinha em Silicone com Cabo de Madeira',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
    description: 'Kit completo com suporte organizador cilíndrico.',
    isReserved: false,
  },
  {
    id: 'gift-5',
    name: 'Tábua Gourmet de Bambu com Molheiras',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    description: 'Ideal para servir petiscos, queijos e frios.',
    isReserved: false,
  },
  {
    id: 'gift-6',
    name: 'Jogo de Facas com Cepo de Madeira/Inox (6 Peças)',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
    description: 'Lâminas em aço inox de alta precisão com suporte elegante.',
    isReserved: false,
  },
  {
    id: 'gift-7',
    name: 'Jogo de Taças de Cristal para Vinho e Água (6 Peças)',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    description: 'Cristal ecológico com acabamento fino e resistente.',
    isReserved: false,
  },
  {
    id: 'gift-8',
    name: 'Garrafa Térmica Nórdica com Cabo de Madeira',
    category: 'Cozinha',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    description: 'Design escandinavo em acabamento matte com cabo de madeira clara.',
    isReserved: false,
  },

  // ELETROS
  {
    id: 'gift-9',
    name: 'Fritadeira Elétrica sem Óleo (Air Fryer) Inox & Preto',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    description: 'Cesto antiaderente espaçoso com controle de temperatura.',
    isReserved: false,
  },
  {
    id: 'gift-10',
    name: 'Cafeteira Expresso & Prensa Francesa com Detalhe em Bambu',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    description: 'Vidro refratário e acabamento em bambu para cafés especiais.',
    isReserved: false,
  },
  {
    id: 'gift-11',
    name: 'Liquidificador com Jarra de Vidro e Acabamento Inox',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    description: 'Lâminas resistentes em aço inoxidável e jarra de vidro.',
    isReserved: false,
  },
  {
    id: 'gift-12',
    name: 'Sanduicheira e Grill Duplo Inox Escovado',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    description: 'Chapas antiaderentes de fácil limpeza e aquecimento rápido.',
    isReserved: false,
  },
  {
    id: 'gift-13',
    name: 'Torradeira Elétrica com Níveis de Tostagem',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    description: 'Design minimalista com detalhes cromados e coletor de migalhas.',
    isReserved: false,
  },
  {
    id: 'gift-14',
    name: 'Aspirador de Pó Vertical 2 em 1 Sem Fio',
    category: 'Eletros',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    description: 'Filtro lavável e bateria recarregável com haste flexível.',
    isReserved: false,
  },

  // CAMA & BANHO
  {
    id: 'gift-15',
    name: 'Jogo de Cama 100% Algodão Percal 300 Fios Queen',
    category: 'Cama & Banho',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    description: 'Toque macio e acetinado em tom neutro e aconchegante.',
    isReserved: false,
  },
  {
    id: 'gift-16',
    name: 'Jogo de Toalhas de Banho e Rosto Fio Penteado (5 Peças)',
    category: 'Cama & Banho',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Alta absorção e toque aveludado em tons elegantes.',
    isReserved: false,
  },
  {
    id: 'gift-17',
    name: 'Manta Decorativa de Tricô Macramê para Sofá/Cama',
    category: 'Cama & Banho',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    description: 'Trama artesanal encorpada com franjas, cor natural.',
    isReserved: false,
  },
  {
    id: 'gift-18',
    name: 'Kit Acessórios de Banheiro em Bambu e Cerâmica Fosca',
    category: 'Cama & Banho',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
    description: 'Porta sabonete líquido, porta escovas e bandeja em bambu.',
    isReserved: false,
  },
  {
    id: 'gift-19',
    name: 'Par de Travesseiros Toque de Pluma',
    category: 'Cama & Banho',
    image: 'https://images.unsplash.com/photo-1584100936772-cfa9760aa7b0?auto=format&fit=crop&w=800&q=80',
    description: 'Capa 100% algodão com enchimento de microfibra macia.',
    isReserved: false,
  },

  // DECORAÇÃO
  {
    id: 'gift-20',
    name: 'Espelho Redondo com Alça de Couro 60cm',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    description: 'Moldura em alumínio preto com pino de fixação.',
    isReserved: false,
  },
  {
    id: 'gift-21',
    name: 'Luminária de Mesa com Base de Madeira e Cúpula de Linho',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    description: 'Iluminação difusa suave para sala ou cabeceira.',
    isReserved: false,
  },
  {
    id: 'gift-22',
    name: 'Vaso de Cerâmica Artesanal com Arranjo de Flores Secas',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
    description: 'Vaso fosco contemporâneo com folhagens desidratadas.',
    isReserved: false,
  },
  {
    id: 'gift-23',
    name: 'Difusor de Aromas Ultrassônico Efeito Madeira',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    description: 'Umidificador e difusor de óleos essenciais com LED suave.',
    isReserved: false,
  },
  {
    id: 'gift-24',
    name: 'Tapete Minimalista Algodão Cru Geométrico 100x150cm',
    category: 'Decoração',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    description: 'Toque macio, lavável e harmonioso para o ambiente.',
    isReserved: false,
  },

  // ÁREA DE SERVIÇO
  {
    id: 'gift-25',
    name: 'Cesto de Roupas Dobrável com Estrutura em Bambu',
    category: 'Área de Serviço',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
    description: 'Cesto com tampa e forro interno removível e lavável.',
    isReserved: false,
  },
  {
    id: 'gift-26',
    name: 'Vaporizador Portátil de Roupas a Vapor (Steamer)',
    category: 'Área de Serviço',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    description: 'Desamassa roupas diretamente no cabide com rapidez.',
    isReserved: false,
  },
  {
    id: 'gift-27',
    name: 'Kit Frascos Âmbar com Válvula Dosadora para Lavanderia',
    category: 'Área de Serviço',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Frascos minimalistas para sabão, amaciante e alvejante.',
    isReserved: false,
  },
  {
    id: 'gift-28',
    name: 'Escada Doméstica Leve em Alumínio 3 Degraus',
    category: 'Área de Serviço',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Estrutura compacta com sapatas antiderrapantes e trava.',
    isReserved: false,
  },
];
