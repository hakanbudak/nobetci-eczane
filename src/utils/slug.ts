const TURKISH_CHAR_MAP: Record<string, string> = {
    ç: 'c',
    Ç: 'C',
    ğ: 'g',
    Ğ: 'G',
    ı: 'i',
    İ: 'I',
    ö: 'o',
    Ö: 'O',
    ş: 's',
    Ş: 'S',
    ü: 'u',
    Ü: 'U',
}

/**
 * Türkçe karakterleri ASCII karşılıklarına dönüştürür.
 */
export function replaceTurkishChars(text: string): string {
    return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => TURKISH_CHAR_MAP[char] || char)
}

/**
 * Metni SEO-uyumlu slug'a çevirir.
 * Örnek: "Kadıköy" → "kadikoy"
 */
export function toSlug(text: string): string {
    return replaceTurkishChars(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Slug'ı okunabilir başlığa dönüştürür.
 * Örnek: "kadikoy" → "Kadıköy" (cities data'dan eşleştirilir)
 */
export function fromSlug(slug: string, lookupMap: Map<string, string>): string {
    return lookupMap.get(slug) || slug
}
