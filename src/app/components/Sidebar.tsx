import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Users,
  ChevronDown, ChevronRight, Monitor, Cpu, Smartphone, Headphones,
  Cable, Printer, Pencil, Check, X, Receipt, LogOut, Shield,
} from "lucide-react";

interface SidebarProps {
  storeName: string;
  onStoreNameChange: (name: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  usuario: { nombre: string; rol: "admin" | "vendedor" };
  onLogout: () => void;
}

const categories = [
  { id: "computadoras", label: "Computadoras", icon: Monitor },
  { id: "componentes", label: "Componentes", icon: Cpu },
  { id: "celulares", label: "Celulares", icon: Smartphone },
  { id: "audio", label: "Audio & Periféricos", icon: Headphones },
  { id: "cables", label: "Cables & Accesorios", icon: Cable },
  { id: "impresoras", label: "Impresoras", icon: Printer },
];

export function Sidebar({ storeName, onStoreNameChange, activeView, onViewChange, usuario, onLogout }: SidebarProps) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(storeName);
  const [productsOpen, setProductsOpen] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) onStoreNameChange(tempName.trim());
    setEditingName(false);
  };

  const handleCancelName = () => {
    setTempName(storeName);
    setEditingName(false);
  };

  const isProductsActive = activeView === "inventario" || activeView.startsWith("cat-");

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Store name */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Monitor size={15} className="text-white" />
          </div>
          {editingName ? (
            <input
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") handleCancelName(); }}
              className="flex-1 bg-sidebar-accent text-sidebar-foreground text-sm px-2 py-1 rounded outline-none border border-primary"
            />
          ) : (
            <span className="text-sm text-sidebar-foreground truncate flex-1">{storeName}</span>
          )}
        </div>
        {editingName ? (
          <div className="flex gap-2 mt-2 pl-10">
            <button onClick={handleSaveName} className="flex items-center gap-1 text-xs px-2 py-1 bg-primary text-white rounded hover:bg-blue-700 transition-colors">
              <Check size={11} /> Guardar
            </button>
            <button onClick={handleCancelName} className="flex items-center gap-1 text-xs px-2 py-1 bg-sidebar-accent text-sidebar-foreground rounded hover:bg-opacity-80 transition-colors">
              <X size={11} /> Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => { setTempName(storeName); setEditingName(true); }}
            className="flex items-center gap-1 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors pl-10 mt-0.5">
            <Pencil size={10} /> Editar nombre
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <NavBtn icon={<LayoutDashboard size={15} />} label="Dashboard" active={activeView === "dashboard"} onClick={() => onViewChange("dashboard")} />

        {/* Facturación */}
        <NavBtn icon={<Receipt size={15} />} label="Facturación" active={activeView === "facturacion"} onClick={() => onViewChange("facturacion")} />

        {/* Clientes */}
        <NavBtn icon={<Users size={15} />} label="Clientes" active={activeView === "clientes"} onClick={() => onViewChange("clientes")} />

        {/* Ventas */}
        <NavBtn icon={<ShoppingCart size={15} />} label="Historial de ventas" active={activeView === "ventas"} onClick={() => onViewChange("ventas")} />

        {/* Productos expandable */}
        <div>
          <button
            onClick={() => { setProductsOpen(!productsOpen); if (!isProductsActive) onViewChange("inventario"); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isProductsActive ? "bg-primary text-white" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
          >
            <Package size={15} />
            <span className="flex-1 text-left">Inventario</span>
            {productsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {(productsOpen || isProductsActive) && (
            <div className="mt-0.5 ml-3 pl-3 border-l border-sidebar-border space-y-0.5">
              <SubNavBtn label="Todos los productos" active={activeView === "inventario"} onClick={() => onViewChange("inventario")} />
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <SubNavBtn
                    key={cat.id}
                    icon={<Icon size={12} />}
                    label={cat.label}
                    active={activeView === `cat-${cat.id}`}
                    onClick={() => onViewChange(`cat-${cat.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Reportes */}
        <NavBtn icon={<BarChart2 size={15} />} label="Reportes" active={activeView === "reportes"} onClick={() => onViewChange("reportes")} />
      </nav>

      {/* Usuario y logout */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Shield size={13} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-sidebar-foreground truncate">{usuario.nombre}</div>
            <div className="text-xs text-sidebar-foreground/40 capitalize">{usuario.rol}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-primary text-white" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
      {icon}
      {label}
    </button>
  );
}

function SubNavBtn({ icon, label, active, onClick }: { icon?: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${active ? "bg-primary text-white" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}>
      {icon}
      {label}
    </button>
  );
}
