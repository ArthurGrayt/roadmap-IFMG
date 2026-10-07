import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
  Handle,
  Position,
  useReactFlow,
  Panel,
  NodeProps,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DiamondCard } from "@/components/diamond-card";
import { UserProfileNode } from "@/components/UserProfileNode";
import { SKILLS, SkillId } from "@/data/skills-config";
import { ALL_SKILLS, CAREER_DATA } from "@/data/rolesData";
import layoutData from "@/data/skill-layout.json";
import { useSkillStore } from "@/store/useSkillStore";
import { User, Maximize2, Minimize2 } from "lucide-react";

interface DiamondNodeData extends Record<string, unknown> {
  label: string;
  status?: "pendente" | "adquirido";
  icon?: React.ElementType;
  isExpanded?: boolean;
  isHighlighted?: boolean;
  isTrail?: boolean;
}

const DiamondNode = ({ id, data }: NodeProps<Node<DiamondNodeData>>) => {
  const { setEdges, setNodes, getNodes } = useReactFlow();
  const toggleSkill = useSkillStore((state) => state.toggleSkill);

  const handleStatusChange = (isActive: boolean) => {
    const nodes = getNodes();

    // Regra 1: Não pode acender se os pré-requisitos não estiverem acesos
    if (isActive) {
      const skill = SKILLS.find((s) => s.id === id);
      if (skill) {
        const reqs =
          skill.logicalPrerequisites.length > 0
            ? skill.logicalPrerequisites
            : skill.officialPrerequisites;
        const missingReqId = reqs.find((reqId) => {
          const reqNode = nodes.find((n) => n.id === reqId);
          return reqNode?.data.status !== "adquirido";
        });

        if (missingReqId) {
          // Eleva temporariamente o zIndex do nó clicado para que o tooltip sobreponha qualquer badge ou elemento vizinho
          setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, zIndex: 99999 } : n)));

          // Destaca a linha (cabo) que conecta a matéria atual ao pré-requisito faltante
          setEdges((eds) =>
            eds.map((edge) => {
              // Verifica se a conexão liga o nó atual ao pré-requisito faltante
              if (
                (edge.source === missingReqId && edge.target === id) ||
                (edge.target === missingReqId && edge.source === id)
              ) {
                // Retorna a conexão com animação pulsante e cor vermelha
                return {
                  ...edge,
                  animated: true, // Faz a linha pulsar
                  style: {
                    ...edge.style,
                    stroke: "#ff3333", // Vermelho brilhante
                    strokeWidth: 3,
                    filter: "drop-shadow(0 0 8px rgba(255, 51, 51, 0.6))",
                  },
                };
              }
              // Retorna o cabo sem modificações
              return edge;
            })
          );

          // Reverte a linha e o zIndex para o estado original após 3 segundos
          setTimeout(() => {
            // Restaura o zIndex do nó para o padrão
            setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, zIndex: 10 } : n)));

            // Restaura o estilo do cabo elétrico
            setEdges((eds) =>
              eds.map((edge) => {
                // Verifica se é o cabo que foi destacado
                if (
                  (edge.source === missingReqId && edge.target === id) ||
                  (edge.target === missingReqId && edge.source === id)
                ) {
                  // Retorna o estilo inativo original
                  return {
                    ...edge,
                    animated: false,
                    style: {
                      ...edge.style,
                      stroke: "#4b5563", // Retorna ao cinza padrão de inativo
                      strokeWidth: 1,
                      filter: "none",
                    },
                  };
                }
                // Retorna o cabo sem modificações
                return edge;
              })
            );
          }, 3000);

          // Retorna o Nome da Matéria que faltou para acionar o modal no DiamondCard
          const missingSkill = SKILLS.find((s) => s.id === missingReqId);
          // Retorna o título da matéria ou fallback
          return missingSkill ? missingSkill.name : "Pré-requisito desconhecido";
        }
      }
    }

    // Regra 2: Se estiver desligando (apagando), precisamos apagar toda a árvore de descendentes!
    const nodesToDeactivate = new Set<string>();

    if (!isActive) {
      // Função recursiva para achar filhos, netos, bisnetos...
      const findDescendants = (parentId: string) => {
        const children = SKILLS.filter(
          (s) =>
            s.logicalPrerequisites.includes(parentId as SkillId) ||
            s.officialPrerequisites.includes(parentId as SkillId)
        ).map((s) => s.id);

        children.forEach((childId) => {
          if (!nodesToDeactivate.has(childId)) {
            nodesToDeactivate.add(childId);
            findDescendants(childId); // Busca os filhos do filho
          }
        });
      };

      findDescendants(id);
    }

    // Atualiza o status global nos nós (Cards)
    setNodes((nds) =>
      nds.map((n) => {
        // Altera o nó clicado
        if (n.id === id) {
          return { ...n, data: { ...n.data, status: isActive ? "adquirido" : "pendente" } };
        }
        // Se a ação for "apagar", desliga toda a árvore de dependentes encontrada
        if (!isActive && nodesToDeactivate.has(n.id)) {
          return { ...n, data: { ...n.data, status: "pendente" } };
        }
        return n;
      })
    );

    // Sync state with global store
    toggleSkill(id, isActive, Array.from(nodesToDeactivate));

    // Atualiza os cabos elétricos (Edges)
    setEdges((eds) =>
      eds.map((edge) => {
        // Deixa o useEffect lidar com a sincronização visual globalmente
        return edge;
      })
    );

    return true; // Permite a mudança na UI local do Card
  };

  return (
    <div className="relative">
      {/* Target Handles (entradas) invisíveis (inline style) posicionadas na margem 0 para tocar a expansão externa do SVG */}
      <Handle
        type="target"
        id="t-top"
        position={Position.Top}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="target"
        id="t-bottom"
        position={Position.Bottom}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="target"
        id="t-left"
        position={Position.Left}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="target"
        id="t-right"
        position={Position.Right}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />

      {/* Source Handles (saídas) invisíveis na margem 0 */}
      <Handle
        type="source"
        id="s-top"
        position={Position.Top}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="source"
        id="s-bottom"
        position={Position.Bottom}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="source"
        id="s-left"
        position={Position.Left}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />
      <Handle
        type="source"
        id="s-right"
        position={Position.Right}
        isConnectable={false}
        style={{ opacity: 0, border: "none" }}
      />

      {/* Renderiza o componente DiamondCard com todas as propriedades visuais e de interação */}
      <DiamondCard
        title={data.label} // Título da matéria
        status={data.status || "pendente"} // Estado atual da disciplina
        icon={data.icon} // Ícone associado
        interactive={true} // Habilita cliques
        isExpanded={data.isExpanded || false} // Modo expandido ou compacto
        isHighlighted={data.isHighlighted || false} // Efeito luminoso quando a disciplina for buscada
        isTrail={data.isTrail || false} // Efeito amarelo da trilha de carreira
        onStatusChange={handleStatusChange} // Manipulador de transição de status
      />
    </div>
  );
};

interface BadgeNodeData extends Record<string, unknown> {
  label: string;
  originalX?: number;
}

// Componente customizado para o Badge de Período
const BadgeNode = ({ data }: NodeProps<Node<BadgeNodeData>>) => {
  // Extrai apenas os números da string (Ex: "4º Período" -> "4")
  const periodNumber = data.label.replace(/\D/g, "");

  return (
    <div
      className="transition-all duration-300 hover:scale-105 cursor-default"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "56px",
        padding: "0 28px",
        borderRadius: "14px",
        background: "#1e252c",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        gap: "16px",
      }}
    >
      <span
        style={{
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          fontSize: "11px",
          color: "#8BA5C2",
          letterSpacing: "0.2em",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Período
      </span>
      <span
        style={{
          fontFamily: '"Inter", "Outfit", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontSize: "32px",
          lineHeight: "1",
          color: "#38bdf8",
          fontWeight: 900,
          letterSpacing: "-1px",
        }}
      >
        {periodNumber}
      </span>
    </div>
  );
};

// Configuração dos tipos de nós
const nodeTypes = {
  avatarNode: UserProfileNode,
  diamondNode: DiamondNode,
  custom: DiamondNode,
  badge: BadgeNode,
};

// Injeta os dados originais no layout estático para recuperar os ícones e travar a edição
const initialNodes: Node[] = (layoutData.nodes as Node[]).map((node) => {
  // Retorna nó de avatar imutável com zIndex padrão
  if (node.id === "avatar") return { ...node, draggable: false, selectable: false, zIndex: 10 };
  // Obtém dados da skill para recuperar ícone e label
  const uiSkill = ALL_SKILLS[node.id];
  // Retorna nó da matéria configurado e travado
  return {
    ...node, // Propriedades originais
    draggable: false, // Trava movimento manual
    selectable: false, // Trava contorno de seleção
    zIndex: 10, // Garante que cards de matérias fiquem acima das badges de período
    data: {
      ...node.data, // Mantém dados internos
      status: "pendente", // Garante que nenhum card (mesmo nível 1) comece já aceso
      icon: uiSkill ? uiSkill.icon : undefined, // Ícone da matéria
      label: uiSkill ? uiSkill.title : node.data.label, // Nome da matéria
    },
  };
});

// Descobre o limite direito e o centro horizontal
const validNodes = (layoutData.nodes as Node[]).filter((n) => n.id !== "avatar");
// Menor coordenada X
const minX = Math.min(...validNodes.map((n) => n.position.x));
// Maior coordenada X
const maxX = Math.max(...validNodes.map((n) => n.position.x));
// Ponto médio horizontal do layout
const layoutCenterX = (minX + maxX) / 2;

// Mapeamento matemático de Coordenadas Y para o nome do Período
const yToPeriod: Record<number, string> = {
  150: "1º Período",
  [-200]: "2º Período",
  [-550]: "3º Período",
  [-900]: "4º Período",
  [-1250]: "5º Período",
  [-1600]: "6º Período",
  [-1950]: "7º Período",
  [-2300]: "8º Período",
};

// Gera os nós de Badge fixados à direita (+220px do Max X)
const badgeNodes: Node[] = Object.entries(yToPeriod).map(([yStr, period]) => {
  // Converte a chave para número
  const y = Number(yStr);
  // Retorna a estrutura do nó de badge
  return {
    id: `badge-${y}`, // Identificador único da badge
    type: "badge", // Tipo customizado
    // Y + 42 é a matemática exata (Losango 140px / Badge 56px)
    position: { x: maxX + 220, y: y + 42 },
    draggable: false, // Trava arrastar
    selectable: false, // Trava seleção
    zIndex: 1, // zIndex inferior para ficar sempre atrás de cards e modais/tooltips
    data: {
      label: period, // Texto do período
      originalX: maxX + 220, // Coordenada base para cálculo de expansão
    },
  };
});

const initialNodesWithBadges = [...initialNodes, ...badgeNodes];

const initialEdges: Edge[] = (layoutData.edges as Edge[]).map((edge) => ({
  ...edge,
  selectable: false,
  focusable: false,
}));

export function SkillMap() {
  // Lista de nós do React Flow contendo matérias e badges de período
  const [nodes, setNodes] = useState<Node[]>(initialNodesWithBadges);
  // Lista de conexões elétricas (edges) entre as matérias
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  // Estado que rastreia se os cartões estão no modo expandido ou normal
  const [isGlobalExpanded, setIsGlobalExpanded] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const acquiredSkills = useSkillStore((state) => state.acquiredSkills);
  const careerTrail = useSkillStore((state) => state.careerTrail);

  const previousCompletedRef = useRef<number>(0);

  const completedRolesCount = useMemo(() => {
    let count = 0;
    CAREER_DATA.forEach((category) => {
      category.roles.forEach((role) => {
        if (role.skills && role.skills.length > 0) {
          const isCompleted = role.skills.every((skillId) => acquiredSkills.has(skillId));
          if (isCompleted) count++;
        }
      });
    });
    return count;
  }, [acquiredSkills]);

  useEffect(() => {
    if (completedRolesCount > previousCompletedRef.current) {
      if (rfInstance) {
        // Aguarda 800ms para o usuário ver o node atual ficar verde antes de voar a câmera
        setTimeout(() => {
          const avatarNode = nodes.find((n) => n.id === "avatar");
          if (avatarNode) {
            const centerX = avatarNode.position.x + 200;
            const centerY = avatarNode.position.y + 150;
            rfInstance.setCenter(centerX, centerY, { zoom: 1.2, duration: 1100 });
          }
        }, 800);
      }
    }
    previousCompletedRef.current = completedRolesCount;
  }, [completedRolesCount, rfInstance, nodes]);

  // Sincroniza nodes do React Flow com estado global quando a store atualizar fora do mapa
  useEffect(() => {
    // Calcula a trilha completa incluindo todos os pré-requisitos necessários
    const getFullTrail = (skills: string[]) => {
      const fullTrail = new Set<string>();
      const queue = [...skills];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (!fullTrail.has(current)) {
          fullTrail.add(current);
          const skill = SKILLS.find((s) => s.id === current);
          if (skill) {
            const reqs =
              skill.logicalPrerequisites.length > 0
                ? skill.logicalPrerequisites
                : skill.officialPrerequisites;
            queue.push(...reqs);
          }
        }
      }
      return fullTrail;
    };

    const fullTrailSet = getFullTrail(careerTrail);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === "avatar" || n.type === "badge") return n;
        const isAcquired = acquiredSkills.has(n.id);
        const isTrail = fullTrailSet.has(n.id) && !isAcquired;

        const newStatus = isAcquired ? "adquirido" : "pendente";

        if (n.data.status !== newStatus || n.data.isTrail !== isTrail) {
          return { ...n, data: { ...n.data, status: newStatus, isTrail } };
        }
        return n;
      })
    );

    setEdges((eds) =>
      eds.map((edge) => {
        const getEdgeParent = (source: string, target: string) => {
          const tSkill = SKILLS.find((s) => s.id === target);
          if (
            tSkill &&
            (tSkill.logicalPrerequisites.includes(source as SkillId) ||
              tSkill.officialPrerequisites.includes(source as SkillId))
          )
            return source;
          const sSkill = SKILLS.find((s) => s.id === source);
          if (
            sSkill &&
            (sSkill.logicalPrerequisites.includes(target as SkillId) ||
              sSkill.officialPrerequisites.includes(target as SkillId))
          )
            return target;
          return null;
        };

        const parentId = getEdgeParent(edge.source, edge.target);
        // A linha fica verde (adquirida) se a disciplina PAI daquela linha foi adquirida
        const isAcquiredEdge = parentId ? acquiredSkills.has(parentId) : false;

        // A linha faz parte da trilha amarela se ela leva a uma disciplina da trilha e o pai ainda NÃO foi adquirido
        // O parentId é o pré-requisito (a origem do cabo), a outra ponta é o target (o destino do cabo)
        const childId = parentId === edge.source ? edge.target : edge.source;
        const isTrailEdge = fullTrailSet.has(childId) && !isAcquiredEdge;

        if (isAcquiredEdge) {
          return {
            ...edge,
            animated: true,
            style: {
              ...edge.style,
              stroke: "#4ade80",
              strokeWidth: 2,
              filter: "drop-shadow(0 0 5px rgba(74, 222, 128, 0.4))",
            },
          };
        } else if (isTrailEdge) {
          return {
            ...edge,
            animated: true,
            style: {
              ...edge.style,
              stroke: "#facc15",
              strokeWidth: 2,
              filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))",
            },
          };
        } else {
          return {
            ...edge,
            animated: false,
            style: { ...edge.style, stroke: "#4b5563", strokeWidth: 1, filter: "none" },
          };
        }
      })
    );
  }, [acquiredSkills, careerTrail, setNodes, setEdges]);

  // Escuta requisições de focar disciplina acionadas pelo botão 'Achar Disciplina'
  useEffect(() => {
    // Função manipuladora do evento customizado de foco
    const handleFocusSkill = (e: Event) => {
      // Converte o tipo do evento para CustomEvent contendo o skillId
      const customEvent = e as CustomEvent<{ skillId: string }>;
      // Recupera o ID da matéria solicitada
      const skillId = customEvent.detail?.skillId;
      // Valida se o ID foi recebido corretamente
      if (!skillId) return;

      // Localiza o nó correspondente na lista atual
      const targetNode = nodes.find((n) => n.id === skillId);
      // Se encontrou o nó e temos a referência da instância do React Flow
      if (targetNode && rfInstance) {
        // Largura base considerando o estado atual (expandido 390px ou normal 140px)
        const width = targetNode.measured?.width ?? (targetNode.data?.isExpanded ? 390 : 140);
        // Altura padrão do card (140px)
        const height = targetNode.measured?.height ?? 140;
        // Posição central horizontal do nó
        const centerX = targetNode.position.x + width / 2;
        // Posição central vertical do nó
        const centerY = targetNode.position.y + height / 2;

        // Desliza suavemente a câmera até a disciplina e coloca o zoom máximo (1.5)
        rfInstance.setCenter(centerX, centerY, { zoom: 1.5, duration: 1100 });

        // Eleva o z-index do nó para o topo e ativa o destaque luminoso de localização
        setNodes((nds) =>
          nds.map((n) =>
            n.id === skillId
              ? {
                  ...n, // Mantém dados originais
                  zIndex: 99999, // Fica sobre qualquer outro nó
                  data: { ...n.data, isHighlighted: true }, // Ativa halo luminoso no DiamondCard
                }
              : n
          )
        );

        // Remove o destaque luminoso após 2 segundos (tempo solicitado pelo usuário)
        setTimeout(() => {
          // Restaura os nós ao estado normal
          setNodes((nds) =>
            nds.map((n) =>
              n.id === skillId
                ? {
                    ...n, // Mantém dados originais
                    zIndex: 10, // Restaura z-index base dos cards
                    data: { ...n.data, isHighlighted: false }, // Desativa o contorno azul
                  }
                : n
            )
          );
        }, 2000);
      }
    };

    // Registra o ouvinte para o evento global
    window.addEventListener("focus-skill-node", handleFocusSkill);
    // Remove o ouvinte ao desmontar o componente
    return () => window.removeEventListener("focus-skill-node", handleFocusSkill);
  }, [nodes, rfInstance]);

  const toggleExpandAll = () => {
    const newState = !isGlobalExpanded;
    setIsGlobalExpanded(newState);

    // Fator de escala matemático:
    // Normal = 200px por coluna (140px card + 60px gap)
    // Expandido = 450px por coluna (390px card + 60px gap)
    // 450 / 200 = 2.25
    const scaleFactor = newState ? 2.25 : 1.0;

    setNodes((nds) =>
      nds.map((n) => {
        // Ignora avatar
        if (n.id === "avatar") return n;

        let originalX = 0;
        const originalNode = (layoutData.nodes as Node[]).find((o) => o.id === n.id);
        if (originalNode) {
          originalX = originalNode.position.x;
        } else if (n.data?.originalX !== undefined) {
          originalX = Number(n.data.originalX);
        } else {
          return n;
        }

        // Calcula o novo X ancorado no centro do layout exportado
        const newX = layoutCenterX + (originalX - layoutCenterX) * scaleFactor;

        return {
          ...n,
          position: { ...n.position, x: newX },
          data: { ...n.data, isExpanded: newState },
        };
      })
    );
  };

  const goToProfile = () => {
    if (rfInstance) {
      const avatarNode = nodes.find((n) => n.id === "avatar");
      if (avatarNode) {
        // O nó de perfil (UserProfileNode) tem largura de 400px
        const centerX = avatarNode.position.x + 200;
        // Altura aproximada do node é ~300px
        const centerY = avatarNode.position.y + 150;
        rfInstance.setCenter(centerX, centerY, { zoom: 1.2, duration: 1100 });
      }
    }
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    // O container usa a tag style (abaixo) para gerenciar o cursor no React Flow
    <div className="w-full h-full absolute inset-0">
      <style>{`
        /* Cursor de mãozinha para indicar que o mapa é arrastável */
        .react-flow__pane {
          cursor: grab !important;
        }
        .react-flow__pane:active {
          cursor: grabbing !important;
        }
        .react-flow__node {
          cursor: default !important;
          pointer-events: auto !important;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
        }
        /* Foco acessível para navegação por teclado */
        .react-flow__node:focus-visible {
          outline: 3px solid #38bdf8;
          outline-offset: 4px;
        }
        .react-flow__node:focus:not(:focus-visible) {
          outline: none;
        }
        /* Customiza os controles de zoom */
        .react-flow__controls {
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: rgba(26, 33, 40, 0.8) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .react-flow__controls-button {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          fill: #8BA5C2 !important;
          transition: all 0.2s ease !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .react-flow__controls-button:hover {
          background: rgba(255,255,255,0.1) !important;
          fill: #38bdf8 !important;
        }
        .react-flow__controls-button:last-child {
          border-bottom: none !important;
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setRfInstance} // Salva a referência da instância para permitir transições de câmera programáticas
        panOnDrag={true} // Permite arrastar o canvas clicando no fundo
        panOnScroll={false} // Desativa pan via scroll
        zoomOnScroll={true} // Ativa zoom via scroll (mouse wheel)
        selectionOnDrag={false} // Desativa o marquee de seleção ao arrastar
        nodesConnectable={false} // Tranca a edição de linhas
        elementsSelectable={false} // Tranca a seleção de linhas e cards
        nodesDraggable={false} // Tranca o movimento dos cards
        minZoom={0.15} // Permite afastar a câmera
        maxZoom={1.5}
        fitView
      >
        <Panel position="top-right" className="m-3 md:m-6 flex gap-2 md:gap-3">
          <button
            onClick={goToProfile}
            className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-xl backdrop-blur-xl hover:bg-emerald-500/30 hover:text-white transition-all font-semibold text-sm flex items-center gap-2"
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Ir para o Perfil</span>
          </button>
          <button
            onClick={toggleExpandAll}
            className="px-3 py-2 md:px-5 md:py-2.5 bg-[#1A2128]/80 text-white border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-sm flex items-center gap-2"
          >
            {isGlobalExpanded ? (
              <Minimize2 className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            )}
            <span className="hidden md:inline">
              {isGlobalExpanded ? "Recolher Cards" : "Expandir Cards"}
            </span>
          </button>
        </Panel>
        <Controls 
          position="bottom-right" 
          showInteractive={false} 
          className="!bottom-[80px] md:!bottom-[24px] !right-[8px] md:!right-[16px]" 
        />
      </ReactFlow>
    </div>
  );
}
