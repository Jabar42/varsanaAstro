/**
 * Textos de la página /parador-el-elefante.
 *
 * La estructura sigue al pie de la letra el documento que envió el equipo
 * (solicitud VC-261107-01, «Parador web.pdf»): intro + 8 secciones numeradas.
 * El contenido va como bloques ordenados para no reinterpretar el orden ni el
 * énfasis del original; la página solo decide cómo se ven.
 */

export type Block =
  | { type: 'lead'; text: string }
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'note'; title: string; text: string }
  | { type: 'quote'; text: string };

export interface ContactRow {
  label: string;
  value: string;
  href?: string;
}

export interface Section {
  kicker: string;
  title: string;
  blocks: Block[];
  contact?: ContactRow[];
}

export interface ParadorPage {
  metaTitle: string;
  metaDescription: string;
  banner: { title: string; subtitle: string; badge: string; imageAlt: string };
  breadcrumb: { home: string; alimentacion: string; parador: string };
  intro: { title: string; blocks: Block[] };
  sections: Section[];
}

export const es: ParadorPage = {
  metaTitle: 'Centro Cultural y Parador El Elefante Feliz | Varsana Eco Yoga Aldea',
  metaDescription:
    'Alimentación consciente y natural en la Vía Sumapaz, Granada, Cundinamarca. Centro Cultural y Parador El Elefante Feliz, una extensión de Varsana.',
  banner: {
    title: 'Centro Cultural y Parador El Elefante Feliz',
    subtitle:
      'Alimentación consciente y natural, un espacio saludable en la Vía Sumapaz, en conexión con la madre Tierra. • Más que comida, una experiencia saludable •',
    badge: 'Parador de montaña',
    imageAlt: 'Centro Cultural y Parador El Elefante Feliz en la Vía Sumapaz',
  },
  breadcrumb: {
    home: 'Inicio',
    alimentacion: 'Alimentación',
    parador: 'El Elefante Feliz',
  },

  intro: {
    title: 'Un espacio para alimentar, aprender y reconectar.',
    blocks: [
      {
        type: 'p',
        text: 'En el corazón de la vía Sumapaz, en Granada, Cundinamarca, existe un lugar donde la alimentación consciente, la cultura y la naturaleza se encuentran.',
      },
      {
        type: 'p',
        text: 'El Elefante Feliz es una extensión de Varsana, con una historia que se remonta a 1983. Inspirado en una filosofía de respeto por la vida, servicio, conciencia y armonía con nuestro entorno, queremos compartir una forma diferente de relacionarnos con la alimentación y la naturaleza.',
      },
      {
        type: 'p',
        text: 'Somos un espacio de encuentro que invita a disfrutar de la gastronomía lacto-vegetariana, descubrir productos artesanales, aprender saberes tradicionales y vivir experiencias que nos acercan a una vida más saludable y consciente.',
      },
      { type: 'quote', text: 'Ven a compartir, aprender y disfrutar. Aquí siempre hay algo nuevo por descubrir.' },
    ],
  },

  sections: [
    {
      kicker: 'Conócenos',
      title: 'Nuestra historia',
      blocks: [
        { type: 'lead', text: 'Una historia de servicio que comenzó en 1983.' },
        {
          type: 'p',
          text: 'La historia del Centro Cultural y Parador El Elefante Feliz está profundamente ligada a Varsana, cuya historia comenzó en 1978.',
        },
        {
          type: 'p',
          text: 'En aquellos primeros años, surgió el deseo de compartir algo muy especial con los amigos, invitados, visitantes y viajeros que transitaban por la carretera: una alimentación consciente (Prasadam), los alimentos preparados y ofrecidos con devoción a Krishna.',
        },
        {
          type: 'p',
          text: 'Sin embargo, no existía un espacio destinado a recibir a todas estas personas y compartir con ellas esta tradición.',
        },
        {
          type: 'p',
          text: "Fue así como en 1983 nació Govinda's, el primer nombre de nuestro Parador, un lugar creado con el propósito de ofrecer alimentos vegetarianos y compartir la cultura de la alimentación consciente.",
        },
        {
          type: 'p',
          text: 'Con el paso del tiempo, este espacio fue construyendo su propia identidad y hoy es conocido como el Centro Cultural y Parador El Elefante Feliz.',
        },
        {
          type: 'p',
          text: 'A lo largo de esta historia hemos conservado una misma inspiración: servir, compartir y ofrecer una experiencia donde la alimentación sea también una oportunidad para cultivar conciencia, gratitud y respeto por la vida.',
        },
        {
          type: 'p',
          text: 'Hoy queremos seguir fortaleciendo ese propósito, integrando nuestra tradición gastronómica con nuevos proyectos de sostenibilidad, educación ambiental, cultura y bienestar.',
        },
        { type: 'quote', text: 'Desde 1983 compartiendo el sabor del servicio, la tradición y la alimentación consciente.' },
        { type: 'quote', text: 'Una historia que continúa, con nuevas experiencias y el mismo espíritu de compartir.' },
      ],
    },
    {
      kicker: 'Nuestra cocina',
      title: 'Alimentación consciente, sabores que nutren.',
      blocks: [
        {
          type: 'p',
          text: 'Nuestra cocina está inspirada en la tradición lacto-vegetariana y en una filosofía de alimentación que busca armonizar el cuerpo, la mente y el espíritu.',
        },
        {
          type: 'p',
          text: 'Preparamos alimentos artesanales con dedicación, rescatando recetas tradicionales e incorporando ingredientes naturales y preparaciones propias.',
        },
        { type: 'h3', text: 'Nuestra panadería artesanal: el sabor de lo natural' },
        { type: 'p', text: 'Uno de nuestros grandes protagonistas es el pan artesanal de masa madre.' },
        {
          type: 'p',
          text: 'Elaboramos panes mediante procesos de fermentación natural, dedicando tiempo y cuidado a cada preparación.',
        },
        { type: 'p', text: 'Nuestra propuesta incluye:' },
        {
          type: 'ul',
          items: [
            'Pan de molde de siete semillas.',
            'Mogollas artesanales de avena.',
            'Preparaciones especiales de panadería según temporada.',
          ],
        },
        {
          type: 'p',
          text: 'La masa madre nos permite recuperar una tradición panadera que valora los procesos naturales, el tiempo y la calidad de los ingredientes.',
        },
        { type: 'h3', text: '¿Qué más puedes encontrar en nuestra cocina?' },
        {
          type: 'ul',
          items: [
            'Gastronomía lacto-vegetariana.',
            'Preparaciones tradicionales y recetas de inspiración védica.',
            'Repostería artesanal y galletería saludable.',
            'Productos elaborados con ingredientes naturales.',
            'Bebidas naturales, aromáticas y frutales.',
            'Preparaciones especiales de temporada.',
          ],
        },
        {
          type: 'p',
          text: 'En nuestra tradición espiritual, cocinar también es una forma de servicio y gratitud.',
        },
        {
          type: 'p',
          text: 'Te invitamos a descubrir una cocina donde cada preparación tiene dedicación, tradición y propósito.',
        },
        {
          type: 'note',
          title: 'Nuestra carta',
          text: 'Consulta próximamente nuestra oferta gastronómica, con fotografías de nuestros platos, productos de panadería, repostería y bebidas.',
        },
      ],
    },
    {
      kicker: 'Nuestra ecotienda',
      title: 'Consumo consciente para una vida más sostenible.',
      blocks: [
        {
          type: 'p',
          text: 'Estamos desarrollando un espacio dedicado a promover productos y alternativas que contribuyan a una vida más saludable y respetuosa con el planeta.',
        },
        {
          type: 'p',
          text: 'Nuestra futura eco tienda busca reunir productos naturales, alimentos artesanales, opciones reutilizables y alternativas para reducir los residuos en nuestra vida cotidiana.',
        },
        {
          type: 'p',
          text: 'Queremos apoyar el consumo responsable, valorar la producción artesanal y facilitar el acceso a productos que estén en armonía con nuestros principios.',
        },
        { type: 'quote', text: 'Un proyecto en construcción, una invitación a consumir con mayor conciencia.' },
      ],
    },
    {
      kicker: 'Huerta y naturaleza',
      title: 'Cultivar la tierra es cultivar conciencia.',
      blocks: [
        {
          type: 'p',
          text: 'Creemos que reconectar con la naturaleza comienza por comprender de dónde vienen nuestros alimentos y valorar los procesos que hacen posible la vida.',
        },
        {
          type: 'p',
          text: 'Nuestra huerta es un proyecto en desarrollo que busca convertirse en un espacio de aprendizaje, contemplación y conexión con la tierra.',
        },
        {
          type: 'p',
          text: 'Sembramos plantas aromáticas, medicinales, hortalizas y alimentos que nos permiten reconocer los ciclos naturales y recuperar conocimientos tradicionales.',
        },
        {
          type: 'p',
          text: 'Promovemos prácticas de cultivo responsables, el cuidado del suelo, el aprovechamiento de los recursos naturales y el respeto por la biodiversidad.',
        },
        {
          type: 'p',
          text: 'En este espacio también queremos compartir conocimientos sobre cultivo, semillas, plantas y formas más conscientes de relacionarnos con nuestro entorno.',
        },
        {
          type: 'quote',
          text: 'Estamos sembrando las bases de un espacio donde la naturaleza será nuestra maestra.',
        },
      ],
    },
    {
      kicker: 'Talleres y experiencias',
      title: 'Aprender haciendo, compartir transformando.',
      blocks: [
        {
          type: 'p',
          text: 'Para 2027 queremos abrir nuevos espacios de aprendizaje en El Elefante Feliz, donde podamos recuperar saberes, desarrollar habilidades y compartir experiencias alrededor de una vida más saludable y consciente.',
        },
        { type: 'h3', text: 'Nuestra propuesta de talleres' },
        { type: 'p', text: 'Cocina consciente' },
        {
          type: 'p',
          text: 'Descubre nuevas preparaciones, ingredientes y formas de relacionarte con los alimentos.',
        },
        { type: 'p', text: 'Panadería artesanal' },
        {
          type: 'p',
          text: 'Aprende sobre masas, fermentación natural, masa madre y elaboración de panes artesanales.',
        },
        { type: 'p', text: 'Herbolaria para la vida cotidiana' },
        {
          type: 'p',
          text: 'Conoce las propiedades tradicionales de las plantas aromáticas y medicinales y sus posibilidades de uso responsable.',
        },
        { type: 'p', text: 'Huerta y cultivo' },
        {
          type: 'p',
          text: 'Aprende a cultivar, cuidar las plantas, reconocer las semillas y conectar con los ciclos de la naturaleza.',
        },
        { type: 'p', text: 'Consumo responsable y sostenibilidad' },
        {
          type: 'p',
          text: 'Descubre alternativas para reducir residuos, reutilizar materiales y adoptar hábitos que contribuyan al cuidado del planeta.',
        },
        {
          type: 'p',
          text: 'Durante 2027 iremos anunciando nuestra programación de talleres y experiencias.',
        },
        {
          type: 'p',
          text: 'Queremos que El Elefante Feliz sea un lugar donde el conocimiento se comparta y se transforme en acciones para la vida cotidiana.',
        },
      ],
    },
    {
      kicker: 'Cultura y bienestar',
      title: 'Un espacio para encontrarnos y compartir.',
      blocks: [
        {
          type: 'p',
          text: 'El Elefante Feliz quiere ser un lugar donde la cultura, la educación y el bienestar tengan un espacio especial.',
        },
        {
          type: 'p',
          text: 'En conexión con Varsana, promovemos actividades que invitan a cultivar valores como el respeto, la gratitud, la solidaridad, el servicio y la convivencia armónica.',
        },
        {
          type: 'p',
          text: 'Queremos recibir encuentros familiares, actividades culturales, experiencias gastronómicas, talleres y jornadas especiales que permitan construir comunidad.',
        },
        {
          type: 'quote',
          text: 'Más que ofrecer actividades, buscamos generar experiencias significativas que dejen aprendizajes y buenos recuerdos.',
        },
      ],
    },
    {
      kicker: 'Nuestro compromiso con el planeta',
      title: 'Vivir con conciencia también significa cuidar lo que nos rodea.',
      blocks: [
        { type: 'p', text: 'El respeto por la naturaleza es parte fundamental de nuestra filosofía.' },
        {
          type: 'p',
          text: 'Trabajamos para desarrollar un modelo de funcionamiento cada vez más responsable, que integre prácticas sostenibles en nuestra cocina, nuestras instalaciones y las experiencias que ofrecemos.',
        },
        { type: 'h3', text: 'Nuestros compromisos incluyen:' },
        {
          type: 'ul',
          items: [
            'Reducir progresivamente el uso de plásticos de un solo uso.',
            'Promover alternativas reutilizables y retornables.',
            'Separar y aprovechar adecuadamente los residuos.',
            'Fomentar el consumo local y responsable.',
            'Promover el cultivo y cuidado de plantas.',
            'Aprovechar conscientemente el agua y la energía.',
            'Compartir educación ambiental con nuestros visitantes.',
          ],
        },
        {
          type: 'quote',
          text: 'Creemos que cuidar el planeta no es una actividad aislada, sino una forma de vivir.',
        },
      ],
    },
    {
      kicker: 'Visítanos',
      title: 'Haz una pausa en el camino y vive una experiencia diferente.',
      blocks: [
        {
          type: 'p',
          text: 'Estamos ubicados sobre la vía Sumapaz, en un entorno natural que invita a detenerse, descansar y disfrutar.',
        },
        {
          type: 'p',
          text: 'Ven a compartir nuestra cocina, conocer nuestros proyectos y descubrir todo lo que El Elefante Feliz tiene para ofrecer.',
        },
        {
          type: 'p',
          text: 'Te esperamos para compartir una experiencia de alimentación consciente, naturaleza y cultura.',
        },
        { type: 'quote', text: 'El Elefante Feliz — un espacio inspirado en Varsana.' },
        { type: 'quote', text: 'Alimentar el cuerpo, cultivar el alma y reconectar con la naturaleza.' },
      ],
      contact: [
        { label: 'Ubicación', value: 'Vereda El Ramal, Km 28, Vía Sumapaz. Granada, Cundinamarca, Colombia.' },
        { label: 'WhatsApp', value: '322 329 7191', href: 'https://wa.me/573223297191' },
        { label: 'Correo', value: 'paradorelefante@varsana.com', href: 'mailto:paradorelefante@varsana.com' },
        { label: 'Facebook', value: 'Centro Cultural y Parador El Elefante Feliz' },
        { label: 'Instagram', value: 'paradorelelefantefeliz', href: 'https://instagram.com/paradorelelefantefeliz' },
        { label: 'Google Maps', value: 'Centro Cultural y Parador El Elefante Feliz' },
      ],
    },
  ],
};

export const en: ParadorPage = {
  metaTitle: 'El Elefante Feliz Cultural Centre & Rest Stop | Varsana Eco Yoga Village',
  metaDescription:
    'Conscious, natural food on the Sumapaz road, Granada, Cundinamarca. El Elefante Feliz Cultural Centre & Rest Stop, an extension of Varsana.',
  banner: {
    title: 'El Elefante Feliz Cultural Centre & Rest Stop',
    subtitle:
      'Conscious, natural food: a healthy space on the Sumapaz road, in connection with Mother Earth. • More than food, a healthy experience •',
    badge: 'Mountain rest stop',
    imageAlt: 'El Elefante Feliz cultural centre on the Sumapaz road',
  },
  breadcrumb: {
    home: 'Home',
    alimentacion: 'Food',
    parador: 'El Elefante Feliz',
  },

  intro: {
    title: 'A place to nourish, learn and reconnect.',
    blocks: [
      {
        type: 'p',
        text: 'In the heart of the Sumapaz road, in Granada, Cundinamarca, there is a place where conscious food, culture and nature meet.',
      },
      {
        type: 'p',
        text: 'El Elefante Feliz is an extension of Varsana, with a history that goes back to 1983. Inspired by a philosophy of respect for life, service, awareness and harmony with our surroundings, we want to share a different way of relating to food and nature.',
      },
      {
        type: 'p',
        text: 'We are a meeting place that invites you to enjoy lacto-vegetarian cuisine, discover handmade products, learn traditional knowledge and live experiences that bring us closer to a healthier, more conscious life.',
      },
      { type: 'quote', text: 'Come to share, learn and enjoy. There is always something new to discover here.' },
    ],
  },

  sections: [
    {
      kicker: 'Get to know us',
      title: 'Our story',
      blocks: [
        { type: 'lead', text: 'A story of service that began in 1983.' },
        {
          type: 'p',
          text: 'The story of the El Elefante Feliz Cultural Centre & Rest Stop is deeply tied to Varsana, whose own story began in 1978.',
        },
        {
          type: 'p',
          text: 'In those early years a wish arose: to share something very special with the friends, guests, visitors and travellers passing along the road — conscious food (Prasadam), meals prepared and offered with devotion to Krishna.',
        },
        {
          type: 'p',
          text: 'There was, however, no space set aside to welcome all these people and share this tradition with them.',
        },
        {
          type: 'p',
          text: "That is how Govinda's came to be in 1983, the first name of our Rest Stop: a place created to offer vegetarian food and share the culture of conscious eating.",
        },
        {
          type: 'p',
          text: 'Over time this space built its own identity and today it is known as the El Elefante Feliz Cultural Centre & Rest Stop.',
        },
        {
          type: 'p',
          text: 'Throughout this history we have kept the same inspiration: to serve, to share and to offer an experience where food is also an opportunity to cultivate awareness, gratitude and respect for life.',
        },
        {
          type: 'p',
          text: 'Today we want to keep strengthening that purpose, weaving our culinary tradition together with new projects in sustainability, environmental education, culture and well-being.',
        },
        { type: 'quote', text: 'Since 1983, sharing the flavour of service, tradition and conscious food.' },
        { type: 'quote', text: 'A story that continues, with new experiences and the same spirit of sharing.' },
      ],
    },
    {
      kicker: 'Our kitchen',
      title: 'Conscious food, flavours that nourish.',
      blocks: [
        {
          type: 'p',
          text: 'Our kitchen is inspired by the lacto-vegetarian tradition and by a philosophy of eating that seeks to bring body, mind and spirit into harmony.',
        },
        {
          type: 'p',
          text: 'We prepare handmade food with care, reviving traditional recipes and bringing in natural ingredients and preparations of our own.',
        },
        { type: 'h3', text: 'Our artisan bakery: the flavour of what is natural' },
        { type: 'p', text: 'One of our great protagonists is sourdough bread.' },
        {
          type: 'p',
          text: 'We bake our breads through natural fermentation, giving time and care to every preparation.',
        },
        { type: 'p', text: 'Our selection includes:' },
        {
          type: 'ul',
          items: [
            'Seven-seed sandwich loaf.',
            'Handmade oat rolls.',
            'Seasonal bakery specialities.',
          ],
        },
        {
          type: 'p',
          text: 'Sourdough lets us recover a baking tradition that values natural processes, time and the quality of ingredients.',
        },
        { type: 'h3', text: 'What else can you find in our kitchen?' },
        {
          type: 'ul',
          items: [
            'Lacto-vegetarian cuisine.',
            'Traditional preparations and recipes of Vedic inspiration.',
            'Handmade pastries and wholesome biscuits.',
            'Products made with natural ingredients.',
            'Natural, herbal and fruit drinks.',
            'Seasonal specialities.',
          ],
        },
        {
          type: 'p',
          text: 'In our spiritual tradition, cooking is also a form of service and gratitude.',
        },
        {
          type: 'p',
          text: 'We invite you to discover a kitchen where every preparation has care, tradition and purpose.',
        },
        {
          type: 'note',
          title: 'Our menu',
          text: 'Our food offering — with photographs of our dishes, bakery, pastries and drinks — is coming soon.',
        },
      ],
    },
    {
      kicker: 'Our eco-shop',
      title: 'Conscious consumption for a more sustainable life.',
      blocks: [
        {
          type: 'p',
          text: 'We are developing a space dedicated to promoting products and alternatives that contribute to a healthier life in greater harmony with the planet.',
        },
        {
          type: 'p',
          text: 'Our future eco-shop aims to bring together natural products, handmade foods, reusable options and alternatives for reducing waste in everyday life.',
        },
        {
          type: 'p',
          text: 'We want to support responsible consumption, value handmade production and make it easier to find products that are in harmony with our principles.',
        },
        { type: 'quote', text: 'A project under construction, an invitation to consume more consciously.' },
      ],
    },
    {
      kicker: 'Garden and nature',
      title: 'Cultivating the land is cultivating awareness.',
      blocks: [
        {
          type: 'p',
          text: 'We believe that reconnecting with nature starts by understanding where our food comes from and valuing the processes that make life possible.',
        },
        {
          type: 'p',
          text: 'Our garden is a project in development that aims to become a space for learning, contemplation and connection with the land.',
        },
        {
          type: 'p',
          text: 'We plant aromatic and medicinal plants, vegetables and foods that help us recognise natural cycles and recover traditional knowledge.',
        },
        {
          type: 'p',
          text: 'We promote responsible growing practices, care for the soil, the use of natural resources and respect for biodiversity.',
        },
        {
          type: 'p',
          text: 'In this space we also want to share knowledge about growing, seeds, plants and more conscious ways of relating to our surroundings.',
        },
        {
          type: 'quote',
          text: 'We are laying the foundations of a space where nature will be our teacher.',
        },
      ],
    },
    {
      kicker: 'Workshops and experiences',
      title: 'Learning by doing, sharing by transforming.',
      blocks: [
        {
          type: 'p',
          text: 'For 2027 we want to open new learning spaces at El Elefante Feliz, where we can recover knowledge, develop skills and share experiences around a healthier, more conscious life.',
        },
        { type: 'h3', text: 'Our workshop programme' },
        { type: 'p', text: 'Conscious cooking' },
        {
          type: 'p',
          text: 'Discover new preparations, ingredients and ways of relating to food.',
        },
        { type: 'p', text: 'Artisan baking' },
        {
          type: 'p',
          text: 'Learn about doughs, natural fermentation, sourdough and baking handmade breads.',
        },
        { type: 'p', text: 'Herbalism for everyday life' },
        {
          type: 'p',
          text: 'Get to know the traditional properties of aromatic and medicinal plants and how to use them responsibly.',
        },
        { type: 'p', text: 'Garden and growing' },
        {
          type: 'p',
          text: 'Learn to grow and care for plants, recognise seeds and connect with the cycles of nature.',
        },
        { type: 'p', text: 'Responsible consumption and sustainability' },
        {
          type: 'p',
          text: 'Discover alternatives for reducing waste, reusing materials and adopting habits that help care for the planet.',
        },
        {
          type: 'p',
          text: 'During 2027 we will be announcing our programme of workshops and experiences.',
        },
        {
          type: 'p',
          text: 'We want El Elefante Feliz to be a place where knowledge is shared and turned into action for everyday life.',
        },
      ],
    },
    {
      kicker: 'Culture and well-being',
      title: 'A space to meet and share.',
      blocks: [
        {
          type: 'p',
          text: 'El Elefante Feliz wants to be a place where culture, education and well-being have a space of their own.',
        },
        {
          type: 'p',
          text: 'In connection with Varsana, we promote activities that invite us to cultivate values such as respect, gratitude, solidarity, service and harmonious coexistence.',
        },
        {
          type: 'p',
          text: 'We want to host family gatherings, cultural activities, food experiences, workshops and special days that help build community.',
        },
        {
          type: 'quote',
          text: 'More than offering activities, we seek to create meaningful experiences that leave learning and good memories behind.',
        },
      ],
    },
    {
      kicker: 'Our commitment to the planet',
      title: 'Living consciously also means caring for what surrounds us.',
      blocks: [
        { type: 'p', text: 'Respect for nature is a fundamental part of our philosophy.' },
        {
          type: 'p',
          text: 'We work to develop an increasingly responsible way of operating, integrating sustainable practices into our kitchen, our facilities and the experiences we offer.',
        },
        { type: 'h3', text: 'Our commitments include:' },
        {
          type: 'ul',
          items: [
            'Progressively reducing single-use plastics.',
            'Promoting reusable and returnable alternatives.',
            'Separating and making good use of waste.',
            'Encouraging local and responsible consumption.',
            'Promoting the growing and care of plants.',
            'Using water and energy consciously.',
            'Sharing environmental education with our visitors.',
          ],
        },
        {
          type: 'quote',
          text: 'We believe caring for the planet is not an isolated activity, but a way of living.',
        },
      ],
    },
    {
      kicker: 'Visit us',
      title: 'Pause along the road and live a different experience.',
      blocks: [
        {
          type: 'p',
          text: 'We are located on the Sumapaz road, in a natural setting that invites you to stop, rest and enjoy.',
        },
        {
          type: 'p',
          text: 'Come and share our kitchen, get to know our projects and discover everything El Elefante Feliz has to offer.',
        },
        {
          type: 'p',
          text: 'We look forward to sharing an experience of conscious food, nature and culture with you.',
        },
        { type: 'quote', text: 'El Elefante Feliz — a space inspired by Varsana.' },
        { type: 'quote', text: 'Nourish the body, cultivate the soul and reconnect with nature.' },
      ],
      contact: [
        { label: 'Location', value: 'Vereda El Ramal, Km 28, Sumapaz road. Granada, Cundinamarca, Colombia.' },
        { label: 'WhatsApp', value: '322 329 7191', href: 'https://wa.me/573223297191' },
        { label: 'Email', value: 'paradorelefante@varsana.com', href: 'mailto:paradorelefante@varsana.com' },
        { label: 'Facebook', value: 'Centro Cultural y Parador El Elefante Feliz' },
        { label: 'Instagram', value: 'paradorelelefantefeliz', href: 'https://instagram.com/paradorelelefantefeliz' },
        { label: 'Google Maps', value: 'Centro Cultural y Parador El Elefante Feliz' },
      ],
    },
  ],
};
