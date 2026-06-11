import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { LeadImportPreview } from "@/types/lead";
import { mapRowToLeadFields } from "./columnMap";
import { validateImportRow } from "./validateRow";

function normalizeLinkedInUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function recordsFromCsv(text: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: false,
  });

  if (result.errors.length > 0) {
    const message = result.errors.map((e) => e.message).join("; ");
    throw new Error(`Failed to parse CSV: ${message}`);
  }

  return result.data;
}

function recordsFromExcel(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("Excel file has no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()])
    )
  );
}

function buildPreview(records: Record<string, string>[]): LeadImportPreview {
  const rows = records.map((record, index) => {
    const fields = mapRowToLeadFields(record);
    const validated = validateImportRow(index + 2, {
      ...fields,
      linkedinUrl: normalizeLinkedInUrl(fields.linkedinUrl),
    });
    return validated;
  });

  const nonEmptyRows = rows.filter((row) => !row.isEmpty);
  const validRows = nonEmptyRows.filter((row) => row.isValid);
  const invalidRows = nonEmptyRows.filter((row) => !row.isValid);
  const skippedEmptyCount = rows.filter((row) => row.isEmpty).length;

  return {
    rows: nonEmptyRows,
    validRows,
    invalidRows,
    skippedEmptyCount,
  };
}

export async function parseLeadImportFile(file: File): Promise<LeadImportPreview> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();
    return buildPreview(recordsFromCsv(text));
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    return buildPreview(recordsFromExcel(buffer));
  }

  throw new Error("Unsupported file type. Please upload a CSV or XLSX file.");
}
