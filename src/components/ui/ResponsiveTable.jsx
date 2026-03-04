import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ResponsiveTable({ headers, data, renderRow, renderCard, className }) {
  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead key={idx}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center text-slate-500 py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, idx) => renderRow(item, idx))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No data available
          </Card>
        ) : (
          data.map((item, idx) => renderCard(item, idx))
        )}
      </div>
    </>
  );
}