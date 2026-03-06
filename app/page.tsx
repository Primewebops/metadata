"use client"

import { useState } from "react"
import { 
  Music, 
  Upload, 
  CheckCircle2, 
  Shield, 
  Zap, 
  FileCheck, 
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Download
} from "lucide-react"
import { ValidatorApp } from "@/components/validator-app"

const STATS = [
  { value: "15+", label: "Fields Validated" },
  { value: "50+", label: "Rules Applied" },
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "0.5s", label: "Avg. Scan Time" },
]

const FEATURES = [
  {
    icon: FileCheck,
    title: "Deep Metadata Scanning",
    description: "Validate track titles, artist names, album info, release dates, genre, UPC codes, and copyright details against industry standards.",
  },
  {
    icon: AlertTriangle,
    title: "Error Detection",
    description: "Identify inconsistencies, missing required fields, formatting errors, and potential duplicates before they cause distribution delays.",
  },
  {
    icon: Upload,
    title: "Bulk Validation",
    description: "Upload entire catalogs via CSV and validate hundreds of tracks at once. Perfect for labels managing large libraries.",
  },
  {
    icon: Sparkles,
    title: "Optimization Tips",
    description: "Get actionable recommendations to improve metadata for better discoverability on Spotify, Apple Music, and other platforms.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Real-time validation with clear pass/warning/fail indicators and specific suggestions for every issue found.",
  },
  {
    icon: Shield,
    title: "Distribution Ready",
    description: "Ensure only properly validated metadata proceeds to release. Prevent costly rejections from distributors and platforms.",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Enter or Upload",
    description: "Input a single track or upload a CSV of your entire catalog. We support all standard metadata fields.",
  },
  {
    number: "02",
    title: "Review Results",
    description: "Get instant validation with color-coded severity levels, specific error messages, and fix suggestions.",
  },
  {
    number: "03",
    title: "Fix & Distribute",
    description: "Apply recommended fixes, optimize for discoverability, and confidently submit for distribution.",
  },
]

export default function HomePage() {
  const [showValidator, setShowValidator] = useState(false)

  if (showValidator) {
    return <ValidatorApp onBack={() => setShowValidator(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Music className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">SoundCheck</span>
            </div>
            <nav className="hidden items-center gap-8 md:flex">
              <a href="#" className="text-sm font-medium text-foreground">Home</a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Validator</a>
            </nav>
            <button
              onClick={() => setShowValidator(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Validating
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
            Catch errors, fix inconsistencies, and optimize metadata for streaming platforms.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
            Stop distribution rejections before they happen.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowValidator(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors animate-pulse-glow"
            >
              Start Validating
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowValidator(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Catalog
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Everything you need for clean metadata
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Comprehensive validation that covers every field your distributor and streaming platforms require.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b border-border bg-card/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to distribution-ready metadata.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-bold text-primary/20 md:text-6xl">{step.number}</div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Ready to validate your catalog?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Start checking your metadata now. No signup required.
            </p>
            <button
              onClick={() => setShowValidator(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Launch Validator
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Music className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">SoundCheck</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Professional Music Metadata Validation Tool
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
