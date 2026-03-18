import { Modal, Form, Input, InputNumber, DatePicker, Select } from "antd";
import { useEffect } from "react";
import type { IProducto } from "../../interfaces/IProducto";

interface ProductoModalProps {
    open: boolean;
    onCancel: () => void;
    onOk: (values: any) => void;
    confirmLoading?: boolean;
    categorias: { id: number; nombre: string }[];
    proveedores: { id: number; nombre: string }[];
    initialValues?: Partial<IProducto>;
    modo?: "crear" | "editar";
}

export default function ProductoModal({
    open,
    onCancel,
    onOk,
    confirmLoading,
    categorias,
    proveedores,
    initialValues,
    modo = "crear",
}: ProductoModalProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues);
            return;
        }

        form.resetFields();
    }, [form, initialValues, open]);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={confirmLoading}
            okText={modo === "crear" ? "Guardar" : "Actualizar"}
            cancelText="Cancelar"
            centered
            width={460}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            backgroundColor: "#1677ff",
                            color: "white",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            fontSize: 16,
                        }}
                    >
                        🍷
                    </div>
                    <h3
                        style={{
                            margin: 0,
                            color: "#1677ff",
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {modo === "crear" ? "Agregar nuevo producto" : "Editar producto"}
                    </h3>
                </div>
            }
            bodyStyle={{
                paddingTop: 10,
                paddingBottom: 5,
                paddingInline: 20,
                maxHeight: "80vh",
                overflowY: "auto",
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onOk}
                style={{ marginTop: 8 }}
                size="middle"
                requiredMark={false}
            >
                <Form.Item
                    label={<span style={{ fontWeight: 600 }}>Nombre del producto</span>}
                    name="nombre"
                    rules={[{ required: true, message: "Ingrese el nombre del producto" }]}
                >
                    <Input placeholder="Ej: Ron Anejo 750ml" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-2">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Marca</span>}
                        name="marca"
                        rules={[{ required: true, message: "Ingrese la marca" }]}
                    >
                        <Input placeholder="Ron, Vino, etc." />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Tipo</span>}
                        name="tipo"
                        rules={[{ required: true, message: "Ingrese el tipo del producto" }]}
                    >
                        <Input placeholder="Ej: Premium, Reserva" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Precio (C$)</span>}
                        name="precio"
                        rules={[{ required: true, message: "Ingrese el precio" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Costo (C$)</span>}
                        name="costo"
                        rules={[{ required: true, message: "Ingrese el costo" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Graduación (%)</span>}
                        name="graduacionAlcoholica"
                        rules={[{ required: true, message: "Ingrese la graduación" }]}
                    >
                        <InputNumber min={0} max={100} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Capacidad (ml)</span>}
                        name="capacidadML"
                        rules={[{ required: true, message: "Ingrese la capacidad" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Stock</span>}
                        name="stock"
                        rules={[{ required: true, message: "Ingrese el stock" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Vencimiento</span>}
                        name="fechaVencimiento"
                    >
                        <DatePicker style={{ width: "100%" }} placeholder="Opcional" />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span style={{ fontWeight: 600 }}>Categoría</span>}
                    name="categoriaId"
                    rules={[{ required: true, message: "Seleccione una categoría" }]}
                >
                    <Select placeholder="Seleccione una categoría">
                        {categorias.map((cat) => (
                            <Select.Option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 600 }}>Proveedor</span>}
                    name="proveedorId"
                    rules={[{ required: true, message: "Seleccione un proveedor" }]}
                >
                    <Select placeholder="Seleccione un proveedor">
                        {proveedores.map((prov) => (
                            <Select.Option key={prov.id} value={prov.id}>
                                {prov.nombre}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
