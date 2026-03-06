import type {
  ArtworkValidation,
  MetadataForm,
  MetadataValidation,
  AudioValidation,
  PublishingDetails,
  PublishingValidation,
} from "./types"

// Artwork Validation
export function validateArtwork(
  width: number,
  height: number,
  isBlurry: boolean,
  hasExplicitContent: boolean
): ArtworkValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Check dimensions
  if (width !== height) {
    errors.push("Artwork must be square (equal width and height)")
  }

  if (width < 1600 || height < 1600) {
    errors.push(`Artwork must be at least 1600x1600px. Current: ${width}x${height}px`)
  }

  if (width > 3000 || height > 3000) {
    errors.push(`Artwork must not exceed 3000x3000px. Current: ${width}x${height}px`)
  }

  if (width !== 3000 && width >= 1600 && width < 3000) {
    warnings.push(`Recommended size is 3000x3000px. Current: ${width}x${height}px`)
  }

  if (isBlurry) {
    errors.push("Artwork appears to be blurry. Please upload a clearer image")
  }

  return {
    isValid: errors.length === 0,
    width,
    height,
    errors,
    warnings,
    hasExplicitContent,
    isBlurry,
    hasSocialMediaLogos: false,
    hasContactInfo: false,
  }
}

// Detect blurriness using Laplacian variance
export function detectBlurriness(imageData: ImageData): boolean {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height

  // Convert to grayscale and calculate Laplacian variance
  const gray: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }

  let laplacianSum = 0
  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const laplacian =
        gray[idx - width] +
        gray[idx + width] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx]
      laplacianSum += laplacian * laplacian
      count++
    }
  }

  const variance = laplacianSum / count
  // Threshold for blurriness detection
  return variance < 100
}

// Detect social media logos, emails, and phone numbers
export function detectProhibitedContent(text: string): {
  hasSocialMediaLogos: boolean
  hasContactInfo: boolean
  details: string[]
} {
  const details: string[] = []

  // Social media patterns
  const socialMediaPatterns = [
    /instagram/i,
    /facebook/i,
    /twitter/i,
    /tiktok/i,
    /youtube/i,
    /snapchat/i,
    /linkedin/i,
    /@\w+/,
    /#\w+/,
  ]

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

  // Phone number patterns
  const phonePatterns = [
    /\+?[\d\s-]{10,}/,
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
  ]

  let hasSocialMediaLogos = false
  let hasContactInfo = false

  socialMediaPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      hasSocialMediaLogos = true
      details.push("Social media reference detected")
    }
  })

  if (emailPattern.test(text)) {
    hasContactInfo = true
    details.push("Email address detected")
  }

  phonePatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      hasContactInfo = true
      details.push("Phone number detected")
    }
  })

  return { hasSocialMediaLogos, hasContactInfo, details }
}

// Metadata Validation
export function validateMetadata(data: MetadataForm): MetadataValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Check primary artist
  if (data.primaryArtists.length === 0) {
    errors.push("At least one primary artist is required")
  } else {
    data.primaryArtists.forEach((artist, index) => {
      if (!artist.name.trim()) {
        errors.push(`Primary artist ${index + 1} name is required`)
      }
    })
  }

  // Check release title
  if (!data.releaseTitle.trim()) {
    errors.push("Release title is required")
  }

  // Check genre
  if (!data.genre) {
    errors.push("Genre is required")
  }

  // Check copyright year
  if (!data.copyrightYear) {
    errors.push("Copyright year is required")
  } else {
    const year = parseInt(data.copyrightYear)
    const currentYear = new Date().getFullYear()
    if (year < 1900 || year > currentYear + 1) {
      errors.push(`Copyright year must be between 1900 and ${currentYear + 1}`)
    }
  }

  // Check C Line
  if (!data.cLine.trim()) {
    errors.push("Copyright holder (C Line) is required")
  }

  // Check P Line
  if (!data.pLine.trim()) {
    errors.push("Sound recording owner (P Line) is required")
  }

  // Check language
  if (!data.language) {
    errors.push("Language is required")
  }

  // Check producer name
  if (!data.producerName.trim()) {
    errors.push("Producer name is required")
  } else {
    // Check if producer name matches any primary artist
    const producerLower = data.producerName.trim().toLowerCase()
    const artistMatch = data.primaryArtists.some(
      (artist) => artist.name.trim().toLowerCase() === producerLower
    )
    if (artistMatch) {
      warnings.push(
        "Warning: Producer name matches an artist name. If this is intentional, please confirm"
      )
    }
  }

  // Validate lyrics if provided
  if (data.lyrics.trim()) {
    const lyricsErrors = validateLyrics(data.lyrics)
    errors.push(...lyricsErrors)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Lyrics Validation
export function validateLyrics(lyrics: string): string[] {
  const errors: string[] = []

  // Forbidden patterns in lyrics
  const forbiddenPatterns = [
    { pattern: /\b1x\b/gi, message: "Lyrics contain '1x' notation" },
    { pattern: /\b2x\b/gi, message: "Lyrics contain '2x' notation" },
    { pattern: /\b3x\b/gi, message: "Lyrics contain '3x' notation" },
    { pattern: /\b4x\b/gi, message: "Lyrics contain '4x' notation" },
    { pattern: /\b5x\b/gi, message: "Lyrics contain '5x' notation" },
    { pattern: /\[?\bhook\b\]?/gi, message: "Lyrics contain 'Hook' marker" },
    { pattern: /\[?\bbridge\b\]?/gi, message: "Lyrics contain 'Bridge' marker" },
    { pattern: /\[?\bchorus\b\]?/gi, message: "Lyrics contain 'Chorus' marker" },
    { pattern: /\[?\bfirst\s*verse\b\]?/gi, message: "Lyrics contain 'First Verse' marker" },
    { pattern: /\[?\bsecond\s*verse\b\]?/gi, message: "Lyrics contain 'Second Verse' marker" },
    { pattern: /\[?\bverse\s*1\b\]?/gi, message: "Lyrics contain 'Verse 1' marker" },
    { pattern: /\[?\bverse\s*2\b\]?/gi, message: "Lyrics contain 'Verse 2' marker" },
    { pattern: /\[?\bpre[- ]?chorus\b\]?/gi, message: "Lyrics contain 'Pre-chorus' marker" },
  ]

  forbiddenPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(lyrics)) {
      errors.push(message)
    }
  })

  return errors
}

// Audio Validation
export function validateAudio(file: File): AudioValidation {
  const errors: string[] = []

  const fileName = file.name
  const extension = fileName.split(".").pop()?.toLowerCase()

  if (extension !== "wav") {
    errors.push(`Audio must be in WAV format. Received: ${extension?.toUpperCase() || "unknown"}`)
  }

  return {
    isValid: errors.length === 0,
    format: extension || null,
    fileName,
    errors,
  }
}

// Publishing Details Validation
export function validatePublishing(details: PublishingDetails): PublishingValidation {
  const errors: string[] = []

  if (details.songwriters.length === 0) {
    errors.push("At least one songwriter is required")
  }

  // Check for legal names (basic validation - must contain space for first/last name)
  details.songwriters.forEach((writer, index) => {
    if (!writer.legalName.trim()) {
      errors.push(`Songwriter ${index + 1}: Legal name is required`)
    } else if (!writer.legalName.trim().includes(" ")) {
      errors.push(
        `Songwriter ${index + 1}: Please use full legal name (first and last name)`
      )
    }

    if (writer.percentage <= 0) {
      errors.push(`Songwriter ${index + 1}: Percentage must be greater than 0`)
    }

    if (writer.percentage > 100) {
      errors.push(`Songwriter ${index + 1}: Percentage cannot exceed 100%`)
    }
  })

  // Calculate total percentage
  const totalPercentage = details.songwriters.reduce(
    (sum, writer) => sum + writer.percentage,
    0
  )

  if (details.songwriters.length > 0 && totalPercentage !== 100) {
    errors.push(
      `Publishing percentages must total 100%. Current total: ${totalPercentage}%`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    totalPercentage,
  }
}

// Check if a name looks like an artist name vs legal name
export function isLikelyArtistName(name: string, artistNames: string[]): boolean {
  const nameLower = name.trim().toLowerCase()
  return artistNames.some((artist) => artist.trim().toLowerCase() === nameLower)
}

// Generate CSV content from valid form data
export function generateCSV(data: {
  metadata: MetadataForm
  publishing: PublishingDetails
  artworkFileName: string
  audioFileName: string
}): string {
  const rows: string[][] = []

  // Header
  rows.push([
    "Field",
    "Value",
  ])

  // Artwork
  rows.push(["Artwork File", data.artworkFileName])

  // Primary Artists
  data.metadata.primaryArtists.forEach((artist, index) => {
    rows.push([`Primary Artist ${index + 1}`, artist.name])
  })

  // Release Title
  rows.push(["Release Title", data.metadata.releaseTitle])

  // Featured Artists
  data.metadata.featuredArtists.forEach((artist, index) => {
    rows.push([`Featured Artist ${index + 1}`, artist.name])
  })

  // Other metadata
  rows.push(["Genre", data.metadata.genre])
  rows.push(["Copyright Year", data.metadata.copyrightYear])
  rows.push(["Copyright Holder (C Line)", data.metadata.cLine])
  rows.push(["Sound Recording Owner (P Line)", data.metadata.pLine])
  rows.push(["Record Label", data.metadata.recordLabel || "N/A"])
  rows.push(["Language", data.metadata.language])
  rows.push(["Producer", data.metadata.producerName])
  rows.push(["Explicit Content", data.metadata.hasExplicitContent ? "Yes" : "No"])

  // Audio
  rows.push(["Audio File", data.audioFileName])

  // Publishing
  data.publishing.songwriters.forEach((writer, index) => {
    rows.push([`Songwriter ${index + 1} Name`, writer.legalName])
    rows.push([`Songwriter ${index + 1} Percentage`, `${writer.percentage}%`])
  })

  // Lyrics (if any)
  if (data.metadata.lyrics.trim()) {
    rows.push(["Lyrics", `"${data.metadata.lyrics.replace(/"/g, '""')}"`])
  }

  // Convert to CSV string
  return rows
    .map((row) =>
      row.map((cell) => {
        if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(",")
    )
    .join("\n")
}
