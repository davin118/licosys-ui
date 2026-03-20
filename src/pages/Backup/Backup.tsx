import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Upload,
  type TableColumnsType,
  type UploadProps,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api, { API_BASE_URL } from "../../api/api";

interface BackupFile {
  nombre: string;
  fecha: string;
  tamañoKB: number;
}

const formatFecha = (fecha: string) => {
  const parsedDate = new Date(fecha);

  if (Number.isNaN(parsedDate.getTime())) {
    return fecha;
  }

  return parsedDate.toLocaleString();
};

const getErrorMessage = (fallbackMessage: string, error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const { data } = error.response as { data?: unknown };

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }
  }

  return fallbackMessage;
};

export default function Backup() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [messageApi, contextHolder] = message.useMessage();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [uploadingBackup, setUploadingBackup] = useState(false);

  const cargarBackups = async () => {
    try {
      setLoadingList(true);
      const response = await api.get("/Backup/lista");
      setBackups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      messageApi.error(getErrorMessage("Error al cargar los respaldos", error));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void cargarBackups();
  }, []);

  const crearBackup = async () => {
    try {
      setCreatingBackup(true);

      const response = await api.get("/Backup/crear", {
        responseType: "blob",
      });

      const downloadUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      const disposition = response.headers["content-disposition"];
      const fileNameMatch = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/i);
      const fileName = decodeURIComponent(fileNameMatch?.[1] ?? "backup.sql");

      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      messageApi.success("Respaldo creado correctamente");
      await cargarBackups();
    } catch (error) {
      messageApi.error(getErrorMessage("Error al crear el respaldo", error));
    } finally {
      setCreatingBackup(false);
    }
  };

  const restaurarBackup = async (nombre: string) => {
    try {
      setProcessingFile(nombre);
      await api.post(`/Backup/restaurar/${encodeURIComponent(nombre)}`);
      messageApi.success("Base de datos restaurada correctamente");
      await cargarBackups();
    } catch (error) {
      messageApi.error(getErrorMessage("Error al restaurar el respaldo", error));
    } finally {
      setProcessingFile(null);
    }
  };

  const eliminarBackup = async (nombre: string) => {
    try {
      setProcessingFile(nombre);
      await api.delete(`/Backup/${encodeURIComponent(nombre)}`);
      messageApi.success("Respaldo eliminado");
      await cargarBackups();
    } catch (error) {
      messageApi.error(getErrorMessage("Error al eliminar el respaldo", error));
    } finally {
      setProcessingFile(null);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    action: `${API_BASE_URL}/Backup/restaurar`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    },
    showUploadList: false,
    onChange: async (info) => {
      if (info.file.status === "uploading") {
        setUploadingBackup(true);
        return;
      }

      if (info.file.status === "done") {
        setUploadingBackup(false);
        messageApi.success("Base de datos restaurada correctamente");
        await cargarBackups();
        return;
      }

      if (info.file.status === "error") {
        setUploadingBackup(false);
        const serverMessage =
          typeof info.file.response === "string"
            ? info.file.response
            : typeof info.file.response === "object" &&
                info.file.response !== null &&
                "message" in info.file.response &&
                typeof info.file.response.message === "string"
              ? info.file.response.message
              : "Error al restaurar el respaldo";

        messageApi.error(serverMessage);
      }
    },
  };

  const columns: TableColumnsType<BackupFile> = [
    {
      title: "Archivo",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (fecha: string) => formatFecha(fecha),
    },
    {
      title: "Tamaño",
      dataIndex: "tamañoKB",
      key: "tamañoKB",
      render: (size: number) => <Tag color="blue">{size.toLocaleString()} KB</Tag>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => {
        const isProcessingRecord = processingFile === record.nombre;

        return (
          <Space wrap>
            <Popconfirm
              title="¿Restaurar este respaldo?"
              description="Esto reemplazará la base de datos actual."
              okText="Sí, restaurar"
              cancelText="Cancelar"
              onConfirm={() => restaurarBackup(record.nombre)}
            >
              <Button
                type="primary"
                icon={<SyncOutlined />}
                loading={isProcessingRecord}
              >
                Restaurar
              </Button>
            </Popconfirm>

            <Popconfirm
              title="¿Eliminar este respaldo?"
              description="Esta acción no se puede deshacer."
              okText="Sí, eliminar"
              cancelText="Cancelar"
              onConfirm={() => eliminarBackup(record.nombre)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={isProcessingRecord}
              >
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}

      <Card
        title="Respaldo y restauración de base de datos"
        className="rounded-2xl shadow-md"
      >
        <Space style={{ marginBottom: 20, width: "100%", flexWrap: "wrap" }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={crearBackup}
            loading={creatingBackup}
            style={{ width: isMobile ? "100%" : undefined }}
          >
            Crear respaldo manual
          </Button>

          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={uploadingBackup}
              style={{ width: isMobile ? "100%" : undefined }}
            >
              Restaurar desde archivo
            </Button>
          </Upload>
        </Space>

        <div className="table-scroll">
          <Table
            columns={columns}
            dataSource={backups}
            rowKey="nombre"
            loading={loadingList}
            pagination={false}
            locale={{ emptyText: "No hay respaldos disponibles" }}
            scroll={{ x: 760 }}
          />
        </div>
      </Card>
    </>
  );
}
