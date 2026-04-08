/**
 * MetasArea.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Display financial goals with progress tracking and visualization
 */
import { useAuth } from "@/contexts/AuthContext";
import { formatBRL } from "@/lib/finance";
import { toast } from "sonner";
import { Trash2, Edit2, CheckCircle2, Target } from "lucide-react";
import type { Meta } from "@/contexts/AuthContext";

interface MetasAreaProps {
  editingMeta: Meta | null;
  onEdit: (meta: Meta) => void;
  refreshKey: number;
}

export default function MetasArea({ editingMeta, onEdit, refreshKey }: MetasAreaProps) {
  const { dados, syncToCloud } = useAuth();

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta meta?")) return;
    
    const novosDados = {
      ...dados,
      metas: dados.metas.filter(m => m.id !== id),
    };
    
    await syncToCloud(novosDados);
    toast.success("Meta deletada ✓");
  }

  async function handleToggleComplete(meta: Meta) {
    const novosDados = { ...dados, metas: [...dados.metas] };
    const idx = novosDados.metas.findIndex(m => m.id === meta.id);
    if (idx !== -1) {
      novosDados.metas[idx].concluida = !novosDados.metas[idx].concluida;
      await syncToCloud(novosDados);
      toast.success(novosDados.metas[idx].concluida ? "Meta marcada como concluída! 🎉" : "Meta desmarcada");
    }
  }

  // Calcular estatísticas
  const totalMetas = dados.metas.length;
  const metasCompletas = dados.metas.filter(m => m.concluida).length;
  const totalPoupado = dados.metas.reduce((s, m) => s + m.valorAtual, 0);
  const totalAlvo = dados.metas.reduce((s, m) => s + m.valorAlvo, 0);
  const progressoGeral = totalAlvo > 0 ? (totalPoupado / totalAlvo) * 100 : 0;

  if (totalMetas === 0) {
    return (
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Poupado</div>
            <div className="text-2xl font-black text-emerald-400 mono-num">{formatBRL(0)}</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Progresso Geral</div>
            <div className="text-2xl font-black text-slate-300 mono-num">0%</div>
          </div>
        </div>

        {/* Empty State */}
        <div className="rounded-2xl p-8 text-center" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-400 mb-2">Nenhuma meta criada</h3>
          <p className="text-xs text-slate-600">Use o formulário ao lado para criar sua primeira meta de economia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Metas Ativas</div>
          <div className="text-2xl font-black text-emerald-400">{totalMetas - metasCompletas}</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Poupado</div>
          <div className="text-2xl font-black text-emerald-400 mono-num">{formatBRL(totalPoupado)}</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Progresso Geral</div>
          <div className="text-2xl font-black text-emerald-400 mono-num">{progressoGeral.toFixed(1)}%</div>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="rounded-2xl p-5" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Progresso Geral</h3>
          <span className="text-xs font-bold text-emerald-400 mono-num">{progressoGeral.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: "oklch(0.098 0.01 240)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressoGeral, 100)}%`,
              background: "linear-gradient(90deg, oklch(0.696 0.17 162.48), oklch(0.75 0.15 220))",
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-600">
          <span>{formatBRL(totalPoupado)}</span>
          <span>{formatBRL(totalAlvo)}</span>
        </div>
      </div>

      {/* Lista de Metas */}
      <div className="space-y-3">
        {dados.metas.map((meta) => (
          <div
            key={meta.id}
            className={`rounded-2xl p-4 transition-all duration-200 ${
              meta.concluida ? "opacity-60" : ""
            }`}
            style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
            
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: meta.cor }}
                  />
                  <h4 className="text-sm font-bold text-slate-200">{meta.nome}</h4>
                  {meta.concluida && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                {meta.descricao && (
                  <p className="text-xs text-slate-600">{meta.descricao}</p>
                )}
                <div className="flex gap-3 mt-2 text-[10px] text-slate-600">
                  <span>{meta.categoria}</span>
                  <span>Vencimento: {new Date(meta.dataVencimento).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(meta)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                  title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(meta.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="Deletar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Progresso</span>
                <span className="text-xs font-bold mono-num" style={{ color: meta.cor }}>
                  {meta.percentualProgresso.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "oklch(0.098 0.01 240)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(meta.percentualProgresso, 100)}%`,
                    background: meta.cor,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span className="mono-num">{formatBRL(meta.valorAtual)}</span>
                <span className="mono-num">{formatBRL(meta.valorAlvo)}</span>
              </div>
            </div>

            {/* Botão Completar */}
            <button
              onClick={() => handleToggleComplete(meta)}
              className="w-full mt-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: meta.concluida ? "oklch(0.098 0.01 240)" : meta.cor,
                color: meta.concluida ? "oklch(0.55 0.01 240)" : "white",
                border: meta.concluida ? "1px solid oklch(1 0 0 / 12%)" : "none",
              }}>
              {meta.concluida ? "✓ Concluída" : "Marcar como Concluída"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
