/**
 * TransacoesTabela.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Table displaying income and expense transactions with filters
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MESES, formatBRL } from "@/lib/finance";
import { toast } from "sonner";
import { Search, Trash2, Package, CheckCircle2, Circle } from "lucide-react";
import type { Transacao } from "@/contexts/AuthContext";

interface TransacoesTabelaProps {
  onEdit: (t: Transacao) => void;
  refreshKey: number;
}

export default function TransacoesTabela({ onEdit, refreshKey: _refreshKey }: TransacoesTabelaProps) {
  const { dados, syncToCloud } = useAuth();
  const now = new Date();
  const [filterMes, setFilterMes] = useState(MESES[now.getMonth()]);
  const [filterAno, setFilterAno] = useState(String(now.getFullYear()));
  const [search, setSearch] = useState("");

  const filtradas = useMemo(() => {
    const mIdx = MESES.indexOf(filterMes);
    const yVal = parseInt(filterAno);
    const s = search.toLowerCase();
    return dados.transacoes.filter(t =>
      t.mesIdx === mIdx && t.ano === yVal &&
      (!s || t.desc.toLowerCase().includes(s) || t.categoria.toLowerCase().includes(s) || t.metodo.toLowerCase().includes(s))
    );
  }, [dados.transacoes, filterMes, filterAno, search]);

  const receitas = filtradas.filter(t => t.tipo === "income");
  const despesas = filtradas.filter(t => t.tipo === "expense");
  const totalReceitas = receitas.reduce((s, t) => s + t.valor, 0);
  const totalDespesas = despesas.reduce((s, t) => s + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  async function handleTogglePago(id: string) {
    const novosDados = { ...dados, transacoes: dados.transacoes.map(t =>
      t.id === id ? { ...t, pago: !t.pago } : t
    )};
    const t = novosDados.transacoes.find(x => x.id === id);
    await syncToCloud(novosDados);
    toast.info(t?.pago ? "✅ Marcado como pago" : "⏳ Marcado como pendente");
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este registro?")) return;
    const novosDados = { ...dados, transacoes: dados.transacoes.filter(t => t.id !== id) };
    await syncToCloud(novosDados);
    toast.success("Excluído com sucesso");
  }

  async function handleExcluirParcelas(descOriginal: string, parcTotal: number) {
    const toDelete = dados.transacoes.filter(t => t.descOriginal === descOriginal && t.parcTotal === parcTotal);
    if (!confirm(`Excluir TODAS as ${toDelete.length} parcelas de "${descOriginal}"?`)) return;
    const novosDados = { ...dados, transacoes: dados.transacoes.filter(t => !(t.descOriginal === descOriginal && t.parcTotal === parcTotal)) };
    await syncToCloud(novosDados);
    toast.success(`${toDelete.length} parcelas excluídas`);
  }

  const inputStyle = {
    background: "oklch(0.098 0.01 240)",
    border: "1px solid oklch(1 0 0 / 12%)",
    color: "oklch(0.94 0.005 240)",
  };

  function renderRows(transacoes: Transacao[], isIncome: boolean) {
    const gruposParcelas: Record<string, boolean> = {};
    return transacoes.map(t => {
      const chaveGrupo = t.descOriginal ? `${t.descOriginal}-${t.parcTotal}` : null;
      const showGroupDelete = chaveGrupo && !gruposParcelas[chaveGrupo];
      if (chaveGrupo) gruposParcelas[chaveGrupo] = true;

      return (
        <tr key={t.id} className="table-row-hover border-b" style={{ borderColor: "oklch(1 0 0 / 5%)" }}>
          <td className="py-3 px-3 w-8">
            <button onClick={() => handleTogglePago(t.id)} className="transition-colors">
              {t.pago
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
              }
            </button>
          </td>
          <td className="py-3 cursor-pointer" onClick={() => onEdit(t)}>
            <div className="font-semibold text-sm text-slate-200">
              {t.desc}
              {t.parc && <span className="text-[9px] text-slate-500 ml-1.5 font-mono">{t.parc}</span>}
            </div>
            <div className={`text-[10px] mt-0.5 ${isIncome ? "text-emerald-500/70" : "text-rose-500/70"}`}>
              {t.metodo} · {t.categoria}
            </div>
          </td>
          <td className="py-3 text-right pr-2">
            <span className={`font-black text-sm mono-num ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
              {isIncome ? "+" : "-"}{formatBRL(t.valor)}
            </span>
          </td>
          <td className="py-3 pr-3 text-right">
            <div className="flex items-center justify-end gap-1">
              {showGroupDelete && t.descOriginal && t.parcTotal && (
                <button
                  onClick={() => handleExcluirParcelas(t.descOriginal!, t.parcTotal!)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-400 transition-colors"
                  title="Excluir todas as parcelas">
                  <Package className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => handleExcluir(t.id)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 transition-colors"
                title="Excluir">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
      
      {/* Summary cards */}
      <div className="p-4 grid grid-cols-3 gap-3 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Saldo</p>
          <p className={`text-lg font-black mono-num ${saldo > 0 ? "text-emerald-400" : saldo < 0 ? "text-rose-400" : "text-slate-300"}`}>
            {formatBRL(saldo)}
          </p>
        </div>
        <div className="text-center border-x" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Receitas</p>
          <p className="text-lg font-black mono-num text-emerald-400">{formatBRL(totalReceitas)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Despesas</p>
          <p className="text-lg font-black mono-num text-rose-400">{formatBRL(totalDespesas)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 flex gap-2 flex-wrap border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <select
          value={filterMes}
          onChange={(e) => setFilterMes(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none text-slate-200"
          style={inputStyle}>
          {MESES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="number"
          value={filterAno}
          onChange={(e) => setFilterAno(e.target.value)}
          className="w-20 px-3 py-2 rounded-lg text-xs outline-none text-slate-200"
          style={inputStyle}
        />
        <div className="flex-1 min-w-40 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none text-slate-200 placeholder-slate-600"
            style={inputStyle}
          />
        </div>
        <span className="flex items-center text-[10px] text-slate-500 font-mono">
          {filtradas.length} reg.
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        {filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10" style={{ background: "oklch(0.13 0.012 240)" }}>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Descrição</th>
                <th className="py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Valor</th>
                <th className="py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {receitas.length > 0 && (
                <>
                  <tr style={{ background: "oklch(0.696 0.17 162.48 / 0.08)" }}>
                    <td colSpan={4} className="py-2 px-3 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                      💰 Receitas ({receitas.length})
                    </td>
                  </tr>
                  {renderRows(receitas, true)}
                </>
              )}
              {despesas.length > 0 && (
                <>
                  <tr style={{ background: "oklch(0.65 0.22 25 / 0.08)" }}>
                    <td colSpan={4} className="py-2 px-3 text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                      📉 Despesas ({despesas.length})
                    </td>
                  </tr>
                  {renderRows(despesas, false)}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
