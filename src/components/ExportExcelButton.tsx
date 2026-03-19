"use client";

import { useState } from "react";

type CellValue = string | number | boolean | null | undefined;
export type ExportExcelRow = Record<string, CellValue>;

type Props = {
  rows: ExportExcelRow[];
  filename: string;
  sheetName?: string;
  className?: string;
  disabled?: boolean;
};

export function ExportExcelButton({
  rows,
  filename,
  sheetName = "Sheet1",
  className,
  disabled,
}: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const data = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const isDisabled = disabled || exporting || rows.length === 0;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      className={className ?? "btn-secondary text-sm"}
    >
      {exporting ? "מייצא…" : "ייצוא לאקסל"}
    </button>
  );
}

