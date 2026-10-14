import { useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Check, ChevronUp, ChevronDown, Filter,
} from "lucide-react";
import type { Product } from "./types";

interface InventarioProps {
  products: Product[];
  onAdd: (p: Omit<Product, "id">) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  filterCategory?: string;
}

const CATEGORIAS = ["Computadoras", "Componentes", "Celulares", "Audio & Periféricos", "Cables & Accesorios", "Impresoras"];

const formatC = (n: number) =>
  `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyForm = (): Omit<Product, "id"> => ({
  nombre: "",
  categoria: CATEGORIAS[0],
  marca: "",
  precio: 0,
  costo: 0,
  stock: 0,
  stockMinimo: 5,
  codigo: "",
  descripcion: "",
  fechaEntrada: new Date().toISOString().slice(0, 10),
});

export function Inventario({ products, onAdd, onEdit, onDelete, filterCategory }: InventarioProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof Product>("nombre");
  const [sortAsc, setSortAsc] = useState(true);
  const [catFilter, setCatFilter] = useState(filterCategory ? mapCatId(filterCategory) : "");

  function mapCatId(id: string) {
    const map: Record<string, string> = {
      "cat-computadoras": "Computadoras",
      "cat-componentes": "Componentes",
      "cat-celulares": "Celulares",
      "cat-audio": "Audio & Periféricos",
      "cat-cables": "Cables & Accesorios",
      "cat-impresoras": "Impresoras",
    };
    return map[id] || "";
  }

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
      const matchCat = catFilter ? p.categoria === catFilter : true;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (typeof va === "number" && typeof vb === "number") return sortAsc ? va - vb : vb - va;
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

  function handleSort(field: keyof Product) {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  }

  function openAdd() {
    setForm(emptyForm());
    setEditProduct(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({ nombre: p.nombre, categoria: p.categoria, marca: p.marca, precio: p.precio, costo: p.costo, stock: p.stock, stockMinimo: p.stockMinimo, codigo: p.codigo, descripcion: p.descripcion, fechaEntrada: p.fechaEntrada });
    setEditProduct(p);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editProduct) onEdit({ ...editProduct, ...form });
    else onAdd(form);
    setShowForm(false);
  }

  const SortIcon = ({ field }: { field: keyof Product }) => (
    sortField === field
      ? (sortAsc ? <ChevronUp size={13} className="text-primary" /> : <ChevronDown size={13} className="text-primary" />)
      : <ChevronUp size={13} className="text-muted-foreground/30" />
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">{catFilter || "Todos los productos"}</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={15} /> Agregar producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o código..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="pl-8 pr-8 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground appearance-none"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {[
                  { label: "Código", field: "codigo" },
                  { label: "Producto", field: "nombre" },
                  { label: "Categoría", field: "categoria" },
                  { label: "Marca", field: "marca" },
                  { label: "Precio (C$)", field: "precio" },
                  { label: "Costo (C$)", field: "costo" },
                  { label: "Entrada", field: "fechaEntrada" },
                  { label: "Stock", field: "stock" },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field as keyof Product)}
                    className="text-left px-4 py-3 text-muted-foreground cursor-pointer hover:text-foreground select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field as keyof Product} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.codigo}</td>
                    <td className="px-4 py-3 text-foreground">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full">{p.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.marca}</td>
                    <td className="px-4 py-3 text-foreground">{formatC(p.precio)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatC(p.costo)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.fechaEntrada
                        ? new Date(p.fechaEntrada + "T00:00:00").toLocaleDateString("es-NI", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {deleteConfirm === p.id ? (
                        <span className="flex items-center gap-1">
                          <button onClick={() => { onDelete(p.id); setDeleteConfirm(null); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1 text-muted-foreground hover:bg-muted rounded">
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock <= p.stockMinimo ? "bg-red-100 text-red-700" : p.stock <= p.stockMinimo * 2 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {p.stock} u.
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm !== p.id && (
                        <span className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground">{editProduct ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nombre del producto" required>
                  <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-style" />
                </FormField>
                <FormField label="Código / SKU">
                  <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="input-style" placeholder="TEC-001" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Categoría">
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-style">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Marca">
                  <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="input-style" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Precio de venta (C$)" required>
                  <input required type="number" min="0" step="0.01" value={form.precio || ""} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} className="input-style" placeholder="0.00" />
                </FormField>
                <FormField label="Costo (C$)">
                  <input type="number" min="0" step="0.01" value={form.costo || ""} onChange={(e) => setForm({ ...form, costo: parseFloat(e.target.value) || 0 })} className="input-style" placeholder="0.00" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Stock actual">
                  <input type="number" min="0" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input-style" placeholder="0" />
                </FormField>
                <FormField label="Stock mínimo">
                  <input type="number" min="0" value={form.stockMinimo || ""} onChange={(e) => setForm({ ...form, stockMinimo: parseInt(e.target.value) || 0 })} className="input-style" placeholder="5" />
                </FormField>
              </div>
              <FormField label="Fecha de entrada al inventario">
                <input
                  type="date"
                  value={form.fechaEntrada}
                  onChange={(e) => setForm({ ...form, fechaEntrada: e.target.value })}
                  className="input-style"
                />
              </FormField>
              <FormField label="Descripción">
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="input-style resize-none" />
              </FormField>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  {editProduct ? "Guardar cambios" : "Agregar producto"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.input-style { width: 100%; padding: 0.5rem 0.75rem; background: var(--input-background); border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; color: var(--foreground); outline: none; transition: box-shadow 0.15s; } .input-style:focus { box-shadow: 0 0 0 2px rgba(26,86,219,0.25); }`}</style>
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-muted-foreground mb-1">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
