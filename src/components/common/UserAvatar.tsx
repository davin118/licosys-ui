import { Avatar, Dropdown, type MenuProps } from "antd";
import { UserOutlined, IdcardOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { clearToken, getUserFromToken } from "../../utils/auth";

export default function UserAvatar() {
    const navigate = useNavigate();
    const user = getUserFromToken();

    const logout = () => {
        clearToken();
        navigate("/login");
    };

    const items: MenuProps["items"] = [
        {
            key: "perfil",
            label: "Mi perfil",
            icon: <IdcardOutlined />,
            onClick: () => navigate("/perfil"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            label: "Cerrar sesión",
            icon: <LogoutOutlined />,
            onClick: logout,
        },
    ];

    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <Avatar
                    size={40}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1677ff", marginRight: 8 }}
                />
                <div style={{ lineHeight: 1 }}>
                    <div style={{ fontWeight: 500 }}>
                        {user?.name || "Usuario"}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                        {user?.role || "Invitado"}
                    </div>
                </div>
            </div>
        </Dropdown>
    );
}
