import {
  Package, Receipt, Users, BarChart2, ShoppingCart,
  AlertTriangle, ArrowRight, Monitor, Cpu, Smartphone,
  Headphones, Cable, Printer,
} from "lucide-react";
import type { Product, Factura } from "./types";

interface DashboardProps {
  products: Product[];
  storeName: string;
  userName: string;
  facturas: Factura[];
  onNavigate: (view: string) => void;
}

const formatC = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const categorias = [
  { id: "cat-computadoras", label: "Computadoras", icon: Monitor, color: "bg-blue-100 text-blue-700" },
  { id: "cat-componentes", label: "Componentes", icon: Cpu, color: "bg-indigo-100 text-indigo-700" },
  { id: "cat-celulares", label: "Celulares", icon: Smartphone, color: "bg-emerald-100 text-emerald-700" },
  { id: "cat-audio", label: "Audio & Periféricos", icon: Headphones, color: "bg-purple-100 text-purple-700" },
  { id: "cat-cables", label: "Cables & Accesorios", icon: Cable, color: "bg-amber-100 text-amber-700" },
  { id: "cat-impresoras", label: "Impresoras", icon: Printer, color: "bg-red-100 text-red-700" },
];

const menuPrincipal = [
  {
    id: "facturacion",
    label: "Facturación",
    desc: "Crear nueva factura de venta",
    icon: Receipt,
    color: "bg-blue-600",
    hover: "hover:bg-blue-700",
  },
  {
    id: "inventario",
    label: "Gestionar Productos",
    desc: "Ver, agregar y editar inventario",
    icon: Package,
    color: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
  },
  {
    id: "clientes",
    label: "Clientes",
    desc: "Administrar clientes registrados",
    icon: Users,
    color: "bg-purple-600",
    hover: "hover:bg-purple-700",
  },
  {
    id: "ventas",
    label: "Historial de Ventas",
    desc: "Consultar facturas emitidas",
    icon: ShoppingCart,
    color: "bg-amber-600",
    hover: "hover:bg-amber-700",
  },
  {
    id: "reportes",
    label: "Reportes",
    desc: "Análisis y estadísticas del negocio",
    icon: BarChart2,
    color: "bg-rose-600",
    hover: "hover:bg-rose-700",
  },
];

export function Dashboard({ products, storeName, userName, facturas, onNavigate }: DashboardProps) {
  const stockBajo = products.filter((p) => p.stock <= p.stockMinimo);
  const totalProductos = products.length;
  const facturasHoy = facturas.filter(
    (f) => f.estado !== "anulada" && f.fecha.slice(0, 10) === new Date().toISOString().slice(0, 10)
  );
  const ventasHoy = facturasHoy.reduce((s, f) => s + f.total, 0);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Saludo */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground">{saludo}, {userName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("es-NI", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{storeName}</div>
        </div>
      </div>

      {/* Alertas rápidas */}
      {(stockBajo.length > 0 || facturasHoy.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {facturasHoy.length > 0 && (
            <button onClick={() => onNavigate("ventas")}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
              <ShoppingCart size={14} />
              {facturasHoy.length} venta{facturasHoy.length !== 1 ? "s" : ""} hoy · {formatC(ventasHoy)}
              <ArrowRight size={12} />
            </button>
          )}
          {stockBajo.length > 0 && (
            <button onClick={() => onNavigate("inventario")}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
              <AlertTriangle size={14} />
              {stockBajo.length} producto{stockBajo.length !== 1 ? "s" : ""} con stock bajo
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}

      {/* Menú principal */}
      <div>
        <h3 className="text-foreground mb-3">Menú principal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {menuPrincipal.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`${item.color} ${item.hover} text-white rounded-xl p-5 text-left transition-colors group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={16} className="text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-base text-white">{item.label}</div>
                <div className="text-sm text-white/70 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gestión rápida por categoría */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground">Gestionar por categoría</h3>
          <button onClick={() => onNavigate("inventario")} className="text-xs text-primary hover:underline flex items-center gap-1">
            Ver todo <ArrowRight size={11} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {categorias.map((cat) => {
            const Icon = cat.icon;
            const count = products.filter((p) => p.categoria === cat.label).length;
            const bajoCat = products.filter((p) => p.categoria === cat.label && p.stock <= p.stockMinimo).length;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate(cat.id)}
                className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center mb-2`}>
                  <Icon size={17} />
                </div>
                <div className="text-xs text-foreground leading-tight">{cat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{count} producto{count !== 1 ? "s" : ""}</div>
                {bajoCat > 0 && (
                  <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-0.5">
                    <AlertTriangle size={10} /> {bajoCat} bajo
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl text-foreground">{totalProductos}</div>
          <div className="text-xs text-muted-foreground mt-1">Productos</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl text-foreground">{facturas.filter(f => f.estado !== "anulada").length}</div>
          <div className="text-xs text-muted-foreground mt-1">Facturas totales</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`text-2xl ${stockBajo.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>{stockBajo.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Stock bajo</div>
        </div>
      </div>
    </div>
  );
}
