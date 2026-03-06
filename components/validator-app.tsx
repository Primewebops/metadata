"use client"

import { useState, useCallback, useMemo } from "react"
import { 
  Music, 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Headphones, 
  Users, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
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
  { id: "artwork", label: "Artwork", icon: ImageIcon },
  { id: "metadata", label: "Metadata", icon: FileText },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "publishing", label: "Publishing", icon: Users },
  { id: "review", label: "Review", icon: CheckCircle2 },
] as const

type StepId = (typeof STEPS)[number]["id"]

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

interface ValidatorAppProps {
  onBack: () => void
}

export function ValidatorApp({ onBack }: ValidatorAppProps) {
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
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Music className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">SoundCheck</span>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-5xl px-4">
          <nav className="flex overflow-x-auto py-4" aria-label="Progress">
            <ol className="flex w-full items-center justify-between gap-2">
              {STEPS.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = stepStatus[step.id]
                const isPast = index < currentStepIndex
                const StepIcon = step.icon

                return (
                  <li key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        isActive
                          ? "bg-primary/10"
                          : "hover:bg-secondary"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isCompleted || isPast
                            ? "bg-primary/80 text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {isCompleted || isPast ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "hidden text-sm font-medium md:block",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mx-2 hidden h-px w-8 md:block lg:w-12",
                          isPast || isCompleted
                            ? "bg-primary"
                            : "bg-border"
                        )}
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
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
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
              currentStepIndex === 0
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-foreground hover:bg-secondary border border-border"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStepIndex < STEPS.length - 1 && (
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
