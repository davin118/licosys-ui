import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Upload,
  message,
  Table,
  Popconfirm,
  Tag,
  Space,
  Grid,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import api, { API_BASE_URL } from "../../api/api";

interface BackupFile {
  nombre: string;
  fecha: string;
  tamañoKB: number;
}

export default function Backup() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Obtener lista de backups
  const cargarBackups = async () => {
    try {
      const res = await api.get("/Backup/lista");
      setBackups(res.data);
    } catch (error) {
      message.error("Error al cargar los backups");
    }
  };

  useEffect(() => {
    cargarBackups();
  }, []);

  // 🔹 Crear backup manual
  const crearBackup = async () => {
    try {
      setLoading(true);

      const response = await api.get("/Backup/crear", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      const disposition = response.headers["content-disposition"];
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/i);
      link.setAttribute("download", fileNameMatch?.[1] ?? "backup.sql");

      document.body.appendChild(link);
      link.click();

      message.success("Backup creado correctamente");

      cargarBackups();
    } catch (error) {
      message.error("Error al crear backup");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Restaurar backup existente
  const restaurarBackup = async (nombre: string) => {
    try {
      await api.post(`/Backup/restaurar/${nombre}`);

      message.success("Base de datos restaurada correctamente");
    } catch {
      message.error("Error al restaurar backup");
    }
  };

  // 🔹 Eliminar backup
  const eliminarBackup = async (nombre: string) => {
    try {
      await api.delete(`/Backup/${nombre}`);

      message.success("Backup eliminado");

      cargarBackups();
    } catch {
      message.error("Error al eliminar backup");
    }
  };

  // 🔹 Columnas de la tabla
  const columns = [
    {
      title: "Archivo",
      dataIndex: "nombre",
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      render: (fecha: string) => new Date(fecha).toLocaleString(),
    },
    {
      title: "Tamaño",
      dataIndex: "tamañoKB",
      render: (size: number) => <Tag color="blue">{size} KB</Tag>,
    },
    {
      title: "Acciones",
      render: (_: any, record: BackupFile) => (
        <Space>
          <Popconfirm
            title="¿Restaurar este backup?"
            description="Esto reemplazará la base de datos actual"
            onConfirm={() => restaurarBackup(record.nombre)}
          >
            <Button type="primary" icon={<SyncOutlined />}>
              Restaurar
            </Button>
          </Popconfirm>

          <Popconfirm
            title="¿Eliminar este backup?"
            onConfirm={() => eliminarBackup(record.nombre)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Respaldo y Restauración de Base de Datos"
      className="rounded-2xl shadow-md"
    >
      <Space style={{ marginBottom: 20, width: "100%", flexWrap: "wrap" }}>
        {/* Crear Backup */}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={crearBackup}
          loading={loading}
          style={{ width: isMobile ? "100%" : undefined }}
        >
          Crear Backup Manual
        </Button>

        {/* Restaurar desde archivo */}
        <Upload
          name="file"
          action={`${API_BASE_URL}/Backup/restaurar`}
          headers={{
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }}
          showUploadList={false}
          onChange={(info) => {
            if (info.file.status === "done") {
              message.success("Base de datos restaurada correctamente");
              cargarBackups();
            } else if (info.file.status === "error") {
              message.error("Error al restaurar backup");
            }
          }}
        >
          <Button icon={<UploadOutlined />} style={{ width: isMobile ? "100%" : undefined }}>
            Restaurar desde archivo
          </Button>
        </Upload>
      </Space>

      {/* Tabla de backups */}
      <div className="table-scroll">
        <Table
          columns={columns}
          dataSource={backups}
          rowKey="nombre"
          pagination={false}
          scroll={{ x: 760 }}
        />
      </div>
    </Card>
  );
}
