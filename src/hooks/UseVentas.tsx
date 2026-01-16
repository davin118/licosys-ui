import { useState } from "react";
import type { IDetalleVenta } from "../interfaces/IVenta";
import type { IProducto } from "../interfaces/IProducto";

export default function useVenta() {
  const [detalles, setDetalles] = useState<IDetalleVenta[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);

  const agregarProducto = (producto: IProducto) => {
    const existente = detalles.find((d) => d.productoId === producto.id);
    if (existente) {
      existente.cantidad += 1;
      existente.subtotal = existente.cantidad * existente.precio;
      setDetalles([...detalles]);
    } else {
      const nuevo = {
        productoId: producto.id,
        cantidad: 1,
        precio: producto.precio,
        subtotal: producto.precio,
        producto,
      };
      setDetalles([...detalles, nuevo]);
    }
  };

  const eliminarProducto = (id: number) => {
    setDetalles(detalles.filter((d) => d.productoId !== id));
  };

  const actualizarCantidad = (id: number, cantidad: number) => {
    setDetalles(
      detalles.map((d) =>
        d.productoId === id
          ? { ...d, cantidad, subtotal: cantidad * d.precio }
          : d
      )
    );
  };

  const total = detalles.reduce((sum, d) => sum + d.subtotal, 0);

  const limpiar = () => {
    setDetalles([]);
    setClienteId(null);
  };

  return { detalles, clienteId, setClienteId, agregarProducto, eliminarProducto, actualizarCantidad, total, limpiar };
}
