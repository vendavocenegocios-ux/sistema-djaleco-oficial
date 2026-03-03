import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format, differenceInHours } from "date-fns";

const PRAZOS_ETAPA: Record<string, number> = {
  Corte: 4,
  Costura: 10,
  Acabamento: 2,
  Embalagem: 1,
  Despachado: 1,
};

export type DashboardPeriod = "este_mes" | "ultimo_mes" | "3_meses" | "6_meses";

export function useDashboardStats(period: DashboardPeriod = "este_mes") {
  return useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: async () => {
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date = now;
      let prevStart: Date;
      let prevEnd: Date;

      switch (period) {
        case "ultimo_mes":
          periodStart = startOfMonth(subMonths(now, 1));
          periodEnd = endOfMonth(subMonths(now, 1));
          prevStart = startOfMonth(subMonths(now, 2));
          prevEnd = endOfMonth(subMonths(now, 2));
          break;
        case "3_meses":
          periodStart = startOfMonth(subMonths(now, 2));
          prevStart = startOfMonth(subMonths(now, 5));
          prevEnd = endOfMonth(subMonths(now, 3));
          break;
        case "6_meses":
          periodStart = startOfMonth(subMonths(now, 5));
          prevStart = startOfMonth(subMonths(now, 11));
          prevEnd = endOfMonth(subMonths(now, 6));
          break;
        default: // este_mes
          periodStart = startOfMonth(now);
          prevStart = startOfMonth(subMonths(now, 1));
          prevEnd = endOfMonth(subMonths(now, 1));
          break;
      }

      const [pedidosRes, clientesRes, allPedidosRes, prevPedidosRes] = await Promise.all([
        supabase
          .from("pedidos")
          .select("*")
          .gte("data_pedido", periodStart.toISOString())
          .lte("data_pedido", periodEnd.toISOString()),
        supabase
          .from("clientes")
          .select("id")
          .gte("created_at", periodStart.toISOString())
          .lte("created_at", periodEnd.toISOString()),
        supabase
          .from("pedidos")
          .select("valor_bruto, valor_liquido, frete, taxa_pagarme, comissao, data_pedido, origem, etapa_producao, etapa_entrada_em")
          .gte("data_pedido", subMonths(now, 6).toISOString()),
        supabase
          .from("pedidos")
          .select("id")
          .gte("data_pedido", prevStart.toISOString())
          .lte("data_pedido", prevEnd.toISOString()),
      ]);

      if (pedidosRes.error) throw pedidosRes.error;
      if (clientesRes.error) throw clientesRes.error;
      if (allPedidosRes.error) throw allPedidosRes.error;

      const pedidosMes = pedidosRes.data || [];
      const faturamentoBruto = pedidosMes.reduce((s, p) => s + Number(p.valor_bruto), 0);
      const faturamentoLiquido = pedidosMes.reduce((s, p) => s + Number(p.valor_liquido), 0);
      const ticketMedio = pedidosMes.length > 0 ? faturamentoBruto / pedidosMes.length : 0;
      const totalTaxasPagarme = pedidosMes.reduce((s, p) => s + Number(p.taxa_pagarme), 0);
      const totalFrete = pedidosMes.reduce((s, p) => s + Number(p.frete), 0);
      const totalComissoes = pedidosMes.reduce((s, p) => s + Number(p.comissao), 0);
      const lucroOperacional = faturamentoBruto - totalTaxasPagarme - totalFrete - totalComissoes;

      // Variation vs previous period
      const prevCount = prevPedidosRes.data?.length || 0;
      const variacaoPedidos = prevCount > 0
        ? Math.round(((pedidosMes.length - prevCount) / prevCount) * 100)
        : 0;

      // Revenue by month
      const revenueByMonth: Record<string, number> = {};
      for (const p of allPedidosRes.data || []) {
        const key = format(new Date(p.data_pedido), "yyyy-MM");
        revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(p.valor_bruto);
      }

      // Orders by origin
      const byOrigin: Record<string, number> = {};
      for (const p of allPedidosRes.data || []) {
        byOrigin[p.origem] = (byOrigin[p.origem] || 0) + 1;
      }

      // Production status
      const byEtapa: Record<string, number> = {};
      for (const p of allPedidosRes.data || []) {
        const etapa = p.etapa_producao || "Sem etapa";
        byEtapa[etapa] = (byEtapa[etapa] || 0) + 1;
      }

      // Production deadline status
      let noPrazo = 0;
      let atencao = 0;
      let atrasado = 0;
      const activeEtapas = Object.keys(PRAZOS_ETAPA);
      for (const p of allPedidosRes.data || []) {
        if (!p.etapa_producao || !activeEtapas.includes(p.etapa_producao) || !p.etapa_entrada_em) continue;
        const prazo = PRAZOS_ETAPA[p.etapa_producao];
        const horasPassadas = differenceInHours(new Date(), new Date(p.etapa_entrada_em));
        const percentual = (horasPassadas / (prazo * 24)) * 100;
        if (percentual >= 90) atrasado++;
        else if (percentual >= 50) atencao++;
        else noPrazo++;
      }

      return {
        totalPedidosMes: pedidosMes.length,
        faturamentoBruto,
        faturamentoLiquido,
        ticketMedio,
        clientesNovos: clientesRes.data?.length || 0,
        totalTaxasPagarme,
        totalFrete,
        totalComissoes,
        lucroOperacional,
        variacaoPedidos,
        producao: { noPrazo, atencao, atrasado },
        revenueByMonth,
        byOrigin,
        byEtapa,
      };
    },
  });
}
