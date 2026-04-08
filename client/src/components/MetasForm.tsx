/**
 * MetasForm.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Form for creating and editing financial goals
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Save, X, Target } from "lucide-react";
import type { Meta } from "@/contexts/AuthContext";

interface MetasFormProps {
  editingMeta: Meta | null;
  onCancelEdit: () => void;
  onSaved: () => void;
}

const CORES_META = [
  "oklch(0.696 0.17 162.48)",  // Esmeralda
  "oklch(0.75 0.15 220)",       // Azul
  "oklch(0.8 0.15 60)",         // Amarelo
  "oklch(0.7 0.15 300)",        // Roxo
  "oklch(0.65 0.22 25)",        // Vermelho
];

const CATEGORIAS_META = [
  "Viagem",
  "Casa",
  "Carro",
  "Educação",
  "Saúde",
  "Lazer",
  "Emergência",
  "Aposentadoria",
  "Outro",
];

export default function MetasForm({ editingMeta, onCancelEdit, onSaved }: MetasFormProps) {
  const { dados, syncToCloud } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_META[0]);
  const [cor, setCor] = useState(CORES_META[0]);
  const [dataVencimento, setDataVencimento] = useState(today);

  useEffect(() => {
    if (editingMeta) {
      setNome(editingMeta.nome);
      setDescricao(editingMeta.descricao || "");
      setValorAlvo(String(editingMeta.valorAlvo));
      setValorAtual(String(editingMeta.valorAtual));
      setCategoria(editingMeta.categoria);
      setCor(editingMeta.cor);
      setDataVencimento(editingMeta.dataVencimento);
    } else {
      resetForm();
    }
  }, [editingMeta]);

  function resetForm() {
    setNome("");
    setDescricao("");
    setValorAlvo("");
    setValorAtual("0");
    setCategoria(CATEGORIAS_META[0]);
    setCor(CORES_META[0]);
    setDataVencimento(today);
  }

  async function handleSave() {
    if (!nome.trim() || nome.trim().length < 3) {
      return toast.error("Nome deve ter 3+ caracteres");
    }
    const alvo = parseFloat(valorAlvo);
    if (isNaN(alvo) || alvo <= 0) {
      return toast.error("Valor alvo inválido");
    }
    const atual = parseFloat(valorAtual) || 0;
    if (atual < 0 || atual > alvo) {
      return toast.error("Valor atual deve estar entre 0 e o valor alvo");
    }

    const novosDados = { ...dados, metas: [...dados.metas] };

    if (editingMeta) {
      const idx = novosDados.metas.findIndex(m => m.id === editingMeta.id);
      if (idx !== -1) {
        novosDados.metas[idx] = {
          ...novosDados.metas[idx],
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          valorAlvo: alvo,
          valorAtual: atual,
          categoria,
          cor,
          dataVencimento,
          percentualProgresso: (atual / alvo) * 100,
          concluida: atual >= alvo,
        };
        toast.success("Meta atualizada ✓");
        onCancelEdit();
      }
    } else {
      novosDados.metas.push({
        id: `meta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        valorAlvo: alvo,
        valorAtual: atual,
        categoria,
        cor,
        dataVencimento,
        dataCriacao: new Date().toISOString(),
        percentualProgresso: (atual / alvo) * 100,
        concluida: atual >= alvo,
      });
      toast.success("Meta criada ☁️");
      resetForm();
    }

    await syncToCloud(novosDados);
    onSaved();
  }

  const inputStyle = {
    background: "oklch(0.098 0.01 240)",
    border: "1px solid oklch(1 0 0 / 12%)",
    color: "oklch(0.94 0.005 240)",
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-600";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 space-y-4"
           style={{ background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}>
        
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {editingMeta ? "✏️ Editando Meta" : "🎯 Nova Meta"}
          </h3>
          {editingMeta && (
            <button onClick={onCancelEdit} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nome */}
        <input
          type="text"
          placeholder="Nome da meta (ex: Viagem para Maldivas)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.696 0.17 162.48)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 12%)"; e.currentTarget.style.boxShadow = "none"; }}
        />

        {/* Descrição */}
        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.696 0.17 162.48)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 12%)"; e.currentTarget.style.boxShadow = "none"; }}
        />

        {/* Valores */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Valor alvo"
            step="0.01"
            value={valorAlvo}
            onChange={(e) => setValorAlvo(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.696 0.17 162.48)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 12%)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <input
            type="number"
            placeholder="Valor atual"
            step="0.01"
            value={valorAtual}
            onChange={(e) => setValorAtual(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.696 0.17 162.48)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 12%)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Categoria e Data */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={inputClass}
            style={inputStyle}>
            {CATEGORIAS_META.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Cores */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cor</label>
          <div className="flex gap-2">
            {CORES_META.map((c) => (
              <button
                key={c}
                onClick={() => setCor(c)}
                className="w-8 h-8 rounded-lg transition-all duration-200"
                style={{
                  background: c,
                  boxShadow: cor === c ? `0 0 0 2px oklch(0.13 0.012 240), 0 0 0 4px ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "oklch(0.696 0.17 162.48)" }}>
          <Save className="w-3.5 h-3.5" />
          {editingMeta ? "Atualizar Meta" : "Criar Meta"}
        </button>
      </div>
    </div>
  );
}
