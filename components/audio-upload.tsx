"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, AlertCircle, CheckCircle, FileAudio, Music } from "lucide-react"
import type { AudioValidation } from "@/lib/types"
import { validateAudio } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface AudioUploadProps {
  validation: AudioValidation
  onValidationChange: (validation: AudioValidation) => void
  onFileChange: (file: File | null) => void
}

export function AudioUpload({
  validation,
  onValidationChange,
  onFileChange,
}: AudioUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const validationResult = validateAudio(file)
      onValidationChange(validationResult)
      onFileChange(file)
      setFileName(file.name)
      setFileSize(formatFileSize(file.size))
    },
    [onFileChange, onValidationChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file) return

      const validationResult = validateAudio(file)
      onValidationChange(validationResult)
      onFileChange(file)
      setFileName(file.name)
      setFileSize(formatFileSize(file.size))
    },
    [onFileChange, onValidationChange]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setFileName(null)
    setFileSize(null)
    onFileChange(null)
    onValidationChange({
      isValid: false,
      format: null,
      fileName: null,
      errors: [],
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Music className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Audio File</h2>
          <p className="text-sm text-muted-foreground">
            Upload your audio file in WAV format only
          </p>
        </div>
      </div>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          fileName
            ? "border-border bg-card"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,audio/wav,audio/wave,audio/x-wav"
          onChange={handleFileSelect}
          className="sr-only"
          id="audio-upload"
        />

        {fileName ? (
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                <FileAudio className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {fileName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {fileSize} • {validation.format?.toUpperCase() || "Unknown format"}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="rounded-lg border border-input bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="audio-upload"
            className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer"
          >
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your audio file here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                WAV format only
              </p>
            </div>
          </label>
        )}
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

      {validation.isValid && fileName && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>Audio file is valid WAV format</span>
        </div>
      )}

      {/* Requirements */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Audio Requirements</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Format: WAV (Waveform Audio File Format) only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Other formats (MP3, FLAC, AAC, etc.) are not accepted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Recommended: 16-bit or 24-bit, 44.1kHz or 48kHz sample rate</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
