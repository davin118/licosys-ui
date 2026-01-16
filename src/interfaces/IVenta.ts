import type { IProducto } from "./IProducto";

export interface IDetalleVenta {
    productoId: number;
    cantidad: number;
    precio: number;
    subtotal: number;
    producto?: IProducto;
}

export interface IVenta {
    id: number;
    clienteId: number;
    fecha: string;
    total: number;
    detalles: IDetalleVenta[];
}
