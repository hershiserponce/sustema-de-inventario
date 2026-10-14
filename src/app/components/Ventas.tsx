import { useState } from "react";
import { Search, Eye, X, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Factura } from "./types";

interface VentasProps {
  facturas: Factura[];
}

const formatC = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const estadoConfig = {
  pagada: { label: "Pagada", icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700" },
  pendiente: { label: "Pendiente", icon: Clock, cls: "bg-amber-100 text-amber-700" },
  anulada: { label: "Anulada", icon: XCircle, cls: "bg-red-100 text-red-700" },
};

export function Ventas({ facturas }: VentasProps) {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [detalleFactura, setDetalleFactura] = useState<Factura | null>(null);

  const filtered = facturas.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = f.numero.toLowerCase().includes(q) || f.clienteNombre.toLowerCase().includes(q);
    const matchEstado = estadoFilter ? f.estado === estadoFilter : true;
    return matchSearch && matchEstado;
  });

  const totalVentas = filtered.reduce((s, f) => s + (f.estado !== "anulada" ? f.total : 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Historial de ventas</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} factura{filtered.length !== 1 ? "s" : ""} · Total: {formatC(totalVentas)}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
        >
          <option value="">Todos los estados</option>
          <option value="pagada">Pagadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground">N° Factura</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Fecha emisión</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Pago</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Estado</th>
              <th className="text-right px-4 py-3 text-muted-foreground">Total</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No hay facturas registradas</td></tr>
            ) : (
              filtered.map((f, i) => {
                const est = estadoConfig[f.estado];
                const Icon = est.icon;
                return (
                  <tr key={f.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-5 py-3 font-mono text-xs text-primary">{f.numero}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{new Date(f.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "short", year: "numeric" })}</div>
                      <div className="text-xs text-muted-foreground/60">{new Date(f.fecha).toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{f.clienteNombre}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{f.metodoPago}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${est.cls}`}>
                        <Icon size={11} />
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{formatC(f.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => setDetalleFactura(f)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle modal */}
      {detalleFactura && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetalleFactura(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-foreground">{detalleFactura.numero}</h2>
                <p className="text-sm text-muted-foreground">{new Date(detalleFactura.fecha).toLocaleString("es-NI")}</p>
              </div>
              <button onClick={() => setDetalleFactura(null)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> <span className="text-foreground ml-1">{detalleFactura.clienteNombre}</span></div>
                <div><span className="text-muted-foreground">Pago:</span> <span className="text-foreground ml-1 capitalize">{detalleFactura.metodoPago}</span></div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">Producto</th>
                    <th className="text-center py-2 text-muted-foreground">Cant.</th>
                    <th className="text-right py-2 text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleFactura.items.map((item, i) => (
                    <tr key={`det-${i}`} className="border-b border-border/40">
                      <td className="py-2 text-foreground">{item.nombre}</td>
                      <td className="py-2 text-center text-muted-foreground">{item.cantidad}</td>
                      <td className="py-2 text-right text-foreground">{formatC(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1.5 text-sm pt-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatC(detalleFactura.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IVA (15%)</span><span>{formatC(detalleFactura.iva)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-foreground">TOTAL</span>
                  <span className="text-primary">{formatC(detalleFactura.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
