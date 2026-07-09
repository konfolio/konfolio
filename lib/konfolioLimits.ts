export const MAX_PUBLISHED_KONFOLIOS = 3
export const UNLIMITED_KONFOLIO_EMAIL = "konfolios@gmail.com"

export function hasUnlimitedKonfolios(email?: string | null) {
  return email?.trim().toLowerCase() === UNLIMITED_KONFOLIO_EMAIL
}