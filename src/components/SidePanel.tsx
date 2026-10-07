// Define a diretiva para executar este componente no cliente (Client Component)
"use client";

// Importa os módulos React, hooks de estado, efeito e referência
import React, { useState, useEffect, useRef } from "react";
// Importa componentes de animação do framer-motion
import { motion, AnimatePresence } from "framer-motion";
// Importa os ícones da biblioteca lucide-react
import { ChevronDown, ChevronRight, Target, Award } from "lucide-react";
// Importa a função utilitária para concatenação de classes Tailwind
import { cn } from "@/lib/utils";
// Importa o componente RoleModal para o tooltip de habilidades da profissão
import { RoleModal } from "./RoleModal";
// Importa o store global para saber qual trilha está selecionada
import { useSkillStore } from "@/store/useSkillStore";

import { CAREER_DATA } from "@/data/rolesData";

// Componente principal do painel lateral
export function SidePanel() {
  // Estado para controlar qual item da sanfona (accordion) está aberto
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // Estado para controlar se o painel está recolhido no mobile
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);
  // Estado para armazenar o papel ativo selecionado por clique e sua posição vertical
  const [activeRole, setActiveRole] = useState<{ name: string; top: number } | null>(null);

  // Trilha ativa selecionada no estado global
  const globalActiveRole = useSkillStore((state) => state.activeRole);
  const acquiredSkills = useSkillStore((state) => state.acquiredSkills);

  // Referência ao container que agrupa o painel e o modal para detectar cliques fora
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para alternar a abertura do item da sanfona
  const toggleAccordion = (index: number) => {
    // Se clicar no item já aberto, fecha (null); caso contrário, abre o clicado
    setOpenIndex(openIndex === index ? null : index);
  };

  // Efeito (Hook) para lidar com cliques fora do componente (SidePanel + RoleModal)
  useEffect(() => {
    // Função chamada quando ocorre um evento de mouse down no documento
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o container existe e se o clique não ocorreu dentro dele
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Fecha o modal ativo definindo o estado como nulo
        setActiveRole(null);
      }
    };

    // Adiciona o listener de 'mousedown' ao documento global na fase de captura
    document.addEventListener("mousedown", handleClickOutside, true);

    // Função de limpeza (cleanup) executada ao desmontar o componente
    return () => {
      // Remove o listener para evitar vazamentos de memória (memory leaks)
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, []); // Array de dependências vazio garante que execute apenas na montagem/desmontagem

  // Retorna a estrutura JSX do painel lateral animado
  return (
    // Div wrapper (com referência) para agrupar o painel e o modal flutuante na mesma árvore DOM e capturar cliques
    <div ref={containerRef}>
      {/* Elemento lateral fixo posicionado no lado esquerdo da tela */}
      <motion.aside
        // Animação inicial vindo da esquerda (-100px) com opacidade 0
        initial={{ x: -100, opacity: 0 }}
        // Animação final na posição normal (0px) com opacidade 1
        animate={{ x: 0, opacity: 1 }}
        // Configuração de transição com efeito de mola suave
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        // Estilização Tailwind: bottom sheet no mobile, painel esquerdo no desktop
        className={cn(
          "fixed z-40 flex flex-col bg-[#1A2128]/95 backdrop-blur-md border border-[#28313A] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden bottom-0 left-0 w-full rounded-t-3xl transition-all duration-300 md:left-6 md:top-24 md:bottom-auto md:w-80 md:max-h-[calc(100vh-8rem)] md:bg-[#1A2128]/80 md:rounded-2xl",
          isMobileCollapsed ? "max-h-[64px]" : "max-h-[45vh]"
        )}
      >
        {/* Cabeçalho do painel */}
        <div 
          className="p-4 md:p-5 border-b border-[#28313A]/50 bg-[#212930]/80 flex items-center justify-between cursor-pointer md:cursor-default shrink-0 h-[64px]"
          onClick={() => window.innerWidth < 768 && setIsMobileCollapsed(!isMobileCollapsed)}
        >
          {/* Título com ícone */}
          <h2 className="text-[17px] md:text-lg font-bold text-white flex items-center gap-2">
            {/* Texto do título */}
            Escolha sua área de atuação
          </h2>
          {/* Ícone de colapso apenas no mobile */}
          <button className="md:hidden p-1.5 bg-white/5 rounded-lg border border-white/5 text-zinc-300">
            <motion.div animate={{ rotate: isMobileCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>
        </div>

        {/* Conteúdo com rolar vertical */}
        <div className="overflow-y-auto p-4 custom-scrollbar flex-1">
          {/* Mapeamento dos itens das categorias */}
          {CAREER_DATA.map((item, index) => {
            // Verifica se este item específico está aberto
            const isOpen = openIndex === index;
            return (
              // Contêiner de cada categoria
              <div key={item.category} className="mb-2 last:mb-0">
                {/* Botão para abrir/fechar a categoria */}
                <button
                  // Evento de clique para alternar o estado do accordion
                  onClick={() => toggleAccordion(index)}
                  // Classes de estilo dinâmicas dependendo se está aberto ou fechado
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-xl transition-all duration-300 cursor-pointer",
                    isOpen
                      ? "bg-[#28313A] text-white"
                      : "bg-transparent text-zinc-300 hover:bg-[#28313A]/50"
                  )}
                >
                  {/* Nome da categoria */}
                  <span className="font-semibold text-sm text-left leading-tight">
                    {item.category}
                  </span>
                  {/* Ícone da seta com animação de rotação */}
                  <motion.div
                    // Rota em 180 graus quando aberto
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    // Duração da rotação
                    transition={{ duration: 0.3 }}
                  >
                    {/* Ícone ChevronDown */}
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </motion.div>
                </button>

                {/* Animação de presença para abrir/fechar suavemente */}
                <AnimatePresence initial={false}>
                  {/* Exibe os papéis apenas se a categoria estiver aberta */}
                  {isOpen && (
                    // Div animada para altura e opacidade
                    <motion.div
                      // Estado inicial zerado
                      initial={{ height: 0, opacity: 0 }}
                      // Estado animado expandido
                      animate={{ height: "auto", opacity: 1 }}
                      // Estado de saída recolhido
                      exit={{ height: 0, opacity: 0 }}
                      // Transição suave da expansão
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      // Oculta transbordo durante animação
                      className="overflow-hidden"
                    >
                      {/* Lista dos papéis da categoria */}
                      <ul className="pl-2 py-2 space-y-1">
                        {/* Mapeia cada papel/função */}
                        {item.roles.map((roleObj) => {
                          const roleName = roleObj.name;
                          // Verifica se este papel é o que está ativo no modal
                          const isActive = activeRole?.name === roleName;
                          // Verifica se o usuário já completou esta profissão
                          const isCompleted =
                            roleObj.skills &&
                            roleObj.skills.length > 0 &&
                            roleObj.skills.every((skillId: string) => acquiredSkills.has(skillId));

                          return (
                            // Item da lista acionável via clique
                            <li
                              key={roleName}
                              // Evento de clique para ativar/desativar o modal
                              onClick={(e) => {
                                // Se clicar no papel já ativo, fecha ele
                                if (isActive) {
                                  setActiveRole(null);
                                } else {
                                  // Se não, obtém a posição e abre o modal na posição correta
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setActiveRole({ name: roleName, top: rect.top });
                                }
                              }}
                              // Classes Tailwind: destaque fixo se estiver ativo ou efeito ao passar o mouse
                              className={cn(
                                "flex items-start justify-between w-full p-2 rounded-xl text-sm transition-all duration-200 group cursor-pointer",
                                isActive
                                  ? "bg-[#28313A]/60 text-green-300"
                                  : "text-zinc-400 hover:text-green-300 hover:bg-[#28313A]/40"
                              )}
                            >
                              {/* Nome da função alinhada à esquerda com ícone de alvo se for a trilha selecionada */}
                              <span
                                className={cn(
                                  "transition-transform duration-300 pr-2 leading-snug flex items-center gap-2",
                                  isActive ? "translate-x-1" : "group-hover:translate-x-1"
                                )}
                              >
                                {roleName}
                                {isCompleted ? (
                                  <Award className="w-4 h-4 shrink-0 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                ) : globalActiveRole === roleName ? (
                                  <Target className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
                                ) : null}
                              </span>
                              {/* Ícone de seta no canto, visível se ativo ou hover */}
                              <ChevronRight
                                className={cn(
                                  "w-4 h-4 shrink-0 mt-0.5 transition-all duration-300 text-green-400",
                                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.aside>

      {/* Modal Tooltip de Habilidades exibido ao clicar na profissão */}
      <AnimatePresence>
        {activeRole && (
          // Renderiza o modal da carreira ativa passando o callback para fechar
          <RoleModal
            role={activeRole.name}
            onClose={() => setActiveRole(null)} // Fecha o modal ao acionar ação de busca ou fechamento
          />
        )}
      </AnimatePresence>
    </div>
  );
}
