import { useContext } from 'react'
import { ContentPackContext } from './ContentPackContext'

export function useContentPack() {
  const context = useContext(ContentPackContext)

  if (!context) {
    throw new Error('useContentPack must be used within ContentPackProvider')
  }

  return context
}
