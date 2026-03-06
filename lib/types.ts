export interface ArtworkValidation {
  isValid: boolean
  width: number | null
  height: number | null
  errors: string[]
  warnings: string[]
  hasExplicitContent: boolean
  isBlurry: boolean
  hasSocialMediaLogos: boolean
  hasContactInfo: boolean
}

export interface PrimaryArtist {
  id: string
  name: string
}

export interface FeaturedArtist {
  id: string
  name: string
}

export interface MetadataForm {
  primaryArtists: PrimaryArtist[]
  releaseTitle: string
  featuredArtists: FeaturedArtist[]
  genre: string
  copyrightYear: string
  cLine: string
  pLine: string
  recordLabel: string
  language: string
  lyrics: string
  producerName: string
  hasExplicitContent: boolean
}

export interface MetadataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface AudioValidation {
  isValid: boolean
  format: string | null
  fileName: string | null
  errors: string[]
}

export interface Songwriter {
  id: string
  legalName: string
  percentage: number
}

export interface PublishingDetails {
  songwriters: Songwriter[]
}

export interface PublishingValidation {
  isValid: boolean
  errors: string[]
  totalPercentage: number
}

export interface FullFormData {
  artwork: {
    file: File | null
    validation: ArtworkValidation
  }
  metadata: MetadataForm
  metadataValidation: MetadataValidation
  audio: {
    file: File | null
    validation: AudioValidation
  }
  publishing: PublishingDetails
  publishingValidation: PublishingValidation
}

export const WORLDWIDE_GENRES = [
  "Afrobeats",
  "Alternative",
  "Blues",
  "Children's Music",
  "Classical",
  "Country",
  "Dance",
  "Electronic",
  "Folk",
  "Funk",
  "Gospel",
  "Hip-Hop/Rap",
  "Holiday",
  "Indie",
  "Jazz",
  "K-Pop",
  "Latin",
  "Metal",
  "New Age",
  "Opera",
  "Pop",
  "R&B/Soul",
  "Reggae",
  "Rock",
  "Ska",
  "Soundtrack",
  "Spoken Word",
  "World",
]

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Japanese",
  "Korean",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Arabic",
  "Hindi",
  "Russian",
  "Turkish",
  "Dutch",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Hebrew",
  "Indonesian",
  "Thai",
  "Vietnamese",
  "Swahili",
  "Yoruba",
  "Twi",
  "Igbo",
  "Hausa",
  "Zulu",
  "Instrumental (No Lyrics)",
  "Other",
]
