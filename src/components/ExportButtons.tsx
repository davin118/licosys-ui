import { Button } from "antd";
import { exportToExcel } from "../utils/exportExcel";
import { exportToPDF } from "../utils/exportPDF";

interface Props {
  data: any[];
  columns: string[];
  rows: any[];
  fileName: string;
}

export default function ExportButtons({
  data,
  columns,
  rows,
  fileName,
}: Props) {
  const disabled = data.length === 0;

  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <Button
        type="primary"
        onClick={() => exportToExcel(data, fileName)}
        disabled={disabled}
      >
        Exportar Excel
      </Button>

      <Button
        onClick={() => exportToPDF(columns, rows, fileName)}
        disabled={disabled}
      >
        Exportar PDF
      </Button>
    </div>
  );
}
