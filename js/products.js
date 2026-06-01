const PRODUCTS = [
    // ==================== HOMME (15 products) ====================
    {
        id: 1, name: "Royal Chronograph Gold", category: "homme", price: 2499, oldPrice: 3199,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80","https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80"],
        rating: 4.8, reviews: 124, badge: "hot", isNew: false, isSale: true, brand: "Royal",
        description: "Un chronographe doré au design intemporel. Boîtier en acier inoxydable plaqué or, verre saphir anti-rayures. Mouvement automatique suisse. Étanche 50m.",
        specs: { mouvement: "Automatique", boitier: "42mm", materiau: "Acier Inoxydable", etancheite: "50m", bracelet: "Cuir véritable" }
    },
    {
        id: 7, name: "Aventurier Noir Titane", category: "homme", price: 3899, oldPrice: null,
        image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80","https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80"],
        rating: 4.7, reviews: 98, badge: "new", isNew: true, isSale: false, brand: "Aventurier",
        description: "Montre masculine en titane noir avec un design audacieux et moderne. Lunette en céramique et cadran texturé. Pour les hommes qui osent.",
        specs: { mouvement: "Automatique", boitier: "44mm", materiau: "Titane", etancheite: "100m", bracelet: "Titane" }
    },
    {
        id: 13, name: "Executive Platine", category: "homme", price: 5499, oldPrice: null,
        image: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80","https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80"],
        rating: 4.9, reviews: 34, badge: null, isNew: true, isSale: false, brand: "Executive",
        description: "Le summum du luxe masculin. Cadran guilloché, aiguilles en or blanc et mouvement manufacture. Une pièce d'exception pour les connaisseurs.",
        specs: { mouvement: "Manufacture", boitier: "41mm", materiau: "Or Blanc 18K", etancheite: "50m", bracelet: "Alligator" }
    },
    {
        id: 17, name: "Navigator GMT Bleu", category: "homme", price: 4299, oldPrice: 4999,
        image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80","https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80"],
        rating: 4.8, reviews: 76, badge: "sale", isNew: false, isSale: true, brand: "Navigator",
        description: "Montre GMT avec double fuseau horaire et lunette bidirectionnelle bleue et noire. Idéale pour les voyageurs fréquents et hommes d'affaires internationaux.",
        specs: { mouvement: "Automatique", boitier: "42mm", materiau: "Acier Inoxydable 904L", etancheite: "100m", bracelet: "Acier Jubilé" }
    },
    {
        id: 18, name: "Prestige Tourbillon", category: "homme", price: 8999, oldPrice: null,
        image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80","https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80"],
        rating: 5.0, reviews: 18, badge: "hot", isNew: true, isSale: false, brand: "Prestige",
        description: "Montre tourbillon avec complication horlogère visible. Cadran squelette en or rose, boîtier saphir et mouvement manufacture 72h de réserve de marche.",
        specs: { mouvement: "Tourbillon Manuel", boitier: "43mm", materiau: "Or Rose 18K", etancheite: "30m", bracelet: "Cuir d'alligator" }
    },
    {
        id: 19, name: "Commandant Militaire", category: "homme", price: 1899, oldPrice: 2399,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80","https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80"],
        rating: 4.5, reviews: 201, badge: "sale", isNew: false, isSale: true, brand: "Commandant",
        description: "Montre militaire robuste avec cadran vert olive et bracelet NATO. Résistante aux conditions extrêmes avec éclairage tritium pour lecture nocturne.",
        specs: { mouvement: "Quartz Suisse", boitier: "44mm", materiau: "Acier PVD", etancheite: "200m", bracelet: "NATO tissu" }
    },
    {
        id: 20, name: "Monaco Carbon Racing", category: "homme", price: 3599, oldPrice: null,
        image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80","https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80"],
        rating: 4.6, reviews: 87, badge: null, isNew: false, isSale: false, brand: "Monaco",
        description: "Chronographe inspiré de l'univers de la course automobile. Boîtier carré en fibre de carbone, cadran tachymétrique et bracelet perforé en cuir.",
        specs: { mouvement: "Automatique", boitier: "39mm carré", materiau: "Fibre de Carbone", etancheite: "100m", bracelet: "Cuir perforé" }
    },
    {
        id: 21, name: "Capitaine Marine Bleu", category: "homme", price: 2799, oldPrice: 3299,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"],
        rating: 4.7, reviews: 143, badge: "sale", isNew: false, isSale: true, brand: "Capitaine",
        description: "Montre nautique avec lunette compas et cadran bleu océan. Étanche 200m, parfaite pour la navigation et les sports nautiques.",
        specs: { mouvement: "Automatique", boitier: "43mm", materiau: "Acier Inoxydable 316L", etancheite: "200m", bracelet: "Caoutchouc marin" }
    },
    {
        id: 22, name: "Gentleman Cuir Noir", category: "homme", price: 1599, oldPrice: null,
        image: "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80","https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80"],
        rating: 4.4, reviews: 215, badge: null, isNew: false, isSale: false, brand: "Gentleman",
        description: "Montre dress watch élégante avec cadran noir minimaliste et aiguilles dauphine. Le compagnon parfait du costume trois pièces.",
        specs: { mouvement: "Quartz", boitier: "40mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir de veau noir" }
    },
    {
        id: 23, name: "Atlas World Timer", category: "homme", price: 4899, oldPrice: 5699,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80","https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80"],
        rating: 4.8, reviews: 42, badge: "sale", isNew: true, isSale: true, brand: "Atlas",
        description: "Montre world timer avec affichage de 24 fuseaux horaires. Cadran carte du monde détaillé et lunette tournante avec noms de villes.",
        specs: { mouvement: "Automatique", boitier: "42mm", materiau: "Acier Inoxydable", etancheite: "50m", bracelet: "Cuir crocodile" }
    },
    {
        id: 24, name: "Falcon Acier Brossé", category: "homme", price: 2199, oldPrice: null,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80","https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80"],
        rating: 4.5, reviews: 167, badge: null, isNew: false, isSale: false, brand: "Falcon",
        description: "Montre tout acier au fini brossé satiné. Design sport-chic polyvalent, parfait pour le bureau comme pour le weekend.",
        specs: { mouvement: "Automatique", boitier: "41mm", materiau: "Acier brossé 316L", etancheite: "100m", bracelet: "Acier brossé" }
    },
    {
        id: 25, name: "Sultan Or Arabe", category: "homme", price: 6999, oldPrice: 7999,
        image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80","https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80"],
        rating: 4.9, reviews: 23, badge: "hot", isNew: true, isSale: true, brand: "Sultan",
        description: "Montre de luxe avec cadran en chiffres arabes orientaux dorés. Boîtier en or 18K avec gravures traditionnelles marocaines. Pièce collector.",
        specs: { mouvement: "Manufacture", boitier: "40mm", materiau: "Or Jaune 18K", etancheite: "30m", bracelet: "Cuir d'autruche" }
    },
    {
        id: 26, name: "Pilote Aviateur II", category: "homme", price: 3299, oldPrice: null,
        image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80","https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80"],
        rating: 4.7, reviews: 91, badge: "new", isNew: true, isSale: false, brand: "Pilote",
        description: "Montre d'aviateur avec grand cadran lisible, aiguilles luminescentes et couronne oignon. Inspirée des instruments de bord d'avion.",
        specs: { mouvement: "Automatique", boitier: "46mm", materiau: "Acier Inoxydable", etancheite: "50m", bracelet: "Cuir rivets" }
    },
    {
        id: 27, name: "Chronos Sport Noir", category: "homme", price: 1299, oldPrice: 1599,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80"],
        rating: 4.3, reviews: 312, badge: "sale", isNew: false, isSale: true, brand: "Chronos",
        description: "Chronographe sport tout noir avec compteurs contrastés. Lunette tachymétrique et bracelet silicone confortable pour un usage quotidien.",
        specs: { mouvement: "Quartz Chronographe", boitier: "43mm", materiau: "Acier PVD Noir", etancheite: "100m", bracelet: "Silicone" }
    },
    {
        id: 28, name: "Maestro Réserve de Marche", category: "homme", price: 4599, oldPrice: null,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80","https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80"],
        rating: 4.8, reviews: 55, badge: null, isNew: false, isSale: false, brand: "Maestro",
        description: "Montre avec indicateur de réserve de marche et phase de lune. Mouvement automatique décoré Côtes de Genève, visible par le fond saphir.",
        specs: { mouvement: "Automatique", boitier: "40mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir bleu nuit" }
    },

    // ==================== FEMME (15 products) ====================
    {
        id: 2, name: "Elegance Silver Moon", category: "femme", price: 1899, oldPrice: null,
        image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80","https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=500&q=80"],
        rating: 4.9, reviews: 89, badge: "new", isNew: true, isSale: false, brand: "Elegance",
        description: "Une montre féminine et raffinée avec un cadran argenté orné de détails subtils. Bracelet en maille milanaise ajustable. Parfaite pour toute occasion.",
        specs: { mouvement: "Quartz", boitier: "34mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Maille milanaise" }
    },
    {
        id: 6, name: "Diamant Rose Femme", category: "femme", price: 4299, oldPrice: 5199,
        image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80","https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80"],
        rating: 5.0, reviews: 56, badge: "sale", isNew: false, isSale: true, brand: "Diamant",
        description: "Montre de luxe pour femme sertie de cristaux, avec un cadran en nacre et un bracelet plaqué or rose. Un bijou à votre poignet.",
        specs: { mouvement: "Quartz Suisse", boitier: "32mm", materiau: "Or Rose 18K", etancheite: "30m", bracelet: "Or rose" }
    },
    {
        id: 11, name: "Perle Dorée Femme", category: "femme", price: 2699, oldPrice: null,
        image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80","https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80"],
        rating: 4.8, reviews: 42, badge: "new", isNew: true, isSale: false, brand: "Perle",
        description: "Montre dorée pour femme avec cadran nacré et index en cristal. Un accessoire élégant qui illumine chaque tenue.",
        specs: { mouvement: "Quartz", boitier: "30mm", materiau: "Acier plaqué or", etancheite: "30m", bracelet: "Acier plaqué or" }
    },
    {
        id: 16, name: "Minimaliste Rose Gold", category: "femme", price: 1499, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80","https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80"],
        rating: 4.5, reviews: 134, badge: null, isNew: true, isSale: false, brand: "Minima",
        description: "Montre minimaliste pour femme en or rose avec un cadran épuré. La simplicité à son état le plus raffiné.",
        specs: { mouvement: "Quartz", boitier: "36mm", materiau: "Acier plaqué or rose", etancheite: "30m", bracelet: "Cuir rose" }
    },
    {
        id: 29, name: "Fleur de Lys Nacre", category: "femme", price: 3499, oldPrice: 4199,
        image: "https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=500&q=80","https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80"],
        rating: 4.9, reviews: 67, badge: "sale", isNew: false, isSale: true, brand: "Fleur de Lys",
        description: "Montre joaillière avec cadran en nacre naturelle et motif floral gravé. Lunette sertie de 36 cristaux. L'alliance parfaite de l'art et du temps.",
        specs: { mouvement: "Quartz Suisse", boitier: "28mm", materiau: "Acier plaqué or rose", etancheite: "30m", bracelet: "Maille milanaise or rose" }
    },
    {
        id: 30, name: "Étoile Bracelet Double", category: "femme", price: 2199, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80","https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80"],
        rating: 4.6, reviews: 93, badge: null, isNew: false, isSale: false, brand: "Étoile",
        description: "Montre-bracelet double tour en cuir fin avec cadran étoilé. Un accessoire fashion qui se porte comme un bijou. Élégance parisienne.",
        specs: { mouvement: "Quartz", boitier: "26mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir double tour" }
    },
    {
        id: 31, name: "Crystal Pavé Argent", category: "femme", price: 3899, oldPrice: 4599,
        image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80","https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80"],
        rating: 4.9, reviews: 38, badge: "hot", isNew: true, isSale: true, brand: "Crystal",
        description: "Montre entièrement pavée de cristaux Swarovski avec cadran argenté miroir. Un éclat éblouissant qui capte tous les regards.",
        specs: { mouvement: "Quartz Suisse", boitier: "30mm", materiau: "Acier cristaux Swarovski", etancheite: "30m", bracelet: "Acier cristaux" }
    },
    {
        id: 32, name: "Camélia Céramique Blanche", category: "femme", price: 5299, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80","https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=500&q=80"],
        rating: 4.8, reviews: 29, badge: null, isNew: true, isSale: false, brand: "Camélia",
        description: "Montre en céramique blanche haute technologie, légère et résistante aux rayures. Cadran avec motif camélia en relief et index diamants.",
        specs: { mouvement: "Quartz", boitier: "33mm", materiau: "Céramique blanche", etancheite: "50m", bracelet: "Céramique blanche" }
    },
    {
        id: 33, name: "Bohème Cuir Tressé", category: "femme", price: 999, oldPrice: 1299,
        image: "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80","https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80"],
        rating: 4.3, reviews: 278, badge: "sale", isNew: false, isSale: true, brand: "Bohème",
        description: "Montre bohème chic avec bracelet tressé en cuir naturel et cadran vintage. Style décontracté et féminin pour tous les jours.",
        specs: { mouvement: "Quartz", boitier: "32mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir tressé" }
    },
    {
        id: 34, name: "Princesse Rubis", category: "femme", price: 6499, oldPrice: null,
        image: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80","https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80"],
        rating: 5.0, reviews: 15, badge: "hot", isNew: true, isSale: false, brand: "Princesse",
        description: "Montre haute joaillerie avec cadran rubis et lunette en diamants. Bracelet articulé en or blanc. Une pièce unique pour les grandes occasions.",
        specs: { mouvement: "Quartz Suisse", boitier: "28mm", materiau: "Or Blanc 18K", etancheite: "30m", bracelet: "Or blanc articulé" }
    },
    {
        id: 35, name: "Luna Phase de Lune", category: "femme", price: 2899, oldPrice: 3499,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80","https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80"],
        rating: 4.7, reviews: 82, badge: "sale", isNew: false, isSale: true, brand: "Luna",
        description: "Montre avec complication phase de lune sur cadran bleu étoilé. Un bijou astronomique qui suit les cycles lunaires avec poésie.",
        specs: { mouvement: "Quartz", boitier: "34mm", materiau: "Acier plaqué or rose", etancheite: "30m", bracelet: "Cuir bleu" }
    },
    {
        id: 36, name: "Soie Champagne", category: "femme", price: 1699, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80"],
        rating: 4.4, reviews: 156, badge: null, isNew: false, isSale: false, brand: "Soie",
        description: "Montre avec cadran champagne texturé et bracelet maille milanaise. Un ton chaud et lumineux qui s'accorde avec toutes les carnations.",
        specs: { mouvement: "Quartz", boitier: "32mm", materiau: "Acier plaqué or", etancheite: "30m", bracelet: "Maille milanaise dorée" }
    },
    {
        id: 37, name: "Jardin Fleuri Émail", category: "femme", price: 3199, oldPrice: null,
        image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80","https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=500&q=80"],
        rating: 4.6, reviews: 44, badge: "new", isNew: true, isSale: false, brand: "Jardin",
        description: "Montre artisanale avec cadran émaillé grand feu représentant un jardin fleuri. Chaque pièce est unique, peinte à la main par un maître émailleur.",
        specs: { mouvement: "Quartz Suisse", boitier: "36mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Satin" }
    },
    {
        id: 38, name: "Sport Femme Active", category: "femme", price: 1199, oldPrice: 1499,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80","https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500&q=80"],
        rating: 4.4, reviews: 198, badge: "sale", isNew: false, isSale: true, brand: "Active",
        description: "Montre sportive féminine avec chronographe et lunette en céramique rose. Design athlétique et élégant pour la femme active.",
        specs: { mouvement: "Quartz", boitier: "36mm", materiau: "Acier et céramique", etancheite: "100m", bracelet: "Caoutchouc rose" }
    },
    {
        id: 62, name: "Arabesque Marrakech", category: "femme", price: 2399, oldPrice: 2899,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80","https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80"],
        rating: 4.7, reviews: 63, badge: "sale", isNew: false, isSale: true, brand: "Arabesque",
        description: "Montre inspirée de l'artisanat marocain avec motifs arabesque gravés sur le cadran. Bracelet en cuir tanné à Marrakech. Pièce unique et culturelle.",
        specs: { mouvement: "Quartz Suisse", boitier: "34mm", materiau: "Acier plaqué or", etancheite: "30m", bracelet: "Cuir artisanal" }
    },

    // ==================== SPORT (13 products) ====================
    {
        id: 3, name: "Sport Extreme Pro", category: "sport", price: 1599, oldPrice: 1999,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80","https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80"],
        rating: 4.7, reviews: 203, badge: "sale", isNew: false, isSale: true, brand: "Extreme",
        description: "Montre sport robuste avec chronographe, tachymètre et lunette rotative. Parfaite pour les activités sportives et en plein air.",
        specs: { mouvement: "Quartz", boitier: "45mm", materiau: "Résine renforcée", etancheite: "200m", bracelet: "Caoutchouc" }
    },
    {
        id: 8, name: "Digital Sport G-Force", category: "sport", price: 899, oldPrice: 1199,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.5, reviews: 445, badge: "sale", isNew: false, isSale: true, brand: "G-Force",
        description: "Montre digitale résistante aux chocs avec alarme, chronomètre et rétroéclairage. Idéale pour le sport et les aventures quotidiennes.",
        specs: { mouvement: "Quartz Digital", boitier: "46mm", materiau: "Résine", etancheite: "200m", bracelet: "Résine" }
    },
    {
        id: 12, name: "Diver Professional 300", category: "sport", price: 2899, oldPrice: 3499,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.9, reviews: 156, badge: "hot", isNew: false, isSale: true, brand: "Diver",
        description: "Montre de plongée professionnelle étanche à 300m. Lunette unidirectionnelle, couronne vissée et cadran luminescent.",
        specs: { mouvement: "Automatique", boitier: "44mm", materiau: "Acier Inoxydable 316L", etancheite: "300m", bracelet: "Acier Inoxydable" }
    },
    {
        id: 39, name: "Triathlon Multi-Sport", category: "sport", price: 2199, oldPrice: 2799,
        image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.6, reviews: 189, badge: "sale", isNew: false, isSale: true, brand: "Triathlon",
        description: "Montre multi-sport avec mode natation, cyclisme et course. Chronomètre, compteur de tours et GPS connecté pour le suivi de performance.",
        specs: { mouvement: "Quartz Digital", boitier: "47mm", materiau: "Polymère renforcé", etancheite: "200m", bracelet: "Silicone" }
    },
    {
        id: 40, name: "Mountain Explorer", category: "sport", price: 1799, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80"],
        rating: 4.5, reviews: 134, badge: null, isNew: false, isSale: false, brand: "Explorer",
        description: "Montre de randonnée avec altimètre, baromètre et boussole numériques. Capteur solaire pour recharge en plein air. Le compagnon idéal en montagne.",
        specs: { mouvement: "Quartz Solaire", boitier: "48mm", materiau: "Résine carbone", etancheite: "100m", bracelet: "Textile militaire" }
    },
    {
        id: 41, name: "Rally Chrono Rouge", category: "sport", price: 2499, oldPrice: 2999,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80","https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80"],
        rating: 4.7, reviews: 112, badge: "sale", isNew: false, isSale: true, brand: "Rally",
        description: "Chronographe de course avec compteurs rouges et lunette tachymétrique. Mouvement chronographe précis au 1/10ème de seconde.",
        specs: { mouvement: "Quartz Chronographe", boitier: "44mm", materiau: "Acier Inoxydable", etancheite: "100m", bracelet: "Cuir perforé rouge" }
    },
    {
        id: 42, name: "Surf Wave Rider", category: "sport", price: 1399, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.4, reviews: 223, badge: "new", isNew: true, isSale: false, brand: "Wave",
        description: "Montre de surf avec indicateur de marée et phase lunaire. Chronomètre et alarme. Design coloré et résistant au sel et au sable.",
        specs: { mouvement: "Quartz Digital", boitier: "44mm", materiau: "Résine", etancheite: "200m", bracelet: "Silicone" }
    },
    {
        id: 43, name: "Parachutiste Altitude", category: "sport", price: 3299, oldPrice: 3899,
        image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500&q=80","https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80"],
        rating: 4.8, reviews: 67, badge: "sale", isNew: true, isSale: true, brand: "Altitude",
        description: "Montre de parachutisme avec altimètre analogique et compteur de chute libre. Lunette de décompte et fond gravé parachutiste.",
        specs: { mouvement: "Automatique", boitier: "45mm", materiau: "Titane", etancheite: "100m", bracelet: "NATO balistique" }
    },
    {
        id: 44, name: "Tennis Pro Timer", category: "sport", price: 1699, oldPrice: null,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80"],
        rating: 4.5, reviews: 145, badge: null, isNew: false, isSale: false, brand: "ProTimer",
        description: "Montre sport légère avec chronomètre set/match et compteur de calories. Résistante aux chocs et aux vibrations du court de tennis.",
        specs: { mouvement: "Quartz", boitier: "42mm", materiau: "Aluminium", etancheite: "50m", bracelet: "Silicone blanc" }
    },
    {
        id: 45, name: "Endurance Marathon GPS", category: "sport", price: 2599, oldPrice: 3199,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.7, reviews: 178, badge: "hot", isNew: false, isSale: true, brand: "Endurance",
        description: "Montre GPS running avec cardio au poignet et suivi de pace en temps réel. Mémoire 100 tours et alertes vibration. Batterie 20h en mode GPS.",
        specs: { mouvement: "Quartz GPS", boitier: "46mm", materiau: "Polymère", etancheite: "50m", bracelet: "Silicone aéré" }
    },
    {
        id: 63, name: "Boxe Ring Timer", category: "sport", price: 1599, oldPrice: 1899,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.4, reviews: 187, badge: "sale", isNew: false, isSale: true, brand: "Ring",
        description: "Montre sport avec timer de round intégré, compteur de calories brûlées et alarme vibration. Résistante aux chocs et à la transpiration.",
        specs: { mouvement: "Quartz Digital", boitier: "45mm", materiau: "Résine ABS", etancheite: "100m", bracelet: "Silicone renforcé" }
    },
    {
        id: 64, name: "Cycliste Tour Pro", category: "sport", price: 2299, oldPrice: null,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80","https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80"],
        rating: 4.6, reviews: 98, badge: "new", isNew: true, isSale: false, brand: "Tour",
        description: "Montre cycliste avec compteur de vitesse, cadence et distance. Mode entraînement par intervalles et alertes de zone cardiaque. GPS intégré.",
        specs: { mouvement: "Quartz GPS", boitier: "44mm", materiau: "Polymère carbone", etancheite: "50m", bracelet: "Silicone aéré" }
    },
    {
        id: 65, name: "Fitness CrossFit X", category: "sport", price: 1099, oldPrice: 1399,
        image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.5, reviews: 256, badge: "sale", isNew: false, isSale: true, brand: "CrossFit",
        description: "Montre fitness avec compteur de répétitions, timer AMRAP/EMOM et suivi de charge d'entraînement. Ultra-résistante pour les WODs les plus intenses.",
        specs: { mouvement: "Quartz Digital", boitier: "43mm", materiau: "Résine renforcée", etancheite: "100m", bracelet: "Nylon balistique" }
    },

    // ==================== CLASSIQUE (12 products) ====================
    {
        id: 4, name: "Classic Heritage Brown", category: "classique", price: 2199, oldPrice: null,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"],
        rating: 4.6, reviews: 67, badge: null, isNew: false, isSale: false, brand: "Heritage",
        description: "Un classique intemporel avec un cadran blanc épuré et un bracelet en cuir marron véritable. Le choix idéal pour le gentleman moderne.",
        specs: { mouvement: "Automatique", boitier: "40mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir italien" }
    },
    {
        id: 9, name: "Classique Cuir Bleu Nuit", category: "classique", price: 1799, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80"],
        rating: 4.6, reviews: 73, badge: null, isNew: false, isSale: false, brand: "Heritage",
        description: "Montre classique avec un cadran bleu nuit profond et un bracelet en cuir véritable. Un mélange parfait de tradition et de modernité.",
        specs: { mouvement: "Automatique", boitier: "38mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir véritable" }
    },
    {
        id: 15, name: "Vintage Mécanicien", category: "classique", price: 3199, oldPrice: 3799,
        image: "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"],
        rating: 4.7, reviews: 51, badge: "sale", isNew: false, isSale: true, brand: "Vintage",
        description: "Montre squelette avec mouvement mécanique visible à travers le cadran. Un chef-d'œuvre d'horlogerie qui fascine par sa complexité.",
        specs: { mouvement: "Mécanique", boitier: "42mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir vintage" }
    },
    {
        id: 46, name: "Perpétuel Calendrier", category: "classique", price: 5999, oldPrice: null,
        image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80"],
        rating: 4.9, reviews: 21, badge: "hot", isNew: true, isSale: false, brand: "Perpétuel",
        description: "Montre à calendrier perpétuel avec jour, date, mois et phase de lune. Ne nécessite aucun réglage de date, même les années bissextiles.",
        specs: { mouvement: "Automatique", boitier: "40mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir d'alligator" }
    },
    {
        id: 47, name: "Opéra Émail Grand Feu", category: "classique", price: 7499, oldPrice: 8499,
        image: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80","https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80"],
        rating: 5.0, reviews: 12, badge: "sale", isNew: false, isSale: true, brand: "Opéra",
        description: "Montre d'exception avec cadran émaillé grand feu et chiffres romains en relief. Mouvement décoré main Côtes de Genève et anglage.",
        specs: { mouvement: "Manufacture", boitier: "39mm", materiau: "Or Rose 18K", etancheite: "30m", bracelet: "Cuir d'alligator noir" }
    },
    {
        id: 48, name: "Rétro 1960 Dateur", category: "classique", price: 1999, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"],
        rating: 4.5, reviews: 145, badge: null, isNew: false, isSale: false, brand: "Rétro",
        description: "Montre inspiration années 60 avec guichet date et index appliqués. Cadran patiné couleur crème et aiguilles feuille bleues.",
        specs: { mouvement: "Automatique", boitier: "38mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir cognac" }
    },
    {
        id: 49, name: "Patrimoine Sonnerie", category: "classique", price: 9999, oldPrice: null,
        image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500&q=80","https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80"],
        rating: 5.0, reviews: 8, badge: "hot", isNew: true, isSale: false, brand: "Patrimoine",
        description: "Montre à répétition minutes avec sonnerie sur demande. Complication horlogère ultime dans un boîtier en platine. Pièce numérotée limitée.",
        specs: { mouvement: "Manufacture Répétition", boitier: "41mm", materiau: "Platine 950", etancheite: "30m", bracelet: "Cuir d'alligator" }
    },
    {
        id: 50, name: "Régulateur Classique", category: "classique", price: 2599, oldPrice: 3099,
        image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80"],
        rating: 4.6, reviews: 76, badge: "sale", isNew: false, isSale: true, brand: "Régulateur",
        description: "Montre régulateur avec affichage heures, minutes et secondes séparés. Design horloger traditionnel inspiré des chronomètres de marine.",
        specs: { mouvement: "Automatique", boitier: "42mm", materiau: "Acier Inoxydable", etancheite: "50m", bracelet: "Cuir marron" }
    },
    {
        id: 51, name: "Diplomat Acier/Or", category: "classique", price: 3899, oldPrice: null,
        image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=500&q=80","https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500&q=80"],
        rating: 4.7, reviews: 58, badge: null, isNew: false, isSale: false, brand: "Diplomat",
        description: "Montre bicolore acier et or avec cadran guilloché et index bâtons en or. L'accessoire du diplomate et de l'homme de goût.",
        specs: { mouvement: "Automatique", boitier: "39mm", materiau: "Acier/Or 18K", etancheite: "30m", bracelet: "Acier/Or bicolore" }
    },
    {
        id: 52, name: "Artisan Email Bleu", category: "classique", price: 2899, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80","https://images.unsplash.com/photo-1619134778706-7015533a6150?w=500&q=80"],
        rating: 4.8, reviews: 39, badge: "new", isNew: true, isSale: false, brand: "Artisan",
        description: "Montre avec cadran en émail bleu fumé et chiffres romains gravés. Fond transparent dévoilant un mouvement automatique décoré à la main.",
        specs: { mouvement: "Automatique", boitier: "40mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir bleu nuit" }
    },
    {
        id: 53, name: "Tradition Petite Seconde", category: "classique", price: 1599, oldPrice: 1899,
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80"],
        rating: 4.4, reviews: 167, badge: "sale", isNew: false, isSale: true, brand: "Tradition",
        description: "Montre classique avec petite seconde à 6h et cadran argenté soleillé. Un design intemporel qui traverse les modes sans vieillir.",
        specs: { mouvement: "Quartz", boitier: "38mm", materiau: "Acier Inoxydable", etancheite: "30m", bracelet: "Cuir noir" }
    },
    {
        id: 54, name: "Notaire Chiffres Romains", category: "classique", price: 2399, oldPrice: null,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"],
        rating: 4.6, reviews: 83, badge: null, isNew: false, isSale: false, brand: "Notaire",
        description: "Montre à chiffres romains avec cadran ivoire et lunette polie miroir. L'élégance discrète pour les professionnels distingués.",
        specs: { mouvement: "Automatique", boitier: "40mm", materiau: "Acier poli", etancheite: "30m", bracelet: "Cuir d'autruche" }
    },

    // ==================== SMART WATCH (10 products) ====================
    {
        id: 5, name: "SmartPro Ultra X", category: "smart", price: 3499, oldPrice: 3999,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80"],
        rating: 4.8, reviews: 312, badge: "hot", isNew: true, isSale: true, brand: "SmartPro",
        description: "Montre connectée avec écran AMOLED, suivi de santé avancé, GPS intégré, et plus de 100 modes sport. Batterie longue durée de 14 jours.",
        specs: { ecran: "1.43\" AMOLED", batterie: "14 jours", capteurs: "SpO2, Rythme cardiaque", gps: "Oui", etancheite: "50m" }
    },
    {
        id: 10, name: "SmartFit Health Plus", category: "smart", price: 1299, oldPrice: 1699,
        image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.4, reviews: 189, badge: "sale", isNew: false, isSale: true, brand: "SmartFit",
        description: "Montre connectée axée sur la santé avec suivi du sommeil, de la fréquence cardiaque et du stress. Notifications intelligentes et design fin.",
        specs: { ecran: "1.28\" AMOLED", batterie: "7 jours", capteurs: "SpO2, Stress, Sommeil", gps: "Non", etancheite: "50m" }
    },
    {
        id: 14, name: "Urban Smart Casual", category: "smart", price: 999, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80"],
        rating: 4.3, reviews: 267, badge: null, isNew: false, isSale: false, brand: "Urban",
        description: "Montre connectée au design casual et moderne. Notifications, suivi d'activité et cadrans personnalisables pour un style unique.",
        specs: { ecran: "1.3\" LCD", batterie: "10 jours", capteurs: "Rythme cardiaque, Pas", gps: "Connecté", etancheite: "50m" }
    },
    {
        id: 55, name: "TechElite Titanium", category: "smart", price: 4999, oldPrice: 5999,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.9, reviews: 89, badge: "hot", isNew: true, isSale: true, brand: "TechElite",
        description: "Montre connectée premium en titane avec écran saphir LTPO AMOLED. Cartographie hors-ligne, musique offline, paiement NFC et appels Bluetooth.",
        specs: { ecran: "1.5\" LTPO AMOLED", batterie: "21 jours", capteurs: "SpO2, ECG, Température", gps: "Multi-bandes", etancheite: "100m" }
    },
    {
        id: 56, name: "FitBand Slim", category: "smart", price: 599, oldPrice: 799,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80"],
        rating: 4.2, reviews: 534, badge: "sale", isNew: false, isSale: true, brand: "FitBand",
        description: "Bracelet connecté ultra-fin avec écran couleur, notifications, suivi de pas et sommeil. Idéal pour débuter dans le fitness connecté. 15 jours d'autonomie.",
        specs: { ecran: "0.96\" OLED", batterie: "15 jours", capteurs: "Rythme cardiaque, Pas", gps: "Non", etancheite: "50m" }
    },
    {
        id: 57, name: "Hybrid Classic Connect", category: "smart", price: 2299, oldPrice: null,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.5, reviews: 112, badge: "new", isNew: true, isSale: false, brand: "Hybrid",
        description: "Montre hybride avec apparence classique et fonctions connectées cachées. Aiguilles analogiques, notifications discrètes et suivi d'activité invisible.",
        specs: { ecran: "E-Ink caché", batterie: "30 jours", capteurs: "Pas, Sommeil", gps: "Connecté", etancheite: "50m" }
    },
    {
        id: 58, name: "Runner GPS Pro", category: "smart", price: 1999, oldPrice: 2499,
        image: "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80","https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80"],
        rating: 4.6, reviews: 201, badge: "sale", isNew: false, isSale: true, brand: "Runner",
        description: "Montre GPS running avec cardio optique avancé, VO2max, plans d'entraînement et coaching vocal. Légère (38g) pour ne pas gêner la course.",
        specs: { ecran: "1.2\" MIP", batterie: "20h GPS", capteurs: "Cardio, VO2max, Cadence", gps: "GPS + GLONASS", etancheite: "50m" }
    },
    {
        id: 59, name: "Kids Smart Watch", category: "smart", price: 499, oldPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.3, reviews: 345, badge: null, isNew: false, isSale: false, brand: "KidSafe",
        description: "Montre connectée pour enfants avec GPS, appels d'urgence SOS et géofencing. Les parents peuvent suivre la localisation en temps réel via l'app.",
        specs: { ecran: "1.4\" LCD tactile", batterie: "3 jours", capteurs: "GPS, Podomètre", gps: "GPS + LBS", etancheite: "IP67" }
    },
    {
        id: 60, name: "Business Smart Elite", category: "smart", price: 2799, oldPrice: 3299,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500&q=80"],
        rating: 4.7, reviews: 78, badge: "sale", isNew: true, isSale: true, brand: "BizElite",
        description: "Montre connectée business avec boîtier acier, cadrans professionnels, agenda intégré et réponse rapide aux emails. Le smart pour le bureau.",
        specs: { ecran: "1.39\" AMOLED", batterie: "5 jours", capteurs: "SpO2, Stress, NFC", gps: "Oui", etancheite: "50m" }
    },
    {
        id: 61, name: "Outdoor Rugged Smart", category: "smart", price: 1799, oldPrice: null,
        image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80",
        images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"],
        rating: 4.5, reviews: 167, badge: null, isNew: false, isSale: false, brand: "Rugged",
        description: "Montre connectée tout-terrain certifiée MIL-STD-810G. Résistante aux chocs, températures extrêmes et immersion. Lampe torche LED intégrée.",
        specs: { ecran: "1.45\" AMOLED", batterie: "14 jours", capteurs: "Altimètre, Baromètre, Boussole", gps: "Multi-GNSS", etancheite: "100m" }
    }
];

const MOROCCAN_CITIES = [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
    "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "El Jadida",
    "Nador", "Béni Mellal", "Mohammedia", "Taza", "Settat", "Khouribga",
    "Laâyoune", "Dakhla"
];

function formatPrice(price) {
    return price.toLocaleString('fr-MA') + ' MAD';
}

function getStarsHTML(rating) {
    let html = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star"></i>';
    return html;
}

function createProductCard(product) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const inWishlist = wishlist.includes(product.id);

    let badgesHTML = '';
    if (product.isNew)          badgesHTML += '<span class="product-badge badge-new">Nouveau</span>';
    if (product.isSale)         badgesHTML += '<span class="product-badge badge-sale">Promo</span>';
    if (product.badge === 'hot') badgesHTML += '<span class="product-badge badge-hot">Populaire</span>';

    const discount = product.oldPrice
        ? `<span class="discount-pct">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>`
        : '';

    return `
        <div class="product-card" data-category="${product.category}" data-id="${product.id}">
            <div class="product-image">
                <a href="product.html#id=${product.id}" aria-label="${product.name}">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </a>
                <div class="product-badges">${badgesHTML}</div>
                <div class="product-actions">
                    <button class="product-action-btn ${inWishlist ? 'in-wishlist' : ''}"
                        onclick="toggleWishlist(${product.id})" title="${inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="product-action-btn" onclick="quickView(${product.id})" title="Aperçu rapide">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">
                    <a href="product.html#id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-rating">
                    ${getStarsHTML(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                    ${discount}
                </div>
            </div>
            <div class="product-footer">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id});window.location.href='checkout.html'">
                    <i class="fas fa-gem"></i> Réserver
                </button>
            </div>
        </div>
    `;
}
