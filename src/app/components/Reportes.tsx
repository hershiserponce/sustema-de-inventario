import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package, User, X, FileText } from "lucide-react";
import type { Factura, Product, Cliente } from "./types";

interface ReportesProps {
  facturas: Factura[];
  products: Product[];
  clientes: Cliente[];
}

const formatC = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COLORS = ["#1a56db", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function Reportes({ facturas, products, clientes }: ReportesProps) {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Si hay cliente seleccionado, filtra por él; si no, todos
  const facturasBase = facturas.filter((f) => f.estado !== "anulada");
  const facturasValidas = clienteSeleccionado
    ? facturasBase.filter((f) => f.clienteId === clienteSeleccionado.id)
    : facturasBase;

  const clientesFiltrados = clientes.filter((c) => {
    const q = busquedaCliente.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || c.cedula.includes(q);
  });

  const totalIngresos = facturasValidas.reduce((s, f) => s + f.total, 0);
  const totalIVA = facturasValidas.reduce((s, f) => s + f.iva, 0);
  const ticketPromedio = facturasValidas.length > 0 ? totalIngresos / facturasValidas.length : 0;

  // Ventas por día (últimos 7 días)
  const hoy = new Date();
  const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = facturasValidas
      .filter((f) => f.fecha.slice(0, 10) === key)
      .reduce((s, f) => s + f.total, 0);
    return { dia: d.toLocaleDateString("es-NI", { weekday: "short", day: "numeric" }), total };
  });

  // Ventas por método de pago
  const pagoData = ["efectivo", "tarjeta", "transferencia"].map((m) => ({
    name: m.charAt(0).toUpperCase() + m.slice(1),
    value: facturasValidas.filter((f) => f.metodoPago === m).length,
  })).filter((d) => d.value > 0);

  // Productos más vendidos
  const productoVentas: Record<number, { nombre: string; cantidad: number; total: number }> = {};
  facturasValidas.forEach((f) => {
    f.items.forEach((item) => {
      if (!productoVentas[item.productoId]) {
        productoVentas[item.productoId] = { nombre: item.nombre, cantidad: 0, total: 0 };
      }
      productoVentas[item.productoId].cantidad += item.cantidad;
      productoVentas[item.productoId].total += item.subtotal;
    });
  });
  const topProductos = Object.values(productoVentas).sort((a, b) => b.total - a.total).slice(0, 5);

  // Clientes más frecuentes (solo si no hay filtro de cliente)
  const clienteFreq: Record<string, { nombre: string; facturas: number; total: number }> = {};
  facturasBase.forEach((f) => {
    if (!clienteFreq[f.clienteNombre]) {
      clienteFreq[f.clienteNombre] = { nombre: f.clienteNombre, facturas: 0, total: 0 };
    }
    clienteFreq[f.clienteNombre].facturas += 1;
    clienteFreq[f.clienteNombre].total += f.total;
  });
  const topClientes = Object.values(clienteFreq).sort((a, b) => b.total - a.total).slice(0, 5);

  // Stock bajo
  const stockBajo = products.filter((p) => p.stock <= p.stockMinimo);

  const maxVentaDia = Math.max(...ventasPorDia.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Header con selector de cliente */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Reportes</h1>
          <p className="text-muted-foreground text-sm">
            {clienteSeleccionado ? `Reporte de: ${clienteSeleccionado.nombre}` : "Análisis general del negocio"}
          </p>
        </div>

        {/* Selector de cliente */}
        <div className="relative min-w-64">
          {clienteSeleccionado ? (
            <div className="flex items-center gap-2 bg-card border border-primary rounded-lg px-3 py-2">
              <User size={14} className="text-primary shrink-0" />
              <span className="text-sm text-foreground flex-1 truncate">{clienteSeleccionado.nombre}</span>
              <button
                onClick={() => { setClienteSeleccionado(null); setBusquedaCliente(""); }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={busquedaCliente}
                onChange={(e) => { setBusquedaCliente(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Filtrar por cliente..."
                className="w-full pl-8 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
              {showSearch && busquedaCliente && (
                <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setClienteSeleccionado(null); setBusquedaCliente(""); setShowSearch(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm text-muted-foreground border-b border-border"
                  >
                    Ver todos los clientes
                  </button>
                  {clientesFiltrados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</div>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(""); setShowSearch(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm">
                        <span className="text-foreground">{c.nombre}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{c.cedula}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos totales", value: formatC(totalIngresos), icon: <DollarSign size={18} className="text-blue-600" />, bg: "bg-blue-50" },
          { label: "Facturas emitidas", value: facturasValidas.length.toString(), icon: <ShoppingCart size={18} className="text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Ticket promedio", value: formatC(ticketPromedio), icon: <TrendingUp size={18} className="text-purple-600" />, bg: "bg-purple-50" },
          { label: "IVA generado", value: formatC(totalIVA), icon: <Package size={18} className="text-amber-600" />, bg: "bg-amber-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>{kpi.icon}</div>
            </div>
            <div className="text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      {facturasValidas.length === 0 ? (
        <div className="bg-card rounded-xl border border-border py-16 text-center">
          <FileText size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {clienteSeleccionado ? `${clienteSeleccionado.nombre} no tiene ventas registradas` : "No hay ventas registradas aún"}
          </p>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ventas últimos 7 días — CSS bars */}
            <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
              <h3 className="text-foreground mb-4">Ventas últimos 7 días (C$)</h3>
              <div className="flex items-end gap-2 h-40">
                {ventasPorDia.map((d) => {
                  const pct = (d.total / maxVentaDia) * 100;
                  return (
                    <div key={d.dia} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end justify-center" style={{ height: "110px" }}>
                        {pct > 0 ? (
                          <div
                            className="w-full rounded-t-md bg-primary group-hover:bg-blue-700 transition-colors"
                            style={{ height: `${pct}%` }}
                            title={formatC(d.total)}
                          />
                        ) : (
                          <div className="w-full rounded-t-md bg-muted" style={{ height: "4px" }} />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground text-center leading-tight">{d.dia}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="text-foreground mb-4">Método de pago</h3>
              {pagoData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart id="rpt-pie-pago">
                    <Pie data={pagoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" isAnimationActive={false}>
                      {pagoData.map((_, i) => (
                        <Cell key={`pie-cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2eaf4", borderRadius: 8, fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top productos */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-foreground">Productos más vendidos</h3>
              </div>
              {topProductos.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">Sin datos</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left px-5 py-2.5 text-muted-foreground">Producto</th>
                      <th className="text-right px-4 py-2.5 text-muted-foreground">Unid.</th>
                      <th className="text-right px-5 py-2.5 text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={`tp-${i}`} className="border-b border-border/40">
                        <td className="px-5 py-2.5 text-foreground">{p.nombre}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{p.cantidad}</td>
                        <td className="px-5 py-2.5 text-right text-foreground">{formatC(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Facturas del cliente seleccionado, o top clientes si no hay filtro */}
            {clienteSeleccionado ? (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-foreground">Facturas de {clienteSeleccionado.nombre}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left px-5 py-2.5 text-muted-foreground">N° Factura</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground">Fecha</th>
                      <th className="text-right px-5 py-2.5 text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasValidas.map((f) => (
                      <tr key={f.id} className="border-b border-border/40">
                        <td className="px-5 py-2.5 font-mono text-xs text-primary">{f.numero}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{new Date(f.fecha).toLocaleDateString("es-NI")}</td>
                        <td className="px-5 py-2.5 text-right text-foreground">{formatC(f.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/20">
                      <td className="px-5 py-2.5 text-muted-foreground text-xs" colSpan={2}>Total comprado</td>
                      <td className="px-5 py-2.5 text-right text-primary">{formatC(totalIngresos)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border"><h3 className="text-foreground">Mejores clientes</h3></div>
                {topClientes.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">Sin datos</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="text-left px-5 py-2.5 text-muted-foreground">Cliente</th>
                        <th className="text-right px-4 py-2.5 text-muted-foreground">Facturas</th>
                        <th className="text-right px-5 py-2.5 text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientes.map((c, i) => (
                        <tr key={`tc-${i}`} className="border-b border-border/40">
                          <td className="px-5 py-2.5 text-foreground">{c.nombre}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">{c.facturas}</td>
                          <td className="px-5 py-2.5 text-right text-foreground">{formatC(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <div className="bg-card rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-200 bg-amber-50">
            <h3 className="text-amber-800">Alerta: Productos con stock bajo ({stockBajo.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-5 py-2.5 text-muted-foreground">Producto</th>
                <th className="text-left px-4 py-2.5 text-muted-foreground">Categoría</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground">Stock actual</th>
                <th className="text-right px-5 py-2.5 text-muted-foreground">Stock mínimo</th>
              </tr>
            </thead>
            <tbody>
              {stockBajo.map((p) => (
                <tr key={p.id} className="border-b border-border/40">
                  <td className="px-5 py-2.5 text-foreground">{p.nombre}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.categoria}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{p.stock} u.</span>
                  </td>
                  <td className="px-5 py-2.5 text-right text-muted-foreground">{p.stockMinimo} u.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
