import type { FaqId, FeatureId, LinkId, PageId, PlatformId, ResourceId } from "@/lib/site";

export type Locale = "pt-BR" | "en";

export const locales: Array<{ id: Locale; label: string; short: string }> = [
  { id: "pt-BR", label: "Português - Brasil", short: "PT-BR" },
  { id: "en", label: "English", short: "EN" },
];

type PageSection = {
  title: string;
  paragraphs: string[];
};

type PageCopy = {
  kicker: string;
  title: string;
  lead: string;
  updated?: string;
  points: string[];
  sections?: PageSection[];
  action?: { href: string; label: string };
};

export type Dictionary = {
  links: Record<LinkId, string>;
  a11y: {
    skip: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    email: string;
    telegram: string;
    mainNav: string;
  };
  navCta: string;
  hero: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  features: {
    items: Array<{ id: FeatureId; title: string; text: string }>;
  };
  resources: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{ id: ResourceId; title: string; text: string }>;
  };
  faq: {
    badge: string;
    title: string;
    items: Array<{ id: FaqId; question: string; answer: string }>;
  };
  notice: {
    title: string;
    subtitle: string;
    confirm: string;
    close: string;
    summary: string;
    blocks: Array<{
      id: "is" | "isNot" | "how";
      title: string;
      items: string[];
    }>;
  };
  platforms: {
    badge: string;
    subtitle: string;
    review: string;
    use: string;
    install: string;
    items: Array<{
      id: PlatformId;
      name: string;
      status: "review" | "use" | "install";
    }>;
  };
  footer: {
    linksTitle: string;
    contactTitle: string;
    legal: string;
  };
  cookieNotice: {
    text: string;
    policy: string;
    action: string;
  };
  supportLabel: string;
  pages: Record<PageId, PageCopy>;
  uploadForm: {
    title: string;
    subtitle: string;
    disclaimer: string;
    tabs: { code: string; url: string; file: string; xtream: string };
    mac: string;
    macPlaceholder: string;
    device: string;
    devicePlaceholder: string;
    shortCode: string;
    playlistName: string;
    playlistNamePlaceholder: string;
    m3uUrl: string;
    epgUrl: string;
    drop: string;
    dropHint: string;
    serverUrl: string;
    username: string;
    password: string;
    protect: string;
    setPin: string;
    confirmPin: string;
    captcha: string;
    refreshCaptcha: string;
    captchaPlaceholder: string;
    submit: string;
    saving: string;
    successTitle: string;
    successText: string;
    close: string;
    errors: Record<
      | "mac"
      | "device"
      | "name"
      | "url"
      | "epg"
      | "file"
      | "server"
      | "username"
      | "password"
      | "pin"
      | "code"
      | "captcha"
      | "save"
      | "config",
      string
    >;
  };
  activationCheckout: {
    notice: string;
    mac: string;
    pay: string;
    paying: string;
    payTitle: string;
    expires: string;
    released: string;
    waiting: string;
    paid: string;
    refunded: string;
    pixCode: string;
    copy: string;
    copied: string;
    history: string;
    historyTitle: string;
    emptyHistory: string;
    supportTitle: string;
    supportLead: string;
    attention: string;
    statuses: Record<"pending" | "paid" | "refunded" | "cancelled", string>;
    voucherOption: string;
    voucherBack: string;
    voucherNote: string;
    voucher: string;
    voucherAction: string;
    voucherWorking: string;
    voucherDone: string;
    errors: Record<"mac" | "unknown" | "voucher" | "captcha" | "save" | "unavailable" | "config", string>;
  };
  resellerPanel: {
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    passwordMismatch: string;
    signupTitle: string;
    signupSubtitle: string;
    signupNote: string;
    signup: string;
    signingUp: string;
    haveAccount: string;
    needAccount: string;
    enter: string;
    entering: string;
    welcome: string;
    credits: string;
    buy: string;
    dashboard: string;
    devices: string;
    subs: string;
    home: string;
    logout: string;
    total: string;
    today: string;
    month: string;
    resellerCount: string;
    spent: string;
    searchDevices: string;
    searchSubs: string;
    search: string;
    refresh: string;
    activate: string;
    add: string;
    emptyDevices: string;
    emptySubs: string;
    renew: string;
    mac: string;
    comment: string;
    commentPlaceholder: string;
    activateNote: string;
    confirmActivate: string;
    activating: string;
    activated: string;
    buyTitle: string;
    buyLead: string;
    buyAction: string;
    buyLater: string;
    buyPaid: string;
    pixCode: string;
    copy: string;
    copied: string;
    waiting: string;
    packCredits: string;
    priceLabel: string;
    close: string;
    menu: string;
    subTitle: string;
    subLead: string;
    phone: string;
    transfer: string;
    create: string;
    creating: string;
    created: string;
    columns: {
      id: string;
      mac: string;
      comment: string;
      expires: string;
      package: string;
      actions: string;
      name: string;
      email: string;
      phone: string;
      credits: string;
    };
    errors: Record<
      | "credentials"
      | "captcha"
      | "session"
      | "credits"
      | "mac"
      | "device"
      | "email"
      | "name"
      | "phone"
      | "password"
      | "save"
      | "config"
      | "unavailable",
      string
    >;
  };
  manage: {
    loginTitle: string;
    loginSubtitle: string;
    mac: string;
    deviceKey: string;
    enter: string;
    entering: string;
    panelTitle: string;
    panelSubtitle: string;
    logout: string;
    addTitle: string;
    empty: string;
    edit: string;
    remove: string;
    cancel: string;
    confirmDelete: string;
    save: string;
    saving: string;
    saved: string;
    deleted: string;
    keepPassword: string;
    show: string;
    hide: string;
    fileNote: string;
    types: { code: string; url: string; xtream: string; file: string; unknown: string };
    errors: Record<
      "credentials" | "captcha" | "session" | "name" | "url" | "epg" | "server" | "username" | "password" | "code" | "missing" | "save" | "config",
      string
    >;
  };
  contact: {
    kicker: string;
    title: string;
    lead: string;
    emailLabel: string;
    telegramLabel: string;
    telegramText: string;
    formTitle: string;
    name: string;
    email: string;
    message: string;
    messagePlaceholder: string;
    captcha: string;
    submit: string;
    sending: string;
    successTitle: string;
    successText: string;
    errors: Record<"name" | "email" | "message" | "captcha" | "save", string>;
  };
  notFound: {
    title: string;
    text: string;
    action: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": {
    links: {
      home: "Home",
      activation: "Ativação",
      upload: "Upload de Lista",
      reseller: "Revendedor",
      terms: "Termos de Uso",
      privacy: "Política de Privacidade",
      cookies: "Política de Cookies",
    },
    a11y: {
      skip: "Ir para o conteúdo",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      language: "Selecionar idioma",
      email: "Enviar e-mail para o suporte",
      telegram: "Abrir o Telegram do Slim Play",
      mainNav: "Principal",
    },
    navCta: "Ativar agora",
    hero: {
      title: "A sua lista, em reprodução.",
      subtitle:
        "O Slim Play é apenas um reprodutor de mídia. Não fornecemos, hospedamos ou vendemos conteúdos nem playlists de canais.",
      primary: "Ativar seu app",
      secondary: "Upload de lista",
    },
    features: {
      items: [
        {
          id: "interface",
          title: "Interface Simples e Fluida",
          text: "Navegue com facilidade, no controle remoto ou na tela do aparelho.",
        },
        {
          id: "trial",
          title: "Teste Gratuito de 7 Dias",
          text: "Novos dispositivos entram em período gratuito automático por 7 dias.",
        },
        {
          id: "support",
          title: "Suporte Dedicado",
          text: "Atendimento para tirar dúvidas e ajudar na configuração.",
        },
      ],
    },
    resources: {
      badge: "• RECURSOS",
      title: "Feito pra ser rápido de abrir e fácil de usar",
      subtitle:
        "Cada tela do SLIM PLAY foi pensada pra sumir do caminho — você entra, encontra o que quer assistir e pronto.",
      items: [
        {
          id: "live",
          title: "Live TV com guia de programação",
          text: "Grade de canais com EPG completo, mostrando o que está passando agora e o que vem a seguir.",
        },
        {
          id: "catalog",
          title: "Catálogo de filmes e séries",
          text: "Organização automática por categorias, lançamentos e recém-adicionados, com capas via TMDB.",
        },
        {
          id: "playlist",
          title: "Suporte a M3U e Xtream",
          text: "Envie sua própria lista e vincule direto ao seu dispositivo, sem complicação.",
        },
        {
          id: "activation",
          title: "Ativação em segundos",
          text: "Basta o MAC address do seu dispositivo — sem instalação complicada, sem espera.",
        },
        {
          id: "devices",
          title: "Multiplataforma",
          text: "Funciona em Android: celular, tablet, TV Box e Android TV. É só baixar na Play Store.",
        },
        {
          id: "smooth",
          title: "Interface leve e fluida",
          text: "Navegação pensada pro controle remoto, com carregamento rápido mesmo em listas grandes.",
        },
      ],
    },
    faq: {
      badge: "• DÚVIDAS",
      title: "Perguntas frequentes",
      items: [
        {
          id: "content",
          question: "O SLIM PLAY fornece canais, filmes ou listas de conteúdo?",
          answer:
            "Não. O SLIM PLAY é exclusivamente um reprodutor de mídia neutro. Não hospedamos, vendemos, fornecemos ou distribuímos nenhum tipo de conteúdo, canal ou lista. O usuário é 100% responsável por adicionar sua própria playlist.",
        },
        {
          id: "login",
          question: "Como eu entro no app?",
          answer:
            "Ao abrir o SLIM PLAY no seu dispositivo, será exibido o endereço MAC da sua TV ou aparelho. Basta acessar a aba \"Ativação\" ou \"Upload de Lista\" no nosso site, digitar o seu MAC e vincular a sua M3U ou credenciais Xtream.",
        },
        {
          id: "devices",
          question: "Em quais dispositivos o SLIM PLAY funciona?",
          answer:
            "O aplicativo é compatível com dispositivos Android (Smart TVs, TV Boxes, Fire TV Stick, Celulares e Tablets). Em breve também estará disponível para Smart TVs Samsung (Tizen) e LG (webOS).",
        },
        {
          id: "playlist",
          question: "Posso usar minha própria lista M3U ou Xtream?",
          answer:
            "Sim! O SLIM PLAY suporta tanto URLs M3U quanto dados de conexão via Xtream API (usuário, senha e URL do servidor).",
        },
        {
          id: "reseller",
          question: "O SLIM PLAY tem sistema de revenda?",
          answer:
            "Sim. Oferecemos um painel de parceiros/revendedores com sistema de créditos para gestão e ativação facilitada de dispositivos de terceiros.",
        },
      ],
    },
    notice: {
      title: "Antes de começar",
      subtitle: "Leia rápido — evita mal-entendido depois.",
      confirm: "Entendi, continuar",
      close: "Fechar aviso",
      summary:
        "Resumindo: o SLIM PLAY é como um aparelho de som. Ele toca a música — mas quem escolhe e fornece a música é você.",
      blocks: [
        {
          id: "is",
          title: "O que o SLIM PLAY é",
          items: [
            "**Um player.** Um aplicativo que reproduz a lista que **você já tem**.",
            "Funciona em Android, TV Box, celular, computador e nas TVs LG, Roku e Samsung.",
            "Organiza seus canais, filmes e séries, com capas, busca e continuar assistindo.",
            "Você paga pelo **uso do aplicativo** — e só por isso.",
          ],
        },
        {
          id: "isNot",
          title: "O que o SLIM PLAY NÃO é",
          items: [
            "**Não fornecemos lista de canais**, filmes, séries ou qualquer conteúdo.",
            "**Não vendemos assinatura de servidor** nem acesso a programação.",
            "Não temos vínculo com quem fornece a sua lista — não damos suporte a ela.",
            "Se o conteúdo sair do ar, falar com **o seu fornecedor** resolve; nós não temos acesso.",
          ],
        },
        {
          id: "how",
          title: "Como funciona na prática",
          items: [
            "Você já tem uma lista (M3U ou Xtream) com **o seu fornecedor**.",
            "Instala o SLIM PLAY no seu aparelho.",
            "Informa os dados da **sua** lista dentro do app.",
            "Pronto: o conteúdo que aparece é o do seu fornecedor, organizado pelo SLIM PLAY.",
          ],
        },
      ],
    },
    platforms: {
      badge: "Disponível em",
      subtitle: "Um app, várias plataformas — a mesma experiência em todas.",
      review: "em análise",
      use: "como usar",
      install: "como instalar",
      items: [
        { id: "android", name: "Android (celular e TV)", status: "review" },
        { id: "windows", name: "Windows (PC)", status: "review" },
        { id: "xbox", name: "Xbox", status: "review" },
        { id: "samsung", name: "Samsung (Tizen)", status: "review" },
        { id: "whale", name: "WhaleOS (Whale TV)", status: "review" },
        { id: "titan", name: "TitanOS", status: "review" },
        { id: "lg", name: "LG (webOS)", status: "review" },
        { id: "roku", name: "Roku", status: "review" },
        { id: "ios", name: "iOS (iPhone / iPad)", status: "review" },
        { id: "macos", name: "macOS (Mac)", status: "review" },
        { id: "chromecast", name: "Chromecast", status: "use" },
        { id: "firestick", name: "Firestick (Fire TV)", status: "install" },
      ],
    },
    footer: {
      linksTitle: "Links rápidos",
      contactTitle: "Contato",
      legal:
        "Slim Play © 2026. Todos os direitos reservados. O aplicativo é apenas um player de mídia e não contém nenhum conteúdo multimídia pré-carregado.",
    },
    cookieNotice: {
      text: "Usamos apenas armazenamento necessário para o idioma, a sessão e lembrar que você viu este aviso. Não há cookie de anúncio nem de análise.",
      policy: "Política de Cookies",
      action: "Entendi",
    },
    supportLabel: "Suporte",
    pages: {
      activation: {
        kicker: "Ativação",
        title: "Ative o seu app",
        lead: "A ativação anual custa R$ 12,00 e libera o player por 1 ano. O pagamento é só por Pix, com o MAC do dispositivo. Nenhum conteúdo ou playlist vem incluso.",
        points: [
          "Informe somente o MAC exibido no aplicativo.",
          "O Pix de R$ 12,00 libera o Slim Play por 1 ano.",
          "A licença não inclui canais, filmes ou séries.",
        ],
        action: { href: "/upload", label: "Upload de lista" },
      },
      upload: {
        kicker: "Upload de Lista",
        title: "Envie a sua lista",
        lead: "O Slim Play reproduz a lista que você adicionar. Não hospedamos, não vendemos e não fornecemos playlists de canais.",
        points: [
          "Use somente listas que você tem direito de reproduzir.",
          "O player não traz mídia pré-carregada.",
          "O gerenciamento da lista fica ligado à sua ativação.",
        ],
        action: { href: "/ativacao", label: "Ativar seu app" },
      },
      reseller: {
        kicker: "Revendedor",
        title: "Licença para revenda",
        lead: "Esta área é para quem distribui a licença do Slim Play. A revenda é do aplicativo, nunca de conteúdos ou playlists.",
        points: [
          "Cada código ativa o player em um dispositivo.",
          "O material comercial deve manter o aviso de player neutro.",
          "Dúvidas de parceria seguem pelo e-mail de suporte.",
        ],
      },
      terms: {
        kicker: "Termos de Uso",
        title: "Termos de Uso",
        lead: "Estes termos regem o site e o aplicativo Slim Play. O Slim Play é um reprodutor de mídia. Não é um serviço de canais, filmes ou playlists.",
        updated: "Vigência: 26 de outubro de 2026.",
        points: [],
        sections: [
          {
            title: "O serviço",
            paragraphs: [
              "O Slim Play reproduz listas e arquivos que você mesmo adiciona, em formatos como M3U ou Xtream.",
              "O site apresenta o player, a ativação da licença, o envio da sua lista e o painel de revenda da licença.",
            ],
          },
          {
            title: "O que não está incluído",
            paragraphs: [
              "Não hospedamos, não vendemos e não fornecemos conteúdos, canais ou playlists.",
              "Não há mídia pré-carregada. A lista continua sendo a sua, ou a do fornecedor que você escolher.",
            ],
          },
          {
            title: "Quem pode contratar",
            paragraphs: [
              "A licença paga é contratada por pessoa com 18 anos ou mais, ou por quem a represente legalmente.",
              "Você responde pelos dados do dispositivo e da lista que informar.",
            ],
          },
          {
            title: "Licença e pagamento",
            paragraphs: [
              "A licença libera o player no dispositivo indicado pelo endereço MAC. Ela não inclui lista, canal ou arquivo.",
              "A degustação, quando disponível, cobre os recursos de reprodução por 7 dias. Não é um catálogo.",
              "A licença paga segue o prazo do plano escolhido. O tempo novo soma-se ao que ainda estiver vigente no aparelho, a partir da confirmação do pagamento.",
              "O pagamento da licença é somente por Pix e é processado pelo gateway.",
            ],
          },
          {
            title: "Arrependimento",
            paragraphs: [
              "Na compra feita pela internet, você pode desistir em até 7 dias contados da contratação, pelo e-mail de suporte. Esse prazo é o do Código de Defesa do Consumidor e não se confunde com a degustação do player.",
            ],
          },
          {
            title: "Suas listas",
            paragraphs: [
              "Envie somente listas e endereços que você tem direito de reproduzir.",
              "Endereços M3U e credenciais Xtream ficam guardados para o player abrir a lista que você cadastrou. Na área logada, você pode editar ou excluir as suas listas.",
              "O Slim Play não controla servidores de terceiros. Se um endereço deixar de funcionar, o suporte cobre o player, não o conteúdo do fornecedor.",
            ],
          },
          {
            title: "Revenda",
            paragraphs: [
              "O painel de revendedor distribui licenças do aplicativo, nunca conteúdos ou playlists.",
              "Cada crédito ativa um MAC por 1 ano. A conta começa sem créditos.",
              "O material comercial deve deixar claro que o Slim Play é um player neutro, sem catálogo incluso.",
              "O revendedor responde pelos dados que cadastrar e pelo uso da própria conta.",
            ],
          },
          {
            title: "Uso aceitável",
            paragraphs: [
              "É vedado atacar o serviço, burlar a licença ou apresentar o Slim Play como fornecedor de conteúdo.",
              "A licença ou a conta de revendedor pode ser encerrada em caso de uso abusivo do aplicativo ou destes termos.",
              "Um aviso sobre uso indevido do aplicativo pode ser enviado ao e-mail de suporte. Não tratamos o catálogo de terceiros como se fosse nosso.",
            ],
          },
          {
            title: "Responsabilidade, lei e contato",
            paragraphs: [
              "O player reproduz o que você adicionar. Não garantimos disponibilidade, qualidade ou legalidade de listas e servidores de terceiros.",
              "Na medida permitida pela lei brasileira, a responsabilidade do Slim Play limita-se à licença do aplicativo.",
              "Estes termos seguem as leis do Brasil. Dúvidas e pedidos vão para contato@slimplay.app. A data no topo indica a versão vigente.",
            ],
          },
        ],
      },
      privacy: {
        kicker: "Privacidade",
        title: "Política de Privacidade",
        lead: "Esta política explica quais dados o site trata, para quê e quais são os seus direitos. O controlador é o responsável pelo Slim Play, contatado pelo e-mail de suporte.",
        updated: "Vigência: 26 de outubro de 2026.",
        points: [],
        sections: [
          {
            title: "Dados que tratamos",
            paragraphs: [
              "Idioma e o registro de que você viu os avisos deste navegador ficam só neste aparelho.",
              "Para gerenciar listas, guardamos o MAC, a chave do dispositivo usada no login e os dados da lista que você enviar: nome, endereço M3U ou código, e, no Xtream, servidor, usuário e senha. Isso serve para o player abrir a sua lista.",
              "Na ativação, o nome, o e-mail, o CPF e o MAC seguem para o gateway emitir a cobrança e ligar a licença ao aparelho. O Slim Play não guarda o CPF. Guardamos o registro do pagamento: MAC, plano, valor, forma (Pix), status e identificadores do gateway.",
              "No cadastro de revendedor, guardamos nome, e-mail, telefone e a senha apenas como hash, além dos créditos e dos MAC que essa conta ativar.",
              "Mensagens do formulário de contato e do e-mail de suporte guardam o nome, o e-mail e o texto, e são usadas para responder o seu pedido.",
            ],
          },
          {
            title: "Finalidade e base legal",
            paragraphs: [
              "Executamos o contrato ao ativar a licença, guardar a sua lista e operar a conta de revendedor.",
              "O interesse legítimo cobre a segurança da sessão, o desafio contra acesso automatizado e a prevenção de abuso do aplicativo.",
              "A obrigação legal cobre o registro da compra pelo prazo exigido para atendimento ao consumidor e obrigações fiscais, quando houver pagamento.",
              "Não vendemos dados pessoais e não usamos os dados para publicidade.",
            ],
          },
          {
            title: "Com quem compartilhamos",
            paragraphs: [
              "O gateway de pagamento recebe nome, e-mail, CPF e o valor da cobrança para processar o Pix.",
              "A infraestrutura que guarda o banco e executa o site trata os dados em nosso nome, para hospedar o serviço. Esses prestadores podem manter servidores fora do Brasil.",
              "Podemos informar dados se uma autoridade competente exigir, nos limites da lei.",
            ],
          },
          {
            title: "Por quanto tempo",
            paragraphs: [
              "A sessão de listas e a sessão de revendedor duram 12 horas.",
              "Idioma e avisos locais permanecem até você limpar os dados deste navegador.",
              "A conta de revendedor e as listas permanecem enquanto a conta ou a lista existir. Você pode pedir a exclusão pelo e-mail de suporte.",
              "Mensagens do formulário de contato ficam até a resposta e o acompanhamento do pedido.",
              "Registros de pagamento permanecem pelo tempo necessário para a licença, o atendimento do arrependimento e as obrigações legais.",
            ],
          },
          {
            title: "Os seus direitos",
            paragraphs: [
              "Você pode pedir confirmação, acesso, correção, anonimização, portabilidade, informação sobre compartilhamento, revogação de consentimento e eliminação dos dados tratados com base em consentimento.",
              "O pedido é feito para contato@slimplay.app. Também é possível apresentar reclamação à Autoridade Nacional de Proteção de Dados.",
              "O site e a licença paga não são dirigidos a crianças. Não coletamos dados de crianças de forma intencional.",
            ],
          },
        ],
      },
      cookies: {
        kicker: "Cookies",
        title: "Política de Cookies",
        lead: "O site usa somente armazenamento necessário para funcionar. Não há cookie de anúncio, rede social ou medição de audiência.",
        updated: "Vigência: 26 de outubro de 2026.",
        points: [],
        sections: [
          {
            title: "O que fica neste navegador",
            paragraphs: [
              "O idioma escolhido fica na memória local deste aparelho, na chave slimplay-locale, até você limpar os dados do navegador.",
              "O aviso de que o Slim Play é um player neutro e a ciência desta política também ficam na memória local, para não serem exibidos de novo.",
              "Depois do login de listas, um cookie chamado slimplay-device guarda a sessão por 12 horas. Ele é httpOnly: o JavaScript da página não lê esse valor.",
              "Depois do login de revendedor, o cookie slimplay-reseller guarda a sessão por 12 horas, também httpOnly.",
            ],
          },
          {
            title: "Por que são necessários",
            paragraphs: [
              "Sem o idioma, o site não lembra a sua escolha. Sem a sessão, a área de listas e o painel de revendedor exigiriam login a cada passo.",
              "Por serem necessários ao serviço que você pediu, esses itens não dependem de uma autorização separada. O aviso no rodapé da tela existe para informar, e o botão Entendi registra que você o viu.",
            ],
          },
          {
            title: "Como controlar",
            paragraphs: [
              "Você pode apagar cookies e dados do site nas configurações do navegador. A sessão termina e o idioma volta ao padrão.",
              "Bloquear todo cookie impede o login de listas e o painel de revendedor. A leitura das páginas públicas continua possível.",
              "Detalhes sobre os demais dados estão na Política de Privacidade. Dúvidas: contato@slimplay.app.",
            ],
          },
        ],
      },
      chromecast: {
        kicker: "Chromecast",
        title: "Como usar no Chromecast",
        lead: "O Slim Play reproduz a lista que você já tem. No Chromecast, o uso parte do aparelho em que o aplicativo está instalado.",
        points: [
          "A lista continua sendo a sua, em M3U ou Xtream.",
          "O aplicativo não fornece canais, filmes nem acesso a servidor.",
          "O suporte do Slim Play cobre o player, não o conteúdo do seu fornecedor.",
        ],
        action: { href: "/ativacao", label: "Ativar seu app" },
      },
      firestick: {
        kicker: "Fire TV",
        title: "Como instalar no Fire TV",
        lead: "O Fire TV Stick roda Android e pode receber o Slim Play. A instalação libera o player, não uma lista de conteúdo.",
        points: [
          "Instale o Slim Play no Fire TV Stick.",
          "Ative com o MAC do aparelho, na página de ativação.",
          "Envie a sua própria lista. Nada vem pré-carregado.",
        ],
        action: { href: "/ativacao", label: "Ativar seu app" },
      },
    },
    uploadForm: {
      title: "Carregar playlist",
      subtitle: "Escolha como deseja carregar sua lista de reprodução no aplicativo",
      disclaimer:
        "O Slim Play só reproduz a lista que você enviar. Não hospedamos, não vendemos e não fornecemos playlists.",
      tabs: { code: "Código", url: "URL", file: "File", xtream: "Conta Xtream" },
      mac: "Digite seu MAC Address",
      macPlaceholder: "AA:BB:CC:DD:EE:FF",
      device: "Digite seu MAC Address ou Código OTP de 6 dígitos gerado na TV.",
      devicePlaceholder: "MAC ou OTP",
      shortCode: "Código curto da lista.",
      playlistName: "Nome da lista",
      playlistNamePlaceholder: "Minha Lista",
      m3uUrl: "URL da lista (URL M3U/M3U8)",
      epgUrl: "URL do EPG da lista (Opcional)",
      drop: "Arraste o arquivo .m3u ou .m3u8",
      dropHint: "ou clique para escolher",
      serverUrl: "Server URL / Host (DNS)",
      username: "Usuário",
      password: "Senha",
      protect: "Protect Playlist",
      setPin: "Set PIN",
      confirmPin: "Confirm PIN",
      captcha: "Confirme que você é humano",
      refreshCaptcha: "Gerar outro desafio",
      captchaPlaceholder: "Resultado",
      submit: "Carregar / Salvar lista",
      saving: "Salvando...",
      successTitle: "Lista vinculada com sucesso!",
      successText: "Reinicie seu aplicativo.",
      close: "Fechar",
      errors: {
        mac: "Digite um MAC Address válido. Exemplo: AA:BB:CC:DD:EE:FF.",
        device: "Digite o MAC Address ou o código OTP de 6 dígitos gerado na TV.",
        name: "Informe o nome da lista.",
        url: "Informe uma URL M3U/M3U8 válida, começando com http:// ou https://.",
        epg: "A URL do EPG precisa começar com http:// ou https://.",
        file: "Envie um arquivo .m3u ou .m3u8 de até 400 KB.",
        server: "Informe a URL do servidor (DNS), começando com http:// ou https://.",
        username: "Informe o usuário.",
        password: "Informe a senha.",
        pin: "O PIN precisa ter de 4 a 8 números e coincidir com a confirmação.",
        code: "Informe o código curto da lista.",
        captcha: "O desafio de segurança não confere. Tente de novo.",
        save: "Não foi possível salvar a lista. Tente novamente.",
        config: "O envio está indisponível no momento.",
      },
    },
    manage: {
      loginTitle: "Entrar no dispositivo",
      loginSubtitle: "Use o endereço MAC e a chave exibidos no aplicativo.",
      mac: "Endereço MAC",
      deviceKey: "Chave do dispositivo",
      enter: "Entrar",
      entering: "Entrando...",
      panelTitle: "Upload de Lista",
      panelSubtitle: "Listas vinculadas a este dispositivo",
      logout: "Sair",
      addTitle: "Adicionar lista",
      empty: "Nenhuma lista vinculada a este dispositivo.",
      edit: "Editar",
      remove: "Excluir",
      cancel: "Cancelar",
      confirmDelete: "Excluir esta lista?",
      save: "Salvar",
      saving: "Salvando...",
      saved: "Lista salva.",
      deleted: "Lista excluída.",
      keepPassword: "Deixe em branco para manter a senha atual",
      show: "Mostrar",
      hide: "Ocultar",
      fileNote: "O envio de arquivo foi desativado. Você pode excluir esta lista.",
      types: { code: "Código", url: "URL M3U", xtream: "Xtream Codes", file: "Arquivo", unknown: "Lista" },
      errors: {
        credentials: "MAC ou Chave do Dispositivo incorretos. Verifique as credenciais no seu aplicativo.",
        captcha: "O desafio de segurança não confere. Tente de novo.",
        session: "Sua sessão expirou. Entre de novo.",
        name: "Informe o nome da lista.",
        url: "Informe uma URL M3U/M3U8 válida, começando com http:// ou https://.",
        epg: "A URL do EPG precisa começar com http:// ou https://.",
        server: "Informe a URL do servidor, começando com http:// ou https://.",
        username: "Informe o usuário.",
        password: "Informe a senha.",
        code: "Informe o código curto da lista.",
        missing: "Lista não encontrada.",
        save: "Não foi possível salvar. Tente novamente.",
        config: "O painel está indisponível no momento.",
      },
    },
    activationCheckout: {
      notice: "Informe o MAC exibido no aplicativo. Se ele já estiver cadastrado, o Pix de R$ 12,00 libera o player por 1 ano.",
      mac: "MAC do dispositivo",
      pay: "Gerar Pix",
      paying: "Gerando Pix...",
      payTitle: "Pague com Pix",
      expires: "Expira em {time}",
      released: "Após o pagamento, a ativação é liberada automaticamente para o MAC",
      waiting: "Aguardando a confirmação do Pix.",
      paid: "Pagamento confirmado. O player foi ativado neste dispositivo.",
      refunded: "Este pagamento foi estornado.",
      pixCode: "Código Pix",
      copy: "Copiar código Pix",
      copied: "Código copiado",
      history: "Já paguei: ver histórico de compras",
      historyTitle: "Histórico de compras",
      emptyHistory: "Nenhum pagamento encontrado para este MAC.",
      supportTitle: "Precisa de suporte com a ativação do MAC?",
      supportLead: "Fale diretamente com a equipe Slim Play pelo Telegram.",
      attention: "A ativação libera somente o aplicativo e não inclui conteúdo. Suporte para canais, filmes e séries deve ser feito diretamente com o seu fornecedor.",
      statuses: { pending: "Pendente", paid: "Pago", refunded: "Estornado", cancelled: "Cancelado" },
      voucherOption: "Ativação por voucher",
      voucherBack: "Voltar para o Pix",
      voucherNote: "Para a equipe de análise das lojas. Informe o voucher e o MAC exibido no aplicativo. Não há cobrança, e a licença vale 1 ano.",
      voucher: "Voucher",
      voucherAction: "Ativar com voucher",
      voucherWorking: "Ativando...",
      voucherDone: "Voucher aceito. O player foi ativado neste dispositivo por 1 ano.",
      errors: {
        mac: "Informe o MAC do dispositivo no formato AA:BB:CC:DD:EE:FF.",
        unknown: "Este MAC não está cadastrado. Abra o aplicativo nesse dispositivo e tente de novo.",
        voucher: "Voucher incorreto.",
        captcha: "O desafio de segurança não confere. Tente de novo.",
        save: "Não foi possível gerar a cobrança. Tente novamente.",
        unavailable: "O pagamento ainda não está disponível.",
        config: "A ativação está indisponível no momento.",
      },
    },
    resellerPanel: {
      loginTitle: "Painel do revendedor",
      loginSubtitle: "A revenda é da licença do player. Cada crédito ativa um MAC por 1 ano.",
      email: "E-mail",
      password: "Senha",
      confirmPassword: "Confirmar senha",
      passwordMismatch: "As senhas não conferem.",
      signupTitle: "Cadastro de revendedor",
      signupSubtitle: "Crie a conta para ativar dispositivos com créditos. Ela começa sem créditos.",
      signupNote: "Cada crédito, quando a compra estiver disponível, ativa um MAC por 1 ano.",
      signup: "Criar conta",
      signingUp: "Criando conta...",
      haveAccount: "Já tenho conta",
      needAccount: "Criar conta de revendedor",
      enter: "Entrar",
      entering: "Entrando...",
      welcome: "Bem-vindo ao seu painel",
      credits: "Créditos",
      buy: "Comprar Créditos",
      dashboard: "Dashboard",
      devices: "Dispositivos",
      subs: "Lista de Revendas",
      home: "Voltar ao início",
      logout: "Desconectar",
      total: "Ativações Totais",
      today: "Ativações Hoje",
      month: "Ativações Este Mês",
      resellerCount: "Revendedores",
      spent: "Créditos Gastos (Total)",
      searchDevices: "Buscar por MAC ou comentário",
      searchSubs: "Buscar por nome ou e-mail",
      search: "Buscar",
      refresh: "Atualizar",
      activate: "Ativar dispositivo",
      add: "Adicionar",
      emptyDevices: "Nenhum dispositivo encontrado.",
      emptySubs: "Nenhuma sub-revenda encontrada.",
      renew: "Renovar",
      mac: "MAC do dispositivo",
      comment: "Comentário",
      commentPlaceholder: "Opcional",
      activateNote: "1 crédito libera o player neste MAC por 1 ano. Não inclui lista nem conteúdo.",
      confirmActivate: "Ativar por 1 ano",
      activating: "Ativando...",
      activated: "Dispositivo ativado por 1 ano.",
      buyTitle: "Comprar Créditos",
      buyLead: "Escolha um pacote de créditos (ativações).",
      buyAction: "Comprar",
      buyLater: "A compra dos créditos entra quando o site estiver hospedado e o pagamento for conectado.",
      buyPaid: "Pagamento confirmado. Os créditos já estão na conta.",
      pixCode: "Código Pix",
      copy: "Copiar código Pix",
      copied: "Código copiado",
      waiting: "Aguardando a confirmação do Pix.",
      packCredits: "{count} Créditos",
      priceLabel: "VALOR EM REAL",
      close: "Fechar",
      menu: "Abrir menu",
      subTitle: "Adicionar revenda",
      subLead: "A sub-revenda entra com os créditos transferidos da sua conta.",
      phone: "Telefone",
      transfer: "Créditos para transferir",
      create: "Adicionar",
      creating: "Adicionando...",
      created: "Sub-revenda adicionada.",
      columns: {
        id: "ID",
        mac: "MAC",
        comment: "Comentário",
        expires: "Expira",
        package: "Package",
        actions: "Ações",
        name: "Nome",
        email: "E-mail",
        phone: "Telefone",
        credits: "Créditos",
      },
      errors: {
        credentials: "E-mail ou senha incorretos.",
        captcha: "O desafio de segurança não confere. Tente de novo.",
        session: "Sua sessão expirou. Entre de novo.",
        credits: "Créditos insuficientes.",
        mac: "Informe o MAC no formato AA:BB:CC:DD:EE:FF.",
        device: "Este MAC já está vinculado a outro revendedor.",
        email: "Informe um e-mail válido que ainda não esteja em uso.",
        name: "Informe o nome.",
        phone: "Informe um telefone válido.",
        password: "A senha precisa ter pelo menos 8 caracteres.",
        save: "Não foi possível concluir. Tente novamente.",
        config: "O painel está indisponível no momento.",
        unavailable: "O Pix ainda não está disponível.",
      },
    },
    contact: {
      kicker: "Contato",
      title: "Fale com o Slim Play",
      lead: "Dúvidas sobre a licença, o aplicativo ou a conta. O Slim Play não dá suporte a listas, canais ou conteúdo de terceiros.",
      emailLabel: "E-mail",
      telegramLabel: "Telegram",
      telegramText: "Abrir conversa",
      formTitle: "Envie uma mensagem",
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
      messagePlaceholder: "Como podemos ajudar?",
      captcha: "Confirme que você é humano",
      submit: "Enviar mensagem",
      sending: "Enviando...",
      successTitle: "Mensagem enviada",
      successText: "Recebemos o seu pedido e vamos responder no e-mail informado.",
      errors: {
        name: "Informe o seu nome.",
        email: "Informe um e-mail válido.",
        message: "Escreva a mensagem com pelo menos 10 caracteres.",
        captcha: "Confirme que você é humano.",
        save: "Não foi possível enviar agora. Use o e-mail ou o Telegram.",
      },
    },
    notFound: {
      title: "Página não encontrada",
      text: "Esse endereço não faz parte do site do Slim Play.",
      action: "Voltar para a home",
    },
  },
  en: {
    links: {
      home: "Home",
      activation: "Activation",
      upload: "List Upload",
      reseller: "Reseller",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
    },
    a11y: {
      skip: "Skip to content",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Choose language",
      email: "Email support",
      telegram: "Open Slim Play on Telegram",
      mainNav: "Primary",
    },
    navCta: "Activate now",
    hero: {
      title: "Your list, playing.",
      subtitle:
        "Slim Play is a neutral media player. We do not provide, host, or sell content or channel playlists.",
      primary: "Activate your app",
      secondary: "Upload list",
    },
    features: {
      items: [
        {
          id: "interface",
          title: "Simple, Smooth Interface",
          text: "Move around easily, with the remote or on the device screen.",
        },
        {
          id: "trial",
          title: "7-Day Free Trial",
          text: "New devices start an automatic 7-day trial.",
        },
        {
          id: "support",
          title: "Dedicated Support",
          text: "Help with questions and with setup.",
        },
      ],
    },
    resources: {
      badge: "• FEATURES",
      title: "Built to open fast and stay easy to use",
      subtitle:
        "Every SLIM PLAY screen is meant to get out of the way — you open it, find what you want to watch, and that's it.",
      items: [
        {
          id: "live",
          title: "Live TV with a program guide",
          text: "A channel grid with a full EPG, showing what's on now and what's coming next.",
        },
        {
          id: "catalog",
          title: "Movie and series catalog",
          text: "Automatic organization by categories, new releases, and recently added, with artwork via TMDB.",
        },
        {
          id: "playlist",
          title: "M3U and Xtream support",
          text: "Send your own list and link it straight to your device, without the hassle.",
        },
        {
          id: "activation",
          title: "Activation in seconds",
          text: "All it takes is your device's MAC address — no complicated install, no waiting.",
        },
        {
          id: "devices",
          title: "Multiplatform",
          text: "Works on Android: phone, tablet, TV Box, and Android TV. Just download it on the Play Store.",
        },
        {
          id: "smooth",
          title: "Light, smooth interface",
          text: "Navigation built for the remote, with fast loading even on large lists.",
        },
      ],
    },
    faq: {
      badge: "• FAQ",
      title: "Frequently asked questions",
      items: [
        {
          id: "content",
          question: "Does SLIM PLAY provide channels, movies, or content lists?",
          answer:
            "No. SLIM PLAY is strictly a neutral media player. We do not host, sell, provide, or distribute any kind of content, channel, or list. The user is fully responsible for adding their own playlist.",
        },
        {
          id: "login",
          question: "How do I get into the app?",
          answer:
            "When you open SLIM PLAY on your device, it shows the MAC address of your TV or device. Open the Activation or List Upload page on our site, enter your MAC, and link your M3U or Xtream credentials.",
        },
        {
          id: "devices",
          question: "Which devices does SLIM PLAY work on?",
          answer:
            "The app is compatible with Android devices (Smart TVs, TV Boxes, Fire TV Stick, phones, and tablets). It will soon be available for Samsung (Tizen) and LG (webOS) Smart TVs as well.",
        },
        {
          id: "playlist",
          question: "Can I use my own M3U or Xtream list?",
          answer:
            "Yes. SLIM PLAY supports both M3U URLs and Xtream API connection details (username, password, and server URL).",
        },
        {
          id: "reseller",
          question: "Does SLIM PLAY have a reseller system?",
          answer:
            "Yes. We offer a partner and reseller panel with a credit system for managing and activating third-party devices.",
        },
      ],
    },
    notice: {
      title: "Before you start",
      subtitle: "A quick read — it avoids a misunderstanding later.",
      confirm: "Got it, continue",
      close: "Close notice",
      summary:
        "In short: SLIM PLAY is like a stereo. It plays the music — but you choose and supply the music.",
      blocks: [
        {
          id: "is",
          title: "What SLIM PLAY is",
          items: [
            "**A player.** An app that plays the list **you already have**.",
            "It works on Android, TV Box, phone, computer, and on LG, Roku, and Samsung TVs.",
            "It organizes your channels, movies, and series, with artwork, search, and continue watching.",
            "You pay for **use of the app** — and only for that.",
          ],
        },
        {
          id: "isNot",
          title: "What SLIM PLAY is not",
          items: [
            "**We do not provide a channel list**, movies, series, or any content.",
            "**We do not sell a server subscription** or access to programming.",
            "We have no tie to whoever supplies your list — we do not support it.",
            "If the content goes offline, talking to **your provider** fixes it; we do not have access.",
          ],
        },
        {
          id: "how",
          title: "How it works in practice",
          items: [
            "You already have a list (M3U or Xtream) with **your provider**.",
            "You install SLIM PLAY on your device.",
            "You enter **your** list details inside the app.",
            "Done: the content shown is your provider's, organized by SLIM PLAY.",
          ],
        },
      ],
    },
    platforms: {
      badge: "Available on",
      subtitle: "One app, several platforms — the same experience on all of them.",
      review: "under review",
      use: "how to use",
      install: "how to install",
      items: [
        { id: "android", name: "Android (phone and TV)", status: "review" },
        { id: "windows", name: "Windows (PC)", status: "review" },
        { id: "xbox", name: "Xbox", status: "review" },
        { id: "samsung", name: "Samsung (Tizen)", status: "review" },
        { id: "whale", name: "WhaleOS (Whale TV)", status: "review" },
        { id: "titan", name: "TitanOS", status: "review" },
        { id: "lg", name: "LG (webOS)", status: "review" },
        { id: "roku", name: "Roku", status: "review" },
        { id: "ios", name: "iOS (iPhone / iPad)", status: "review" },
        { id: "macos", name: "macOS (Mac)", status: "review" },
        { id: "chromecast", name: "Chromecast", status: "use" },
        { id: "firestick", name: "Firestick (Fire TV)", status: "install" },
      ],
    },
    footer: {
      linksTitle: "Quick links",
      contactTitle: "Contact",
      legal:
        "Slim Play © 2026. All rights reserved. The app is only a media player and does not include any preloaded multimedia content.",
    },
    cookieNotice: {
      text: "We only store what the site needs for language, your session, and remembering that you saw this notice. There are no advertising or analytics cookies.",
      policy: "Cookie Policy",
      action: "Got it",
    },
    supportLabel: "Support",
    pages: {
      activation: {
        kicker: "Activation",
        title: "Activate your app",
        lead: "The annual activation costs R$ 12.00 and unlocks the player for 1 year. Payment is Pix only, using the device MAC. No content or playlist is included.",
        points: [
          "Enter only the MAC address shown in the app.",
          "The R$ 12.00 Pix unlocks Slim Play for 1 year.",
          "The license does not include channels, movies, or series.",
        ],
        action: { href: "/upload", label: "Upload list" },
      },
      upload: {
        kicker: "List Upload",
        title: "Upload your list",
        lead: "Slim Play plays the list you add. We do not host, sell, or provide channel playlists.",
        points: [
          "Upload only lists you have the right to play.",
          "The player does not ship with preloaded media.",
          "List management is tied to your activation.",
        ],
        action: { href: "/ativacao", label: "Activate your app" },
      },
      reseller: {
        kicker: "Reseller",
        title: "License resale",
        lead: "This area is for people who distribute the Slim Play license. Resale covers the app, never content or playlists.",
        points: [
          "Each code activates the player on one device.",
          "Sales material must keep the neutral-player notice.",
          "Partnership questions go to the support email.",
        ],
      },
      terms: {
        kicker: "Terms of Use",
        title: "Terms of Use",
        lead: "These terms cover the Slim Play site and app. Slim Play is a media player. It is not a channel, movie, or playlist service.",
        updated: "Effective: October 26, 2026.",
        points: [],
        sections: [
          {
            title: "The service",
            paragraphs: [
              "Slim Play plays lists and files you add yourself, in formats such as M3U or Xtream.",
              "The site presents the player, license activation, your list upload, and the license reseller panel.",
            ],
          },
          {
            title: "What is not included",
            paragraphs: [
              "We do not host, sell, or provide content, channels, or playlists.",
              "Nothing is preloaded. The list remains yours, or your chosen provider's.",
            ],
          },
          {
            title: "Who can buy a license",
            paragraphs: [
              "A paid license is bought by someone 18 or older, or by a person who legally represents them.",
              "You are responsible for the device and list details you submit.",
            ],
          },
          {
            title: "License and payment",
            paragraphs: [
              "The license unlocks the player on the device identified by its MAC address. It does not include a list, channel, or file.",
              "The trial, when available, covers playback features for 7 days. It is not a catalog.",
              "A paid license follows the plan length you choose. New time is added to any time still left on the device, starting when payment is confirmed.",
              "The license is paid by Pix only, and the gateway processes that payment.",
            ],
          },
          {
            title: "Withdrawal",
            paragraphs: [
              "For a purchase made online, you may withdraw within 7 days of the contract by emailing support. That period comes from the Brazilian Consumer Defense Code and is separate from the player trial.",
            ],
          },
          {
            title: "Your lists",
            paragraphs: [
              "Upload only lists and addresses you have the right to play.",
              "M3U addresses and Xtream credentials are stored so the player can open the list you added. While signed in, you can edit or delete your lists.",
              "Slim Play does not control third-party servers. If an address stops working, support covers the player, not your provider's content.",
            ],
          },
          {
            title: "Resale",
            paragraphs: [
              "The reseller panel distributes app licenses, never content or playlists.",
              "Each credit activates one MAC for 1 year. The account starts with no credits.",
              "Sales material must make clear that Slim Play is a neutral player, with no catalog included.",
              "The reseller is responsible for the data they enter and for use of their account.",
            ],
          },
          {
            title: "Acceptable use",
            paragraphs: [
              "You may not attack the service, bypass the license, or present Slim Play as a content provider.",
              "The license or reseller account may end in cases of abusive use of the app or of these terms.",
              "A notice about misuse of the app can be sent to the support email. We do not treat a third-party catalog as our own.",
            ],
          },
          {
            title: "Liability, law, and contact",
            paragraphs: [
              "The player plays what you add. We do not guarantee the availability, quality, or legality of third-party lists and servers.",
              "To the extent Brazilian law allows, Slim Play's liability is limited to the app license.",
              "These terms follow the laws of Brazil. Questions and requests go to contato@slimplay.app. The date at the top is the current version.",
            ],
          },
        ],
      },
      privacy: {
        kicker: "Privacy",
        title: "Privacy Policy",
        lead: "This policy explains which data the site handles, why, and which rights you have. The controller is the party responsible for Slim Play, reached at the support email.",
        updated: "Effective: October 26, 2026.",
        points: [],
        sections: [
          {
            title: "Data we handle",
            paragraphs: [
              "Your language and the record that you saw the notices in this browser stay on this device only.",
              "To manage lists, we store the MAC, the device key used at login, and the list you submit: name, M3U address or code, and, for Xtream, server, username, and password. That is what lets the player open your list.",
              "For activation, the name, email, CPF, and MAC go to the gateway to issue the charge and tie the license to the device. Slim Play does not store the CPF. We keep the payment record: MAC, plan, amount, method (Pix), status, and gateway identifiers.",
              "Reseller signup stores the name, email, phone, and the password only as a hash, plus credits and the MACs that account activates.",
              "Contact form and support email messages store the name, email, and text, and are used to answer your request.",
            ],
          },
          {
            title: "Purpose and legal basis",
            paragraphs: [
              "We perform the contract when we activate the license, store your list, and run the reseller account.",
              "Legitimate interest covers session security, the challenge against automated access, and preventing abuse of the app.",
              "Legal obligation covers keeping the purchase record for as long as consumer and tax rules require, when a payment exists.",
              "We do not sell personal data and we do not use the data for advertising.",
            ],
          },
          {
            title: "Who we share it with",
            paragraphs: [
              "The payment gateway receives the name, email, CPF, and charge amount to process the Pix.",
              "The infrastructure that stores the database and runs the site handles data on our behalf, to host the service. Those providers may keep servers outside Brazil.",
              "We may disclose data if a competent authority requires it, within the limits of the law.",
            ],
          },
          {
            title: "How long we keep it",
            paragraphs: [
              "The list session and the reseller session last 12 hours.",
              "Language and local notices stay until you clear this browser's data.",
              "The reseller account and the lists remain while the account or the list exists. You can ask for deletion at the support email.",
              "Contact form messages stay until we answer and follow up on the request.",
              "Payment records remain for as long as the license, the withdrawal period, and legal duties require.",
            ],
          },
          {
            title: "Your rights",
            paragraphs: [
              "You may ask for confirmation, access, correction, anonymization, portability, information about sharing, withdrawal of consent, and deletion of data handled on the basis of consent.",
              "Send the request to contato@slimplay.app. You may also lodge a complaint with the Brazilian National Data Protection Authority.",
              "The site and the paid license are not directed at children. We do not knowingly collect children's data.",
            ],
          },
        ],
      },
      cookies: {
        kicker: "Cookies",
        title: "Cookie Policy",
        lead: "The site only stores what it needs to work. There are no advertising, social, or audience-measurement cookies.",
        updated: "Effective: October 26, 2026.",
        points: [],
        sections: [
          {
            title: "What stays in this browser",
            paragraphs: [
              "The language you choose stays in this device's local storage, under the key slimplay-locale, until you clear the browser data.",
              "The notice that Slim Play is a neutral player, and the record that you saw this policy, also stay in local storage so they are not shown again.",
              "After list login, a cookie named slimplay-device keeps the session for 12 hours. It is httpOnly: page JavaScript cannot read that value.",
              "After reseller login, the slimplay-reseller cookie keeps the session for 12 hours, also httpOnly.",
            ],
          },
          {
            title: "Why they are necessary",
            paragraphs: [
              "Without the language setting, the site cannot remember your choice. Without the session, the list area and the reseller panel would ask you to sign in at every step.",
              "Because they are necessary for the service you asked for, they do not depend on a separate permission. The notice at the bottom of the screen is there to inform you, and Got it records that you saw it.",
            ],
          },
          {
            title: "How to control them",
            paragraphs: [
              "You can delete cookies and site data in the browser settings. The session ends and the language returns to the default.",
              "Blocking every cookie prevents list login and the reseller panel. Public pages can still be read.",
              "Other data is described in the Privacy Policy. Questions: contato@slimplay.app.",
            ],
          },
        ],
      },
      chromecast: {
        kicker: "Chromecast",
        title: "How to use it on Chromecast",
        lead: "Slim Play plays the list you already have. On Chromecast, use starts from the device where the app is installed.",
        points: [
          "The list is still yours, as M3U or Xtream.",
          "The app does not provide channels, movies, or server access.",
          "Slim Play support covers the player, not your provider's content.",
        ],
        action: { href: "/ativacao", label: "Activate your app" },
      },
      firestick: {
        kicker: "Fire TV",
        title: "How to install on Fire TV",
        lead: "Fire TV Stick runs Android and can run Slim Play. Installation unlocks the player, not a content list.",
        points: [
          "Install Slim Play on the Fire TV Stick.",
          "Activate it with the device MAC, on the activation page.",
          "Upload your own list. Nothing is preloaded.",
        ],
        action: { href: "/ativacao", label: "Activate your app" },
      },
    },
    uploadForm: {
      title: "Load playlist",
      subtitle: "Choose how you want to load your playlist in the app",
      disclaimer:
        "Slim Play only plays the list you upload. We do not host, sell, or provide playlists.",
      tabs: { code: "Code", url: "URL", file: "File", xtream: "Xtream account" },
      mac: "Enter your MAC Address",
      macPlaceholder: "AA:BB:CC:DD:EE:FF",
      device: "Enter your MAC Address or the 6-digit OTP shown on the TV.",
      devicePlaceholder: "MAC or OTP",
      shortCode: "Short playlist code.",
      playlistName: "Playlist name",
      playlistNamePlaceholder: "My List",
      m3uUrl: "Playlist URL (M3U/M3U8)",
      epgUrl: "Playlist EPG URL (Optional)",
      drop: "Drop a .m3u or .m3u8 file",
      dropHint: "or click to choose",
      serverUrl: "Server URL / Host (DNS)",
      username: "Username",
      password: "Password",
      protect: "Protect Playlist",
      setPin: "Set PIN",
      confirmPin: "Confirm PIN",
      captcha: "Confirm you are human",
      refreshCaptcha: "New challenge",
      captchaPlaceholder: "Result",
      submit: "Load / Save list",
      saving: "Saving...",
      successTitle: "List linked successfully!",
      successText: "Restart your app.",
      close: "Close",
      errors: {
        mac: "Enter a valid MAC Address. Example: AA:BB:CC:DD:EE:FF.",
        device: "Enter the MAC Address or the 6-digit OTP shown on the TV.",
        name: "Enter the playlist name.",
        url: "Enter a valid M3U/M3U8 URL starting with http:// or https://.",
        epg: "The EPG URL must start with http:// or https://.",
        file: "Upload a .m3u or .m3u8 file up to 400 KB.",
        server: "Enter the server URL (DNS), starting with http:// or https://.",
        username: "Enter the username.",
        password: "Enter the password.",
        pin: "The PIN must be 4 to 8 digits and match the confirmation.",
        code: "Enter the short playlist code.",
        captcha: "The security challenge does not match. Try again.",
        save: "The list could not be saved. Try again.",
        config: "Upload is unavailable right now.",
      },
    },
    manage: {
      loginTitle: "Sign in to the device",
      loginSubtitle: "Use the MAC address and the key shown in the app.",
      mac: "MAC address",
      deviceKey: "Device key",
      enter: "Sign in",
      entering: "Signing in...",
      panelTitle: "List Upload",
      panelSubtitle: "Lists linked to this device",
      logout: "Sign out",
      addTitle: "Add list",
      empty: "No lists linked to this device.",
      edit: "Edit",
      remove: "Delete",
      cancel: "Cancel",
      confirmDelete: "Delete this list?",
      save: "Save",
      saving: "Saving...",
      saved: "List saved.",
      deleted: "List deleted.",
      keepPassword: "Leave blank to keep the current password",
      show: "Show",
      hide: "Hide",
      fileNote: "File upload is disabled. You can delete this list.",
      types: { code: "Code", url: "M3U URL", xtream: "Xtream Codes", file: "File", unknown: "List" },
      errors: {
        credentials: "Incorrect MAC or device key. Check the credentials in your app.",
        captcha: "The security challenge does not match. Try again.",
        session: "Your session expired. Sign in again.",
        name: "Enter the list name.",
        url: "Enter a valid M3U/M3U8 URL starting with http:// or https://.",
        epg: "The EPG URL must start with http:// or https://.",
        server: "Enter the server URL, starting with http:// or https://.",
        username: "Enter the username.",
        password: "Enter the password.",
        code: "Enter the short list code.",
        missing: "List not found.",
        save: "Could not save. Try again.",
        config: "The panel is unavailable right now.",
      },
    },
    activationCheckout: {
      notice: "Enter the MAC shown in the app. If it is already registered, the R$ 12.00 Pix unlocks the player for 1 year.",
      mac: "Device MAC",
      pay: "Generate Pix",
      paying: "Generating Pix...",
      payTitle: "Pay with Pix",
      expires: "Expires in {time}",
      released: "After payment, activation is released automatically for MAC",
      waiting: "Waiting for the Pix confirmation.",
      paid: "Payment confirmed. The player is activated on this device.",
      refunded: "This payment was refunded.",
      pixCode: "Pix code",
      copy: "Copy Pix code",
      copied: "Code copied",
      history: "I already paid: view purchase history",
      historyTitle: "Purchase history",
      emptyHistory: "No payments found for this MAC.",
      supportTitle: "Need help activating this MAC?",
      supportLead: "Talk to the Slim Play team on Telegram.",
      attention: "Activation unlocks the app only and does not include content. Support for channels, movies, and series goes to your provider.",
      statuses: { pending: "Pending", paid: "Paid", refunded: "Refunded", cancelled: "Cancelled" },
      voucherOption: "Voucher activation",
      voucherBack: "Back to Pix",
      voucherNote: "For store review teams. Enter the voucher and the MAC shown in the app. There is no charge, and the license lasts 1 year.",
      voucher: "Voucher",
      voucherAction: "Activate with voucher",
      voucherWorking: "Activating...",
      voucherDone: "Voucher accepted. The player is activated on this device for 1 year.",
      errors: {
        mac: "Enter the device MAC as AA:BB:CC:DD:EE:FF.",
        unknown: "This MAC is not registered. Open the app on that device and try again.",
        voucher: "Incorrect voucher.",
        captcha: "The security challenge does not match. Try again.",
        save: "The charge could not be created. Try again.",
        unavailable: "Payment is not available yet.",
        config: "Activation is unavailable right now.",
      },
    },
    resellerPanel: {
      loginTitle: "Reseller panel",
      loginSubtitle: "Resale covers the player license. Each credit activates one MAC for 1 year.",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      passwordMismatch: "The passwords do not match.",
      signupTitle: "Reseller signup",
      signupSubtitle: "Create an account to activate devices with credits. It starts with no credits.",
      signupNote: "Each credit, once purchases are available, activates one MAC for 1 year.",
      signup: "Create account",
      signingUp: "Creating account...",
      haveAccount: "I already have an account",
      needAccount: "Create a reseller account",
      enter: "Sign in",
      entering: "Signing in...",
      welcome: "Welcome to your panel",
      credits: "Credits",
      buy: "Buy credits",
      dashboard: "Dashboard",
      devices: "Devices",
      subs: "Reseller list",
      home: "Back to home",
      logout: "Sign out",
      total: "Total activations",
      today: "Activations today",
      month: "Activations this month",
      resellerCount: "Resellers",
      spent: "Credits spent (total)",
      searchDevices: "Search by MAC or comment",
      searchSubs: "Search by name or email",
      search: "Search",
      refresh: "Refresh",
      activate: "Activate device",
      add: "Add",
      emptyDevices: "No devices found.",
      emptySubs: "No sub-reseller found.",
      renew: "Renew",
      mac: "Device MAC",
      comment: "Comment",
      commentPlaceholder: "Optional",
      activateNote: "1 credit unlocks the player on this MAC for 1 year. No list or content is included.",
      confirmActivate: "Activate for 1 year",
      activating: "Activating...",
      activated: "Device activated for 1 year.",
      buyTitle: "Buy credits",
      buyLead: "Choose a credit pack (activations).",
      buyAction: "Buy",
      buyLater: "Credit purchases open once the site is hosted and payment is connected.",
      buyPaid: "Payment confirmed. The credits are in the account.",
      pixCode: "Pix code",
      copy: "Copy Pix code",
      copied: "Code copied",
      waiting: "Waiting for the Pix confirmation.",
      packCredits: "{count} credits",
      priceLabel: "PRICE IN BRL",
      close: "Close",
      menu: "Open menu",
      subTitle: "Add reseller",
      subLead: "The sub-reseller starts with credits transferred from your account.",
      phone: "Phone",
      transfer: "Credits to transfer",
      create: "Add",
      creating: "Adding...",
      created: "Sub-reseller added.",
      columns: {
        id: "ID",
        mac: "MAC",
        comment: "Comment",
        expires: "Expires",
        package: "Package",
        actions: "Actions",
        name: "Name",
        email: "Email",
        phone: "Phone",
        credits: "Credits",
      },
      errors: {
        credentials: "Incorrect email or password.",
        captcha: "The security challenge does not match. Try again.",
        session: "Your session expired. Sign in again.",
        credits: "Not enough credits.",
        mac: "Enter the MAC as AA:BB:CC:DD:EE:FF.",
        device: "This MAC is already linked to another reseller.",
        email: "Enter a valid email that is not already in use.",
        name: "Enter the name.",
        phone: "Enter a valid phone number.",
        password: "The password must be at least 8 characters.",
        save: "Could not finish. Try again.",
        config: "The panel is unavailable right now.",
        unavailable: "Pix is not available yet.",
      },
    },
    contact: {
      kicker: "Contact",
      title: "Talk to Slim Play",
      lead: "Questions about the license, the app, or the account. Slim Play does not support third-party lists, channels, or content.",
      emailLabel: "Email",
      telegramLabel: "Telegram",
      telegramText: "Open chat",
      formTitle: "Send a message",
      name: "Name",
      email: "Email",
      message: "Message",
      messagePlaceholder: "How can we help?",
      captcha: "Confirm that you are human",
      submit: "Send message",
      sending: "Sending...",
      successTitle: "Message sent",
      successText: "We received your request and will reply to the email you entered.",
      errors: {
        name: "Enter your name.",
        email: "Enter a valid email.",
        message: "Write a message of at least 10 characters.",
        captcha: "Confirm that you are human.",
        save: "Could not send right now. Use email or Telegram.",
      },
    },
    notFound: {
      title: "Page not found",
      text: "This address is not part of the Slim Play site.",
      action: "Back to home",
    },
  },
};
