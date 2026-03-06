"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, X, AlertCircle, CheckCircle, AlertTriangle, Music2, User } from "lucide-react"
import type { MetadataForm, MetadataValidation, PrimaryArtist, FeaturedArtist } from "@/lib/types"
import { WORLDWIDE_GENRES, LANGUAGES } from "@/lib/types"
import { validateMetadata } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface MetadataFormProps {
  data: MetadataForm
  onChange: (data: MetadataForm) => void
  validation: MetadataValidation
  onValidationChange: (validation: MetadataValidation) => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function MetadataFormComponent({
  data,
  onChange,
  validation,
  onValidationChange,
}: MetadataFormProps) {
  const [showProducerWarning, setShowProducerWarning] = useState(false)

  const updateField = useCallback(
    <K extends keyof MetadataForm>(field: K, value: MetadataForm[K]) => {
      const newData = { ...data, [field]: value }
      onChange(newData)
    },
    [data, onChange]
  )

  // Validate on data change
  useEffect(() => {
    const result = validateMetadata(data)
    onValidationChange(result)
  }, [data, onValidationChange])

  // Check producer name against artist names
  useEffect(() => {
    const producerLower = data.producerName.trim().toLowerCase()
    const artistMatch = data.primaryArtists.some(
      (artist) => artist.name.trim().toLowerCase() === producerLower
    )
    setShowProducerWarning(artistMatch && producerLower.length > 0)
  }, [data.producerName, data.primaryArtists])

  // Primary Artists Management
  const addPrimaryArtist = () => {
    const newArtist: PrimaryArtist = { id: generateId(), name: "" }
    updateField("primaryArtists", [...data.primaryArtists, newArtist])
  }

  const removePrimaryArtist = (id: string) => {
    if (data.primaryArtists.length > 1) {
      updateField(
        "primaryArtists",
        data.primaryArtists.filter((a) => a.id !== id)
      )
    }
  }

  const updatePrimaryArtist = (id: string, name: string) => {
    updateField(
      "primaryArtists",
      data.primaryArtists.map((a) => (a.id === id ? { ...a, name } : a))
    )
  }

  // Featured Artists Management
  const addFeaturedArtist = () => {
    const newArtist: FeaturedArtist = { id: generateId(), name: "" }
    updateField("featuredArtists", [...data.featuredArtists, newArtist])
  }

  const removeFeaturedArtist = (id: string) => {
    updateField(
      "featuredArtists",
      data.featuredArtists.filter((a) => a.id !== id)
    )
  }

  const updateFeaturedArtist = (id: string, name: string) => {
    updateField(
      "featuredArtists",
      data.featuredArtists.map((a) => (a.id === id ? { ...a, name } : a))
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Music2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Metadata</h2>
          <p className="text-sm text-muted-foreground">
            Enter release information and track details
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Primary Artists */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Primary Artist(s) <span className="text-destructive">*</span>
          </label>
          <div className="space-y-2">
            {data.primaryArtists.map((artist, index) => (
              <div key={artist.id} className="flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={artist.name}
                    onChange={(e) => updatePrimaryArtist(artist.id, e.target.value)}
                    placeholder={`Primary Artist ${index + 1}`}
                    className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                {data.primaryArtists.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrimaryArtist(artist.id)}
                    className="rounded-lg border border-input bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPrimaryArtist}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add another primary artist
          </button>
        </div>

        {/* Release Title */}
        <div className="space-y-2">
          <label htmlFor="release-title" className="text-sm font-medium text-foreground">
            Release Title <span className="text-destructive">*</span>
          </label>
          <input
            id="release-title"
            type="text"
            value={data.releaseTitle}
            onChange={(e) => updateField("releaseTitle", e.target.value)}
            placeholder="Enter release title"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Featured Artists */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Featured Artist(s)
          </label>
          <div className="space-y-2">
            {data.featuredArtists.map((artist, index) => (
              <div key={artist.id} className="flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={artist.name}
                    onChange={(e) => updateFeaturedArtist(artist.id, e.target.value)}
                    placeholder={`Featured Artist ${index + 1}`}
                    className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFeaturedArtist(artist.id)}
                  className="rounded-lg border border-input bg-background p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFeaturedArtist}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add featured artist
          </button>
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <label htmlFor="genre" className="text-sm font-medium text-foreground">
            Genre (Worldwide) <span className="text-destructive">*</span>
          </label>
          <select
            id="genre"
            value={data.genre}
            onChange={(e) => updateField("genre", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select genre</option>
            {WORLDWIDE_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Copyright Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="copyright-year" className="text-sm font-medium text-foreground">
              Copyright Year <span className="text-destructive">*</span>
            </label>
            <input
              id="copyright-year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={data.copyrightYear}
              onChange={(e) => updateField("copyrightYear", e.target.value)}
              placeholder={new Date().getFullYear().toString()}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="record-label" className="text-sm font-medium text-foreground">
              Record Label <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              id="record-label"
              type="text"
              value={data.recordLabel}
              onChange={(e) => updateField("recordLabel", e.target.value)}
              placeholder="Enter record label"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* C Line */}
        <div className="space-y-2">
          <label htmlFor="c-line" className="text-sm font-medium text-foreground">
            Copyright Holder (C Line) <span className="text-destructive">*</span>
          </label>
          <input
            id="c-line"
            type="text"
            value={data.cLine}
            onChange={(e) => updateField("cLine", e.target.value)}
            placeholder="e.g., 2024 Artist Name"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            The copyright holder of the musical composition
          </p>
        </div>

        {/* P Line */}
        <div className="space-y-2">
          <label htmlFor="p-line" className="text-sm font-medium text-foreground">
            Sound Recording Owner (P Line) <span className="text-destructive">*</span>
          </label>
          <input
            id="p-line"
            type="text"
            value={data.pLine}
            onChange={(e) => updateField("pLine", e.target.value)}
            placeholder="e.g., 2024 Record Label Name"
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            The owner of the sound recording (phonogram)
          </p>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium text-foreground">
            Language <span className="text-destructive">*</span>
          </label>
          <select
            id="language"
            value={data.language}
            onChange={(e) => updateField("language", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select language</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Producer Name */}
        <div className="space-y-2">
          <label htmlFor="producer" className="text-sm font-medium text-foreground">
            Producer Name <span className="text-destructive">*</span>
          </label>
          <input
            id="producer"
            type="text"
            value={data.producerName}
            onChange={(e) => updateField("producerName", e.target.value)}
            placeholder="Enter producer name"
            className={cn(
              "w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1",
              showProducerWarning
                ? "border-warning focus:border-warning focus:ring-warning"
                : "border-input focus:border-ring focus:ring-ring"
            )}
          />
          {showProducerWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Producer name matches an artist name. If this is intentional, you may proceed.
              </span>
            </div>
          )}
        </div>

        {/* Explicit Content */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <input
            type="checkbox"
            id="explicit-lyrics"
            checked={data.hasExplicitContent}
            onChange={(e) => updateField("hasExplicitContent", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <label htmlFor="explicit-lyrics" className="flex-1">
            <span className="text-sm font-medium text-foreground">
              Contains Explicit Lyrics
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Check this box if the song contains explicit language or mature content
            </p>
          </label>
        </div>

        {/* Lyrics */}
        <div className="space-y-2">
          <label htmlFor="lyrics" className="text-sm font-medium text-foreground">
            Lyrics <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea
            id="lyrics"
            value={data.lyrics}
            onChange={(e) => updateField("lyrics", e.target.value)}
            placeholder="Enter song lyrics (without markers like 'Chorus', 'Verse 1', etc.)"
            rows={8}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          />
          <div className="rounded-lg border border-border p-3 bg-muted/30">
            <p className="text-xs font-medium text-foreground mb-2">Lyrics must NOT contain:</p>
            <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              <li>• Repeat markers (1x, 2x, 3x, 4x, 5x)</li>
              <li>• [Hook] or Hook markers</li>
              <li>• [Bridge] or Bridge markers</li>
              <li>• [Chorus] or Chorus markers</li>
              <li>• [Verse 1], [First Verse], etc.</li>
              <li>• [Pre-chorus] markers</li>
            </ul>
          </div>
        </div>
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

      {validation.isValid && validation.errors.length === 0 && data.primaryArtists[0]?.name && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>All metadata fields are valid</span>
        </div>
      )}
    </div>
  )
}
