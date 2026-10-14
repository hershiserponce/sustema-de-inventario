export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  codigo: string;
  descripcion: string;
  fechaEntrada: string; // ISO date string
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  tipo: "natural" | "empresa";
}

export interface ItemFactura {
  productoId: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  id: number;
  numero: string;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  items: ItemFactura[];
  subtotal: number;
  iva: number;
  total: number;
  estado: "pagada" | "pendiente" | "anulada";
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
}
