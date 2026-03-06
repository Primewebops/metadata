"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, AlertCircle, CheckCircle, AlertTriangle, Image } from "lucide-react"
import type { ArtworkValidation } from "@/lib/types"
import { validateArtwork, detectBlurriness } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface ArtworkUploadProps {
  validation: ArtworkValidation
  onValidationChange: (validation: ArtworkValidation) => void
  onFileChange: (file: File | null) => void
  hasExplicitContent: boolean
  onExplicitContentChange: (value: boolean) => void
}

export function ArtworkUpload({
  validation,
  onValidationChange,
  onFileChange,
  hasExplicitContent,
  onExplicitContentChange,
}: ArtworkUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(
    async (file: File) => {
      setIsProcessing(true)

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            setIsProcessing(false)
            return
          }

          // Scale down for blur detection to improve performance
          const maxSize = 200
          const scale = Math.min(maxSize / img.width, maxSize / img.height)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const isBlurry = detectBlurriness(imageData)

          const validationResult = validateArtwork(
            img.width,
            img.height,
            isBlurry,
            hasExplicitContent
          )

          // Additional checks for social media and contact info
          // This would typically use OCR - for now we just set the flags
          validationResult.hasSocialMediaLogos = false
          validationResult.hasContactInfo = false

          onValidationChange(validationResult)
          setPreview(e.target?.result as string)
          setIsProcessing(false)
        }

        img.onerror = () => {
          onValidationChange({
            isValid: false,
            width: null,
            height: null,
            errors: ["Failed to load image"],
            warnings: [],
            hasExplicitContent: false,
            isBlurry: false,
            hasSocialMediaLogos: false,
            hasContactInfo: false,
          })
          setIsProcessing(false)
        }

        img.src = e.target?.result as string
      }

      reader.onerror = () => {
        onValidationChange({
          isValid: false,
          width: null,
          height: null,
          errors: ["Failed to read file"],
          warnings: [],
          hasExplicitContent: false,
          isBlurry: false,
          hasSocialMediaLogos: false,
          hasContactInfo: false,
        })
        setIsProcessing(false)
      }

      reader.readAsDataURL(file)
    },
    [hasExplicitContent, onValidationChange]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        onValidationChange({
          isValid: false,
          width: null,
          height: null,
          errors: ["File must be an image (JPG, PNG, etc.)"],
          warnings: [],
          hasExplicitContent: false,
          isBlurry: false,
          hasSocialMediaLogos: false,
          hasContactInfo: false,
        })
        return
      }

      onFileChange(file)
      processImage(file)
    },
    [onFileChange, onValidationChange, processImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        onValidationChange({
          isValid: false,
          width: null,
          height: null,
          errors: ["File must be an image (JPG, PNG, etc.)"],
          warnings: [],
          hasExplicitContent: false,
          isBlurry: false,
          hasSocialMediaLogos: false,
          hasContactInfo: false,
        })
        return
      }

      onFileChange(file)
      processImage(file)
    },
    [onFileChange, onValidationChange, processImage]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setPreview(null)
    onFileChange(null)
    onValidationChange({
      isValid: false,
      width: null,
      height: null,
      errors: [],
      warnings: [],
      hasExplicitContent: false,
      isBlurry: false,
      hasSocialMediaLogos: false,
      hasContactInfo: false,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Image className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Artwork</h2>
          <p className="text-sm text-muted-foreground">
            Upload your release artwork (3000x3000px recommended, minimum 1600x1600px)
          </p>
        </div>
      </div>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          preview
            ? "border-border bg-card"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
          id="artwork-upload"
        />

        {preview ? (
          <div className="p-4">
            <div className="relative aspect-square max-w-xs mx-auto overflow-hidden rounded-lg">
              <img
                src={preview}
                alt="Artwork preview"
                className="h-full w-full object-cover"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 hover:bg-background transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {validation.width && validation.height && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Dimensions: {validation.width} x {validation.height}px
              </p>
            )}
          </div>
        ) : (
          <label
            htmlFor="artwork-upload"
            className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer"
          >
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isProcessing ? "Processing..." : "Drop your artwork here or click to upload"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Explicit Content Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
        <input
          type="checkbox"
          id="explicit-content"
          checked={hasExplicitContent}
          onChange={(e) => onExplicitContentChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-input"
        />
        <label htmlFor="explicit-content" className="flex-1">
          <span className="text-sm font-medium text-foreground">
            Contains Explicit Artwork
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Check this box if the artwork contains explicit or mature content. This is required by music platforms.
          </p>
        </label>
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

      {validation.warnings.length > 0 && (
        <div className="space-y-2">
          {validation.warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {validation.isValid && preview && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>Artwork meets all requirements</span>
        </div>
      )}

      {/* Requirements List */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Artwork Requirements</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Dimensions: 3000x3000px (recommended) / minimum 1600x1600px</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Must be square (equal width and height)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>No blurry or low-quality images</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>No social media logos (Instagram, Facebook, Twitter, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>No email addresses or phone numbers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>If artwork contains explicit content, you must indicate this</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
