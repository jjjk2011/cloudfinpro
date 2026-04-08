/**
 * Home.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Main app page with transactions and investments management
 */
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MESES, formatBRL } from "@/lib/finance";
import AuthScreen from "@/components/AuthScreen";
import AppHeader from "@/components/AppHeader";
import TransacaoForm from "@/components/TransacaoForm";
import TransacoesTabela from "@/components/TransacoesTabela";
import InvestimentosArea from "@/components/InvestimentosArea";
import MetasForm from "@/components/MetasForm";
import MetasArea from "@/components/MetasArea";
import { toast } from "sonner";
import type { Transacao, Meta } from "@/contexts/AuthContext";
import { Cloud, Shield } from "lucide-react";

export default function Home() {
  const { user, loading, dados } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"transacoes" | "investimentos" | "metas">("transacoes");
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      toast.info(`Modo ${next ? "escuro" : "claro"} ativado`);
      return next;
    });
  }

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleExportPDF() {
    const script1 = document.createElement("script");
    script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script1.onload = () => {
      const script2 = document.createElement("script");
      script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js";
      script2.onload = () => generatePDF();
      document.head.appendChild(script2);
    };
    if ((window as any).jspdf) {
      generatePDF();
    } else {
      document.head.appendChild(script1);
    }
  }

  function generatePDF() {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    if (activeTab === "transacoes") {
      const now = new Date();
      const mes = MESES[now.getMonth()];
      const ano = now.getFullYear();
      const mIdx = MESES.indexOf(mes);
      const transacoes = dados.transacoes.filter(t => t.mesIdx === mIdx && t.ano === ano);
      const receitas = transacoes.filter(t => t.tipo === "income");
      const despesas = transacoes.filter(t => t.tipo === "expense");
      const totalRec = receitas.reduce((s, t) => s + t.valor, 0);
      const totalDes = despesas.reduce((s, t) => s + t.valor, 0);

      doc.setFontSize(20); doc.setTextColor(0, 150, 100);
      doc.text("Relatório de Transações", 20, 20);
      doc.setFontSize(12); doc.setTextColor(100);
      doc.text(`${mes} ${ano}`, 20, 30);
      doc.setFontSize(14); doc.setTextColor(0);
      doc.text("Resumo do Período", 20, 45);
      doc.autoTable({
        startY: 50,
        head: [["Descrição", "Valor"]],
        body: [
          ["Total Receitas", `R$ ${totalRec.toFixed(2)}`],
          ["Total Despesas", `R$ ${totalDes.toFixed(2)}`],
          ["Saldo", `R$ ${(totalRec - totalDes).toFixed(2)}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] },
      });
      doc.text("Detalhamento", 20, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Descrição", "Categoria", "Método", "Valor", "Status"]],
        body: transacoes.map(t => [
          t.desc + (t.parc ? ` (${t.parc})` : ""),
          t.categoria, t.metodo,
          `R$ ${t.valor.toFixed(2)}`,
          t.pago ? "Pago" : "Pendente",
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });
      doc.save(`transacoes-${mes}-${ano}.pdf`);
    } else {
      const inv = dados.investimentosMP || [];
      const totalInv = inv.reduce((s, t) => s + t.valorAplicado, 0);
      const totalAtual = inv.reduce((s, t) => s + t.valorAtualLiquido, 0);
      const totalLucro = totalAtual - totalInv;
      const rent = totalInv > 0 ? (totalLucro / totalInv) * 100 : 0;

      doc.setFontSize(20); doc.setTextColor(0, 150, 100);
      doc.text("Relatório de Investimentos", 20, 20);
      doc.setFontSize(14); doc.setTextColor(0);
      doc.text("Resumo da Carteira", 20, 35);
      doc.autoTable({
        startY: 40,
        head: [["Descrição", "Valor"]],
        body: [
          ["Total Investido", `R$ ${totalInv.toFixed(2)}`],
          ["Valor Atual", `R$ ${totalAtual.toFixed(2)}`],
          ["Lucro/Prejuízo", `R$ ${totalLucro.toFixed(2)}`],
          ["Rentabilidade", `${rent >= 0 ? "+" : ""}${rent.toFixed(2)}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] },
      });
      doc.text("Detalhamento", 20, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Nome", "Tipo", "Aplicado", "Atual", "Rendimento", "Rent."]],
        body: inv.map(t => [
          t.nome, t.tipo,
          `R$ ${t.valorAplicado.toFixed(2)}`,
          `R$ ${t.valorAtualLiquido.toFixed(2)}`,
          `R$ ${(t.valorAtualLiquido - t.valorAplicado).toFixed(2)}`,
          `${t.rentabilidadeLiquida >= 0 ? "+" : ""}${t.rentabilidadeLiquida.toFixed(2)}%`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });
      doc.save(`investimentos-${new Date().toISOString().split("T")[0]}.pdf`);
    }
    toast.success("PDF gerado com sucesso!");
  }

  const handleSaved = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "oklch(0.098 0.01 240)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500" style={{ fontFamily: "var(--font-body)" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Compute quick stats for footer
  const now = new Date();
  const mIdx = now.getMonth();
  const anoAtual = now.getFullYear();
  const transacoesMes = dados.transacoes.filter(t => t.mesIdx === mIdx && t.ano === anoAtual);
  const saldoMes = transacoesMes.reduce((s, t) => t.tipo === "income" ? s + t.valor : s - t.valor, 0);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "oklch(0.098 0.01 240)" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <AppHeader
          darkMode={darkMode}
          onToggleDark={toggleDark}
          onExportPDF={handleExportPDF}
          activeTab={activeTab}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("transacoes")}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${
              activeTab === "transacoes" ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
            style={activeTab === "transacoes"
              ? { background: "oklch(0.696 0.17 162.48)", fontFamily: "var(--font-display)" }
              : { background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)", fontFamily: "var(--font-display)" }}>
            💰 Transações
          </button>
          <button
            onClick={() => setActiveTab("investimentos")}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${
              activeTab === "investimentos" ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
            style={activeTab === "investimentos"
              ? { background: "oklch(0.696 0.17 162.48)", fontFamily: "var(--font-display)" }
              : { background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)", fontFamily: "var(--font-display)" }}>
            📈 Investimentos
          </button>
          <button
            onClick={() => setActiveTab("metas")}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${
              activeTab === "metas" ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            }`}
            style={activeTab === "metas"
              ? { background: "oklch(0.696 0.17 162.48)", fontFamily: "var(--font-display)" }
              : { background: "oklch(0.13 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)", fontFamily: "var(--font-display)" }}>
            🎯 Metas
          </button>
        </div>

        {/* Content */}
        {activeTab === "transacoes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up">
            <div className="lg:col-span-1">
              <TransacaoForm
                editingTransacao={editingTransacao}
                onCancelEdit={() => setEditingTransacao(null)}
                onSaved={handleSaved}
              />
            </div>
            <div className="lg:col-span-2">
              <TransacoesTabela
                onEdit={(t) => setEditingTransacao(t)}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        )}

        {activeTab === "investimentos" && (
          <div className="fade-in-up">
            <InvestimentosArea />
          </div>
        )}

        {activeTab === "metas" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up">
            <div className="lg:col-span-1">
              <MetasForm
                editingMeta={editingMeta}
                onCancelEdit={() => setEditingMeta(null)}
                onSaved={handleSaved}
              />
            </div>
            <div className="lg:col-span-2">
              <MetasArea
                editingMeta={editingMeta}
                onEdit={(m) => setEditingMeta(m)}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ borderColor: "oklch(1 0 0 / 6%)" }}>
          <div className="flex items-center gap-2 text-slate-600">
            <Cloud className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[10px]" style={{ fontFamily: "var(--font-body)" }}>
              Cloud Finance Pro v2.0 · Dados sincronizados com Firebase
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-700">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-800" />
              Saldo do mês:
              <span className={`font-bold ml-1 ${saldoMes >= 0 ? "text-emerald-700" : "text-red-800"}`}
                    style={{ fontFamily: "var(--font-mono)" }}>
                {formatBRL(saldoMes)}
              </span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
