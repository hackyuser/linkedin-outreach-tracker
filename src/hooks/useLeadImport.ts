"use client";

import { useState } from "react";
import type { BulkImportResult, LeadImportPreview } from "@/types/lead";
import { createLeadsBulk } from "@/lib/firebase";
import { parseLeadImportFile } from "@/lib/import/parseFile";
import { useAuth } from "@/contexts/AuthContext";

export function useLeadImport() {
  const { user } = useAuth();
  const [preview, setPreview] = useState<LeadImportPreview | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(
    null
  );

  const parseFile = async (file: File) => {
    setParsing(true);
    setParseError(null);
    setPreview(null);
    setImportResult(null);

    try {
      const result = await parseLeadImportFile(file);
      setPreview(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setParsing(false);
    }
  };

  const importValidRows = async (): Promise<BulkImportResult | null> => {
    if (!user || !preview) return null;

    setImporting(true);
    setImportResult(null);

    try {
      const importBatchId = crypto.randomUUID();
      const result = await createLeadsBulk(
        user.uid,
        preview.validRows,
        importBatchId
      );

      const failureCount =
        result.failureCount + preview.invalidRows.length;

      const finalResult: BulkImportResult = {
        successCount: result.successCount,
        failureCount,
        failures: [
          ...result.failures,
          ...preview.invalidRows.map((row) => ({
            rowNumber: row.rowNumber,
            message: row.errors.join(", ") || "Invalid row",
          })),
        ],
      };

      setImportResult(finalResult);
      return finalResult;
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setParseError(null);
    setImportResult(null);
  };

  return {
    preview,
    parsing,
    importing,
    parseError,
    importResult,
    parseFile,
    importValidRows,
    reset,
  };
}
