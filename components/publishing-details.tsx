"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, X, AlertCircle, CheckCircle, AlertTriangle, FileText, Percent } from "lucide-react"
import type { PublishingDetails, PublishingValidation, Songwriter } from "@/lib/types"
import { validatePublishing, isLikelyArtistName } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface PublishingDetailsProps {
  data: PublishingDetails
  onChange: (data: PublishingDetails) => void
  validation: PublishingValidation
  onValidationChange: (validation: PublishingValidation) => void
  artistNames: string[]
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function PublishingDetailsComponent({
  data,
  onChange,
  validation,
  onValidationChange,
  artistNames,
}: PublishingDetailsProps) {
  const [artistNameWarnings, setArtistNameWarnings] = useState<Record<string, boolean>>({})

  // Validate on data change
  useEffect(() => {
    const result = validatePublishing(data)
    onValidationChange(result)
  }, [data, onValidationChange])

  // Check for artist names used as legal names
  useEffect(() => {
    const warnings: Record<string, boolean> = {}
    data.songwriters.forEach((writer) => {
      if (writer.legalName && isLikelyArtistName(writer.legalName, artistNames)) {
        warnings[writer.id] = true
      }
    })
    setArtistNameWarnings(warnings)
  }, [data.songwriters, artistNames])

  const addSongwriter = useCallback(() => {
    const newWriter: Songwriter = {
      id: generateId(),
      legalName: "",
      percentage: 0,
    }
    onChange({
      songwriters: [...data.songwriters, newWriter],
    })
  }, [data.songwriters, onChange])

  const removeSongwriter = useCallback(
    (id: string) => {
      if (data.songwriters.length > 1) {
        onChange({
          songwriters: data.songwriters.filter((w) => w.id !== id),
        })
      }
    },
    [data.songwriters, onChange]
  )

  const updateSongwriter = useCallback(
    (id: string, field: keyof Songwriter, value: string | number) => {
      onChange({
        songwriters: data.songwriters.map((w) =>
          w.id === id ? { ...w, [field]: value } : w
        ),
      })
    },
    [data.songwriters, onChange]
  )

  const distributeEvenly = useCallback(() => {
    const count = data.songwriters.length
    if (count === 0) return

    const evenShare = Math.floor(100 / count)
    const remainder = 100 % count

    onChange({
      songwriters: data.songwriters.map((w, index) => ({
        ...w,
        percentage: evenShare + (index < remainder ? 1 : 0),
      })),
    })
  }, [data.songwriters, onChange])

  const totalPercentage = data.songwriters.reduce((sum, w) => sum + w.percentage, 0)
  const hasAnyArtistNameWarning = Object.values(artistNameWarnings).some(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Publishing Details</h2>
          <p className="text-sm text-muted-foreground">
            Enter songwriter information with legal names only
          </p>
        </div>
      </div>

      {/* Percentage Summary */}
      <div
        className={cn(
          "flex items-center justify-between rounded-lg p-4",
          totalPercentage === 100
            ? "bg-success/10"
            : totalPercentage > 100
            ? "bg-destructive/10"
            : "bg-muted/50"
        )}
      >
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Total Percentage</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-lg font-bold",
              totalPercentage === 100
                ? "text-success"
                : totalPercentage > 100
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {totalPercentage}%
          </span>
          {totalPercentage !== 100 && (
            <span className="text-xs text-muted-foreground">
              {totalPercentage < 100
                ? `(${100 - totalPercentage}% remaining)`
                : `(${totalPercentage - 100}% over)`}
            </span>
          )}
        </div>
      </div>

      {/* Songwriters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Songwriters <span className="text-destructive">*</span>
          </label>
          <button
            type="button"
            onClick={distributeEvenly}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Distribute evenly
          </button>
        </div>

        <div className="space-y-3">
          {data.songwriters.map((writer, index) => (
            <div
              key={writer.id}
              className={cn(
                "rounded-lg border p-4",
                artistNameWarnings[writer.id]
                  ? "border-warning bg-warning/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                <div className="flex-1 grid gap-3 sm:grid-cols-[1fr,120px]">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Legal Name (First & Last)
                    </label>
                    <input
                      type="text"
                      value={writer.legalName}
                      onChange={(e) =>
                        updateSongwriter(writer.id, "legalName", e.target.value)
                      }
                      placeholder="e.g., John Smith"
                      className={cn(
                        "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1",
                        artistNameWarnings[writer.id]
                          ? "border-warning focus:border-warning focus:ring-warning"
                          : "border-input focus:border-ring focus:ring-ring"
                      )}
                    />
                    {artistNameWarnings[writer.id] && (
                      <p className="text-xs text-warning flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        This appears to be an artist name. Use legal name only.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={writer.percentage || ""}
                        onChange={(e) =>
                          updateSongwriter(
                            writer.id,
                            "percentage",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {data.songwriters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSongwriter(writer.id)}
                    className="rounded-lg border border-input bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSongwriter}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add another songwriter
        </button>
      </div>

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {hasAnyArtistNameWarning && (
        <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            One or more songwriter names appear to be artist names. Publishing details require legal names only. The form will not validate if artist names are used.
          </span>
        </div>
      )}

      {validation.isValid && !hasAnyArtistNameWarning && data.songwriters.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>Publishing details are valid (100% allocated)</span>
        </div>
      )}

      {/* Requirements */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Publishing Requirements</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Use legal names only (first and last name required)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Artist/stage names are not accepted for publishing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Total percentage must equal exactly 100%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Each songwriter must have a percentage greater than 0%</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
