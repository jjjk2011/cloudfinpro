/**
 * finance.ts — Cloud Finance Pro
 * Utility functions for financial calculations
 */

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function calcularIOF(diasDecorridos: number): number {
  if (diasDecorridos <= 0 || diasDecorridos >= 30) return 0;
  const aliquota = Math.max(0, 96 - (diasDecorridos - 1) * 4);
  return aliquota / 100;
}

export function calcularIR(diasDecorridos: number): number {
  if (diasDecorridos <= 180) return 0.225;
  if (diasDecorridos <= 360) return 0.20;
  if (diasDecorridos <= 720) return 0.175;
  return 0.15;
}

export interface RendimentoResult {
  valorAplicado: number;
  valorAtualBruto: number;
  rendimentoBruto: number;
  iof: number;
  impostoRenda: number;
  valorAtualLiquido: number;
  rentabilidadeBruta: number;
  rentabilidadeLiquida: number;
  diasDecorridos: number;
  diasTotais: number;
  aliquotaIOF: number;
  aliquotaIR: number;
}

export function calcularRendimento(
  valorAplicado: number,
  rendimentoPercentual: number,
  dataAplicacaoStr: string,
  dataVencimentoStr?: string | null
): RendimentoResult {
  const zero: RendimentoResult = {
    valorAplicado, valorAtualBruto: valorAplicado, rendimentoBruto: 0,
    iof: 0, impostoRenda: 0, valorAtualLiquido: valorAplicado,
    rentabilidadeBruta: 0, rentabilidadeLiquida: 0, diasDecorridos: 0, diasTotais: 0,
    aliquotaIOF: 0, aliquotaIR: 0,
  };

  if (!dataVencimentoStr) return zero;

  const [anoAplic, mesAplic, diaAplic] = dataAplicacaoStr.split("-").map(Number);
  const dataAplic = new Date(anoAplic, mesAplic - 1, diaAplic);
  const hoje = new Date();
  const hojeSemFuso = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const [anoVenc, mesVenc, diaVenc] = dataVencimentoStr.split("-").map(Number);
  const dataVenc = new Date(anoVenc, mesVenc - 1, diaVenc);

  if (hojeSemFuso <= dataAplic) return zero;

  const diasTotais = Math.ceil((dataVenc.getTime() - dataAplic.getTime()) / (1000 * 60 * 60 * 24));
  const diasDecorridos = Math.min(
    Math.ceil((hojeSemFuso.getTime() - dataAplic.getTime()) / (1000 * 60 * 60 * 24)),
    diasTotais
  );

  const cdiAnual = 0.1315;
  const cdiDiario = Math.pow(1 + cdiAnual, 1 / 252) - 1;
  const rendimentoDiario = cdiDiario * (rendimentoPercentual / 100);
  const valorAtualBruto = valorAplicado * Math.pow(1 + rendimentoDiario, diasDecorridos);
  const rendimentoBruto = valorAtualBruto - valorAplicado;
  const aliquotaIOF = calcularIOF(diasDecorridos);
  const iof = Math.max(0, rendimentoBruto * aliquotaIOF);
  const aliquotaIR = calcularIR(diasDecorridos);
  const impostoRenda = (rendimentoBruto - iof) * aliquotaIR;
  const valorAtualLiquido = valorAplicado + rendimentoBruto - iof - impostoRenda;

  return {
    valorAplicado, valorAtualBruto, rendimentoBruto, iof, impostoRenda, valorAtualLiquido,
    rentabilidadeBruta: (rendimentoBruto / valorAplicado) * 100,
    rentabilidadeLiquida: ((valorAtualLiquido - valorAplicado) / valorAplicado) * 100,
    diasDecorridos, diasTotais, aliquotaIOF: aliquotaIOF * 100, aliquotaIR: aliquotaIR * 100,
  };
}

export function formatarDataLocal(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataBR(dateStr: string): string {
  if (!dateStr) return "";
  const [ano, mes, dia] = dateStr.split("-");
  return `${dia}/${mes}/${ano}`;
}
