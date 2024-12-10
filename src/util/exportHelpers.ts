import { Attendee } from "@/components/RegistrationTable/columns";
import { Table } from "@tanstack/react-table";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PageOrientation } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function exportToCSV(data: Attendee[], fileName = 'data') {
    if (!data.length) {
        console.error("No data to export");
        return;
    }
    const columns = Object.keys(data[0])
    const header = columns.join(',');
    const csvRows = data.map(row => 
        columns.map(col => {
            const value = row[col as keyof Attendee];
            return (value !== null && value !== undefined) ? `"${value}"` : '""';
        }).join(',')
    );
    const csvContent = [header, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToPDF(data: Attendee[], fileName = 'data') {
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
      pdfMake.createPdf(docDefinition).download(fileName + ".pdf");
}

function createAttendeeTemplate(keys: string[]): Attendee {
    return keys.reduce((template, key) => {
        template[key as keyof Attendee] = null as never;
        return template;
    }, {} as Attendee);
}

export function formatTableForExport(table: Table<any>) {
    const tableHeader = table.getRowModel().rows[0].getVisibleCells();
    const tableRows = Object.values(table.getCoreRowModel().rowsById);
    const cols = tableHeader.slice(2).map(cell => cell.column.id); // slice from 2 because first 2 cols don't have data values 
    const rows: Attendee[] = tableRows.map(row => {
        const attendeeTemplate: Attendee = createAttendeeTemplate(cols);
        row.getVisibleCells().slice(2).forEach(cell => {
            attendeeTemplate[cell.column.id as keyof Attendee] = cell.getValue() as never;
        });
        return attendeeTemplate;
    })
    return rows;
}