"use client"

import { Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type {
  ArtworkValidation,
  MetadataValidation,
  AudioValidation,
  PublishingValidation,
  MetadataForm,
  PublishingDetails,
} from "@/lib/types"
import { generateCSV } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface ValidationSummaryProps {
  artworkValidation: ArtworkValidation
  metadataValidation: MetadataValidation
  audioValidation: AudioValidation
  publishingValidation: PublishingValidation
  metadata: MetadataForm
  publishing: PublishingDetails
  artworkFileName: string | null
  audioFileName: string | null
  hasArtistNameInPublishing: boolean
}

interface ValidationItem {
  label: string
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export function ValidationSummary({
  artworkValidation,
  metadataValidation,
  audioValidation,
  publishingValidation,
  metadata,
  publishing,
  artworkFileName,
  audioFileName,
  hasArtistNameInPublishing,
}: ValidationSummaryProps) {
  const validationItems: ValidationItem[] = [
    {
      label: "Artwork",
      isValid: artworkValidation.isValid,
      errors: artworkValidation.errors,
      warnings: artworkValidation.warnings,
    },
    {
      label: "Metadata",
      isValid: metadataValidation.isValid,
      errors: metadataValidation.errors,
      warnings: metadataValidation.warnings,
    },
    {
      label: "Audio",
      isValid: audioValidation.isValid,
      errors: audioValidation.errors,
    },
    {
      label: "Publishing",
      isValid: publishingValidation.isValid && !hasArtistNameInPublishing,
      errors: hasArtistNameInPublishing
        ? [...publishingValidation.errors, "Artist names detected in publishing details"]
        : publishingValidation.errors,
    },
  ]

  const allValid = validationItems.every((item) => item.isValid)
  const totalErrors = validationItems.reduce((sum, item) => sum + item.errors.length, 0)
  const totalWarnings = validationItems.reduce(
    (sum, item) => sum + (item.warnings?.length || 0),
    0
  )

  const handleDownloadCSV = () => {
    if (!allValid || !artworkFileName || !audioFileName) return

    const csvContent = generateCSV({
      metadata,
      publishing,
      artworkFileName,
      audioFileName,
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${metadata.releaseTitle || "release"}-metadata.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Validation Summary</h2>
          <p className="text-sm text-muted-foreground">
            Review all sections before exporting
          </p>
        </div>

        {allValid && (
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-success-foreground hover:bg-success/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        )}
      </div>

      {/* Overall Status */}
      <div
        className={cn(
          "rounded-lg p-4",
          allValid ? "bg-success/10" : "bg-destructive/10"
        )}
      >
        <div className="flex items-center gap-3">
          {allValid ? (
            <CheckCircle className="h-6 w-6 text-success" />
          ) : (
            <XCircle className="h-6 w-6 text-destructive" />
          )}
          <div>
            <p
              className={cn(
                "font-medium",
                allValid ? "text-success" : "text-destructive"
              )}
            >
              {allValid
                ? "All validations passed!"
                : `${totalErrors} error${totalErrors !== 1 ? "s" : ""} found`}
            </p>
            <p className="text-sm text-muted-foreground">
              {allValid
                ? "Your metadata is ready for export."
                : "Please fix the errors below before exporting."}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {validationItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-lg border p-4",
              item.isValid ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {item.isValid ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium text-foreground">{item.label}</span>
            </div>

            {item.errors.length > 0 && (
              <ul className="space-y-1 mt-2">
                {item.errors.slice(0, 3).map((error, index) => (
                  <li key={index} className="text-xs text-destructive flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
                {item.errors.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{item.errors.length - 3} more errors
                  </li>
                )}
              </ul>
            )}

            {item.warnings && item.warnings.length > 0 && (
              <ul className="space-y-1 mt-2">
                {item.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-warning flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            )}

            {item.isValid && item.errors.length === 0 && (
              <p className="text-xs text-success mt-1">All checks passed</p>
            )}
          </div>
        ))}
      </div>

      {/* Warnings Summary */}
      {totalWarnings > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {totalWarnings} warning{totalWarnings !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Warnings do not prevent export but should be reviewed.
          </p>
        </div>
      )}

      {/* Export Disabled Message */}
      {!allValid && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <Download className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Export Disabled</p>
            <p className="text-xs text-muted-foreground">
              Fix all validation errors to enable CSV export
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
