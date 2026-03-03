import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, type DashboardPeriod } from "@/hooks/useDashboardStats";
import { usePedidos } from "@/hooks/usePedidos";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShoppingBag, DollarSign, TrendingUp, UserPlus, AlertTriangle, CheckCircle, Clock, CreditCard, Truck, Percent, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const COLORS = ["hsl(210, 80%, 45%)", "hsl(142, 72%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 50%)"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "este_mes", label: "Este Mês" },
  { value: "ultimo_mes", label: "Último Mês" },
  { value: "3_meses", label: "Últimos 3 Meses" },
  { value: "6_meses", label: "Últimos 6 Meses" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("este_mes");
  const { data: stats, isLoading } = useDashboardStats(period);
  const { data: pedidos } = usePedidos();
  const recentPedidos = pedidos?.slice(0, 5) || [];

  const revenueData = stats
    ? Object.entries(stats.revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, value]) => ({
          name: format(new Date(month + "-01"), "MMM/yy", { locale: ptBR }),
          valor: value,
        }))
    : [];

  const originData = stats
    ? Object.entries(stats.byOrigin).map(([name, value]) => ({ name, value }))
    : [];

  const etapaData = stats
    ? Object.entries(stats.byEtapa).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <Select value={period} onValueChange={(v) => setPeriod(v as DashboardPeriod)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats?.totalPedidosMes || 0}</div>
              {stats?.variacaoPedidos !== 0 && (
                <p className={`text-[10px] sm:text-xs ${(stats?.variacaoPedidos || 0) >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {(stats?.variacaoPedidos || 0) >= 0 ? "+" : ""}{stats?.variacaoPedidos}% vs anterior
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Fat. Bruto</CardTitle>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.faturamentoBruto || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Fat. Líquido</CardTitle>
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.faturamentoLiquido || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(stats?.ticketMedio || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Clientes Novos</CardTitle>
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats?.clientesNovos || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Financial section */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-muted-foreground mb-3">Financeiro</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-destructive" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Taxas Pagar.me</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-base sm:text-xl font-bold text-destructive">{formatCurrency(stats?.totalTaxasPagarme || 0)}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-400">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-orange-500" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Frete / Correios</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-base sm:text-xl font-bold text-orange-600">{formatCurrency(stats?.totalFrete || 0)}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-400">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-purple-500" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Comissões</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-base sm:text-xl font-bold text-purple-600">{formatCurrency(stats?.totalComissoes || 0)}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Lucro Operacional</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-base sm:text-xl font-bold text-green-600">{formatCurrency(stats?.lucroOperacional || 0)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Production status */}
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-muted-foreground mb-3">Produção</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">No Prazo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-3xl font-bold text-blue-600">{stats?.producao.noPrazo || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-400">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Atenção</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-3xl font-bold text-orange-600">{stats?.producao.atencao || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground">Atrasado</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-3xl font-bold text-destructive">{stats?.producao.atrasado || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64 p-3 sm:p-6 pt-0 sm:pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="valor" fill="hsl(350, 45%, 65%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">Pedidos por Origem</CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64 flex items-center justify-center p-3 sm:p-6 pt-0 sm:pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={originData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={10}>
                    {originData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Production status + Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">Etapas da Produção</CardTitle>
            </CardHeader>
            <CardContent className="h-40 sm:h-48 p-3 sm:p-6 pt-0 sm:pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={etapaData} layout="vertical">
                  <XAxis type="number" fontSize={10} />
                  <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(142, 72%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">Últimos Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-3">
                {recentPedidos.map((p) => (
                  <Link
                    key={p.id}
                    to={`/pedidos/${p.id}`}
                    className="flex items-center justify-between p-1.5 sm:p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-xs sm:text-sm">#{p.numero_pedido}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm ml-2 truncate">{p.cliente_nome}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-flex">{p.etapa_producao || "—"}</Badge>
                      <span className="text-xs sm:text-sm font-medium">{formatCurrency(Number(p.valor_bruto))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
