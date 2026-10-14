import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inventario } from "./components/Inventario";
import { Clientes } from "./components/Clientes";
import { Facturacion } from "./components/Facturacion";
import { Ventas } from "./components/Ventas";
import { Reportes } from "./components/Reportes";
import { Login } from "./components/Login";
import { LogOut } from "lucide-react";
import type { Product, Cliente, Factura } from "./components/types";

const initialProducts: Product[] = [
  { id: 1, nombre: "Laptop Dell Inspiron 15", categoria: "Computadoras", marca: "Dell", precio: 42500, costo: 35000, stock: 8, stockMinimo: 3, codigo: "LAP-001", descripcion: "Intel i5, 8GB RAM, 256GB SSD", fechaEntrada: "2026-05-10" },
  { id: 2, nombre: "Monitor LG 24\" Full HD", categoria: "Computadoras", marca: "LG", precio: 12800, costo: 9500, stock: 15, stockMinimo: 5, codigo: "MON-002", descripcion: "1080p, 75Hz, IPS", fechaEntrada: "2026-05-12" },
  { id: 3, nombre: "iPhone 14 128GB", categoria: "Celulares", marca: "Apple", precio: 65000, costo: 55000, stock: 4, stockMinimo: 5, codigo: "CEL-003", descripcion: "Negro, desbloqueado", fechaEntrada: "2026-05-15" },
  { id: 4, nombre: "Samsung Galaxy S23", categoria: "Celulares", marca: "Samsung", precio: 58000, costo: 48000, stock: 6, stockMinimo: 4, codigo: "CEL-004", descripcion: "256GB, Phantom Black", fechaEntrada: "2026-05-15" },
  { id: 5, nombre: "Audífonos Sony WH-1000XM5", categoria: "Audio & Periféricos", marca: "Sony", precio: 14500, costo: 10800, stock: 10, stockMinimo: 3, codigo: "AUD-005", descripcion: "Cancelación de ruido, Bluetooth", fechaEntrada: "2026-05-18" },
  { id: 6, nombre: "Teclado Mecánico Redragon", categoria: "Audio & Periféricos", marca: "Redragon", precio: 3200, costo: 2100, stock: 20, stockMinimo: 8, codigo: "PER-006", descripcion: "RGB, switches azules", fechaEntrada: "2026-05-20" },
  { id: 7, nombre: "SSD Kingston 1TB NVMe", categoria: "Componentes", marca: "Kingston", precio: 5800, costo: 4200, stock: 12, stockMinimo: 5, codigo: "COM-007", descripcion: "M.2 PCIe 4.0, 3500MB/s", fechaEntrada: "2026-05-22" },
  { id: 8, nombre: "RAM Corsair 16GB DDR4", categoria: "Componentes", marca: "Corsair", precio: 3600, costo: 2700, stock: 18, stockMinimo: 6, codigo: "COM-008", descripcion: "3200MHz, Vengeance RGB", fechaEntrada: "2026-05-22" },
  { id: 9, nombre: "Cable HDMI 2.0 2m", categoria: "Cables & Accesorios", marca: "Genérico", precio: 320, costo: 180, stock: 50, stockMinimo: 15, codigo: "CAB-009", descripcion: "4K 60Hz", fechaEntrada: "2026-06-01" },
  { id: 10, nombre: "Impresora HP LaserJet Pro", categoria: "Impresoras", marca: "HP", precio: 8900, costo: 6800, stock: 5, stockMinimo: 2, codigo: "IMP-010", descripcion: "Monocromática, WiFi, 29ppm", fechaEntrada: "2026-06-03" },
  { id: 11, nombre: "Mouse Logitech MX Master 3", categoria: "Audio & Periféricos", marca: "Logitech", precio: 4500, costo: 3200, stock: 14, stockMinimo: 5, codigo: "PER-011", descripcion: "Inalámbrico, 4000 DPI", fechaEntrada: "2026-06-05" },
  { id: 12, nombre: "Procesador AMD Ryzen 5 7600", categoria: "Componentes", marca: "AMD", precio: 12500, costo: 9800, stock: 7, stockMinimo: 3, codigo: "COM-012", descripcion: "6 núcleos, 5.1GHz boost, AM5", fechaEntrada: "2026-06-10" },
];

const initialClientes: Cliente[] = [
  { id: 1, nombre: "Juan Carlos Pérez", cedula: "001-230589-0001K", telefono: "8888-1234", correo: "juan@gmail.com", direccion: "Bo. El Carmen, Managua", tipo: "natural" },
  { id: 2, nombre: "María López Ramos", cedula: "001-150392-0002F", telefono: "7777-5678", correo: "maria.lopez@hotmail.com", direccion: "Las Colinas, Managua", tipo: "natural" },
  { id: 3, nombre: "TechSolutions S.A.", cedula: "J-0000123456", telefono: "2222-0001", correo: "compras@techsolutions.com.ni", direccion: "Centro Pellas, Managua", tipo: "empresa" },
  { id: 4, nombre: "Carlos Mendoza", cedula: "002-040178-0003L", telefono: "8956-7890", correo: "c.mendoza@yahoo.com", direccion: "Ciudad Jardín, Managua", tipo: "natural" },
];

const catViewMap: Record<string, string> = {
  "cat-computadoras": "Computadoras",
  "cat-componentes": "Componentes",
  "cat-celulares": "Celulares",
  "cat-audio": "Audio & Periféricos",
  "cat-cables": "Cables & Accesorios",
  "cat-impresoras": "Impresoras",
};

let productIdSeq = initialProducts.length + 1;
let clienteIdSeq = initialClientes.length + 1;
let facturaIdSeq = 1;

interface Usuario { nombre: string; rol: "admin" | "vendedor" }

interface PersistedData {
  storeName?: string;
  products?: Product[];
  clientes?: Cliente[];
  facturas?: Factura[];
}

const STORAGE_KEY = "inventario-data";

async function loadPersistedData(): Promise<PersistedData | null> {
  if (window.api?.loadData) {
    try {
      return (await window.api.loadData()) as PersistedData | null;
    } catch {
      return null;
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedData) : null;
  } catch {
    return null;
  }
}

async function savePersistedData(data: PersistedData): Promise<void> {
  if (window.api?.saveData) {
    try {
      await window.api.saveData(data);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function nextSeq(items: { id: number }[] | undefined): number {
  return Math.max(0, ...(items ?? []).map((i) => i.id)) + 1;
}

export default function App() {
  const [storeName, setStoreName] = useState("TechStore Nicaragua");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Cargar datos guardados (archivo JSON en Electron, localStorage en navegador)
  useEffect(() => {
    let active = true;
    loadPersistedData().then((data) => {
      if (!active) return;
      if (data) {
        if (data.storeName) setStoreName(data.storeName);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.clientes)) setClientes(data.clientes);
        if (Array.isArray(data.facturas)) setFacturas(data.facturas);
        productIdSeq = nextSeq(data.products);
        clienteIdSeq = nextSeq(data.clientes);
        facturaIdSeq = nextSeq(data.facturas);
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Guardar automáticamente cuando cambian los datos
  useEffect(() => {
    if (!hydrated) return;
    savePersistedData({ storeName, products, clientes, facturas });
  }, [hydrated, storeName, products, clientes, facturas]);

  // Products
  const handleAddProduct = (p: Omit<Product, "id">) => setProducts((prev) => [...prev, { ...p, id: productIdSeq++ }]);
  const handleEditProduct = (p: Product) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const handleDeleteProduct = (id: number) => setProducts((prev) => prev.filter((x) => x.id !== id));

  // Clientes
  const handleAddCliente = (c: Omit<Cliente, "id">) => setClientes((prev) => [...prev, { ...c, id: clienteIdSeq++ }]);
  const handleEditCliente = (c: Cliente) => setClientes((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  const handleDeleteCliente = (id: number) => setClientes((prev) => prev.filter((x) => x.id !== id));

  // Facturas
  const handleGuardarFactura = (f: Omit<Factura, "id" | "numero">): Factura => {
    const id = facturaIdSeq++;
    const numero = `FAC-${String(id).padStart(6, "0")}`;
    const factura: Factura = { ...f, id, numero };
    setFacturas((prev) => [...prev, factura]);
    setProducts((prev) =>
      prev.map((p) => {
        const item = f.items.find((i) => i.productoId === p.id);
        if (!item) return p;
        return { ...p, stock: Math.max(0, p.stock - item.cantidad) };
      })
    );
    return factura;
  };

  const getFilteredProducts = () => {
    if (activeView.startsWith("cat-")) {
      const cat = catViewMap[activeView];
      return cat ? products.filter((p) => p.categoria === cat) : products;
    }
    return products;
  };

  // Login screen
  if (!usuario) {
    return <Login storeName={storeName} onLogin={setUsuario} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            products={products}
            storeName={storeName}
            userName={usuario.nombre}
            facturas={facturas}
            onNavigate={setActiveView}
          />
        );
      case "facturacion":
        return <Facturacion products={products} clientes={clientes} onGuardarFactura={handleGuardarFactura} storeName={storeName} key={facturas.length} />;
      case "clientes":
        return <Clientes clientes={clientes} onAdd={handleAddCliente} onEdit={handleEditCliente} onDelete={handleDeleteCliente} />;
      case "ventas":
        return <Ventas facturas={facturas} />;
      case "reportes":
        return <Reportes facturas={facturas} products={products} clientes={clientes} />;
      default:
        if (activeView === "inventario" || activeView.startsWith("cat-")) {
          return (
            <Inventario
              products={getFilteredProducts()}
              onAdd={handleAddProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              filterCategory={activeView.startsWith("cat-") ? activeView : undefined}
            />
          );
        }
        return (
          <Dashboard
            products={products}
            storeName={storeName}
            userName={usuario.nombre}
            facturas={facturas}
            onNavigate={setActiveView}
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <Sidebar
        storeName={storeName}
        onStoreNameChange={setStoreName}
        activeView={activeView}
        onViewChange={setActiveView}
        usuario={usuario}
        onLogout={() => { setUsuario(null); setActiveView("dashboard"); }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}
