import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF(columns: string[], rows: any[], fileName: string) {
    const doc = new jsPDF();

    autoTable(doc, {
        head: [columns],
        body: rows,
    });

    doc.save(`${fileName}.pdf`);
}