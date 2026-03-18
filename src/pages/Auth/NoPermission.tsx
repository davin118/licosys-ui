import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function NoPermission() {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            title="403"
            subTitle="No tienes permiso para acceder a este módulo"
            extra={
                <Button type="primary" onClick={() => navigate("/")}>
                    Volver al Dashboard
                </Button>
            }
        />
    );
}