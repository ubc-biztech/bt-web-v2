import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";

type AuditLog = {
  record_id: string;
  change_type: "CREATE" | "UPDATE" | "DELETE";
  "timestamp#email": string;
  table_name: string;
  email: string;
  timestamp: string;
  delta?: Record<string, any>;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const data = await fetchBackend({
          endpoint: "/audit",
          method: "GET",
          // authenticatedCall: true
        });
        setLogs(data);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        toast({
          title: "Error",
          description: "Failed to load audit logs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [toast]);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "CREATE":
        return "bg-green-500 hover:bg-green-600";
      case "UPDATE":
        return "bg-blue-500 hover:bg-blue-600";
      case "DELETE":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const formatJson = (obj: any) => {
    if (!obj) return "N/A";
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return "Invalid data";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <TableRow
                        key={`${log.record_id}-${log.timestamp}-${index}`}
                      >
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.timestamp), "PPpp")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.email}
                        </TableCell>
                        <TableCell>{log.change_type}</TableCell>
                        <TableCell>{log.table_name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.record_id}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                            {formatJson(log.delta)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
