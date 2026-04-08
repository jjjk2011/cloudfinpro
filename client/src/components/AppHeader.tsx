/**
 * AppHeader.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 */
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Cloud, Sun, Moon, FileText, LogOut, RefreshCw } from "lucide-react";

interface AppHeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onExportPDF: () => void;
  activeTab: "transacoes" | "investimentos" | "metas";
}

export default function AppHeader({ darkMode, onToggleDark, onExportPDF }: AppHeaderProps) {
  const { userName, logout, syncing } = useAuth();

  async function handleLogout() {
    await logout();
    toast.info("Até logo! 👋");
  }

  return (
    <header className="rounded-2xl mb-6 px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "linear-gradient(135deg, oklch(0.15 0.015 240), oklch(0.12 0.012 240))", border: "1px solid oklch(1 0 0 / 8%)" }}>
      
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: "linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.55 0.17 162.48))" }}>
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-tight text-white uppercase" style={{ fontFamily: "var(--font-display)" }}>
              Cloud Finance
            </h1>
            <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">
              👤 {userName}
            </span>
            {syncing && (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                Salvando...
              </span>
            )}
            {!syncing && (
              <span className="text-[9px] text-emerald-500/60">● ONLINE</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
          style={{ background: "oklch(0.18 0.012 240)", border: "1px solid oklch(1 0 0 / 8%)" }}
          title="Alternar tema">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onExportPDF}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-105"
          style={{ background: "oklch(0.696 0.17 162.48)" }}
          title="Exportar PDF">
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-105"
          style={{ background: "oklch(0.65 0.22 25)" }}
          title="Sair">
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
