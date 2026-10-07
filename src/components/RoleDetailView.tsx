// Define a diretiva para execução no cliente
"use client";

// Importa o React e hooks necessários
import React from "react";
// Importa o Framer Motion para animações fluidas de transição
import { motion } from "framer-motion";
// Importa ícones temáticos da biblioteca Lucide React
import {
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Layers,
  Rocket,
  Code,
  Database,
  Layout,
  Smartphone,
  Server,
  Brain,
  ShieldCheck,
  Settings,
  Target,
  Lightbulb,
  Gamepad2,
  Briefcase,
} from "lucide-react";
// Importa a tipagem de Skill
import { Skill } from "@/data/rolesData";

// Interface para definir as propriedades recebidas pela tela de detalhes da carreira
interface RoleDetailViewProps {
  // Nome da profissão (ex: "Desenvolvedor Back-end")
  role: string;
  // Categoria à qual a profissão pertence (ex: "Desenvolvimento Web e Mobile")
  categoryName?: string;
  // Lista de disciplinas da grade associadas a essa profissão
  skills: Skill[];
  // Callback para retornar à lista de habilidades
  onBack: () => void;
  // Callback opcional para fechar o modal completamente
  onClose?: () => void;
  // Callback acionado ao clicar em "Quero aprender essa profissão"
  onSelectRole?: () => void;
}

// Mapa de informações profissionais detalhadas para cada carreira
const ROLE_DEFINITIONS: Record<
  string,
  {
    description: string;
    responsibilities: string[];
    icon: React.ElementType;
    badge: string;
  }
> = {
  "Desenvolvedor Front-end": {
    description:
      "Cria as interfaces visuais, telas responsivas e experiências interativas com as quais os usuários navegam diretamente, unindo código moderno, acessibilidade e design.",
    responsibilities: [
      "Desenvolvimento de telas reativas e fluidas",
      "Integração contínua com APIs e serviços back-end",
      "Otimização de velocidade, acessibilidade e SEO",
    ],
    icon: Layout,
    badge: "Foco no Usuário",
  },
  "Desenvolvedor Back-end": {
    description:
      "Projeta e desenvolve os motores lógicos dos sistemas: APIs, regras de negócios e bancos de dados, assegurando alto desempenho, integridade e segurança.",
    responsibilities: [
      "Construção de APIs RESTful e microsserviços",
      "Modelagem e otimização de bancos de dados",
      "Autenticação segura e proteção de dados críticos",
    ],
    icon: Server,
    badge: "Lógica e Segurança",
  },
  "Desenvolvedor Fullstack": {
    description:
      "Domina tanto o desenvolvimento de interfaces (front-end) quanto os serviços de suporte e dados (back-end), tendo visão holística de todo o ciclo de software.",
    responsibilities: [
      "Construção de sistemas completos do início ao fim",
      "Integração perfeita entre interface e banco de dados",
      "Prototipagem ágil e implantação de soluções",
    ],
    icon: Code,
    badge: "Visão Completa",
  },
  "Desenvolvedor Mobile": {
    description:
      "Cria aplicativos para smartphones e tablets (Android e iOS), focando em navegação por toque fluida, baixo consumo de bateria e integração com recursos do aparelho.",
    responsibilities: [
      "Desenvolvimento de apps nativos e multiplataforma",
      "Integração com sensores, câmeras e GPS",
      "Publicação e manutenção nas lojas Google Play e App Store",
    ],
    icon: Smartphone,
    badge: "Ecossistema Mobile",
  },
  "Cientista / Analista de Dados": {
    description:
      "Descobre correlações, padrões e respostas estratégicas em grandes volumes de dados para apoiar tomadas de decisão e antecipar tendências de mercado.",
    responsibilities: [
      "Análise exploratória e mineração de dados",
      "Construção de painéis e relatórios visuais inteligentes",
      "Modelagem estatística preditiva para empresas",
    ],
    icon: Target,
    badge: "Tomada de Decisão",
  },
  "Engenheiro de Dados": {
    description:
      "Constrói pipelines escaláveis, data lakes e arquiteturas de fluxo contínuo de dados para alimentar plataformas analíticas e inteligências artificiais com segurança.",
    responsibilities: [
      "Estruturação de pipelines de dados em tempo real",
      "Gerenciamento de bancos SQL, NoSQL e Big Data",
      "Garantia de consistência, qualidade e governança",
    ],
    icon: Database,
    badge: "Big Data e Infra",
  },
  "Especialista em Machine Learning": {
    description:
      "Desenvolve e treina modelos matemáticos e redes neurais que aprendem com dados históricos para resolver desafios complexos de previsão e automação cognitiva.",
    responsibilities: [
      "Treinamento e ajuste fino de algoritmos inteligentes",
      "Processamento de visão computacional e linguagem natural",
      "Implantação e monitoramento de modelos em produção",
    ],
    icon: Brain,
    badge: "Inteligência Artificial",
  },
  "Arquiteto de Software": {
    description:
      "Define a estrutura tecnológica, padrões de projeto e diretrizes de sistemas de alta complexidade, balanceando custo, escalabilidade e facilidade de manutenção.",
    responsibilities: [
      "Planejamento de arquiteturas distribuídas e microsserviços",
      "Escolha estratégica de linguagens e tecnologias",
      "Garantia de alta resiliência e disponibilidade de sistemas",
    ],
    icon: Settings,
    badge: "Estratégia Técnica",
  },
  "Analista de Qualidade (QA)": {
    description:
      "Garante que o software funcione sem falhas e cumpra todos os requisitos de segurança e usabilidade por meio de testes automatizados e integração contínua.",
    responsibilities: [
      "Criação e execução de testes automatizados de ponta a ponta",
      "Identificação precoce de vulnerabilidades e bugs",
      "Garantia de confiabilidade e conformidade do produto",
    ],
    icon: ShieldCheck,
    badge: "Qualidade de Software",
  },
  "SysAdmin / DevOps": {
    description:
      "Automatiza a integração e entrega contínua (CI/CD), gerencia servidores e nuvens (Cloud) para assegurar que os sistemas estejam sempre no ar e operando rápido.",
    responsibilities: [
      "Automação de deploys e esteiras de integração contínua",
      "Gerenciamento de infraestrutura em nuvem e containers",
      "Monitoramento contínuo e mitigação rápida de incidentes",
    ],
    icon: Server,
    badge: "Nuvem e Automação",
  },
  "Product Manager (PM)": {
    description:
      "Lidera a visão e estratégia de produtos digitais, alinhando as necessidades dos usuários aos objetivos do negócio e orientando as prioridades da equipe de desenvolvimento.",
    responsibilities: [
      "Mapeamento e priorização de novas funcionalidades",
      "Alinhamento entre clientes, executivos e desenvolvedores",
      "Acompanhamento de métricas de engajamento e valor entregue",
    ],
    icon: Sparkles,
    badge: "Gestão de Produto",
  },
  "Gerente de Projetos": {
    description:
      "Orquestra prazos, recursos e equipes multidisciplinares com metodologias ágeis para garantir que os projetos de tecnologia sejam entregues com qualidade e pontualidade.",
    responsibilities: [
      "Planejamento e acompanhamento de cronogramas ágeis",
      "Facilitação de ritos diários e resolução de impedimentos",
      "Comunicação clara de progresso com os clientes",
    ],
    icon: Briefcase,
    badge: "Liderança Ágil",
  },
  "Empreendedor de TI": {
    description:
      "Transforma ideias inovadoras em startups escaláveis e produtos tecnológicos de sucesso, construindo modelos de negócio sustentáveis no mercado digital.",
    responsibilities: [
      "Validação ágil de novos modelos de negócios e MVPs",
      "Gestão financeira, captação de parceiros e clientes",
      "Liderança na criação de soluções tecnológicas inovadoras",
    ],
    icon: Lightbulb,
    badge: "Inovação e Startups",
  },
  "Desenvolvedor de Jogos": {
    description:
      "Programa a física, jogabilidade, inteligência artificial e efeitos interativos de jogos digitais para computadores, consoles e smartphones.",
    responsibilities: [
      "Desenvolvimento de mecânicas de jogo e loops de gameplay",
      "Programação de física interativa e IA para personagens",
      "Otimização de consumo de memória e taxa de quadros (FPS)",
    ],
    icon: Gamepad2,
    badge: "Criação de Jogos",
  },
};

// Componente para exibir os detalhes do que a profissão faz
export function RoleDetailView({
  role,
  categoryName = "Área de Tecnologia",
  skills,
  onBack,
  onClose,
  onSelectRole,
}: RoleDetailViewProps) {
  // Recupera as informações detalhadas da carreira cadastrada ou aplica fallback informativo
  const details = ROLE_DEFINITIONS[role] || {
    description:
      "Atua no ecossistema de tecnologia aplicando competências teóricas e práticas desenvolvidas ao longo das disciplinas da grade do IFMG.",
    responsibilities: [
      "Desenvolvimento e sustentação de soluções digitais",
      "Aplicação de boas práticas de engenharia e código limpo",
      "Resolução de problemas práticos com tecnologia",
    ],
    icon: Rocket,
    badge: "Carreira em TI",
  };

  // Ícone específico da carreira
  const RoleIcon = details.icon;

  // Renderiza a estrutura alinhada ao design de SkillDetailView e compatível com 380x400
  return (
    // Container animado com tipografia sans-serif garantida
    <motion.div
      initial={{ opacity: 0, y: 6 }} // Animação sutil de entrada
      animate={{ opacity: 1, y: 0 }} // Estado ativo
      exit={{ opacity: 0, y: -6 }} // Saída suave
      transition={{ duration: 0.18, ease: "easeOut" }} // Transição rápida
      className="flex flex-col h-full w-full select-none"
      style={{
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Cabeçalho compacto com botão de voltar, título e fechar */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/[0.08] shrink-0">
        {/* Lado esquerdo com botão voltar e contexto */}
        <div className="flex items-center gap-2">
          {/* Botão de retorno à grade de matérias */}
          <button
            onClick={onBack}
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
            title="Voltar às disciplinas"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>

          {/* Título do cabeçalho */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block leading-none">
              Carreira Profissional
            </span>
            <h3 className="text-[12.5px] font-bold text-white tracking-tight mt-0.5">
              O que essa profissão faz
            </h3>
          </div>
        </div>

        {/* Botão de fechar o modal completamente */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/[0.04]"
            title="Fechar modal"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Conteúdo central com rolagem personalizada */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col items-center text-center custom-scrollbar">
        {/* Hero Card com Ícone Luminoso da Carreira (44x44) */}
        <div className="relative my-1 shrink-0">
          {/* Brilho radial de fundo verde esmeralda */}
          <div
            className="absolute inset-0 rounded-xl blur-lg opacity-50 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, transparent 70%)",
            }}
          />

          {/* Container do ícone com acabamento cyber/glassmorphic */}
          <div className="relative w-11 h-11 rounded-xl flex items-center justify-center border bg-gradient-to-b from-[#132e22] to-[#0c1c15] border-emerald-500/40 text-emerald-400 ">
            <RoleIcon className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </div>

        {/* Título da Profissão */}
        <h2 className="text-[14.5px] font-extrabold text-white tracking-tight leading-snug px-1 mb-1.5 shrink-0">
          {role}
        </h2>

        {/* Linha com badges temáticas da carreira com border-radius mínimo */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 shrink-0">
          {/* Badge da Área / Categoria com cantos quase retos (3px) */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <Layers className="w-2.5 h-2.5 text-sky-400" />
            {categoryName}
          </span>

          {/* Badge de Destaque da Carreira com cantos quase retos (3px) */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            {details.badge}
          </span>

          {/* Badge com quantidade de matérias recomendadas com cantos quase retos (3px) */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
            {skills.length} Disciplinas no curso
          </span>
        </div>

        {/* Cartão de descrição da profissão e principais atividades */}
        <div className="w-full bg-[#101419]/70 border border-white/[0.06] rounded-lg p-2.5 text-left mb-1 flex flex-col gap-1.5 max-h-[115px] overflow-y-auto custom-scrollbar">
          {/* Texto de descrição do que o profissional faz */}
          <p className="text-[11px] text-zinc-300/90 leading-relaxed font-normal">
            {details.description}
          </p>

          {/* Principais atividades práticas da profissão */}
          <div className="pt-1.5 border-t border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/90 block mb-1">
              Principais Atividades:
            </span>
            <ul className="flex flex-col gap-1">
              {details.responsibilities.map((resp, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-[10px] text-zinc-300 leading-tight"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Ação de rodapé: Botão 'Quero aprender essa profissão' */}
      <div className="pt-2 mt-auto border-t border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
        {/* Botão para voltar e ver as matérias da profissão */}
        <button
          onClick={onBack}
          className="h-11 md:h-[34px] px-3 rounded-lg font-semibold text-[11px] text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer"
        >
          Ver Disciplinas
        </button>

        {/* Botão de destaque afirmativo */}
        <button
          onClick={() => {
            if (onSelectRole) onSelectRole();
            else onBack();
          }}
          className="flex-1 h-11 md:h-[34px] flex items-center justify-center gap-1.5 px-3 rounded-lg font-extrabold text-[11px] uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 active:scale-[0.98] cursor-pointer shadow-[0_0_18px_rgba(52,211,153,0.3)] transition-all"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Quero aprender</span>
        </button>
      </div>
    </motion.div>
  );
}
