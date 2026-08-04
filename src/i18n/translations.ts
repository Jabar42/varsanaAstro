export type Locale = 'es' | 'en';

export interface TranslationDict {
  nav: {
    home: string;
    about: string;
    experiences: string;
    events: string;
    pasadias: string;
    volunteering: string;
    shop: string;
    lodging: string;
    food: string;
    blog: string;
    contact: string;
    donate: string;
    menu: string;
  };
  home: {
    tagline: string;
    taglinePart1?: string;
    taglinePart2?: string;
    subtitle: string;
    ctaCommunity: string;
    discoverTitle: string;
    discoverSubtitle: string;
    upcomingTitle: string;
    upcomingSubtitle: string;
    viewAllEvents: string;
    aboutTitle: string;
    aboutText: string;
    aboutCta: string;
    huertaTitlePart1: string;
    huertaTitlePart2: string;
    huertaTitle: string;
    huertaText: string;
    huertaCta: string;
    metaDescription: string;
    ctaFinalTitle: string;
    ctaFinalText: string;
    ctaReserve: string;
    ctaContact: string;
  };
  events: {
    heading: string;
    subtitle: string;
    noEvents: string;
    backHome: string;
    organizedBy: string;
    communityTagline: string;
    communityEnv: string;
    communityEnvDesc: string;
    allIncluded: string;
    allIncludedDesc: string;
    perPerson: string;
    date: string;
    spots: string;
    people: string;
    secureSpot: string;
  };
  pasadias: {
    heading: string;
    subtitle: string;
    noPasadias: string;
    backHome: string;
    organizedBy: string;
    communityTagline: string;
    includedServices: string;
    communityEnv: string;
    communityEnvDesc: string;
    allIncluded: string;
    allIncludedDesc: string;
    perPerson: string;
    duration: string;
    spotsPerDay: string;
    ticketType: string;
    secureSpot: string;
  };
  nosotros: {
    heading: string;
    subtitle: string;
    noMembers: string;
    backHome: string;
    storyTitle: string;
    storyText: string;
    storyCta: string;
    storyImageAlt: string;
    practiceTitle: string;
    practiceText: string;
    practiceCta: string;
    practiceImageAlt: string;
    sustainabilityTitle: string;
    sustainabilityText: string;
    sustainabilityImageAlt: string;
  };
  hospedaje: {
    title: string;
    badge: string;
    heading: string;
    subtitle: string;
    ctaRooms: string;
    ctaInfo: string;
    location: string;
    roomsHeading: string;
    roomsSubtitle: string;
    fromPrice: string;
    perNight: string;
    reserve: string;
    amenitiesBadge: string;
    amenitiesHeading: string;
    amenitiesSubtitle: string;
    amenitiesNote: string;
    faqBadge: string;
    faqHeading: string;
    faqSubtitle: string;
    faqOtherQuestion: string;
    faqCta: string;
    rooms: {
      suiteSol: { name: string; description: string; capacity: string; features: string[] };
      refugioLunar: { name: string; description: string; capacity: string; features: string[] };
      cabanaLoto: { name: string; description: string; capacity: string; features: string[] };
      nidoBosque: { name: string; description: string; capacity: string; features: string[] };
      estanciaEstrellas: { name: string; description: string; capacity: string; features: string[] };
      cabanaViento: { name: string; description: string; capacity: string; features: string[] };
    };
    amenities: string[];
    faqs: { question: string; answer: string }[];
  };
  alimentacion: {
    title: string;
    badge: string;
    heading: string;
    subtitle: string;
    ctaHuerta: string;
    ctaPhilosophy: string;
    philosophyHeading: string;
    philosophySubtitle: string;
    huertaBadge: string;
    huertaHeading: string;
    huertaSubtitle: string;
    mealsHeading: string;
    mealsSubtitle: string;
    principlesBadge: string;
    principlesHeading: string;
    ctaTitle: string;
    ctaText: string;
    ctaEvents: string;
    ctaVolunteer: string;
    philosophy: { title: string; description: string }[];
    huertaProducts: string[];
    meals: { name: string; time: string; description: string }[];
    principles: { title: string; description: string }[];
  };
  voluntariado: {
    title: string;
    heading: string;
    subtitle: string;
    ctaInscribe: string;
    ctaActivities: string;
    activitiesHeading: string;
    activitiesSubtitle: string;
    includesHeading: string;
    includesNote: string;
    faqHeading: string;
    faqSubtitle: string;
    activities: { title: string; description: string }[];
    includes: string[];
    faqs: { question: string; answer: string }[];
  };
  contacto: {
    title: string;
    badge: string;
    heading: string;
    subtitle: string;
    whatsapp: string;
    whatsappDesc: string;
    whatsappCta: string;
    emailLabel: string;
    emailDesc: string;
    emailCta: string;
    visit: string;
    visitDesc: string;
    visitAddress: string;
    visitCountry: string;
    formBadge: string;
    formHeading: string;
    formSubtitle: string;
    formName: string;
    formNamePlaceholder: string;
    formEmail: string;
    formEmailPlaceholder: string;
    formMessage: string;
    formMessagePlaceholder: string;
    formSubmit: string;
    howToBadge: string;
    howToHeading: string;
    howToSubtitle: string;
    byCar: string;
    byCarDesc: string;
    byBus: string;
    byBusDesc: string;
    arrivalTime: string;
    arrivalTimeDesc: string;
  };
  donar: {
    title: string;
    heading: string;
    subtitle: string;
    subtitle2: string;
    ctaDonate: string;
    ctaAbout: string;
    impactHeading: string;
    impactSubtitle: string;
    storyHeading: string;
    storyText1: string;
    storyText2: string;
    ctaBannerTitle: string;
    ctaBannerText: string;
    ctaBannerDonate: string;
    ctaBannerMore: string;
    impactAreas: { title: string; description: string }[];
  };
  red: {
    title: string;
    badge: string;
    heading: string;
    subtitle: string;
    ecoAldeaBadge: string;
    upcomingNote: string;
  };
  sitemap: {
    title: string;
    badge: string;
    heading: string;
    subtitle: string;
    groups: {
      heading: string;
      links: { label: string; description: string }[];
    }[];
  };
  notFound: {
    title: string;
    heading: string;
    text: string;
    cta: string;
    suggestTitle: string;
  };
  payment: {
    successTitle: string;
    successMessage: string;
    declinedTitle: string;
    declinedMessage: string;
    failedTitle: string;
    failedMessage: string;
    pendingTitle: string;
    pendingMessage: string;
    processing: string;
    noInfo: string;
    searchingTitle: string;
    searchingMessage: string;
    confirmingTitle: string;
    confirmingMessage: string;
    unknownMessage: string;
    unknownFallback: string;
    reference: string;
    retry: string;
    backHome: string;
    loadError: string;
    paymentError: string;
    notReady: string;
    serverError: string;
    noBold: string;
    unexpectedError: string;
    genericError: string;
    chooseDate: string;
    chooseDatePrompt: string;
    selectTicket: string;
    reserveNow: string;
    loadingGateway: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    phonePlaceholder: string;
  };
  blog: {
    heading: string;
    subtitle: string;
    noPosts: string;
    backHome: string;
  };
  footer: {
    tagline: string;
    community: string;
    varsanaOrg: string;
    socialProjects: string;
    organicAgriculture: string;
    ecoConstruction: string;
    ecoVillageNetwork: string;
    about: string;
    ourStory: string;
    philosophy: string;
    gallery: string;
    faq: string;
    contact: string;
    location: string;
    colombia: string;
    privacy: string;
    terms: string;
    sitemap: string;
    designSystem: string;
    copyright: string;
    language: string;
    currency: string;
  };
  announcement: {
    before: string;
    here: string;
    close: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  es: {
    nav: {
      home: 'Inicio',
      about: 'Nosotros',
      experiences: 'Experiencias',
      events: 'Eventos',
      pasadias: 'Pasadías',
      volunteering: 'Voluntariado',
      shop: 'Tienda',
      lodging: 'Hospedaje',
      food: 'Alimentación',
      blog: 'Blog',
      contact: 'Contacto',
      donate: 'Donar',
      menu: 'Menú',
    },
    home: {
      taglinePart1: 'Más que un lugar,',
      taglinePart2: 'es una forma de habitar el mundo',
      tagline: 'Más que un lugar, es una forma de habitar el mundo',
      subtitle: 'Un espacio donde la naturaleza, la conciencia y la comunidad se encuentran.',
      ctaCommunity: 'Conoce nuestra comunidad',
      discoverTitle: 'Descubre Varsana',
      discoverSubtitle: 'Experiencias que transforman',
      upcomingTitle: 'Próximas Experiencias',
      upcomingSubtitle: 'Los eventos más cercanos para tu transformación.',
      viewAllEvents: 'Ver todos los eventos',
      aboutTitle: 'Más que un lugar, una forma de vivir',
      aboutText: 'Varsana es una ecoaldea dedicada al bienestar integral, la vida consciente y la conexión espiritual. Aquí cultivamos la tierra, el cuerpo, la mente y el alma.',
      aboutCta: 'Conoce nuestra historia',
      huertaTitlePart1: 'Cultivamos alimentos,',
      huertaTitlePart2: 'cultivamos conciencia',
      huertaTitle: 'Cultivamos alimentos, cultivamos conciencia',
      huertaText: 'En nuestra huerta orgánica producimos alimentos frescos, con prácticas sostenibles que cuidan la tierra y nuestra comunidad.',
      huertaCta: 'Ver la Huerta',
      metaDescription: 'Varsana Eco Yoga Aldea es una comunidad consciente en Granada, Cundinamarca. Retiros de yoga, meditación, pasadías, voluntariado y hospedaje ecológico en conexión con la naturaleza.',
      ctaFinalTitle: '¿Listo para tu transformación?',
      ctaFinalText: 'Únete a cientos de personas que han encontrado paz y propósito en nuestra aldea. Tu viaje comienza aquí.',
      ctaReserve: 'Reservar ahora',
      ctaContact: 'Contactar guía',
    },
    events: {
      heading: 'Calendario de Eventos',
      subtitle: 'Explora todas nuestras próximas actividades y retiros.',
      noEvents: 'No hay eventos programados por ahora.',
      backHome: 'Volver al inicio',
      organizedBy: 'Experiencia organizada por Varsana',
      communityTagline: 'Comunidad intencional · 15 años de sabiduría',
      communityEnv: 'Ambiente Comunitario',
      communityEnvDesc: 'Comparte con personas que buscan el mismo camino de paz.',
      allIncluded: 'Todo Incluido',
      allIncludedDesc: 'Alimentación vegetariana consciente y hospedaje ecológico.',
      perPerson: ' / persona',
      date: 'Fecha',
      spots: 'Cupos',
      people: 'personas',
      secureSpot: 'Asegura tu cupo con anticipación',
    },
    pasadias: {
      heading: 'Pasadías',
      subtitle: 'Descubre nuestras experiencias de día completo en contacto con la naturaleza y la espiritualidad.',
      noPasadias: 'No hay pasadías disponibles en este momento.',
      backHome: 'Volver al inicio',
      organizedBy: 'Experiencia organizada por Varsana',
      communityTagline: 'Comunidad intencional · 15 años de sabiduría',
      includedServices: 'Servicios incluidos',
      communityEnv: 'Ambiente Comunitario',
      communityEnvDesc: 'Comparte con personas que buscan el mismo camino de paz.',
      allIncluded: 'Todo Incluido',
      allIncludedDesc: 'Alimentación vegetariana consciente y hospedaje ecológico.',
      perPerson: ' / persona',
      duration: 'Duración',
      spotsPerDay: 'Cupos por día',
      ticketType: 'Tipo de Entrada',
      secureSpot: 'Asegura tu cupo con anticipación',
    },
    nosotros: {
      heading: 'Nuestro Equipo',
      subtitle: 'Conoce a las personas que hacen posible Varsana Eco Yoga Aldea.',
      noMembers: 'No hay miembros activos en este momento.',
      backHome: 'Volver al inicio',
      storyTitle: 'Espacio de vida consciente donde convergen la espiritualidad, la naturaleza y la comunidad',
      storyText: 'Varsana es un santuario de conciencia ubicado en la puerta del Sumapaz, creado para reconectar con la naturaleza, la espiritualidad y la vida en comunidad. Desde 1980, este territorio reúne prácticas como yoga, meditación, permacultura, alimentación consciente y experiencias de descanso interior en un entorno natural y ancestral.',
      storyCta: 'Conoce nuestra historia',
      storyImageAlt: 'Paisaje de Varsana Eco Yoga Aldea en Granada, Cundinamarca',
      practiceTitle: 'Práctica espiritual',
      practiceText: 'La vida en la ecoaldea está guiada por una práctica espiritual basada en la tradición védica. La meditación, el canto de mantras y el servicio consciente hacen parte del día a día.',
      practiceCta: 'Explora más',
      practiceImageAlt: 'Práctica espiritual en Varsana Eco Yoga Aldea',
      sustainabilityTitle: 'Varsana es también un proyecto de sostenibilidad',
      sustainabilityText: 'A través de la huerta orgánica, el consumo consciente y el trabajo comunitario, se construye una forma de habitar el territorio en equilibrio. Además, genera impacto en la comunidad local mediante educación, empleo y prácticas regenerativas.',
      sustainabilityImageAlt: 'Proyecto de sostenibilidad en Varsana Eco Yoga Aldea',
    },
    hospedaje: {
      title: 'Hospedaje Ecológico | Varsana Eco Yoga Aldea',
      badge: 'Eco-alojamiento consciente',
      heading: 'Hospedaje Ecológico en Varsana',
      subtitle: 'Despierta entre montañas, respira aire puro y descansa en espacios diseñados para la paz interior. Cada habitación es un refugio donde la naturaleza y la espiritualidad se encuentran.',
      ctaRooms: 'Ver habitaciones',
      ctaInfo: 'Más información',
      location: 'Granada, Cundinamarca',
      roomsHeading: 'Nuestras Habitaciones',
      roomsSubtitle: 'Seis espacios únicos donde la arquitectura sostenible se funde con el paisaje de Cundinamarca. Cada uno tiene su propia personalidad.',
      fromPrice: 'Desde',
      perNight: ' COP / noche',
      reserve: 'Reservar',
      amenitiesBadge: 'Servicios incluidos',
      amenitiesHeading: 'Todo lo que necesitas para una estancia plena',
      amenitiesSubtitle: 'Cada detalle está pensado para tu comodidad, sin perder la esencia de la vida consciente y sostenible.',
      amenitiesNote: 'Todos nuestros espacios son libres de humo, alcohol y sustancias. Mantenemos un ambiente de respeto, silencio y espiritualidad.',
      faqBadge: 'Preguntas frecuentes',
      faqHeading: 'Información para tu visita',
      faqSubtitle: 'Resolvemos las dudas más comunes para que solo te preocupes por disfrutar.',
      faqOtherQuestion: '¿Tienes una pregunta diferente?',
      faqCta: 'Escríbenos',
      rooms: {
        suiteSol: {
          name: 'Suite del Sol',
          description: 'Amplia habitación con vista al amanecer sobre la montaña. Decorada con textiles artesanales y maderas de la región.',
          capacity: '2 personas',
          features: ['Vista panorámica', 'Baño privado', 'Terraza'],
        },
        refugioLunar: {
          name: 'Refugio Lunar',
          description: 'Un espacio íntimo y sereno para el descanso profundo. Iluminación tenue, colores tierra y total silencio natural.',
          capacity: '2 personas',
          features: ['Aislación acústica', 'Baño privado', 'Ropa de cama orgánica'],
        },
        cabanaLoto: {
          name: 'Cabaña Flor de Loto',
          description: 'Cabaña independiente rodeada de jardines. Ideal para quienes buscan privacidad y conexión con la naturaleza.',
          capacity: '3 personas',
          features: ['Cabaña privada', 'Baño con ducha caliente', 'Vista al jardín'],
        },
        nidoBosque: {
          name: 'Nido del Bosque',
          description: 'Habitación elevada entre los árboles con diseño rústico y acogedor. Perfecta para una experiencia inmersiva en el bosque.',
          capacity: '2 personas',
          features: ['Hamaca privada', 'Ducha ecológica', 'Escritorio'],
        },
        estanciaEstrellas: {
          name: 'Estancia de las Estrellas',
          description: 'Nuestra habitación más especial, con claraboya para observar el cielo nocturno desde la cama.',
          capacity: '2 personas',
          features: ['Claraboya', 'Baño privado', 'Chimenea'],
        },
        cabanaViento: {
          name: 'Cabaña Al Viento',
          description: 'Espacio abierto con brisa constante y diseño minimalista. La ventilación natural mantiene fresco todo el año.',
          capacity: '4 personas',
          features: ['Dos habitaciones', 'Cocina básica', 'Zona de hamacas'],
        },
      },
      amenities: [
        'Agua caliente con energía solar',
        'Alimentación vegetariana consciente (3 comidas)',
        'Clases diarias de yoga y meditación',
        'Senderos ecológicos señalizados',
        'Estacionamiento privado',
        'Wi-Fi en áreas comunes',
        'Ropa de cama y toallas orgánicas',
        'Productos de aseo biodegradables',
      ],
      faqs: [
        {
          question: '¿Cuál es el horario de llegada y salida?',
          answer: 'El check-in es a partir de las 2:00 p. m. y el check-out antes de las 11:00 a. m. Si necesitas flexibilidad, contáctanos y haremos lo posible por acomodarte.',
        },
        {
          question: '¿Se permiten mascotas?',
          answer: 'Por respeto a la fauna local y a la tranquilidad de nuestros huéspedes, no permitimos mascotas. Tenemos tres perros residentes que cuidan la aldea.',
        },
        {
          question: '¿La alimentación está incluida en la tarifa?',
          answer: 'Sí, todas nuestras tarifas incluyen tres comidas vegetarianas conscientes al día, preparadas con ingredientes de nuestra huerta orgánica.',
        },
        {
          question: '¿Cuál es la política de cancelación?',
          answer: 'Reembolso completo si cancelas con más de 7 días de anticipación. Con 3 a 6 días, reembolsamos el 50 %. Las cancelaciones con menos de 48 horas no tienen reembolso.',
        },
        {
          question: '¿Cómo llegar a Varsana desde Bogotá?',
          answer: 'Estamos en Granada, Cundinamarca. Puedes llegar en carro por la vía Bogotá – Silvania – Granada (hora y media aprox.) o tomar un bus intermunicipal desde el Terminal del Sur.',
        },
      ],
    },
    alimentacion: {
      title: 'Alimentación Consciente | Varsana Eco Yoga Aldea',
      badge: 'Alimentación consciente',
      heading: 'Alimentación Consciente en Varsana',
      subtitle: 'En nuestra mesa, cada alimento cuenta una historia de amor por la tierra. Practicamos una cocina vegetariana que nutre el cuerpo, honra la naturaleza y eleva el espíritu.',
      ctaHuerta: 'Conoce la huerta',
      ctaPhilosophy: 'Nuestra filosofía',
      philosophyHeading: 'Nuestra filosofía alimentaria',
      philosophySubtitle: 'Comer en Varsana es una experiencia que despierta los sentidos y cultiva la gratitud. Esto es lo que creemos.',
      huertaBadge: 'Del campo a tu plato',
      huertaHeading: 'Nuestra huerta orgánica',
      huertaSubtitle: 'Cultivamos sin químicos, en armonía con los ciclos de la naturaleza. La tierra de Varsana nos regala alimentos vivos, llenos de sabor y de prana.',
      mealsHeading: 'Qué esperar en la mesa',
      mealsSubtitle: 'Tres comidas al día preparadas con ingredientes frescos de la huerta, servidas en comunidad.',
      principlesBadge: 'Principios de nuestra cocina',
      principlesHeading: 'Así preparamos tus alimentos',
      ctaTitle: '¿Quieres aprender el arte de la cocina consciente?',
      ctaText: 'Participa en nuestros talleres de panadería artesanal, cocina vegetariana y nutrición ayurvédica. Descubre cómo transformar ingredientes simples en alimento sagrado.',
      ctaEvents: 'Ver eventos',
      ctaVolunteer: 'Ser voluntario en la huerta',
      philosophy: [
        {
          title: 'De la huerta a la mesa',
          description: 'Cosechamos cada día los ingredientes frescos de nuestra huerta orgánica. Lo que llega a tu plato fue cultivado con amor, sin químicos ni prisas.',
        },
        {
          title: 'Cocina vegetariana consciente',
          description: 'No servimos carne, huevos, alcohol ni tabaco. Nuestra cocina honra la vida en todas sus formas y nutre el cuerpo con la abundancia del reino vegetal.',
        },
        {
          title: 'Nutrición sagrada',
          description: 'Para nosotros cocinar es un acto de devoción. Cada ingrediente se elige, se prepara y se ofrece con conciencia, transformando la nutrición en una práctica espiritual.',
        },
      ],
      huertaProducts: [
        'Verduras de temporada — lechuga, acelga, kale, espinaca',
        'Hierbas aromáticas — albahaca, cilantro, romero, tomillo',
        'Frutas frescas — mora, fresa, guayaba, feijoa',
        'Flores comestibles — caléndula, pensamiento, capuchina',
        'Tubérculos andinos — papa criolla, cubio, arracacha',
      ],
      meals: [
        {
          name: 'Desayuno',
          time: '7:00 – 9:00 a. m.',
          description: 'Frutas frescas de la huerta, granola artesanal, pan recién horneado, mermeladas naturales y bebidas calientes para empezar el día con energía.',
        },
        {
          name: 'Almuerzo',
          time: '12:00 – 2:00 p. m.',
          description: 'El plato principal del día: sopa de verduras, una proteína vegetal como lentejas o garbanzos, arroz, ensalada fresca y postre.',
        },
        {
          name: 'Cena',
          time: '6:30 – 8:00 p. m.',
          description: 'Una opción más ligera: crema de verduras, wrap de vegetales asados o bowl de quinoa con hortalizas de la huerta.',
        },
        {
          name: 'Bebidas',
          time: 'Todo el día',
          description: 'Infusiones de hierbas recolectadas en la montaña, agua de panela, café orgánico de la región y jugos naturales según la cosecha del día.',
        },
      ],
      principles: [
        {
          title: 'Ingredientes orgánicos',
          description: 'Todo lo que cultivamos y servimos es 100 % libre de pesticidas y fertilizantes químicos.',
        },
        {
          title: 'Sin procesados',
          description: 'Preparamos nuestros alimentos desde cero. Nada de conservantes, saborizantes ni productos industriales.',
        },
        {
          title: 'Sazón consciente',
          description: 'Cocinamos con intención, en un ambiente de calma y gratitud. La energía con la que se prepara el alimento también nutre.',
        },
      ],
    },
    voluntariado: {
      title: 'Programa de Voluntariado | Varsana Eco Yoga Aldea',
      heading: 'Programa de Voluntariado Cerca a Bogotá',
      subtitle: 'Una experiencia especial para quienes desean vivir en una eco-aldea, conectar con la naturaleza y descubrir nuevas habilidades.',
      ctaInscribe: 'Inscribirme ahora',
      ctaActivities: 'Ver actividades',
      activitiesHeading: '¿Qué harás como voluntario?',
      activitiesSubtitle: 'Participa en actividades sostenibles y descubre el ritmo de la vida consciente.',
      includesHeading: 'Tu estancia incluye',
      includesNote: 'Buscamos voluntarios comprometidos, con ganas de aprender y compartir en un ambiente de respeto y espiritualidad.',
      faqHeading: 'Preguntas Frecuentes',
      faqSubtitle: 'Todo lo que necesitas saber antes de venir.',
      activities: [
        { title: 'Agricultura Orgánica', description: 'Participa en la siembra, cuidado y cosecha de alimentos saludables en nuestra huerta.' },
        { title: 'Cocina Vegetariana', description: 'Aprende el arte de la cocina consciente y saludable preparando alimentos para la comunidad.' },
        { title: 'Mantenimiento y Bioconstrucción', description: 'Ayuda en el mejoramiento de las instalaciones usando técnicas sostenibles.' },
        { title: 'Proyectos Especiales', description: 'Si tienes habilidades en diseño, comunicaciones o artes, puedes aportar a la visibilidad de la aldea.' },
      ],
      includes: [
        'Alojamiento en la eco-aldea',
        'Alimentación vegetariana completa (3 comidas al día)',
        'Participación en programas de yoga y meditación',
        'Conexión profunda con la naturaleza',
        'Descubrimiento de nuevas habilidades sostenibles',
      ],
      faqs: [
        {
          question: '¿Qué debo traer?',
          answer: 'Ropa cómoda para trabajo de campo, botas de caucho, linterna, artículos de aseo personal biodegradables y muchas ganas de aprender.',
        },
        {
          question: '¿Hay requisitos de alimentación?',
          answer: 'En Varsana seguimos una dieta vegetariana consciente. No se permite el consumo de carne, huevos, alcohol ni tabaco dentro de la aldea.',
        },
        {
          question: '¿Cuál es la duración mínima?',
          answer: 'Recomendamos una estancia mínima de una semana para poder integrarte plenamente en las actividades y el ritmo de la comunidad.',
        },
      ],
    },
    contacto: {
      title: 'Contacto | Varsana Eco Yoga Aldea',
      badge: 'Contáctanos',
      heading: 'Estamos aquí para ti',
      subtitle: 'Escríbenos, llámanos o visítanos. Queremos acompañarte en tu camino hacia una experiencia de bienestar, naturaleza y espiritualidad en Varsana.',
      whatsapp: 'WhatsApp',
      whatsappDesc: 'Chatea con nosotros',
      whatsappCta: 'Abrir chat',
      emailLabel: 'Correo electrónico',
      emailDesc: 'Escríbenos tus preguntas',
      emailCta: 'Enviar correo',
      visit: 'Visítanos',
      visitDesc: 'Te recibimos con los brazos abiertos',
      visitAddress: 'Km 28, Vía Silvania – Granada, Granada, Cundinamarca',
      visitCountry: 'Colombia',
      formBadge: 'Envíanos un mensaje',
      formHeading: '¿Tienes una pregunta?',
      formSubtitle: 'Completa el formulario y te responderemos lo antes posible.',
      formName: 'Nombre',
      formNamePlaceholder: 'Tu nombre completo',
      formEmail: 'Correo electrónico',
      formEmailPlaceholder: 'tucorreo@ejemplo.com',
      formMessage: 'Mensaje',
      formMessagePlaceholder: 'Cuéntanos cómo podemos ayudarte...',
      formSubmit: 'Enviar mensaje',
      howToBadge: 'Cómo llegar',
      howToHeading: 'Encuentra el camino a Varsana',
      howToSubtitle: 'Estamos a hora y media de Bogotá. La ruta es sencilla y el paisaje hace que el viaje valga la pena.',
      byCar: 'En carro',
      byCarDesc: 'Toma la vía Bogotá – Silvania – Granada. Al llegar al Km 28, encontrarás la entrada de Varsana. El trayecto dura aproximadamente hora y media. Hay estacionamiento gratuito en la aldea.',
      byBus: 'En bus',
      byBusDesc: 'Desde el Terminal del Sur de Bogotá salen buses intermunicipales hacia Granada. Pide al conductor que te deje en el Km 28 de la vía Silvania – Granada, justo en la entrada de Varsana.',
      arrivalTime: 'Horario de llegada',
      arrivalTimeDesc: 'Recomendamos llegar antes de las 5:00 p. m. para que puedas instalarte con luz natural y disfrutar el atardecer desde nuestra montaña.',
    },
    donar: {
      title: 'Donar | Varsana Eco Yoga Aldea',
      heading: 'Apoya Nuestra Misión',
      subtitle: 'Tu donación sostiene los proyectos de la eco-aldea: la huerta orgánica, el templo, y los espacios que hacen posible una vida más consciente y conectada con la naturaleza.',
      subtitle2: 'Cada aporte, grande o pequeño, siembra una semilla de transformación en Varsana.',
      ctaDonate: 'Hacer una Donación',
      ctaAbout: 'Conócenos',
      impactHeading: '¿Qué haces posible?',
      impactSubtitle: 'Tres pilares que tu generosidad ayuda a sostener.',
      storyHeading: 'Una aldea que se cultiva con amor colectivo',
      storyText1: 'Varsana no es solo un lugar — es un proyecto vivo que crece gracias a quienes creen en una forma distinta de habitar el mundo. Cada donación riega las raíces de esta comunidad.',
      storyText2: 'Desde las semillas en la huerta hasta las velas del templo, tu apoyo se traduce en acciones concretas que cuidan la tierra, el cuerpo y el espíritu.',
      ctaBannerTitle: 'Tu generosidad transforma vidas',
      ctaBannerText: 'Cada aporte nutre este sueño colectivo. Dona hoy y sé parte de la familia que hace posible Varsana.',
      ctaBannerDonate: 'Hacer una Donación',
      ctaBannerMore: 'Conoce más',
      impactAreas: [
        { title: 'Huerta Orgánica', description: 'Expandimos nuestra huerta para producir alimentos frescos y saludables que nutren a la comunidad y protegen la tierra.' },
        { title: 'Templo y Espiritualidad', description: 'Mantenemos el templo como un espacio sagrado para la práctica de yoga, meditación y ceremonias que elevan la conciencia.' },
        { title: 'Comunidad Consciente', description: 'Fortalecemos los lazos entre voluntarios, visitantes y residentes creando un tejido social basado en el respeto y el servicio.' },
      ],
    },
    red: {
      title: 'Red de Eco Aldeas | Varsana Eco Yoga Aldea',
      badge: 'Red de eco aldeas',
      heading: 'Red de Eco Aldeas',
      subtitle: 'Comunidades hermanas que comparten nuestra visión de un mundo más consciente, sostenible y conectado con la tierra. Descubre espacios donde florece una nueva forma de habitar el planeta.',
      ecoAldeaBadge: 'Eco aldea',
      upcomingNote: 'Próximamente: conoce más eco aldeas, filtra por región y descubre cómo visitarlas o colaborar con ellas.',
    },
    sitemap: {
      title: 'Mapa del sitio | Varsana Eco Yoga Aldea',
      badge: 'Navegación',
      heading: 'Mapa del sitio',
      subtitle: 'Todas las páginas de Varsana en un solo lugar.',
      groups: [
        {
          heading: 'Principal',
          links: [
            { label: 'Inicio', description: 'Página de bienvenida, eventos destacados y galería' },
            { label: 'Nosotros', description: 'Conoce a nuestro equipo y nuestra misión' },
            { label: 'Contáctanos', description: 'Escríbenos, llámanos o visítanos' },
          ],
        },
        {
          heading: 'Experiencias',
          links: [
            { label: 'Eventos', description: 'Retiros, talleres y encuentros con fecha programada' },
            { label: 'Pasadías', description: 'Servicios y experiencias disponibles todo el año' },
            { label: 'Voluntariado', description: 'Vive la eco-aldea como voluntario y aprende habilidades sostenibles' },
          ],
        },
        {
          heading: 'Bienestar',
          links: [
            { label: 'Hospedaje', description: 'Habitaciones ecológicas con vista a las montañas de Cundinamarca' },
            { label: 'Alimentación', description: 'Cocina vegetariana consciente con ingredientes frescos de nuestra huerta orgánica' },
            { label: 'Tienda', description: 'Productos artesanales y sostenibles — próximamente' },
          ],
        },
        {
          heading: 'Más',
          links: [
            { label: 'Donar', description: 'Apoya la misión de Varsana con tu contribución' },
            { label: 'Blog', description: 'Historias, sabiduría y noticias de la comunidad' },
            { label: 'Design System', description: 'Guía de diseño para desarrolladores y colaboradores' },
          ],
        },
      ],
    },
    notFound: {
      title: 'Página no encontrada | Varsana Eco Yoga Aldea',
      heading: 'Página no encontrada',
      text: 'El camino que buscas no está en nuestro mapa. Tal vez la página fue movida, renombrada, o simplemente decidió salir a meditar al jardín.',
      cta: 'Volver al inicio',
      suggestTitle: 'Quizás te interese visitar',
    },
    payment: {
      successTitle: '¡Pago exitoso!',
      successMessage: 'Pronto recibirás un correo de confirmación con los detalles de tu reserva. Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam.',
      declinedTitle: 'Pago rechazado',
      declinedMessage: 'El pago no pudo completarse. Esto puede deberse a fondos insuficientes o a un error temporal. Intenta nuevamente con otro medio de pago.',
      failedTitle: 'Pago fallido',
      failedMessage: 'Ocurrió un error al procesar el pago. Por favor, intenta nuevamente.',
      pendingTitle: 'Pago en proceso',
      pendingMessage: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme. No cierres esta página.',
      processing: 'Procesando...',
      noInfo: 'Sin información de pago',
      searchingTitle: 'Buscando transacción...',
      searchingMessage: 'Estamos consultando la información de tu pago. Si realizaste una transacción, espera unos segundos.',
      confirmingTitle: 'Confirmando transacción...',
      confirmingMessage: 'Tu pago está siendo confirmado. Esto puede tomar unos segundos. No cierres esta página.',
      unknownMessage: 'Tu transacción está siendo procesada. Te contactaremos cuando tengamos una actualización.',
      unknownFallback: 'No se encontró información de una transacción reciente. Si realizaste un pago, por favor contáctanos.',
      reference: 'Referencia',
      retry: 'Intentar nuevamente',
      backHome: 'Volver al inicio',
      loadError: 'No se pudo cargar la pasarela de pago. Intenta recargar la página.',
      paymentError: 'El pago no pudo completarse. Intenta nuevamente.',
      notReady: 'La pasarela de pago aún no está lista. Intenta de nuevo en un momento.',
      serverError: 'Error del servidor',
      noBold: 'BoldCheckout no está disponible. Recarga la página.',
      unexpectedError: 'Error inesperado',
      genericError: 'Ocurrió un error inesperado.',
      chooseDate: 'Elige la fecha',
      chooseDatePrompt: 'Elige una fecha',
      selectTicket: 'Selecciona al menos un boleto',
      reserveNow: 'Reservar ahora',
      loadingGateway: 'Cargando pasarela de pago...',
      emailPlaceholder: 'Correo electrónico *',
      namePlaceholder: 'Nombre completo *',
      phonePlaceholder: 'Teléfono (opcional)',
    },
    blog: {
      heading: 'Blog de Varsana',
      subtitle: 'Historias, sabiduría y noticias de nuestra comunidad consciente.',
      noPosts: 'No hay artículos publicados por ahora.',
      backHome: 'Volver al inicio',
    },
    footer: {
      tagline: 'Eco Yoga Aldea — bienestar, conciencia y conexión espiritual en Granada, Cundinamarca.',
      community: 'Comunidad',
      varsanaOrg: 'Varsana.org',
      socialProjects: 'Proyectos Sociales',
      organicAgriculture: 'Agricultura Orgánica',
      ecoConstruction: 'Eco-Construcción',
      ecoVillageNetwork: 'Red de eco aldeas',
      about: 'Sobre Nosotros',
      ourStory: 'Nuestra Historia',
      philosophy: 'Filosofía',
      gallery: 'Galería',
      faq: 'Preguntas Frecuentes',
      contact: 'Contacto',
      location: 'Granada, Cundinamarca',
      colombia: 'Colombia',
      privacy: 'Privacidad',
      terms: 'Condiciones',
      sitemap: 'Mapa del sitio',
      designSystem: 'Design System',
      copyright: '© 2024 Varsana Eco Yoga Aldea',
      language: 'Español (CO)',
      currency: 'COP',
    },
    announcement: {
      before: 'Descarga nuestra guía de Varsana',
      here: 'aquí',
      close: 'Cerrar aviso',
    },
  },

  en: {
    home: {
      taglinePart1: 'More than a place,',
      taglinePart2: 'it is a way of inhabiting the world',
      tagline: 'More than a place, it is a way of inhabiting the world',
      subtitle: 'A space where nature, consciousness, and community come together.',
      ctaCommunity: 'Meet our community',
      discoverTitle: 'Discover Varsana',
      discoverSubtitle: 'Transformative experiences',
      upcomingTitle: 'Upcoming Experiences',
      upcomingSubtitle: 'The nearest events for your transformation.',
      viewAllEvents: 'View all events',
      aboutTitle: 'More than a place, a way of living',
      aboutText: 'Varsana is an eco-village dedicated to holistic well-being, conscious living, and spiritual connection. Here we cultivate the earth, the body, the mind, and the soul.',
      aboutCta: 'Learn our story',
      huertaTitlePart1: 'We grow food,',
      huertaTitlePart2: 'we grow consciousness',
      huertaTitle: 'We grow food, we grow consciousness',
      huertaText: 'In our organic garden we produce fresh food with sustainable practices that care for the land and our community.',
      huertaCta: 'See the Garden',
      metaDescription: 'Varsana Eco Yoga Aldea is a conscious community in Granada, Colombia. Yoga retreats, meditation, day passes, volunteering, and eco-lodging in harmony with nature.',
      ctaFinalTitle: 'Ready for your transformation?',
      ctaFinalText: 'Join hundreds of people who have found peace and purpose in our village. Your journey begins here.',
      ctaReserve: 'Book now',
      ctaContact: 'Contact a guide',
    },
    nav: {
      home: 'Home',
      about: 'About Us',
      experiences: 'Experiences',
      events: 'Events',
      pasadias: 'Day Passes',
      volunteering: 'Volunteering',
      shop: 'Shop',
      lodging: 'Lodging',
      food: 'Food',
      blog: 'Blog',
      contact: 'Contact',
      donate: 'Donate',
      menu: 'Menu',
    },
    events: {
      heading: 'Events Calendar',
      subtitle: 'Explore all our upcoming activities and retreats.',
      noEvents: 'No events scheduled at this time.',
      backHome: 'Back to home',
      organizedBy: 'Experience organized by Varsana',
      communityTagline: 'Intentional community · 15 years of wisdom',
      communityEnv: 'Community Atmosphere',
      communityEnvDesc: 'Share with people seeking the same path of peace.',
      allIncluded: 'All Included',
      allIncludedDesc: 'Conscious vegetarian food and eco-friendly lodging.',
      perPerson: ' / person',
      date: 'Date',
      spots: 'Spots',
      people: 'people',
      secureSpot: 'Secure your spot in advance',
    },
    pasadias: {
      heading: 'Day Passes',
      subtitle: 'Discover our full-day experiences in contact with nature and spirituality.',
      noPasadias: 'No day passes available at this time.',
      backHome: 'Back to home',
      organizedBy: 'Experience organized by Varsana',
      communityTagline: 'Intentional community · 15 years of wisdom',
      includedServices: 'Included Services',
      communityEnv: 'Community Atmosphere',
      communityEnvDesc: 'Share with people seeking the same path of peace.',
      allIncluded: 'All Included',
      allIncludedDesc: 'Conscious vegetarian food and eco-friendly lodging.',
      perPerson: ' / person',
      duration: 'Duration',
      spotsPerDay: 'Spots per day',
      ticketType: 'Ticket Type',
      secureSpot: 'Secure your spot in advance',
    },
    nosotros: {
      heading: 'Our Team',
      subtitle: 'Meet the people who make Varsana Eco Yoga Aldea possible.',
      noMembers: 'No active members at this time.',
      backHome: 'Back to home',
      storyTitle: 'A conscious living space where spirituality, nature, and community converge',
      storyText: 'Varsana is a sanctuary of consciousness located at the gateway to Sumapaz, created to reconnect with nature, spirituality, and community life. Since 1980, this territory has brought together practices such as yoga, meditation, permaculture, conscious eating, and inner rest experiences in a natural and ancestral environment.',
      storyCta: 'Learn our story',
      storyImageAlt: 'Landscape of Varsana Eco Yoga Aldea in Granada, Cundinamarca',
      practiceTitle: 'Spiritual practice',
      practiceText: 'Life in the eco-village is guided by a spiritual practice rooted in the Vedic tradition. Meditation, mantra chanting, and conscious service are part of everyday life.',
      practiceCta: 'Explore more',
      practiceImageAlt: 'Spiritual practice at Varsana Eco Yoga Aldea',
      sustainabilityTitle: 'Varsana is also a sustainability project',
      sustainabilityText: 'Through organic farming, conscious consumption, and community work, a balanced way of inhabiting the land is built. It also generates impact in the local community through education, employment, and regenerative practices.',
      sustainabilityImageAlt: 'Sustainability project at Varsana Eco Yoga Aldea',
    },
    hospedaje: {
      title: 'Eco-Lodging | Varsana Eco Yoga Aldea',
      badge: 'Conscious eco-lodging',
      heading: 'Eco-Lodging at Varsana',
      subtitle: 'Wake up among mountains, breathe pure air, and rest in spaces designed for inner peace. Each room is a refuge where nature and spirituality meet.',
      ctaRooms: 'View rooms',
      ctaInfo: 'More information',
      location: 'Granada, Cundinamarca',
      roomsHeading: 'Our Rooms',
      roomsSubtitle: 'Six unique spaces where sustainable architecture blends with the Cundinamarca landscape. Each one has its own personality.',
      fromPrice: 'From',
      perNight: ' COP / night',
      reserve: 'Reserve',
      amenitiesBadge: 'Included services',
      amenitiesHeading: 'Everything you need for a fulfilling stay',
      amenitiesSubtitle: 'Every detail is designed for your comfort, without losing the essence of conscious and sustainable living.',
      amenitiesNote: 'All our spaces are smoke-free, alcohol-free, and substance-free. We maintain an atmosphere of respect, silence, and spirituality.',
      faqBadge: 'Frequently asked questions',
      faqHeading: 'Information for your visit',
      faqSubtitle: 'We answer the most common questions so you only have to worry about enjoying yourself.',
      faqOtherQuestion: 'Have a different question?',
      faqCta: 'Write to us',
      rooms: {
        suiteSol: {
          name: 'Sun Suite',
          description: 'Spacious room with sunrise views over the mountain. Decorated with artisanal textiles and local woods.',
          capacity: '2 people',
          features: ['Panoramic view', 'Private bathroom', 'Terrace'],
        },
        refugioLunar: {
          name: 'Lunar Refuge',
          description: 'An intimate and serene space for deep rest. Soft lighting, earth tones, and total natural silence.',
          capacity: '2 people',
          features: ['Acoustic insulation', 'Private bathroom', 'Organic bedding'],
        },
        cabanaLoto: {
          name: 'Lotus Flower Cabin',
          description: 'Independent cabin surrounded by gardens. Ideal for those seeking privacy and connection with nature.',
          capacity: '3 people',
          features: ['Private cabin', 'Hot shower bathroom', 'Garden view'],
        },
        nidoBosque: {
          name: 'Forest Nest',
          description: 'Elevated room among the trees with rustic and cozy design. Perfect for an immersive forest experience.',
          capacity: '2 people',
          features: ['Private hammock', 'Eco-friendly shower', 'Desk'],
        },
        estanciaEstrellas: {
          name: 'Starlight Room',
          description: 'Our most special room, with a skylight for watching the night sky from bed.',
          capacity: '2 people',
          features: ['Skylight', 'Private bathroom', 'Fireplace'],
        },
        cabanaViento: {
          name: 'Wind Cabin',
          description: 'Open space with constant breeze and minimalist design. Natural ventilation keeps it cool year-round.',
          capacity: '4 people',
          features: ['Two bedrooms', 'Basic kitchen', 'Hammock area'],
        },
      },
      amenities: [
        'Solar-powered hot water',
        'Conscious vegetarian meals (3 meals)',
        'Daily yoga and meditation classes',
        'Marked ecological trails',
        'Private parking',
        'Wi-Fi in common areas',
        'Organic bedding and towels',
        'Biodegradable toiletries',
      ],
      faqs: [
        {
          question: 'What are the check-in and check-out times?',
          answer: 'Check-in is from 2:00 p.m. and check-out is before 11:00 a.m. If you need flexibility, contact us and we will do our best to accommodate you.',
        },
        {
          question: 'Are pets allowed?',
          answer: 'Out of respect for local wildlife and the tranquility of our guests, we do not allow pets. We have three resident dogs that watch over the village.',
        },
        {
          question: 'Is food included in the rate?',
          answer: 'Yes, all our rates include three conscious vegetarian meals a day, prepared with ingredients from our organic garden.',
        },
        {
          question: 'What is the cancellation policy?',
          answer: 'Full refund if you cancel more than 7 days in advance. With 3 to 6 days, we refund 50%. Cancellations with less than 48 hours are non-refundable.',
        },
        {
          question: 'How to get to Varsana from Bogotá?',
          answer: 'We are in Granada, Cundinamarca. You can drive via Bogotá – Silvania – Granada (approximately 1.5 hours) or take an intercity bus from the Terminal del Sur.',
        },
      ],
    },
    alimentacion: {
      title: 'Conscious Eating | Varsana Eco Yoga Aldea',
      badge: 'Conscious eating',
      heading: 'Conscious Eating at Varsana',
      subtitle: 'At our table, every food tells a story of love for the earth. We practice a vegetarian cuisine that nourishes the body, honors nature, and elevates the spirit.',
      ctaHuerta: 'Discover the garden',
      ctaPhilosophy: 'Our philosophy',
      philosophyHeading: 'Our Food Philosophy',
      philosophySubtitle: 'Eating at Varsana is an experience that awakens the senses and cultivates gratitude. This is what we believe.',
      huertaBadge: 'From field to plate',
      huertaHeading: 'Our Organic Garden',
      huertaSubtitle: 'We grow without chemicals, in harmony with nature\'s cycles. Varsana\'s land gives us living food, full of flavor and prana.',
      mealsHeading: 'What to expect at the table',
      mealsSubtitle: 'Three meals a day prepared with fresh garden ingredients, served in community.',
      principlesBadge: 'Our kitchen principles',
      principlesHeading: 'How we prepare your food',
      ctaTitle: 'Want to learn the art of conscious cooking?',
      ctaText: 'Join our workshops on artisan baking, vegetarian cooking, and Ayurvedic nutrition. Discover how to transform simple ingredients into sacred food.',
      ctaEvents: 'View events',
      ctaVolunteer: 'Volunteer in the garden',
      philosophy: [
        {
          title: 'From garden to table',
          description: 'We harvest fresh ingredients daily from our organic garden. What reaches your plate was grown with love, without chemicals or haste.',
        },
        {
          title: 'Conscious vegetarian cuisine',
          description: 'We do not serve meat, eggs, alcohol, or tobacco. Our kitchen honors life in all its forms and nourishes the body with the abundance of the plant kingdom.',
        },
        {
          title: 'Sacred nutrition',
          description: 'For us, cooking is an act of devotion. Each ingredient is chosen, prepared, and offered with awareness, transforming nutrition into a spiritual practice.',
        },
      ],
      huertaProducts: [
        'Seasonal vegetables — lettuce, chard, kale, spinach',
        'Aromatic herbs — basil, cilantro, rosemary, thyme',
        'Fresh fruits — blackberry, strawberry, guava, feijoa',
        'Edible flowers — calendula, pansy, nasturtium',
        'Andean tubers — criolla potato, cubio, arracacha',
      ],
      meals: [
        {
          name: 'Breakfast',
          time: '7:00 – 9:00 a.m.',
          description: 'Fresh garden fruits, artisan granola, freshly baked bread, natural jams, and hot drinks to start the day with energy.',
        },
        {
          name: 'Lunch',
          time: '12:00 – 2:00 p.m.',
          description: 'The main meal of the day: vegetable soup, a plant-based protein like lentils or chickpeas, rice, fresh salad, and dessert.',
        },
        {
          name: 'Dinner',
          time: '6:30 – 8:00 p.m.',
          description: 'A lighter option: vegetable cream, roasted veggie wrap, or quinoa bowl with garden vegetables.',
        },
        {
          name: 'Drinks',
          time: 'All day',
          description: 'Herbal infusions harvested from the mountain, panela water, organic regional coffee, and natural juices depending on the day\'s harvest.',
        },
      ],
      principles: [
        {
          title: 'Organic ingredients',
          description: 'Everything we grow and serve is 100% free of pesticides and chemical fertilizers.',
        },
        {
          title: 'No processed foods',
          description: 'We prepare our food from scratch. No preservatives, flavorings, or industrial products.',
        },
        {
          title: 'Conscious seasoning',
          description: 'We cook with intention, in an atmosphere of calm and gratitude. The energy with which food is prepared also nourishes.',
        },
      ],
    },
    voluntariado: {
      title: 'Volunteering Program | Varsana Eco Yoga Aldea',
      heading: 'Volunteering Program Near Bogotá',
      subtitle: 'A special experience for those who wish to live in an eco-village, connect with nature, and discover new skills.',
      ctaInscribe: 'Sign up now',
      ctaActivities: 'View activities',
      activitiesHeading: 'What will you do as a volunteer?',
      activitiesSubtitle: 'Participate in sustainable activities and discover the rhythm of conscious living.',
      includesHeading: 'Your stay includes',
      includesNote: 'We seek committed volunteers, eager to learn and share in an environment of respect and spirituality.',
      faqHeading: 'Frequently Asked Questions',
      faqSubtitle: 'Everything you need to know before coming.',
      activities: [
        { title: 'Organic Agriculture', description: 'Participate in planting, caring for, and harvesting healthy food in our garden.' },
        { title: 'Vegetarian Cooking', description: 'Learn the art of conscious and healthy cooking by preparing food for the community.' },
        { title: 'Maintenance and Bio-construction', description: 'Help improve our facilities using sustainable techniques.' },
        { title: 'Special Projects', description: 'If you have skills in design, communications, or arts, you can contribute to the visibility of the village.' },
      ],
      includes: [
        'Accommodation in the eco-village',
        'Full vegetarian meals (3 meals a day)',
        'Participation in yoga and meditation programs',
        'Deep connection with nature',
        'Discovery of new sustainable skills',
      ],
      faqs: [
        {
          question: 'What should I bring?',
          answer: 'Comfortable clothing for field work, rubber boots, flashlight, biodegradable personal care items, and a strong desire to learn.',
        },
        {
          question: 'Are there dietary requirements?',
          answer: 'At Varsana we follow a conscious vegetarian diet. Consumption of meat, eggs, alcohol, or tobacco is not permitted within the village.',
        },
        {
          question: 'What is the minimum stay?',
          answer: 'We recommend a minimum stay of one week to fully integrate into the activities and rhythm of the community.',
        },
      ],
    },
    contacto: {
      title: 'Contact | Varsana Eco Yoga Aldea',
      badge: 'Contact Us',
      heading: 'We are here for you',
      subtitle: 'Write to us, call us, or visit us. We want to accompany you on your path to an experience of well-being, nature, and spirituality at Varsana.',
      whatsapp: 'WhatsApp',
      whatsappDesc: 'Chat with us',
      whatsappCta: 'Open chat',
      emailLabel: 'Email',
      emailDesc: 'Send us your questions',
      emailCta: 'Send email',
      visit: 'Visit Us',
      visitDesc: 'We welcome you with open arms',
      visitAddress: 'Km 28, Vía Silvania – Granada, Granada, Cundinamarca',
      visitCountry: 'Colombia',
      formBadge: 'Send us a message',
      formHeading: 'Have a question?',
      formSubtitle: 'Fill out the form and we will respond as soon as possible.',
      formName: 'Name',
      formNamePlaceholder: 'Your full name',
      formEmail: 'Email',
      formEmailPlaceholder: 'youremail@example.com',
      formMessage: 'Message',
      formMessagePlaceholder: 'Tell us how we can help you...',
      formSubmit: 'Send message',
      howToBadge: 'How to get here',
      howToHeading: 'Find your way to Varsana',
      howToSubtitle: 'We are an hour and a half from Bogotá. The route is straightforward and the scenery makes the trip worthwhile.',
      byCar: 'By car',
      byCarDesc: 'Take the Bogotá – Silvania – Granada road. At Km 28, you will find the entrance to Varsana. The journey takes about an hour and a half. Free parking is available at the village.',
      byBus: 'By bus',
      byBusDesc: 'From the Terminal del Sur in Bogotá, intercity buses depart for Granada. Ask the driver to drop you off at Km 28 of the Silvania – Granada road, right at the entrance to Varsana.',
      arrivalTime: 'Arrival time',
      arrivalTimeDesc: 'We recommend arriving before 5:00 p.m. so you can settle in with natural light and enjoy the sunset from our mountain.',
    },
    donar: {
      title: 'Donate | Varsana Eco Yoga Aldea',
      heading: 'Support Our Mission',
      subtitle: 'Your donation sustains the eco-village projects: the organic garden, the temple, and the spaces that make a more conscious life connected with nature possible.',
      subtitle2: 'Every contribution, big or small, plants a seed of transformation at Varsana.',
      ctaDonate: 'Make a Donation',
      ctaAbout: 'Get to know us',
      impactHeading: 'What do you make possible?',
      impactSubtitle: 'Three pillars that your generosity helps sustain.',
      storyHeading: 'A village cultivated with collective love',
      storyText1: 'Varsana is not just a place — it is a living project that grows thanks to those who believe in a different way of inhabiting the world. Each donation waters the roots of this community.',
      storyText2: 'From the seeds in the garden to the candles in the temple, your support translates into concrete actions that care for the earth, the body, and the spirit.',
      ctaBannerTitle: 'Your generosity transforms lives',
      ctaBannerText: 'Every contribution nourishes this collective dream. Donate today and be part of the family that makes Varsana possible.',
      ctaBannerDonate: 'Make a Donation',
      ctaBannerMore: 'Learn more',
      impactAreas: [
        { title: 'Organic Garden', description: 'We expand our garden to produce fresh, healthy food that nourishes the community and protects the land.' },
        { title: 'Temple & Spirituality', description: 'We maintain the temple as a sacred space for yoga, meditation, and ceremonies that elevate consciousness.' },
        { title: 'Conscious Community', description: 'We strengthen the bonds between volunteers, visitors, and residents, creating a social fabric based on respect and service.' },
      ],
    },
    red: {
      title: 'Eco-Village Network | Varsana Eco Yoga Aldea',
      badge: 'Eco-village network',
      heading: 'Eco-Village Network',
      subtitle: 'Sister communities that share our vision of a more conscious, sustainable world connected to the earth. Discover spaces where a new way of inhabiting the planet flourishes.',
      ecoAldeaBadge: 'Eco village',
      upcomingNote: 'Coming soon: discover more eco-villages, filter by region, and learn how to visit or collaborate with them.',
    },
    sitemap: {
      title: 'Sitemap | Varsana Eco Yoga Aldea',
      badge: 'Navigation',
      heading: 'Sitemap',
      subtitle: 'All Varsana pages in one place.',
      groups: [
        {
          heading: 'Main',
          links: [
            { label: 'Home', description: 'Welcome page, featured events, and gallery' },
            { label: 'About Us', description: 'Meet our team and our mission' },
            { label: 'Contact', description: 'Write, call, or visit us' },
          ],
        },
        {
          heading: 'Experiences',
          links: [
            { label: 'Events', description: 'Retreats, workshops, and gatherings with scheduled dates' },
            { label: 'Day Passes', description: 'Services and experiences available year-round' },
            { label: 'Volunteering', description: 'Live the eco-village as a volunteer and learn sustainable skills' },
          ],
        },
        {
          heading: 'Wellness',
          links: [
            { label: 'Lodging', description: 'Eco-friendly rooms overlooking the Cundinamarca mountains' },
            { label: 'Food', description: 'Conscious vegetarian cuisine with fresh ingredients from our organic garden' },
            { label: 'Shop', description: 'Artisanal and sustainable products — coming soon' },
          ],
        },
        {
          heading: 'More',
          links: [
            { label: 'Donate', description: 'Support Varsana\'s mission with your contribution' },
            { label: 'Blog', description: 'Stories, wisdom, and community news' },
            { label: 'Design System', description: 'Design guide for developers and collaborators' },
          ],
        },
      ],
    },
    notFound: {
      title: 'Page Not Found | Varsana Eco Yoga Aldea',
      heading: 'Page not found',
      text: 'The path you\'re looking for is not on our map. Maybe the page was moved, renamed, or simply decided to go meditate in the garden.',
      cta: 'Back to home',
      suggestTitle: 'You might be interested in visiting',
    },
    payment: {
      successTitle: 'Payment successful!',
      successMessage: 'You will soon receive a confirmation email with your reservation details. If you don\'t see it in your inbox, check your spam folder.',
      declinedTitle: 'Payment declined',
      declinedMessage: 'The payment could not be completed. This may be due to insufficient funds or a temporary error. Please try again with another payment method.',
      failedTitle: 'Payment failed',
      failedMessage: 'An error occurred while processing the payment. Please try again.',
      pendingTitle: 'Payment in progress',
      pendingMessage: 'Your payment is being processed. We will notify you when it is confirmed. Do not close this page.',
      processing: 'Processing...',
      noInfo: 'No payment information',
      searchingTitle: 'Looking up transaction...',
      searchingMessage: 'We are looking up your payment information. If you made a transaction, please wait a few seconds.',
      confirmingTitle: 'Confirming transaction...',
      confirmingMessage: 'Your payment is being confirmed. This may take a few seconds. Do not close this page.',
      unknownMessage: 'Your transaction is being processed. We will contact you when we have an update.',
      unknownFallback: 'No information was found for a recent transaction. If you made a payment, please contact us.',
      reference: 'Reference',
      retry: 'Try again',
      backHome: 'Back to home',
      loadError: 'Could not load the payment gateway. Try reloading the page.',
      paymentError: 'The payment could not be completed. Please try again.',
      notReady: 'The payment gateway is not ready yet. Try again in a moment.',
      serverError: 'Server error',
      noBold: 'BoldCheckout is not available. Reload the page.',
      unexpectedError: 'Unexpected error',
      genericError: 'An unexpected error occurred.',
      chooseDate: 'Pick a date',
      chooseDatePrompt: 'Choose a date',
      selectTicket: 'Select at least one ticket',
      reserveNow: 'Book now',
      loadingGateway: 'Loading payment gateway...',
      emailPlaceholder: 'Email *',
      namePlaceholder: 'Full name *',
      phonePlaceholder: 'Phone (optional)',
    },
    blog: {
      heading: 'Varsana Blog',
      subtitle: 'Stories, wisdom, and news from our conscious community.',
      noPosts: 'No articles published yet.',
      backHome: 'Back to home',
    },
    footer: {
      tagline: 'Eco Yoga Village — well-being, consciousness, and spiritual connection in Granada, Cundinamarca.',
      community: 'Community',
      varsanaOrg: 'Varsana.org',
      socialProjects: 'Social Projects',
      organicAgriculture: 'Organic Agriculture',
      ecoConstruction: 'Eco-Construction',
      ecoVillageNetwork: 'Eco-village Network',
      about: 'About Us',
      ourStory: 'Our Story',
      philosophy: 'Philosophy',
      gallery: 'Gallery',
      faq: 'FAQ',
      contact: 'Contact',
      location: 'Granada, Cundinamarca',
      colombia: 'Colombia',
      privacy: 'Privacy',
      terms: 'Terms',
      sitemap: 'Sitemap',
      designSystem: 'Design System',
      copyright: '© 2024 Varsana Eco Yoga Aldea',
      language: 'English (US)',
      currency: 'COP',
    },
    announcement: {
      before: 'Download our Varsana guide',
      here: 'here',
      close: 'Dismiss notice',
    },
  },
};
