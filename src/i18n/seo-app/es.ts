import type { SeoApplicationContent } from "@/components/sections/seo-app/SeoApplicationDocument";

const shared = {
  navigation: [
    { label: "La aplicación", href: "/es/jimboats-seo" },
    { label: "Privacidad", href: "/es/jimboats-seo/privacidad" },
  ],
  contactLabel: "Contacto:",
  contactEmail: "jimboatscharter@gmail.com",
  siteLabel: "Visitar JimBoats Charter",
  siteHref: "/es",
};

export const seoApplicationHome: SeoApplicationContent = {
  ...shared,
  title: "JimBoats SEO",
  description:
    "Herramienta de uso propio de JimBoats Charter para analizar Search Console e investigar palabras clave con Google Ads.",
  introduction:
    "JimBoats SEO es la herramienta de análisis de JimBoats Charter para mejorar la visibilidad de nuestra web y ayudar a las personas a encontrar nuestras experiencias en barco en Barcelona.",
  sections: [
    {
      title: "Qué hace la aplicación",
      paragraphs: [
        "Consulta Google Search Console para analizar las búsquedas por las que aparece jimboatscharter.com, sus clics, impresiones, posición media y páginas visibles en Google. También permite revisar información de indexación de las páginas de nuestra propiedad.",
        "La integración prevista con Google Ads permitirá consultar ideas de palabras clave, volúmenes de búsqueda, tendencias y estimaciones publicitarias del Planificador de Palabras Clave. Esta función requiere la aprobación del acceso correspondiente por Google y todavía no está habilitada.",
      ],
    },
    {
      title: "Para quién es y cómo se accede",
      paragraphs: [
        "La aplicación es de uso propio del equipo de JimBoats Charter. El análisis se realiza desde nuestro entorno de trabajo en Codex, mediante conexiones autorizadas a las cuentas de Google de JimBoats. Esta página presenta la aplicación; no ofrece registro ni acceso público a los informes.",
        "La autorización de las conexiones se realiza en Google mediante OAuth. JimBoats SEO no solicita ni almacena tu contraseña de Google. La conexión actual a Search Console tiene permisos de solo lectura.",
      ],
    },
    {
      title: "Cómo utilizamos la información",
      paragraphs: [
        "Usamos los resultados para preparar informes, investigar palabras clave y decidir mejoras de contenido y estructura de nuestra web. Los datos necesarios para ese análisis se procesan en Codex, de OpenAI, por encargo del equipo de JimBoats.",
        "Puedes consultar los datos utilizados, su conservación y cómo retirar el acceso o solicitar su eliminación en la política de privacidad de la aplicación.",
      ],
      links: [
        {
          label: "Leer la política de privacidad de JimBoats SEO",
          href: "/es/jimboats-seo/privacidad",
        },
      ],
    },
  ],
};

export const seoApplicationPrivacy: SeoApplicationContent = {
  ...shared,
  title: "Política de privacidad de JimBoats SEO",
  description:
    "Cómo JimBoats SEO accede, utiliza, conserva y comparte los datos de las conexiones autorizadas a Google.",
  introduction:
    "Esta política se aplica a JimBoats SEO, la herramienta de análisis de uso propio de JimBoats Charter. Su alcance son las conexiones a Google y los informes de análisis; no sustituye la información de privacidad de las reservas de experiencias.",
  updated: "Última actualización: 30 de octubre de 2026.",
  sections: [
    {
      title: "1. Quién gestiona la aplicación",
      paragraphs: [
        "JimBoats Charter gestiona JimBoats SEO para analizar su propia web y sus cuentas autorizadas. Para consultas sobre la aplicación o sus datos, escribe a jimboatscharter@gmail.com.",
      ],
    },
    {
      title: "2. Datos de Google a los que accedemos",
      paragraphs: [
        "Google Search Console: propiedades autorizadas, consultas de búsqueda, URLs, clics, impresiones, CTR, posición media y dimensiones de los informes, como fecha, país o dispositivo. Según el análisis solicitado, también consultamos información de indexación e inspección de URLs. La conexión actual es de solo lectura.",
        "Google Ads: cuando se habilite esta conexión, se utilizarán los identificadores de las cuentas autorizadas y los resultados del Planificador de Palabras Clave, como ideas, volumen estimado, evolución mensual, competencia publicitaria y estimaciones de coste. La conexión todavía está pendiente de habilitación.",
        "Las conexiones utilizan credenciales y tokens de OAuth para mantener el acceso autorizado. No recibimos la contraseña de Google. Esta herramienta no necesita consultar Gmail, contactos ni documentos de Drive.",
      ],
    },
    {
      title: "3. Para qué utilizamos los datos",
      paragraphs: [
        "Los datos se utilizan para medir la visibilidad de jimboatscharter.com, detectar problemas de indexación, investigar palabras clave y preparar informes y propuestas de mejora de contenidos. El equipo de JimBoats decide qué consultas ejecutar y cómo aplicar sus resultados.",
      ],
    },
    {
      title: "4. Acceso y tratamiento en Codex",
      paragraphs: [
        "El equipo de JimBoats utiliza Codex, de OpenAI, para consultar y analizar la información. Los resultados necesarios para el trabajo pueden incorporarse a las conversaciones y archivos de análisis de ese entorno. OpenAI procesa esa información para prestar el servicio, conforme a las condiciones y controles de datos aplicables a la cuenta utilizada.",
        "No vendemos los datos de Google ni los cedemos a anunciantes. Su uso previsto se limita al equipo de JimBoats y al servicio de Codex necesario para este análisis. Las credenciales de conexión se mantienen separadas de los informes y no deben incluirse en los textos de las conversaciones ni en páginas públicas.",
      ],
      links: [
        {
          label: "Política de privacidad de OpenAI",
          href: "https://openai.com/policies/privacy-policy/",
        },
      ],
    },
    {
      title: "5. Almacenamiento y conservación",
      paragraphs: [
        "Las credenciales de la conexión actual se guardan en el equipo de trabajo, en archivos privados con acceso restringido al usuario. Los informes y exportaciones pueden guardarse en el espacio de trabajo de JimBoats. Las conversaciones y archivos incorporados a Codex se conservan según las opciones y condiciones de la cuenta utilizada.",
        "Conservamos las credenciales mientras la conexión sea necesaria y los informes mientras resulten necesarios para el análisis y seguimiento de la web. Cuando dejan de ser necesarios o se solicita su eliminación, el equipo debe retirar las credenciales y las copias correspondientes de los sistemas que controla. Esta eliminación se gestiona manualmente.",
      ],
    },
    {
      title: "6. Retirar el acceso y solicitar eliminación",
      paragraphs: [
        "Puedes retirar la autorización de JimBoats SEO desde las conexiones con terceros de tu cuenta de Google. Esto impide futuras consultas autorizadas con esa conexión, pero no elimina automáticamente los informes o conversaciones ya creados.",
        "Para solicitar acceso, corrección o eliminación de datos o informes bajo el control de JimBoats, contacta con jimboatscharter@gmail.com. Las conversaciones y archivos guardados en Codex deben gestionarse también desde la cuenta correspondiente, con los controles y plazos del proveedor.",
      ],
      links: [
        {
          label: "Gestionar las conexiones de tu cuenta de Google",
          href: "https://myaccount.google.com/connections",
        },
      ],
    },
    {
      title: "7. Visitas a estas páginas",
      paragraphs: [
        "Las páginas de presentación y privacidad de JimBoats SEO no incorporan formularios, cookies de analítica ni píxeles publicitarios. El servicio de alojamiento puede registrar datos técnicos de las peticiones, como dirección IP, fecha y URL solicitada, para servir y mantener la web.",
      ],
    },
    {
      title: "8. Cambios y contacto",
      paragraphs: [
        "Actualizaremos esta política si cambian las conexiones, las finalidades o el tratamiento de los datos. La fecha al inicio identifica la versión publicada. Puedes plantear cualquier consulta a jimboatscharter@gmail.com.",
      ],
    },
  ],
};
