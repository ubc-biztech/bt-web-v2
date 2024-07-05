import { useState, useRef } from "react"
import { ColumnDef } from "@tanstack/react-table"

interface Column {
    id: string;
}

export const useColumnVisibility = (columns: ColumnDef<any>[]) => {
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
    const [selectedColumnsArray, setSelectedColumnsArray] = useState<string[]>(
        columns.map(col => (col as Column).id)
    )
    const selectedColumnsRef = useRef(new Set<string>(selectedColumnsArray))

    return {
        columnVisibility,
        setColumnVisibility,
        selectedColumnsArray,
        setSelectedColumnsArray,
        selectedColumnsRef
    }
}
