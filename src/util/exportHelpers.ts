import { Attendee } from "@/components/RegistrationTable/columns";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function exportToCSV(data: Attendee[], fileName = 'data.csv') {
    if (!data.length) {
        console.error("No data to export");
        return;
    }
    const columns = Object.keys(data[0])
    const header = columns.join(',');
    const csvRows = data.map(row => 
        columns.map(col => {
            const value = row[col];
            return (value !== null && value !== undefined) ? `"${value}"` : '""';
        }).join(',')
    );
    const csvContent = [header, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToPDF(data: Attendee[], fileName = 'data.pdf') {
    const columns = Object.keys(data[0]);
    const rows = data.map(row => 
        Object.values(row).map(value => value === undefined ? "" : value)
    );
    const docDefinition = {
        pageOrientation: 'landscape' as PageOrientation,
        content: [
          {
            table: {
              body: [
                columns,
                ...rows
              ],
            },
          },
        ],
      };
      pdfMake.createPdf(docDefinition).download(fileName);
}