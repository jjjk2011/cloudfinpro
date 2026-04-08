/**
 * AuthContext — Cloud Finance Pro
 * Design: Neo-Brutalist Finance — Dark theme with emerald accents
 * Manages Firebase authentication state and user data
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBiRF-ISTjYVBv6F1TtCNGpfYWChExVtI",
  authDomain: "meufinanceiro-75b8e.firebaseapp.com",
  projectId: "meufinanceiro-75b8e",
  storageBucket: "meufinanceiro-75b8e.firebasestorage.app",
  messagingSenderId: "1083437842303",
  appId: "1:1083437842303:web:0c6f76428a738aedffa44a",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export interface Transacao {
  id: string;
  tipo: "income" | "expense";
  desc: string;
  valor: number;
  categoria: string;
  metodo: string;
  mesIdx: number;
  ano: number;
  pago: boolean;
  parc?: string;
  parcAtual?: number | null;
  parcTotal?: number;
  descOriginal?: string | null;
  criadoEm: string;
}

export interface Meta {
  id: string;
  nome: string;
  descricao?: string;
  valorAlvo: number;
  valorAtual: number;
  categoria: string;
  cor: string;
  dataVencimento: string;
  dataCriacao: string;
  concluida: boolean;
  percentualProgresso: number;
}

export interface Investimento {
  id: string;
  nome: string;
  tipo: string;
  valorAplicado: number;
  valorAtualBruto: number;
  valorAtualLiquido: number;
  rendimentoBruto: number;
  iof: number;
  impostoRenda: number;
  rendimentoPercentual: number;
  dataAplicacao: string;
  dataVencimento: string | null;
  resgate: string;
  resgateImediato: boolean;
  garantiaFGC: boolean;
  rentabilidadeBruta: number;
  rentabilidadeLiquida: number;
  diasDecorridos: number;
  diasTotais: number;
  aliquotaIOF: number;
  aliquotaIR: number;
  criadoEm: string;
  ultimaAtualizacao: string;
}

export interface DadosFinanceiros {
  transacoes: Transacao[];
  investimentosMP: Investimento[];
  metas: Meta[];
  categorias: string[];
  metodos: string[];
  tiposInvestimento: string[];
  corretoras: string[];
  nome?: string;
  email?: string;
  criadoEm?: string;
}

const dadosPadrao: DadosFinanceiros = {
  transacoes: [],
  investimentosMP: [],
  metas: [],
  categorias: ["ALIMENTAÇÃO", "CONTAS", "SAÚDE", "LAZER", "TRANSPORTE", "EDUCAÇÃO", "TRABALHO", "MORADIA"],
  metodos: ["DINHEIRO", "CRÉDITO", "DÉBITO", "PIX", "TRANSFERÊNCIA"],
  tiposInvestimento: ["Renda Fixa", "Fundos", "Ações"],
  corretoras: ["MERCADO PAGO", "NU INVEST", "XP INC"],
};

interface AuthContextType {
  user: User | null;
  userName: string;
  dados: DadosFinanceiros;
  loading: boolean;
  syncing: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (nome: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  syncToCloud: (newDados?: DadosFinanceiros) => Promise<void>;
  setDados: (d: DadosFinanceiros) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [dados, setDadosState] = useState<DadosFinanceiros>(JSON.parse(JSON.stringify(dadosPadrao)));
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadFromCloud(u);
      } else {
        setDadosState(JSON.parse(JSON.stringify(dadosPadrao)));
        setUserName("");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loadFromCloud(u: User): Promise<void> {
    try {
      const docRef = doc(db, "users", u.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const d = snap.data() as DadosFinanceiros;
        const nome = d.nome || u.displayName || u.email?.split("@")[0] || "Usuário";
        setUserName(nome);
        setDadosState({
          transacoes: d.transacoes || [],
          investimentosMP: d.investimentosMP || [],
          metas: d.metas || [],
          categorias: d.categorias || dadosPadrao.categorias,
          metodos: d.metodos || dadosPadrao.metodos,
          tiposInvestimento: d.tiposInvestimento || dadosPadrao.tiposInvestimento,
          corretoras: d.corretoras || dadosPadrao.corretoras,
        });
      } else {
        const nome = u.displayName || u.email?.split("@")[0] || "Usuário";
        setUserName(nome);
        const novoDoc = { ...dadosPadrao, nome, email: u.email, criadoEm: new Date().toISOString() };
        await setDoc(doc(db, "users", u.uid), novoDoc);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }

  async function login(email: string, pass: string) {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  async function signup(nome: string, email: string, pass: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: nome });
    const novoDoc = { ...dadosPadrao, nome, email, criadoEm: new Date().toISOString() };
    await setDoc(doc(db, "users", cred.user.uid), novoDoc);
  }

  async function logout() {
    await signOut(auth);
    setDadosState(JSON.parse(JSON.stringify(dadosPadrao)));
    setUserName("");
  }

  // Remove undefined fields recursively for Firestore compatibility
  function cleanForFirestore(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(cleanForFirestore);
    }
    if (obj !== null && typeof obj === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (v !== undefined) {
          cleaned[k] = cleanForFirestore(v);
        }
      }
      return cleaned;
    }
    return obj;
  }

  async function syncToCloud(newDados?: DadosFinanceiros) {
    if (!user) return;
    const toSave = newDados || dados;
    setSyncing(true);
    try {
      const cleanData = cleanForFirestore(toSave) as DadosFinanceiros;
      await setDoc(doc(db, "users", user.uid), cleanData);
      if (newDados) setDadosState(newDados);
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      throw err;
    } finally {
      setSyncing(false);
    }
  }

  function setDados(d: DadosFinanceiros) {
    setDadosState(d);
  }

  return (
    <AuthContext.Provider value={{ user, userName, dados, loading, syncing, login, signup, logout, syncToCloud, setDados }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
