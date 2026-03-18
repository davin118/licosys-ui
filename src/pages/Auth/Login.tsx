import { useState } from "react";
import { Card, Input, Button, Typography, Form, message } from "antd";
import { LockOutlined, UserOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { saveAuthSession } from "../../utils/auth";
import "./Login.css"; // 🔹 Importamos el CSS animado
import SplashScreen from "./SplashScreen";

const { Text } = Typography;

export default function Login() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.post("/Auth/login", values);
      saveAuthSession(res.data);
      message.success("Bienvenido a LicoSys 🍷");
      navigate(res.data.debeCambiarPassword ? "/perfil" : "/");
    } catch {
      message.error("Credenciales incorrectas o usuario inactivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Capa de fondo animado */}
      <div className="bg-gradient"></div>
      <div className="golden-light"></div>

      {/* Tarjeta principal */}
      <Card className="login-card">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="logo-container">
            <img
              src="/logo-licosys.svg"
              alt="LicoSys"
              className="logo-animado"
            />
          </div>
          <Text style={{ color: "#fef9c3", opacity: 0.85 }}>
            Sistema de gestión de licorería
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Ingrese su correo electrónico" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Correo electrónico"
              size="large"
              style={{
                backgroundColor: "#fefce8",
                borderRadius: 10,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingrese su contraseña" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              size="large"
              style={{
                backgroundColor: "#fefce8",
                borderRadius: 10,
              }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<LoginOutlined />}
            loading={loading}
            size="large"
            block
            style={{
              backgroundColor: "#facc15",
              borderColor: "#facc15",
              color: "#000",
              borderRadius: 10,
              fontWeight: "bold",
            }}
          >
            Iniciar Sesión
          </Button>
        </Form>

        <div className="text-center mt-6">
          <Text
            style={{
              color: "#fef9c3",
              opacity: 0.7,
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            © {new Date().getFullYear()} <b>LicoSys</b> — Todos los derechos
            reservados
          </Text>
        </div>
      </Card>
    </div>
  );
}
