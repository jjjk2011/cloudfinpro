/**
 * TransacaoForm.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Form for adding/editing financial transactions
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MESES } from "@/lib/finance";
import { toast } from "sonner";
import { Save, X, Plus, TrendingUp, TrendingDown } from "lucide-react";
import type { Transacao } from "@/contexts/AuthContext";

interface TransacaoFormProps {
  editingTransacao: Transacao | null;
  onCancelEdit: () => void;
  onSaved: () => void;
}

export default function TransacaoForm({ editingTransacao, onCancelEdit, onSaved }: TransacaoFormProps) {
  const { dados, syncToCloud } = useAuth();
  const now = new Date();

  const [tipo, setTipo] = useState<"income" | "expense">("expense");
  const [desc, setDesc] = useState("");
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [categoria, setCategoria] = useState(dados.categorias[0] || "ALIMENTAÇÃO");
  const [metodo, setMetodo] = useState(dados.metodos[0] || "DINHEIRO");
  const [mes, setMes] = useState(MESES[now.getMonth()]);
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [newCat, setNewCat] = useState("");
  const [newMeth, setNewMeth] = useState("");

  useEffect(() => {
    if (editingTransacao) {
      setTipo(editingTransacao.tipo);
      setDesc(editingTransacao.desc);
      setValor(String(editingTransacao.valor));
      setCategoria(editingTransacao.categoria);
      setMetodo(editingTransacao.metodo);
      setMes(MESES[editingTransacao.mesIdx]);
      setAno(String(editingTransacao.ano));
    } else {
      resetForm();
    }
  }, [editingTransacao]);

  function resetForm() {
    setTipo("expense");
    setDesc("");
    setValor("");
    setParcelas("1");
    setCategoria(dados.categorias[0] || "ALIMENTAÇÃO");
    setMetodo(dados.metodos[0] || "DINHEIRO");
    setMes(MESES[now.getMonth()]);
    setAno(String(now.getFullYear()));
  }

  async function handleSave() {
    if (!desc.trim() || desc.trim().length < 3) return toast.error("Descrição deve ter 3+ caracteres");
    const val = parseFloat(valor);
    if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
    if (!categoria || !metodo) return toast.error("Selecione categoria e método");

    const novosDados = { ...dados, transacoes: [...dados.transacoes] };

    if (editingTransacao) {
      const idx = novosDados.transacoes.findIndex(t => t.id === editingTransacao.id);
      if (idx !== -1) {
        novosDados.transacoes[idx] = {
          ...novosDados.transacoes[idx],
          tipo, desc: desc.trim(), valor: val, categoria, metodo,
          mesIdx: MESES.indexOf(mes), ano: parseInt(ano),
        };
        toast.success("Transação atualizada ✓");
        onCancelEdit();
      }
    } else {
      const parc = parseInt(parcelas) || 1;
      if (parc > 24) return toast.error("Máximo 24 parcelas");
      const startIdx = MESES.indexOf(mes);
      for (let i = 0; i < parc; i++) {
        const curIdx = startIdx + i;
        novosDados.transacoes.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          tipo, desc: desc.trim(), valor: val, categoria, metodo,
          mesIdx: curIdx % 12, ano: parseInt(ano) + Math.floor(curIdx / 12),
          pago: false,
          parc: parc > 1 ? `${i + 1}/${parc}` : undefined,
          parcAtual: parc > 1 ? i + 1 : null,
          parcTotal: parc > 1 ? parc : undefined,
          descOriginal: parc > 1 ? desc.trim() : null,
          criadoEm: new Date().toISOString(),
        });
      }
      toast.success(`${parc} registro(s) adicionado(s) ☁️`);
      setDesc("");
      setValor("");
      setParcelas("1");
    }

    await syncToCloud(novosDados);
    onSaved();
  }

  async function addCategoria() {
    const val = newCat.trim().toUpperCase();
    if (!val) return toast.error("Digite uma categoria");
    if (dados.categorias.includes(val)) return toast.error("Categoria já existe");
    const novosDados = { ...dados, categorias: [...dados.categorias, val] };
    await syncToCloud(novosDados);
    setNewCat("");
    toast.success("Categoria adicionada");
  }

  async function addMetodo() {
    const val = newMeth.trim().toUpperCase();
    if (!val) return toast.error("Digite um método");
    if (dados.metodos.includes(val)) return toast.error("Método já existe");
    const novosDados = { ...dados, metodos: [...dados.metodos, val] };
    await syncToCloud(novosDados);
    setNewMeth("");
    toast.success("Método adicionado");
  }

  const inputStyle = {
    background: "oklch(0.098 0.01 240)",
    border: "1px solid oklch(1 0 0 / 12%)",
    color: "oklch(0.94 0.005 240)",
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-600";

  return (
    <div className="space-y-4">
      {/* Form card */}
      <div className="rounded-2xl p-5 space-y-4"
           style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {editingTransacao ? "✏️ Editando Registro" : "➕ Novo Registro"}
          </h3>
          {editingTransacao && (
            <button onClick={onCancelEdit} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTipo("income")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              tipo === "income"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
            style={tipo !== "income" ? { background: "oklch(0.098 0.01 240)", border: "1px solid oklch(1 0 0 / 12%)" } : {}}>
            <TrendingUp className="w-3.5 h-3.5" />
            Receita (+)
          </button>
          <button
            onClick={() => setTipo("expense")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              tipo === "expense"
                ? "text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
            style={tipo === "expense"
              ? { background: "oklch(0.65 0.22 25)" }
              : { background: "oklch(0.098 0.01 240)", border: "1px solid oklch(1 0 0 / 12%)" }}>
            <TrendingDown className="w-3.5 h-3.5" />
            Despesa (-)
          </button>
        </div>

        {/* Descrição */}
        <input
          type="text"
          placeholder="Descrição"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
          onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
        />

        {/* Valor e Parcelas */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Valor"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
          />
          <input
            type="number"
            placeholder="Parcelas"
            min="1"
            max="24"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
            disabled={!!editingTransacao}
            className={`${inputClass} disabled:opacity-40`}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Categoria */}
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; }}
          onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; }}>
          {dados.categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Método */}
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; }}
          onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; }}>
          {dados.metodos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Mês e Ano */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; }}>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            type="number"
            placeholder="Ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.6 0.17 162.48))" }}>
          <Save className="w-3.5 h-3.5" />
          {editingTransacao ? "Atualizar" : "Salvar na Nuvem"}
        </button>

        {editingTransacao && (
          <button
            onClick={onCancelEdit}
            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all duration-200"
            style={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
            ← Cancelar
          </button>
        )}
      </div>

      {/* Gerenciar categorias e métodos */}
      <div className="rounded-2xl p-4 space-y-3"
           style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">⚙️ Gerenciar</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nova categoria"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategoria()}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none placeholder-slate-600 text-slate-200"
            style={inputStyle}
          />
          <button
            onClick={addCategoria}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:opacity-80"
            style={{ background: "oklch(0.696 0.17 162.48)" }}>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Novo método"
            value={newMeth}
            onChange={(e) => setNewMeth(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMetodo()}
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none placeholder-slate-600 text-slate-200"
            style={inputStyle}
          />
          <button
            onClick={addMetodo}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors hover:opacity-80"
            style={{ background: "oklch(0.696 0.17 162.48)" }}>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
