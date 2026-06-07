/** Gist file schema written by ForinaDex (forina-collection.json, version 1). */
export const COLLECTION_VERSION = 1

export interface ForinaCollectionCard {
  cardId: string
  cardName: string
  setId: string
  setName: string
  imageUrl: string
  addedAt: string
}

export interface ForinaCollection {
  version: number
  lastUpdated: string
  owned: ForinaCollectionCard[]
  wishlist: ForinaCollectionCard[]
}

export type ForinaCollectionTab = 'owned' | 'wishlist'
