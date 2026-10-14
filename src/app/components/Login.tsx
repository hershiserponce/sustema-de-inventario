import { useState } from "react";
import { Monitor, Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

interface LoginProps {
  storeName: string;
  onLogin: (user: { nombre: string; rol: "admin" | "vendedor" }) => void;
}

const USUARIOS = [
  { usuario: "admin", password: "admin123", nombre: "Administrador", rol: "admin" as const },
  { usuario: "vendedor", password: "venta123", nombre: "Vendedor", rol: "vendedor" as const },
];

export function Login({ storeName, onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const found = USUARIOS.find(
        (u) => u.usuario === usuario.trim().toLowerCase() && u.password === password
      );
      if (found) {
        onLogin({ nombre: found.nombre, rol: found.rol });
      } else {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / marca */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/30">
            <Monitor size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-foreground text-xl">{storeName}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Sistema de Gestión de Inventario</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-foreground text-base text-center">Iniciar sesión</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Usuario</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-9 pr-10 py-2.5 bg-input-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>

        {/* Hint usuarios */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-2">Usuarios de prueba</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-foreground">admin</div>
              <div className="text-muted-foreground">admin123 · Admin</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-foreground">vendedor</div>
              <div className="text-muted-foreground">venta123 · Vendedor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
