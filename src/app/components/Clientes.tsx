import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Check, User, Building2 } from "lucide-react";
import type { Cliente } from "./types";

interface ClientesProps {
  clientes: Cliente[];
  onAdd: (c: Omit<Cliente, "id">) => void;
  onEdit: (c: Cliente) => void;
  onDelete: (id: number) => void;
}

const emptyForm = (): Omit<Cliente, "id"> => ({
  nombre: "",
  cedula: "",
  telefono: "",
  correo: "",
  direccion: "",
  tipo: "natural",
});

export function Clientes({ clientes, onAdd, onEdit, onDelete }: ClientesProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id">>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.cedula.includes(q) ||
      c.telefono.includes(q) ||
      c.correo.toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setForm(emptyForm());
    setEditCliente(null);
    setShowForm(true);
  }

  function openEdit(c: Cliente) {
    setForm({ nombre: c.nombre, cedula: c.cedula, telefono: c.telefono, correo: c.correo, direccion: c.direccion, tipo: c.tipo });
    setEditCliente(c);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editCliente) onEdit({ ...editCliente, ...form });
    else onAdd(form);
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, cédula, teléfono..."
          className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Cédula / RUC</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Teléfono</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Correo</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Tipo</th>
              <th className="px-5 py-3 text-right text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron clientes</td></tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                        {c.tipo === "empresa" ? <Building2 size={13} className="text-primary" /> : <User size={13} className="text-primary" />}
                      </div>
                      <span className="text-foreground">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.cedula || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.telefono || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.correo || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.tipo === "empresa" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {c.tipo === "empresa" ? "Empresa" : "Natural"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {deleteConfirm === c.id ? (
                      <span className="flex items-center justify-end gap-1">
                        <button onClick={() => { onDelete(c.id); setDeleteConfirm(null); }} className="p-1 text-red-600 hover:bg-red-50 rounded"><Check size={14} /></button>
                        <button onClick={() => setDeleteConfirm(null)} className="p-1 text-muted-foreground hover:bg-muted rounded"><X size={14} /></button>
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground">{editCliente ? "Editar cliente" : "Nuevo cliente"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Tipo de cliente</label>
                <div className="flex gap-3">
                  {(["natural", "empresa"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })}
                      className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${form.tipo === t ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                      {t === "natural" ? "Persona Natural" : "Empresa"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">Nombre completo <span className="text-destructive">*</span></label>
                  <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">{form.tipo === "empresa" ? "RUC" : "Cédula"}</label>
                  <input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground" placeholder={form.tipo === "empresa" ? "J-000000000" : "000-000000-0000X"} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground" placeholder="8888-0000" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">Correo electrónico</label>
                  <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-muted-foreground mb-1">Dirección</label>
                  <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  {editCliente ? "Guardar cambios" : "Registrar cliente"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
