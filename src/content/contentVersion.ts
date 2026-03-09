import type { ContentPack } from '../types/content'

function hashString(value: string) {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

export function getContentVersion(contentPack: ContentPack) {
  return hashString(JSON.stringify(contentPack))
}
