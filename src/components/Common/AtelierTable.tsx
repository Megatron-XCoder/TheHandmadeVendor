"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface AtelierTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
}

export default function AtelierTable<TData>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = "No records found.",
  className = "",
}: AtelierTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div className="overflow-x-auto rounded-2xl border border-[#E3C9A8]/60 bg-[#FFFFFF] shadow-[0_4px_20px_rgba(61,43,31,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-[#FAF5EF] border-b border-[#E3C9A8]/70 text-[11px] uppercase tracking-wider text-[#7A6B5D]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  const meta = (header.column.columnDef.meta || {}) as {
                    className?: string;
                    headerClassName?: string;
                    cellClassName?: string;
                    align?: "left" | "center" | "right";
                  };

                  const alignClass =
                    meta.align === "right"
                      ? "text-right"
                      : meta.align === "center"
                      ? "text-center"
                      : "text-left";

                  const flexAlignClass =
                    meta.align === "right"
                      ? "justify-end"
                      : meta.align === "center"
                      ? "justify-center"
                      : "justify-start";

                  return (
                    <th
                      key={header.id}
                      className={`py-4 px-6 font-semibold select-none ${alignClass} ${meta.className || ""} ${meta.headerClassName || ""} ${
                        canSort ? "cursor-pointer hover:text-[#C4896A] transition-colors" : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center ${flexAlignClass} gap-1.5`}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-[10px] text-[#C4896A] font-bold">
                            {isSorted === "asc" ? "▲" : isSorted === "desc" ? "▼" : "⇅"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-[#E3C9A8]/30 bg-white text-xs sm:text-sm text-[#3D2B1F]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-xs text-[#7A6B5D] bg-[#FFFAF5]/40"
                >
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#FFFAF5]/60 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = (cell.column.columnDef.meta || {}) as {
                      className?: string;
                      cellClassName?: string;
                      align?: "left" | "center" | "right";
                    };

                    const alignClass =
                      meta.align === "right"
                        ? "text-right"
                        : meta.align === "center"
                        ? "text-center"
                        : "text-left";

                    return (
                      <td
                        key={cell.id}
                        className={`py-4.5 px-6 align-middle ${alignClass} ${meta.className || ""} ${meta.cellClassName || ""}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls using TanStack Table API */}
      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-1 text-xs text-[#7A6B5D]">
          <p>
            Showing Page{" "}
            <span className="font-semibold text-[#3D2B1F]">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of <span className="font-semibold text-[#3D2B1F]">{table.getPageCount()}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3.5 py-1.5 rounded-full border border-[#E3C9A8] text-[#3D2B1F] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFFAF5] transition-colors"
            >
              Previous
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3.5 py-1.5 rounded-full border border-[#E3C9A8] text-[#3D2B1F] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFFAF5] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
