export interface IProducto {
  id: number;
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
  fechaVencimiento: string;
  categoriaId: number;
  proveedorId: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  proveedor?: {
    id: number;
    nombre: string;
  };
}
