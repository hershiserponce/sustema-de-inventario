import { useState, useRef } from "react";
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, X, ShoppingCart, User } from "lucide-react";
import type { Product, Cliente, Factura, ItemFactura } from "./types";

interface FacturacionProps {
  products: Product[];
  clientes: Cliente[];
  onGuardarFactura: (f: Omit<Factura, "id" | "numero">) => Factura;
  storeName: string;
}

const IVA_RATE = 0.15;

const formatC = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Facturacion({ products, clientes, onGuardarFactura, storeName }: FacturacionProps) {
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [items, setItems] = useState<ItemFactura[]>([]);
  const [metodoPago, setMetodoPago] = useState<Factura["metodoPago"]>("efectivo");
  const [showClienteSearch, setShowClienteSearch] = useState(false);
  const [facturaGuardada, setFacturaGuardada] = useState<Factura | null>(null);
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const productosFiltrados = products.filter((p) => {
    const q = busquedaProducto.toLowerCase();
    return (p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)) && p.stock > 0;
  });

  const clientesFiltrados = clientes.filter((c) => {
    const q = busquedaCliente.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || c.cedula.includes(q);
  });

  function agregarProducto(p: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === p.id);
      if (existing) {
        if (existing.cantidad >= p.stock) return prev;
        return prev.map((i) =>
          i.productoId === p.id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario }
            : i
        );
      }
      return [...prev, { productoId: p.id, nombre: p.nombre, codigo: p.codigo, cantidad: 1, precioUnitario: p.precio, subtotal: p.precio }];
    });
    setBusquedaProducto("");
  }

  function cambiarCantidad(productoId: number, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== productoId) return i;
          const nuevaCant = i.cantidad + delta;
          if (nuevaCant <= 0) return null;
          const maxStock = products.find((p) => p.id === productoId)?.stock ?? 999;
          const cant = Math.min(nuevaCant, maxStock);
          return { ...i, cantidad: cant, subtotal: cant * i.precioUnitario };
        })
        .filter(Boolean) as ItemFactura[]
    );
  }

  function eliminarItem(productoId: number) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  const subtotalGeneral = items.reduce((s, i) => s + i.subtotal, 0);
  const ivaAmount = subtotalGeneral * IVA_RATE;
  const totalGeneral = subtotalGeneral + ivaAmount;
  const cambio = parseFloat(efectivoRecibido || "0") - totalGeneral;

  function handleGuardar() {
    if (!clienteSeleccionado || items.length === 0) return;
    const f: Omit<Factura, "id" | "numero"> = {
      fecha: new Date().toISOString(),
      clienteId: clienteSeleccionado.id,
      clienteNombre: clienteSeleccionado.nombre,
      items,
      subtotal: subtotalGeneral,
      iva: ivaAmount,
      total: totalGeneral,
      estado: "pagada",
      metodoPago,
    };
    const factura = onGuardarFactura(f);
    setFacturaGuardada(factura);
  }

  function handleNuevaFactura() {
    setFacturaGuardada(null);
    setItems([]);
    setClienteSeleccionado(null);
    setBusquedaProducto("");
    setBusquedaCliente("");
    setEfectivoRecibido("");
    setMetodoPago("efectivo");
  }

  function handlePrint() {
    window.print();
  }

  if (facturaGuardada) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <CheckCircle size={22} />
          <div>
            <div className="font-medium">Factura registrada exitosamente</div>
            <div className="text-sm text-emerald-700">
              {facturaGuardada.numero} · Emitida el {new Date(facturaGuardada.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "long", year: "numeric" })} a las {new Date(facturaGuardada.fecha).toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <div ref={printRef} className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header factura */}
          <div className="bg-primary text-white px-6 py-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg text-white/90">{storeName}</div>
                <div className="text-sm text-white/70 mt-0.5">Managua, Nicaragua · RUC: J-0000000-0001</div>
              </div>
              <div className="text-right">
                <div className="text-lg">{facturaGuardada.numero}</div>
                <div className="text-sm text-white/70">
                  {new Date(facturaGuardada.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
                <div className="text-xs text-white/50">
                  {new Date(facturaGuardada.fecha).toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <span className="text-foreground ml-2">{facturaGuardada.clienteNombre}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Método de pago:</span>
                <span className="text-foreground ml-2 capitalize">{facturaGuardada.metodoPago}</span>
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-6 py-2.5 text-muted-foreground">Descripción</th>
                <th className="text-center px-4 py-2.5 text-muted-foreground">Cant.</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground">P. Unit.</th>
                <th className="text-right px-6 py-2.5 text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {facturaGuardada.items.map((item, i) => (
                <tr key={`item-${i}`} className="border-b border-border/40">
                  <td className="px-6 py-2.5 text-foreground">{item.nombre} <span className="text-xs text-muted-foreground">({item.codigo})</span></td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground">{item.cantidad}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{formatC(item.precioUnitario)}</td>
                  <td className="px-6 py-2.5 text-right text-foreground">{formatC(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-muted/10 border-t border-border space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatC(facturaGuardada.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (15%)</span>
              <span className="text-foreground">{formatC(facturaGuardada.iva)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-foreground">TOTAL</span>
              <span className="text-primary text-lg">{formatC(facturaGuardada.total)}</span>
            </div>
            {metodoPago === "efectivo" && efectivoRecibido && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efectivo recibido</span>
                  <span className="text-foreground">{formatC(parseFloat(efectivoRecibido))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cambio</span>
                  <span className="text-emerald-600">{formatC(Math.max(0, parseFloat(efectivoRecibido) - facturaGuardada.total))}</span>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-3 text-center text-xs text-muted-foreground border-t border-border">
            ¡Gracias por su compra! · {storeName}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <Printer size={15} /> Imprimir factura
          </button>
          <button onClick={handleNuevaFactura} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm">
            <Plus size={15} /> Nueva factura
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Left: product search */}
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h1 className="text-foreground">Nueva factura</h1>
          <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString("es-NI", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Cliente */}
        <div className="bg-card border border-border rounded-xl p-4">
          <label className="block text-sm text-muted-foreground mb-2">Cliente <span className="text-destructive">*</span></label>
          {clienteSeleccionado ? (
            <div className="flex items-center justify-between bg-accent rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <User size={15} className="text-primary" />
                <span className="text-sm text-foreground">{clienteSeleccionado.nombre}</span>
                <span className="text-xs text-muted-foreground">{clienteSeleccionado.cedula}</span>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </div>
          ) : (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={busquedaCliente}
                onChange={(e) => { setBusquedaCliente(e.target.value); setShowClienteSearch(true); }}
                onFocus={() => setShowClienteSearch(true)}
                placeholder="Buscar cliente por nombre o cédula..."
                className="w-full pl-8 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
              {showClienteSearch && busquedaCliente && (
                <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {clientesFiltrados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No se encontraron clientes</div>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button key={c.id} onClick={() => { setClienteSeleccionado(c); setBusquedaCliente(""); setShowClienteSearch(false); }}
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

        {/* Buscar producto */}
        <div className="bg-card border border-border rounded-xl p-4">
          <label className="block text-sm text-muted-foreground mb-2">Agregar producto</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              placeholder="Buscar por nombre, código o marca..."
              className="w-full pl-8 pr-4 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            />
          </div>
          {busquedaProducto && (
            <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
              {productosFiltrados.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</div>
              ) : (
                productosFiltrados.map((p) => (
                  <button key={p.id} onClick={() => agregarProducto(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-sm border-b border-border/40 last:border-0">
                    <div className="text-left">
                      <div className="text-foreground">{p.nombre}</div>
                      <div className="text-xs text-muted-foreground">{p.codigo} · Stock: {p.stock}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-primary">{formatC(p.precio)}</div>
                      <Plus size={14} className="text-muted-foreground ml-auto" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Items carrito */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <ShoppingCart size={15} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Artículos ({items.length})</span>
          </div>
          {items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">Agregue productos a la factura</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left px-5 py-2.5 text-muted-foreground">Producto</th>
                  <th className="text-center px-4 py-2.5 text-muted-foreground">Cant.</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground">Precio</th>
                  <th className="text-right px-5 py-2.5 text-muted-foreground">Subtotal</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productoId} className="border-b border-border/40">
                    <td className="px-5 py-2.5 text-foreground">{item.nombre}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => cambiarCantidad(item.productoId, -1)} className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"><Minus size={12} /></button>
                        <span className="w-6 text-center text-foreground">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.productoId, 1)} className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"><Plus size={12} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{formatC(item.precioUnitario)}</td>
                    <td className="px-5 py-2.5 text-right text-foreground">{formatC(item.subtotal)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => eliminarItem(item.productoId)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: resumen */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-0">
          <h3 className="text-foreground">Resumen de factura</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatC(subtotalGeneral)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (15%)</span>
              <span className="text-foreground">{formatC(ivaAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-foreground">TOTAL</span>
              <span className="text-primary text-lg">{formatC(totalGeneral)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {(["efectivo", "tarjeta", "transferencia"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMetodoPago(m)}
                  className={`py-1.5 rounded-lg border text-xs transition-colors capitalize ${metodoPago === m ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {metodoPago === "efectivo" && (
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Efectivo recibido (C$)</label>
              <input
                type="number"
                value={efectivoRecibido}
                onChange={(e) => setEfectivoRecibido(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
              {efectivoRecibido && parseFloat(efectivoRecibido) >= totalGeneral && (
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">Cambio</span>
                  <span className="text-emerald-600">{formatC(cambio)}</span>
                </div>
              )}
              {efectivoRecibido && parseFloat(efectivoRecibido) < totalGeneral && (
                <div className="text-xs text-destructive mt-1">Monto insuficiente</div>
              )}
            </div>
          )}

          <button
            onClick={handleGuardar}
            disabled={!clienteSeleccionado || items.length === 0 || (metodoPago === "efectivo" && efectivoRecibido !== "" && parseFloat(efectivoRecibido) < totalGeneral)}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar y emitir factura
          </button>

          {(!clienteSeleccionado || items.length === 0) && (
            <p className="text-xs text-muted-foreground text-center">
              {!clienteSeleccionado ? "Seleccione un cliente" : "Agregue al menos un producto"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
