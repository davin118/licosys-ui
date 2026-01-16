import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from "antd";
import {
    BellOutlined,
    LogoutOutlined,
    UserOutlined,
    AppstoreOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { clearToken, getUserFromToken } from "../utils/auth";

const { Header } = Layout;

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUserFromToken();
    const [notifications] = useState([
        { id: 1, text: "Producto Paracetamol con bajo stock." },
        { id: 2, text: "Nueva venta registrada por María López." },
    ]);

    const logout = () => {
        clearToken();
        navigate("/login");
    };

    const menuItems = [
        { key: "/dashboard", icon: <AppstoreOutlined />, label: <Link to="/">Dashboard</Link> },
        { key: "/productos", icon: <ShopOutlined />, label: <Link to="/productos">Productos</Link> },
        { key: "/ventas", icon: <DollarOutlined />, label: <Link to="/ventas">Ventas</Link> },
        { key: "/ventas-pos", icon: <ShoppingCartOutlined />, label: <Link to="/ventas-pos">Punto de Venta</Link> },
    ];

    const userMenu = {
        items: [
            {
                key: "perfil",
                label: "Mi perfil",
                icon: <UserOutlined />,
                onClick: () => navigate("/perfil"),
            },
            {
                key: "logout",
                label: "Cerrar sesión",
                icon: <LogoutOutlined />,
                onClick: logout,
            },
        ],
    };

    return (
        <Header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                width: "100%",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                height: 64,
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2">
                <span style={{ fontSize: 22 }}>💊</span>
                <Link
                    to="/"
                    style={{
                        color: "#1677ff",
                        fontWeight: 700,
                        fontSize: 18,
                        textDecoration: "none",
                    }}
                >
                    PharmaSys
                </Link>
            </div>

            {/* Menú de navegación */}
            <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{
                    flex: 1,
                    marginLeft: 30,
                    borderBottom: "none",
                    fontWeight: 500,
                }}
            />

            {/* Notificaciones y usuario */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    dropdownRender={() => (
                        <div
                            style={{
                                background: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                borderRadius: 8,
                                width: 280,
                                padding: 12,
                            }}
                        >
                            <h4 style={{ marginBottom: 8 }}>Notificaciones</h4>
                            {notifications.length === 0 ? (
                                <p style={{ color: "#999" }}>No hay notificaciones nuevas</p>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        style={{
                                            padding: "8px 0",
                                            borderBottom: "1px solid #f0f0f0",
                                            color: "#333",
                                        }}
                                    >
                                        {n.text}
                                    </div>
                                ))
                            )}
                            <Button
                                type="link"
                                size="small"
                                block
                                onClick={() => console.log("Ver todas las notificaciones")}
                            >
                                Ver todas
                            </Button>
                        </div>
                    )}
                >
                    <Badge count={notifications.length} size="small">
                        <Button
                            type="text"
                            icon={<BellOutlined style={{ fontSize: 18 }} />}
                            shape="circle"
                        />
                    </Badge>
                </Dropdown>

                <Dropdown menu={userMenu} placement="bottomRight">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: 8,
                        }}
                    >
                        <Avatar
                            icon={<UserOutlined />}
                            style={{ backgroundColor: "#1677ff", cursor: "pointer" }}
                        />
                        <span
                            style={{
                                fontWeight: 500,
                                color: "#333",
                            }}
                        >
                            {user?.name || user?.email || "Usuario"}
                        </span>
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
}
