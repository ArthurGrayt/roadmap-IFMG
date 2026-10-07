// Importa o React para construção do componente
import React from "react";
// Importa o Framer Motion para animações de entrada e interação
import { motion } from "framer-motion";
// Importa ícones representativos da biblioteca Lucide React
import { ArrowLeft, Crosshair, X, BookOpen, Layers, CheckCircle2, Clock } from "lucide-react";
// Importa a tipagem de Skill usada nas carreiras
import { Skill } from "@/data/rolesData";
// Importa a lista detalhada de disciplinas configuradas para enriquecer os dados
import { SKILLS } from "@/data/skills-config";
// Importa o hook seguro do React Flow
import { useReactFlow } from "@xyflow/react";
// Importa utilitário de combinação de classes
import { cn } from "@/lib/utils";
import { useSkillStore } from "@/store/useSkillStore";

// Interface com as propriedades recebidas pelo componente
interface SkillDetailViewProps {
  // Dados da habilidade/disciplina selecionada
  skill: Skill;
  // Callback para retornar à lista de habilidades
  onBack: () => void;
  // Callback opcional para fechar o modal completamente
  onClose?: () => void;
}

// Componente para exibição compacta, refinada e perfeitamente ajustada ao tamanho fixo de 380x400
export function SkillDetailView({ skill, onBack, onClose }: SkillDetailViewProps) {
  // Busca as configurações oficiais da matéria a partir do seu ID
  const config = SKILLS.find((s) => s.id === skill.id);

  // Determina o rótulo do período acadêmico
  const periodLabel = config?.period || (config?.level ? `${config.level}º Período` : "Geral");
  // Determina se a disciplina é obrigatória ou optativa
  const categoryLabel = config?.category === "optativa" ? "Optativa" : "Obrigatória";

  // Utiliza a store para saber se a disciplina já foi adquirida
  const isAcquired = useSkillStore((state) => state.acquiredSkills.has(skill.id));

  // Identifica a lista de pré-requisitos lógicos ou oficiais
  const prereqIds =
    config?.logicalPrerequisites && config.logicalPrerequisites.length > 0
      ? config.logicalPrerequisites
      : config?.officialPrerequisites || [];

  // Mapeia os IDs dos pré-requisitos para os seus nomes legíveis
  const prereqNames = prereqIds.map((id) => {
    // Procura a disciplina correspondente ao pré-requisito
    const found = SKILLS.find((s) => s.id === id);
    // Retorna o nome formatado ou o ID como fallback
    return found ? found.name : id;
  });

  // Descrição detalhada da matéria com fallback informativo
  const description =
    skill.description ||
    config?.notes ||
    "Disciplina que desenvolve conceitos teóricos e práticos essenciais para a sua formação acadêmica.";

  // Hook do React Flow para acesso direto às funções de viewport
  const reactFlow = useReactFlow();

  // Função disparada ao clicar no botão "Achar Disciplina"
  const handleFindSkill = () => {
    // Fecha o modal imediatamente para liberar a visualização completa do mapa
    if (onClose) {
      // Fecha o modal da carreira
      onClose();
    } else {
      // Retorna a visualização anterior
      onBack();
    }

    // Dispara evento global customizado para que o mapa navegue até o nó com zoom máximo
    window.dispatchEvent(
      new CustomEvent("focus-skill-node", {
        detail: { skillId: skill.id },
      })
    );

    // Se o hook do React Flow estiver disponível diretamente
    if (reactFlow) {
      // Localiza o nó na árvore
      const node = reactFlow.getNode(skill.id);
      // Se encontrou o nó alvo
      if (node) {
        // Largura base do cartão
        const width = node.measured?.width ?? 140;
        // Altura base do cartão
        const height = node.measured?.height ?? 140;
        // Calcula a posição central horizontal
        const cx = node.position.x + width / 2;
        // Calcula a posição central vertical
        const cy = node.position.y + height / 2;
        // Centraliza a visão na matéria e aplica o zoom máximo de 1.5
        reactFlow.setCenter(cx, cy, { zoom: 1.5, duration: 1100 });
      }
    }
  };

  // Renderiza a estrutura do modal compactada para 380x400
  return (
    // Container animado com estilo sans-serif garantido e transição suave
    <motion.div
      initial={{ opacity: 0, y: 6 }} // Estado inicial de entrada
      animate={{ opacity: 1, y: 0 }} // Estado visível animado
      exit={{ opacity: 0, y: -6 }} // Estado de saída
      transition={{ duration: 0.18, ease: "easeOut" }} // Curva suave rápida
      className="flex flex-col h-full w-full select-none"
      style={{
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Cabeçalho compacto com botão de voltar, título e botão de fechar */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/[0.08] shrink-0">
        {/* Lado esquerdo com botão voltar e contexto */}
        <div className="flex items-center gap-2">
          {/* Botão de voltar com micro-interação */}
          <button
            onClick={onBack}
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>

          {/* Título do cabeçalho */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400 block leading-none">
              Disciplina
            </span>
            <h3 className="text-[12.5px] font-bold text-white tracking-tight mt-0.5">
              Detalhes da Matéria
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

      {/* Conteúdo central otimizado para não estourar os 400px de altura total */}
      <div className="flex-1 overflow-y-auto  pt-4 pr-1 flex flex-col items-center text-center custom-scrollbar">
        {/* Hero Card com Ícone Luminoso em tamanho reduzido (44x44) */}
        <div className="relative my-1 shrink-0">
          {/* Brilho radial de fundo */}
          <div
            className="absolute inset-0 rounded-xl blur-lg opacity-50 pointer-events-none"
            style={{
              background: isAcquired
                ? "radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)",
            }}
          />

          {/* Container do ícone com acabamento cyber/glassmorphic */}
          <div
            className={cn(
              "relative w-11 h-11 rounded-xl flex items-center justify-center border",
              isAcquired
                ? "bg-gradient-to-b from-[#132e22] to-[#0c1c15] border-emerald-500/40 text-emerald-400"
                : "bg-gradient-to-b from-[#1c2633] to-[#121922] border-sky-500/30 text-sky-400"
            )}
          >
            <skill.icon className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </div>

        {/* Título da Disciplina */}
        <h2 className="text-[14.5px] pt-2 font-extrabold text-white tracking-tight leading-snug px-1 mb-1.5 shrink-0">
          {skill.title}
        </h2>

        {/* Linha com badges de status e período com border-radius mínimo */}
        <div className="flex flex-wrap pt-2 items-center justify-center gap-1.5 mb-2 shrink-0">
          {/* Badge de Período com cantos quase retos (3px) */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <Layers className="w-2.5 h-2.5 text-sky-400" />
            {periodLabel}
          </span>

          {/* Badge de Categoria com cantos quase retos (3px) */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <BookOpen className="w-2.5 h-2.5 text-violet-400" />
            {categoryLabel}
          </span>

          {/* Badge de Status Atual com cantos quase retos (3px) */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[9.5px] font-bold tracking-wide border",
              isAcquired
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-800/80 text-zinc-300 border-white/10"
            )}
          >
            {isAcquired ? (
              // Concluída com indicador verde
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Concluída
              </>
            ) : (
              // Pendente com ícone de relógio
              <>
                <Clock className="w-2.5 h-2.5 text-zinc-400" />
                Pendente
              </>
            )}
          </span>
        </div>

        {/* Cartão de descrição e pré-requisitos ajustado com rolagem própria se necessário */}
        <div className="w-full mt-2 bg-[#101419]/70 border border-white/[0.06] rounded-lg p-2.5 text-left mb-1 flex flex-col gap-1.5 max-h-[110px] overflow-y-auto custom-scrollbar">
          {/* Texto de descrição */}
          <p className="text-[11px] text-zinc-300/90 leading-relaxed font-normal">{description}</p>

          {/* Seção de pré-requisitos */}
          {prereqNames.length > 0 ? (
            <div className="pt-1.5 border-t border-white/[0.06]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Pré-requisitos:
              </span>
              <div className="flex flex-wrap gap-1">
                {prereqNames.map((req, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[9.5px] font-medium text-zinc-300"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-1 border-t border-white/[0.04]">
              <span className="text-[9.5px] text-emerald-400/90 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Sem pré-requisitos necessários
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ação de rodapé: Botão 'Achar Disciplina' ajustado para altura compacta (34px) */}
      <div className="pt-2 mt-auto border-t border-white/[0.08] flex justify-center shrink-0">
        <button
          onClick={handleFindSkill}
          className="group relative w-full h-11 md:h-[35px] flex items-center justify-center gap-2 px-4 rounded-lg font-extrabold text-[11.5px] uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 active:scale-[0.98] cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all"
        >
          {/* Ícone de mira com tamanho calibrado */}
          <Crosshair className="w-3.5 h-3.5" />
          <span>Achar Disciplina</span>
        </button>
      </div>
    </motion.div>
  );
}
