const DEFAULT_R2_BASE_URL = "https://pub-061bd6f37c9346439c19d31155bf1f96.r2.dev";
const DEFAULT_IMAGE_PREFIX = "placeholders";

export const R2_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? DEFAULT_R2_BASE_URL;
export const R2_IMAGE_PREFIX =
  process.env.NEXT_PUBLIC_R2_IMAGE_PREFIX ?? DEFAULT_IMAGE_PREFIX;

export function buildObjectUrl(key: string): string {
  // Allow future DB rows to store full image URLs directly.
  if (/^https?:\/\//i.test(key)) {
    return key;
  }

  const normalizedBase = R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
  const normalizedPrefix = R2_IMAGE_PREFIX.replace(/^\/+|\/+$/g, "");
  const normalizedKey = key.replace(/^\/+/, "");
  const objectPath = normalizedKey.includes("/")
    ? normalizedKey
    : `${normalizedPrefix}/${normalizedKey}`;

  return `${normalizedBase}/${objectPath}`;
}
