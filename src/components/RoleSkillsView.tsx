// Define a diretiva para execução no cliente
"use client";

// Importa o React e hooks de estado
import React, { useState } from "react";
// Importa o componente DiamondCard para a visualização em grade
import { DiamondCard } from "./diamond-card";
// Importa o Framer Motion para transição suave de troca de modos
import { motion, AnimatePresence } from "framer-motion";
// Importa o tipo Skill das carreiras
import { Skill } from "@/data/rolesData";
// Importa utilitário de combinação de classes
import { cn } from "@/lib/utils";
import { useSkillStore } from "@/store/useSkillStore";

// Interface para definir as propriedades do componente de visualização de skills
interface RoleSkillsViewProps {
  // Lista de habilidades pertencentes à carreira
  skills: Skill[];
  // Modo de exibição: "grid" (losangos compactos) ou "list" (cards em lista)
  viewMode: "grid" | "list";
  // Callback executado ao clicar em uma disciplina para abrir detalhes
  onSkillClick?: (skill: Skill) => void;
}

// Componente isolado com alta performance e fluidez para listar habilidades da profissão
export function RoleSkillsView({ skills, viewMode, onSkillClick }: RoleSkillsViewProps) {
  // Estado que armazena qual disciplina está sob o cursor do mouse
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const acquiredSkills = useSkillStore((state) => state.acquiredSkills);

  // Manipulador para registrar o ID da matéria em foco no hover
  const handleMouseEnter = (skillId: string) => {
    // Atualiza o estado da habilidade em foco
    setHoveredSkillId(skillId);
  };

  // Manipulador para limpar o foco ao retirar o mouse
  const handleMouseLeave = () => {
    // Reseta o estado para nenhum item em foco
    setHoveredSkillId(null);
  };

  // Renderiza o container com altura fixa de 220px e barra de rolagem customizada
  return (
    // Container externo com altura flexível no mobile e fixa no desktop
    <div className="relative flex flex-col flex-1 h-full max-h-[50vh] md:h-[220px] md:max-h-[220px] md:flex-none shrink-0 w-full select-none">
      {/* Contêiner de rolagem suave para navegar entre as disciplinas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 h-full w-full">
        {/* Animação suave na transição entre o modo Grade e Lista */}
        <AnimatePresence mode="wait">
          {/* Visualização em modo Grade (Grid de Losangos) */}
          {viewMode === "grid" ? (
            // Contêiner animado do grid com transição suave
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.96 }} // Entrada sutil
              animate={{ opacity: 1, scale: 1 }} // Estado ativo
              exit={{ opacity: 0, scale: 0.96 }} // Saída
              transition={{ duration: 0.18, ease: "easeOut" }} // Curva rápida e sem travamento
              className="flex flex-wrap gap-3 p-1"
            >
              {/* Itera sobre as skills da carreira */}
              {skills.map((skill) => {
                // Determina se o card atual deve ser atenuado
                const isFaded = hoveredSkillId !== null && hoveredSkillId !== skill.id;

                // Retorna o item do grid
                return (
                  // Div com transição nativa de CSS para máxima fluidez a 120 FPS
                  <div
                    key={skill.id}
                    className={cn(
                      "relative group cursor-pointer w-[44px] h-[44px] flex items-center justify-center flex-shrink-0 transition-opacity duration-150",
                      isFaded ? "opacity-30" : "opacity-100", // Atenuação sem delay assíncrono
                      hoveredSkillId === skill.id ? "z-50" : "z-10" // Eleva z-index no hover
                    )}
                    onMouseEnter={() => handleMouseEnter(skill.id)} // Ativa hover
                    onMouseLeave={handleMouseLeave} // Desativa hover
                    onClick={() => onSkillClick && onSkillClick(skill)} // Dispara clique
                  >
                    {/* Aplica a escala reduzida (0.29) no DiamondCard de 140px */}
                    <div className="scale-[0.29] transform absolute flex items-center justify-center pointer-events-none">
                      <DiamondCard
                        title={skill.title} // Nome da disciplina
                        status={acquiredSkills.has(skill.id) ? "adquirido" : "pendente"} // Status atual a partir do Zustand
                        icon={skill.icon} // Ícone associado
                        isExpanded={false} // Mantém formato compacto
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            // Visualização em modo Lista (Cards horizontais estáveis e sem glitches)
            <motion.div
              key="list"
              initial={{ opacity: 0, scale: 0.96 }} // Entrada sutil
              animate={{ opacity: 1, scale: 1 }} // Estado ativo
              exit={{ opacity: 0, scale: 0.96 }} // Saída
              transition={{ duration: 0.18, ease: "easeOut" }} // Transição rápida
              className="flex flex-col gap-1.5 items-center w-full"
            >
              {/* Itera sobre as skills da carreira renderizando cards estáveis via CSS puro */}
              {skills.map((skill, index) => {
                // Determina se este card deve ser atenuado quando outro está em hover
                const isFaded = hoveredSkillId !== null && hoveredSkillId !== skill.id;
                // Identifica se a disciplina já foi adquirida baseada na store global
                const isAcquired = acquiredSkills.has(skill.id);

                // Retorna o item da lista
                return (
                  // Wrapper do card com transição CSS direta na GPU (elimina piscamento e layout thrashing)
                  <div
                    key={skill.id}
                    className={cn(
                      "w-full flex justify-center cursor-pointer transition-opacity duration-150",
                      isFaded ? "opacity-35" : "opacity-100"
                    )}
                    onMouseEnter={() => handleMouseEnter(skill.id)} // Registra hover instantâneo
                    onMouseLeave={handleMouseLeave} // Limpa hover instantâneo
                    onClick={() => onSkillClick && onSkillClick(skill)} // Dispara abertura dos detalhes
                  >
                    {/* Card estilizado com transição de fundo e borda limpas */}
                    <div
                      className={cn(
                        "w-full h-[46px] bg-[#222a33] hover:bg-[#2c3642] border border-white/[0.06] hover:border-white/[0.14] rounded-xl flex items-center px-3 shadow-sm transition-all duration-150 group",
                        index === skills.length - 1 && "mb-2" // Margem inferior no último item
                      )}
                    >
                      {/* Ícone da disciplina */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center mr-2.5 shrink-0 transition-colors duration-150",
                          isAcquired
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/[0.05] text-zinc-400 group-hover:text-zinc-200"
                        )}
                      >
                        <skill.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </div>

                      {/* Título da matéria estável com truncamento suave e tooltip nativo */}
                      <span
                        className={cn(
                          "font-semibold text-[13px] tracking-normal truncate flex-1 text-left transition-colors duration-150",
                          isAcquired ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"
                        )}
                        title={skill.title} // Permite ler o nome completo ao repousar o mouse
                      >
                        {skill.title}
                      </span>

                      {/* Indicador visual de status no canto direito */}
                      <div className="shrink-0 ml-2 flex items-center">
                        {isAcquired ? (
                          // Ponto luminoso verde para concluída
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                        ) : (
                          // Ponto neutro sutil para pendente
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors inline-block" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
