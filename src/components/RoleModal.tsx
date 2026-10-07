// Define a diretiva para execução no cliente
"use client";

// Importa o React e os hooks de estado
import React, { useState } from "react";
// Importa o Framer Motion para animações
import { motion, AnimatePresence } from "framer-motion";
// Importa o novo componente isolado para visualização de habilidades
import { RoleSkillsView } from "./RoleSkillsView";
// Importa os ícones para os botões de alternância de layout e alvo
import { LayoutGrid, List } from "lucide-react";
// Importa a tela de detalhes da disciplina
import { SkillDetailView } from "./SkillDetailView";
// Importa a tela de detalhes da profissão
import { RoleDetailView } from "./RoleDetailView";
// Importa utilitário de combinação de classes
import { cn } from "@/lib/utils";
import { useSkillStore } from "@/store/useSkillStore";
import { CAREER_DATA, ALL_SKILLS, Skill } from "@/data/rolesData";

// Interface de propriedades do modal de detalhes da profissão
interface RoleModalProps {
  // Nome da profissão selecionada
  role: string;
  // Callback opcional para fechar o modal
  onClose?: () => void;
}

// Componente RoleModal
export function RoleModal({ role, onClose }: RoleModalProps) {
  // Busca a lista de IDs de habilidades para a profissão
  let skillIds: string[] = [];
  // Nome da categoria à qual a carreira pertence
  let categoryName = "Carreira em TI";
  // Itera pelas categorias de carreiras cadastradas
  for (const category of CAREER_DATA) {
    // Procura a profissão correspondente
    const foundRole = category.roles.find((r) => r.name === role);
    // Se encontrou a profissão
    if (foundRole) {
      // Define a lista de IDs das skills exigidas
      skillIds = foundRole.skills;
      // Define o nome da categoria
      categoryName = category.category;
      // Interrompe o loop
      break;
    }
  }

  // Fallback caso a profissão não tenha skills cadastradas
  if (skillIds.length === 0) {
    // IDs de habilidades padrão
    skillIds = ["logica", "git", "cleancode", "arquitetura"];
  }

  // Mapeia os IDs para os objetos reais de Skill definidos em ALL_SKILLS
  const skills: Skill[] = skillIds.map((id) => ALL_SKILLS[id]).filter(Boolean);

  // Estado que gerencia o modo atual de visualização: grid (padrão) ou list (lista expandida)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Estado para armazenar a skill selecionada para a tela de detalhes (Drill-down)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  // Estado para controlar a exibição dos detalhes da profissão
  const [showRoleDetail, setShowRoleDetail] = useState(false);
  // Estado para registrar se o usuário selecionou a trilha de carreira (agora derivado do estado global)
  const activeRole = useSkillStore((state) => state.activeRole);
  const setActiveRole = useSkillStore((state) => state.setActiveRole);
  const setCareerTrail = useSkillStore((state) => state.setCareerTrail);

  const isCareerSelected = activeRole === role;

  // Efeito para resetar a seleção caso o modal feche ou mude de profissão
  React.useEffect(() => {
    // Reseta a skill selecionada ao trocar de carreira
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSkill(null);
    // Reseta a tela de detalhes da carreira
    setShowRoleDetail(false);
  }, [role]);

  // Função para alternar a seleção da carreira globalmente
  const toggleCareerSelection = () => {
    if (isCareerSelected) {
      // Se já está selecionada, desmarca
      setActiveRole(null);
      setCareerTrail([]);
    } else {
      // Se não está, marca como ativa e traça o caminho
      setActiveRole(role);
      setCareerTrail(skillIds);
    }
  };

  // Retorna o JSX do tooltip/modal
  return (
    // Div animada flutuante fixada à direita do SidePanel
    <motion.div
      // Animação de surgimento com opacidade, escala e deslocamento lateral
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      // Estado visível animado
      animate={{ opacity: 1, scale: 1, x: 0 }}
      // Estado de saída
      exit={{ opacity: 0, scale: 0.95, x: -5 }}
      // Transição suave de entrada
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      // Posicionamento absoluto à direita e topo alinhado com o SidePanel
      className="fixed z-50 overflow-hidden flex flex-col bg-[#161c23]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] bottom-0 left-0 right-0 w-full h-[70vh] rounded-t-3xl md:h-[400px] md:min-h-[400px] md:max-h-[400px] md:w-[380px] md:min-w-[380px] md:max-w-[380px] md:rounded-2xl p-5 md:top-24 md:left-[356px] md:bottom-auto md:right-auto"
    >
      {/* Transição de tela entre lista de skills, detalhes da disciplina e detalhes da profissão */}
      <AnimatePresence mode="wait">
        {selectedSkill ? (
          // Componente de visualização aprofundada da disciplina com suporte a fechar
          <SkillDetailView
            key="detail"
            skill={selectedSkill}
            onBack={() => setSelectedSkill(null)}
            onClose={onClose}
          />
        ) : showRoleDetail ? (
          // Componente de visualização aprofundada do que a profissão faz
          <RoleDetailView
            key="role-detail"
            role={role}
            categoryName={categoryName}
            skills={skills}
            onBack={() => setShowRoleDetail(false)}
            onClose={onClose}
            onSelectRole={() => {
              setActiveRole(role);
              setCareerTrail(skillIds);
              setShowRoleDetail(false);
            }}
          />
        ) : (
          // Visualização da lista de habilidades da carreira
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full w-full"
          >
            {/* Cabeçalho do modal tooltip com mais espaço, ícone de interrogação e botões de modo de visão */}
            <div className="flex justify-between items-start mb-5 shrink-0">
              {/* Título da profissão com tracking levemente expandido e ícone de alvo condicional */}
              <div className="flex items-center gap-2 mt-1 pr-2">
                <h3 className="text-[15px] font-bold text-white/95 truncate tracking-wide">
                  {role}
                </h3>
              </div>

              {/* Container para botões de ação e visualização */}
              <div className="flex items-center gap-1 md:gap-3">
                {/* Ícone de interrogação com tooltip de ajuda (apenas md) */}
                <div className="relative group hidden md:flex items-center justify-center shrink-0">
                  <div className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-help transition-colors text-[11px] font-bold text-zinc-300">
                    ?
                  </div>
                  <div className="absolute right-0 -bottom-12 w-44 p-2 bg-[#212930] text-[11px] text-center text-zinc-300 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#28313A] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-tight">
                    Disciplinas necessárias para seguir essa carreira
                  </div>
                </div>

                {/* Botões para trocar o formato de visualização entre grid e lista */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5 shrink-0">
                  {/* Botão Modo Grid (Cards alinhados lado a lado) */}
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 md:p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white/15 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
                    title="Visualização em Grade"
                  >
                    <LayoutGrid className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                  {/* Botão Modo Lista (Cards expandidos empilhados verticalmente) */}
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 md:p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white/15 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
                    title="Visualização em Lista Expandida"
                  >
                    <List className="w-4 h-4 md:w-3.5 md:h-3.5 " />
                  </button>
                </div>
                {/* Botão de Fechar para Mobile (já que clicar fora é difícil) */}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 md:hidden flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                  >
                    <span className="font-bold text-zinc-300">X</span>
                  </button>
                )}
              </div>
            </div>

            {/* Linha clarinha de divisória acima dos cards */}
            <div className="w-full h-px bg-white/10 mb-4 shrink-0" />

            {/* Componente separado que gerencia a exibição e rolagem das skills baseada no viewMode */}
            <RoleSkillsView skills={skills} viewMode={viewMode} onSkillClick={setSelectedSkill} />

            {/* Contêiner de ações fixado no canto inferior direito do modal */}
            <div className="mt-auto pt-3 flex items-center justify-end gap-2 shrink-0">
              {/* Botão 'Ver detalhes' que abre a tela RoleDetailView com os detalhes da carreira */}
              <button
                onClick={() => setShowRoleDetail(true)}
                className="h-11 md:h-auto px-4 md:px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Ver detalhes
              </button>

              {/* Botão de destaque 'Quero aprender essa profissão' com alternância de estado */}
              <button
                onClick={toggleCareerSelection}
                className={cn(
                  "h-11 md:h-auto px-5 md:px-3 py-1 text-[11px] font-bold border rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center",
                  isCareerSelected
                    ? "bg-yellow-400 text-white border-yellow-400/40 "
                    : "text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400  border-emerald-400/40 "
                )}
              >
                {isCareerSelected ? "Trilha Selecionada" : "Quero aprender"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
