import api from "./api";
import type {
    BajoStockReporteItem,
    InventarioReporteItem,
    ProductoMasVendidoReporteItem,
    ProductoPorVencerReporteItem,
    VentaPorFechaReporteItem,
    VentaMaestroDetalleReporteItem,
    VentaPorMetodoReporteItem,
    VentaPorUsuarioReporteItem,
} from "../interfaces/reportes";

export function getInventarioReporte() {
    return api.get<InventarioReporteItem[]>("/Reportes/inventario");
}

export function getBajoStockReporte() {
    return api.get<BajoStockReporteItem[]>("/Reportes/bajo-stock");
}

export function getProductosPorVencerReporte() {
    return api.get<ProductoPorVencerReporteItem[]>("/Reportes/productos-por-vencer");
}

export function getVentasPorFechaReporte(inicio: string, fin: string) {
    return api.get<VentaPorFechaReporteItem[]>(
        `/Reportes/ventas-por-fecha?inicio=${inicio}&fin=${fin}`
    );
}

export function getProductosMasVendidosReporte() {
    return api.get<ProductoMasVendidoReporteItem[]>("/Reportes/productos-mas-vendidos");
}

export function getVentasPorMetodoReporte() {
    return api.get<VentaPorMetodoReporteItem[]>("/Reportes/ventas-por-metodo");
}

export function getVentasMaestroDetalleReporte() {
    return api.get<VentaMaestroDetalleReporteItem[]>("/Reportes/ventas-maestro-detalle");
}

export function getVentasPorUsuarioReporte() {
    return api.get<VentaPorUsuarioReporteItem[]>("/Reportes/ventas-por-usuario");
}
