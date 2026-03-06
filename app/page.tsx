"use client"

import { useState, useCallback, useMemo } from "react"
import { ArtworkUpload } from "@/components/artwork-upload"
import { MetadataFormComponent } from "@/components/metadata-form"
import { AudioUpload } from "@/components/audio-upload"
import { PublishingDetailsComponent } from "@/components/publishing-details"
import { ValidationSummary } from "@/components/validation-summary"
import { isLikelyArtistName } from "@/lib/validation"
import type {
  ArtworkValidation,
  MetadataForm,
  MetadataValidation,
  AudioValidation,
  PublishingDetails,
  PublishingValidation,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "artwork", label: "Artwork" },
  { id: "metadata", label: "Metadata" },
  { id: "audio", label: "Audio" },
  { id: "publishing", label: "Publishing" },
  { id: "review", label: "Review" },
] as const

type StepId = (typeof STEPS)[number]["id"]

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function MetadataValidatorPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("artwork")

  // Artwork state
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkValidation, setArtworkValidation] = useState<ArtworkValidation>({
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
  const [hasExplicitArtwork, setHasExplicitArtwork] = useState(false)

  // Metadata state
  const [metadata, setMetadata] = useState<MetadataForm>({
    primaryArtists: [{ id: generateId(), name: "" }],
    releaseTitle: "",
    featuredArtists: [],
    genre: "",
    copyrightYear: new Date().getFullYear().toString(),
    cLine: "",
    pLine: "",
    recordLabel: "",
    language: "",
    lyrics: "",
    producerName: "",
    hasExplicitContent: false,
  })
  const [metadataValidation, setMetadataValidation] = useState<MetadataValidation>({
    isValid: false,
    errors: [],
    warnings: [],
  })

  // Audio state
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioValidation, setAudioValidation] = useState<AudioValidation>({
    isValid: false,
    format: null,
    fileName: null,
    errors: [],
  })

  // Publishing state
  const [publishing, setPublishing] = useState<PublishingDetails>({
    songwriters: [{ id: generateId(), legalName: "", percentage: 100 }],
  })
  const [publishingValidation, setPublishingValidation] = useState<PublishingValidation>({
    isValid: false,
    errors: [],
    totalPercentage: 0,
  })

  // Get all artist names for validation
  const artistNames = useMemo(() => {
    const names: string[] = []
    metadata.primaryArtists.forEach((a) => {
      if (a.name.trim()) names.push(a.name)
    })
    metadata.featuredArtists.forEach((a) => {
      if (a.name.trim()) names.push(a.name)
    })
    return names
  }, [metadata.primaryArtists, metadata.featuredArtists])

  // Check if any songwriter has an artist name
  const hasArtistNameInPublishing = useMemo(() => {
    return publishing.songwriters.some(
      (writer) => writer.legalName && isLikelyArtistName(writer.legalName, artistNames)
    )
  }, [publishing.songwriters, artistNames])

  // Step validation status
  const stepStatus = useMemo(() => {
    return {
      artwork: artworkValidation.isValid,
      metadata: metadataValidation.isValid,
      audio: audioValidation.isValid,
      publishing: publishingValidation.isValid && !hasArtistNameInPublishing,
      review: true,
    }
  }, [
    artworkValidation.isValid,
    metadataValidation.isValid,
    audioValidation.isValid,
    publishingValidation.isValid,
    hasArtistNameInPublishing,
  ])

  const goToStep = useCallback((step: StepId) => {
    setCurrentStep(step)
  }, [])

  const goToNextStep = useCallback(() => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }, [currentStep])

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }, [currentStep])

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SoundCheck
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Music Metadata Validator
          </p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="flex overflow-x-auto" aria-label="Progress">
            <ol className="flex min-w-full gap-1 py-4">
              {STEPS.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = stepStatus[step.id]
                const isPast = index < currentStepIndex

                return (
                  <li key={step.id} className="flex-1 min-w-0">
                    <button
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        "group flex w-full flex-col items-center gap-2 rounded-lg px-3 py-2 text-center transition-colors",
                        isActive
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted || isPast
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted || isPast ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium truncate max-w-full",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          {currentStep === "artwork" && (
            <ArtworkUpload
              validation={artworkValidation}
              onValidationChange={setArtworkValidation}
              onFileChange={setArtworkFile}
              hasExplicitContent={hasExplicitArtwork}
              onExplicitContentChange={setHasExplicitArtwork}
            />
          )}

          {currentStep === "metadata" && (
            <MetadataFormComponent
              data={metadata}
              onChange={setMetadata}
              validation={metadataValidation}
              onValidationChange={setMetadataValidation}
            />
          )}

          {currentStep === "audio" && (
            <AudioUpload
              validation={audioValidation}
              onValidationChange={setAudioValidation}
              onFileChange={setAudioFile}
            />
          )}

          {currentStep === "publishing" && (
            <PublishingDetailsComponent
              data={publishing}
              onChange={setPublishing}
              validation={publishingValidation}
              onValidationChange={setPublishingValidation}
              artistNames={artistNames}
            />
          )}

          {currentStep === "review" && (
            <ValidationSummary
              artworkValidation={artworkValidation}
              metadataValidation={metadataValidation}
              audioValidation={audioValidation}
              publishingValidation={publishingValidation}
              metadata={metadata}
              publishing={publishing}
              artworkFileName={artworkFile?.name || null}
              audioFileName={audioFile?.name || null}
              hasArtistNameInPublishing={hasArtistNameInPublishing}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              currentStepIndex === 0
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:bg-muted"
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          {currentStepIndex < STEPS.length - 1 && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            SoundCheck - Professional Music Metadata Validation
          </p>
        </div>
      </footer>
    </div>
  )
}
