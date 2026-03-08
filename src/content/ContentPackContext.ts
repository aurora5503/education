import { createContext } from 'react'
import type { ContentPack } from '../types/content'

export interface ContentPackContextValue {
  contentPack: ContentPack
  updateContentPack: (updater: (current: ContentPack) => ContentPack) => void
  importContentPack: (nextContentPack: ContentPack) => void
  restoreDefaults: () => void
  exportContentPack: () => string
  hasLocalChanges: boolean
}

export const ContentPackContext = createContext<ContentPackContextValue | null>(null)
