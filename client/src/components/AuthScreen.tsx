/**
 * AuthScreen.tsx — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Login and signup screen with Firebase authentication
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Cloud, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export default function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !pass) return toast.error("Preencha e-mail e senha");
    setLoading(true);
    try {
      await login(email, pass);
      toast.success("Bem-vindo de volta!");
    } catch {
      toast.error("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    if (!nome.trim()) return toast.error("Digite seu nome completo");
    if (!email) return toast.error("Digite seu e-mail");
    if (pass.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres");
    setLoading(true);
    try {
      await signup(nome.trim(), email, pass);
      toast.success("Conta criada com sucesso!");
    } catch {
      toast.error("Erro ao criar conta. Verifique o e-mail.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (mode === "login") handleLogin();
      else handleSignup();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.2 0.05 162) 0%, oklch(0.098 0.01 240) 60%)" }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle, oklch(0.696 0.17 162.48), transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
             style={{ background: "radial-gradient(circle, oklch(0.696 0.17 162.48), transparent)" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "linear-gradient(oklch(0.696 0.17 162.48) 1px, transparent 1px), linear-gradient(90deg, oklch(0.696 0.17 162.48) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 emerald-glow"
               style={{ background: "linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.55 0.17 162.48))" }}>
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            CLOUD FINANCE
          </h1>
          <div className="inline-flex items-center gap-1 mt-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">PRO</span>
            <span className="text-[10px] text-slate-500">v2.0</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta gratuita"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6 space-y-4"
             style={{ background: "oklch(0.13 0.012 240)", borderColor: "oklch(1 0 0 / 10%)" }}>
          
          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "oklch(0.098 0.01 240)" }}>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                mode === "login"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}>
              <LogIn className="w-3 h-3 inline mr-1" />
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                mode === "signup"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}>
              <UserPlus className="w-3 h-3 inline mr-1" />
              Cadastrar
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-500 text-slate-100"
                style={{
                  background: "oklch(0.098 0.01 240)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
              />
            )}
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-500 text-slate-100"
              style={{
                background: "oklch(0.098 0.01 240)",
                border: "1px solid oklch(1 0 0 / 12%)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
            />
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "Senha (mínimo 6 caracteres)" : "Senha"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200 placeholder-slate-500 text-slate-100"
                style={{
                  background: "oklch(0.098 0.01 240)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.696 0.17 162.48)"; e.target.style.boxShadow = "0 0 0 3px oklch(0.696 0.17 162.48 / 0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(1 0 0 / 12%)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={mode === "login" ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: loading ? "oklch(0.5 0.1 162.48)" : "linear-gradient(135deg, oklch(0.696 0.17 162.48), oklch(0.6 0.17 162.48))" }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Aguarde...
              </span>
            ) : mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          Use qualquer e-mail válido e senha com 6+ caracteres
        </p>
      </div>
    </div>
  );
}
