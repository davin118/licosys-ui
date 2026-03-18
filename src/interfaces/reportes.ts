export interface InventarioReporteItem {
    producto: string;
    categoria: string;
    proveedor: string;
    precio: number;
    stock: number;
}

export interface BajoStockReporteItem {
    producto: string;
    categoria: string;
    proveedor: string;
    stock: number;
    stockMinimo: number;
}

export interface ProductoPorVencerReporteItem {
    producto: string;
    categoria: string;
    proveedor: string;
    fechaVencimiento: string;
    diasRestantes: number;
}

export interface VentaPorFechaReporteItem {
    ventaId: number;
    fecha: string;
    usuario: string;
    total: number;
    metodoPago: string;
    cantidadProductos: number;
}

export interface ProductoMasVendidoReporteItem {
    producto: string;
    cantidadVendida: number;
}

export interface VentaPorMetodoReporteItem {
    metodoPago: string;
    totalVentas: number;
    cantidadVentas: number;
}

export interface VentaMaestroDetalleReporteDetalleItem {
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface VentaMaestroDetalleReporteItem {
    ventaId: number;
    numeroDocumento: string;
    fecha: string;
    usuario: string;
    cliente: string;
    metodoPago: string;
    tipoComprobante: string;
    total: number;
    detalles: VentaMaestroDetalleReporteDetalleItem[];
}

export interface VentaPorUsuarioReporteItem {
    usuario: string;
    totalVentas: number;
    cantidadVentas: number;
}
