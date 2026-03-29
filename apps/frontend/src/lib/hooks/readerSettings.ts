export interface ReaderSettings {
  'reader-type': 'horizontal-snap' | 'vertical-snap';
}

const defaultReaderSettings = {
  "reader-type": "horizontal-snap",
} as const

export async function getSettings(): Promise<ReaderSettings> {
  return defaultReaderSettings;
}
