/**
 * InvestimentosArea.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Investment management with CDI-based yield calculations
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { calcularRendimento, formatBRL, formatPercent, formatarDataLocal, formatarDataBR } from "@/lib/finance";
import { toast } from "sonner";
import { Plus, RefreshCw, X, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Investimento } from "@/contexts/AuthContext";

export default function InvestimentosArea() {
  const { dados, syncToCloud } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Renda Fixa");
  const [valorAplicado, setValorAplicado] = useState("");
  const [rendimentoPerc, setRendimentoPerc] = useState("");
  const [dataAplicacao, setDataAplicacao] = useState(formatarDataLocal(new Date()));
  const [dataVencimento, setDataVencimento] = useState("");
  const [resgate, setResgate] = useState("");
  const [resgateImediato, setResgateImediato] = useState(false);
  const [garantiaFGC, setGarantiaFGC] = useState(true);

  const investimentos = dados.investimentosMP || [];
  const totalInv = investimentos.reduce((s, t) => s + t.valorAplicado, 0);
  const totalLiq = investimentos.reduce((s, t) => s + t.valorAtualLiquido, 0);
  const totalRend = totalLiq - totalInv;
  const rentTotal = totalInv > 0 ? ((totalLiq - totalInv) / totalInv) * 100 : 0;

  function openModal(inv?: Investimento) {
    if (inv) {
      setEditingId(inv.id);
      setNome(inv.nome);
      setTipo(inv.tipo);
      setValorAplicado(String(inv.valorAplicado));
      setRendimentoPerc(String(inv.rendimentoPercentual));
      setDataAplicacao(inv.dataAplicacao);
      setDataVencimento(inv.dataVencimento || "");
      setResgate(inv.resgate || "");
      setResgateImediato(inv.resgateImediato || false);
      setGarantiaFGC(inv.garantiaFGC !== false);
    } else {
      setEditingId(null);
      setNome("");
      setTipo("Renda Fixa");
      setValorAplicado("");
      setRendimentoPerc("");
      setDataAplicacao(formatarDataLocal(new Date()));
      setDataVencimento("");
      setResgate("");
      setResgateImediato(false);
      setGarantiaFGC(true);
    }
    setModalOpen(true);
  }

  async function handleSave() {
    if (!nome.trim() || nome.trim().length < 3) return toast.error("Nome inválido (3+ caracteres)");
    const val = parseFloat(valorAplicado);
    if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
    const rend = parseFloat(rendimentoPerc) || 100;

    const res = calcularRendimento(val, rend, dataAplicacao, dataVencimento || null);
    const invest: Investimento = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: nome.trim().toUpperCase(),
      tipo, valorAplicado: val,
      valorAtualBruto: res.valorAtualBruto,
      valorAtualLiquido: res.valorAtualLiquido,
      rendimentoBruto: res.rendimentoBruto,
      iof: res.iof,
      impostoRenda: res.impostoRenda,
      rendimentoPercentual: rend,
      dataAplicacao, dataVencimento: dataVencimento || null,
      resgate, resgateImediato, garantiaFGC,
      rentabilidadeBruta: res.rentabilidadeBruta,
      rentabilidadeLiquida: res.rentabilidadeLiquida,
      diasDecorridos: res.diasDecorridos,
      diasTotais: res.diasTotais,
      aliquotaIOF: res.aliquotaIOF,
      aliquotaIR: res.aliquotaIR,
      criadoEm: editingId ? (investimentos.find(i => i.id === editingId)?.criadoEm || new Date().toISOString()) : new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
    };

    let novasLista: Investimento[];
    if (editingId) {
      novasLista = investimentos.map(i => i.id === editingId ? invest : i);
      toast.success("Investimento atualizado ✓");
    } else {
      novasLista = [...investimentos, invest];
      toast.success("Investimento adicionado ☁️");
    }

    await syncToCloud({ ...dados, investimentosMP: novasLista });
    setModalOpen(false);
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este investimento?")) return;
    const novaLista = investimentos.filter(i => i.id !== id);
    await syncToCloud({ ...dados, investimentosMP: novaLista });
    toast.success("Investimento excluído");
  }

  async function handleAtualizar() {
    let atualizado = false;
    const novaLista = investimentos.map(inv => {
      if (!inv.dataVencimento) return inv;
      const res = calcularRendimento(inv.valorAplicado, inv.rendimentoPercentual, inv.dataAplicacao, inv.dataVencimento);
      if (Math.abs(res.valorAtualLiquido - inv.valorAtualLiquido) > 0.01) {
        atualizado = true;
        return { ...inv, ...res, ultimaAtualizacao: new Date().toISOString() };
      }
      return inv;
    });
    if (atualizado) {
      await syncToCloud({ ...dados, investimentosMP: novaLista });
      toast.success("💰 Rendimentos atualizados!");
    } else {
      toast.info("Rendimentos já estão atualizados");
    }
  }

  const inputStyle = {
    background: "oklch(0.098 0.01 240)",
    border: "1px solid oklch(1 0 0 / 12%)",
    color: "oklch(0.94 0.005 240)",
  };
  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-600";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel */}
      <div className="lg:col-span-1 space-y-4">
        {/* Summary card */}
        <div className="rounded-2xl p-5 text-white"
             style={{ background: "linear-gradient(135deg, oklch(0.55 0.17 162.48), oklch(0.45 0.15 162.48))" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Investido</p>
          <p className="text-3xl font-black mono-num">{formatBRL(totalInv)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] opacity-70 uppercase tracking-wider">Valor Atual</p>
              <p className="text-lg font-bold mono-num">{formatBRL(totalLiq)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] opacity-70 uppercase tracking-wider">Rendimento</p>
              <p className={`text-lg font-bold mono-num ${totalRend >= 0 ? "text-white" : "text-rose-300"}`}>
                {formatBRL(totalRend)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-[9px] opacity-70 uppercase tracking-wider">Rentabilidade Total</p>
            <p className="text-xl font-black mono-num">{formatPercent(rentTotal)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "oklch(0.696 0.17 162.48)" }}>
            <Plus className="w-3.5 h-3.5" />
            Investir
          </button>
          <button
            onClick={handleAtualizar}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>

        {/* Info card */}
        <div className="rounded-xl p-4" style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <p className="text-[10px] font-bold text-emerald-400 mb-2">📈 Como funciona?</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Os rendimentos são calculados com base no CDI atual (13,15% a.a.). IOF e IR são descontados automaticamente conforme o prazo.
          </p>
        </div>
      </div>

      {/* Right panel — table */}
      <div className="lg:col-span-2 rounded-2xl overflow-hidden"
           style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
            📈 Seus Investimentos
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {investimentos.length}
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {investimentos.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <p className="text-3xl mb-2">📈</p>
              <p className="text-sm">Nenhum investimento cadastrado</p>
              <button
                onClick={() => openModal()}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors">
                + Adicionar primeiro investimento
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10" style={{ background: "oklch(0.13 0.012 240)", borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                <tr>
                  <th className="py-3 px-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Investimento</th>
                  <th className="py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Valor Atual</th>
                  <th className="py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px] hidden sm:table-cell">CDI</th>
                  <th className="py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-[10px] hidden md:table-cell">Aplicação</th>
                  <th className="py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {investimentos.map(inv => {
                  const rend = inv.rentabilidadeLiquida;
                  return (
                    <tr key={inv.id}
                        className="table-row-hover border-b cursor-pointer"
                        style={{ borderColor: "oklch(1 0 0 / 5%)" }}
                        onClick={() => openModal(inv)}>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{inv.nome}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{inv.tipo}</div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-black mono-num text-slate-200">{formatBRL(inv.valorAtualLiquido)}</div>
                        <div className={`text-[10px] mono-num flex items-center justify-end gap-0.5 ${rend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {rend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : rend < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                          {formatPercent(rend)}
                        </div>
                      </td>
                      <td className="py-3 text-right hidden sm:table-cell">
                        <span className="text-xs font-bold text-emerald-400 mono-num">{inv.rendimentoPercentual}%</span>
                        <div className="text-[9px] text-slate-600">do CDI</div>
                      </td>
                      <td className="py-3 text-right hidden md:table-cell">
                        <div className="text-[10px] text-slate-500">{formatarDataBR(inv.dataAplicacao)}</div>
                        {inv.dataVencimento && (
                          <div className="text-[9px] text-slate-600">Venc: {formatarDataBR(inv.dataVencimento)}</div>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExcluir(inv.id); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "oklch(0 0 0 / 70%)" }}
             onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl fade-in-up"
               style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 10%)" }}>
            <div className="sticky top-0 p-4 border-b flex items-center justify-between"
                 style={{ background: "oklch(0.13 0.012 240)", borderColor: "oklch(1 0 0 / 8%)" }}>
              <h3 className="font-bold text-slate-200 text-sm">
                {editingId ? "✏️ Editar Investimento" : "💰 Novo Investimento"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <input
                type="text"
                placeholder="Nome do investimento (ex: CDB Mercado Livre)"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className={inputClass}
                  style={inputStyle}>
                  {dados.tiposInvestimento.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Valor aplicado"
                  step="0.01"
                  value={valorAplicado}
                  onChange={(e) => setValorAplicado(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Rendimento (% do CDI)</label>
                  <input
                    type="number"
                    placeholder="106"
                    step="0.1"
                    value={rendimentoPerc}
                    onChange={(e) => setRendimentoPerc(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Resgate</label>
                  <input
                    type="text"
                    placeholder="Ex: Em 6 meses"
                    value={resgate}
                    onChange={(e) => setResgate(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Data da aplicação</label>
                  <input
                    type="date"
                    value={dataAplicacao}
                    onChange={(e) => setDataAplicacao(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Data de vencimento</label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resgateImediato}
                    onChange={(e) => setResgateImediato(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  🔓 Resgate imediato
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={garantiaFGC}
                    onChange={(e) => setGarantiaFGC(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  ✓ Garantia FGC
                </label>
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.6 0.17 162.48))" }}>
                {editingId ? "🔄 Atualizar" : "💾 Salvar Investimento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
