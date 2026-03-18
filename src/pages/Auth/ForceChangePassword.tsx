import { useState } from "react";
import { Alert, Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, LogoutOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { clearToken, getUserFromToken, markPasswordChangeComplete } from "../../utils/auth";

const { Title, Paragraph, Text } = Typography;

export default function ForceChangePassword() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const user = getUserFromToken();
    const [loading, setLoading] = useState(false);

    const cerrarSesion = () => {
        clearToken();
        navigate("/login");
    };

    const cambiarPassword = async (values: {
        contraseñaActual: string;
        nuevaContraseña: string;
        confirmarContraseña: string;
    }) => {
        try {
            setLoading(true);
            await api.post("/Auth/cambiar-password", {
                email: user?.email,
                contraseñaActual: values.contraseñaActual,
                nuevaContraseña: values.nuevaContraseña,
            });
            markPasswordChangeComplete();
            message.success("Contraseña actualizada correctamente");
            navigate("/");
        } catch {
            message.error("No se pudo cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-6">
            <Card
                style={{
                    width: 460,
                    borderRadius: 20,
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 34, color: "#2563eb" }} />
                    <Title level={3} style={{ marginTop: 12, marginBottom: 8 }}>
                        Cambia tu contraseña
                    </Title>
                    <Paragraph style={{ marginBottom: 8 }}>
                        Tu cuenta fue creada con una contraseña temporal. Debes actualizarla antes de continuar.
                    </Paragraph>
                    <Text type="secondary">{user?.email}</Text>
                </div>

                <Alert
                    style={{ marginBottom: 20 }}
                    type="warning"
                    showIcon
                    message="Acceso limitado temporalmente"
                    description="Hasta completar este paso no podrás usar los demás módulos del sistema."
                />

                <Form layout="vertical" form={form} onFinish={cambiarPassword}>
                    <Form.Item
                        label="Contraseña actual"
                        name="contraseñaActual"
                        rules={[{ required: true, message: "Ingresa tu contraseña temporal actual" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Contraseña actual" />
                    </Form.Item>

                    <Form.Item
                        label="Nueva contraseña"
                        name="nuevaContraseña"
                        rules={[
                            { required: true, message: "Ingresa una nueva contraseña" },
                            { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" />
                    </Form.Item>

                    <Form.Item
                        label="Confirmar nueva contraseña"
                        name="confirmarContraseña"
                        dependencies={["nuevaContraseña"]}
                        rules={[
                            { required: true, message: "Confirma la nueva contraseña" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("nuevaContraseña") === value) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error("Las contraseñas no coinciden"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirmar nueva contraseña" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Guardar nueva contraseña
                    </Button>
                </Form>

                <Button
                    danger
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={cerrarSesion}
                    style={{ marginTop: 16 }}
                    block
                >
                    Cerrar sesión
                </Button>
            </Card>
        </div>
    );
}
