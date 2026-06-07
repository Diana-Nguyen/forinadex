// Drop-in read-only collection widget for a Vite + React + TypeScript portfolio.
//
// 1. Copy into your project (e.g. src/components/forinadex/):
//      PokemonCollection.tsx, PokemonCollection.css, forina-collection.ts
//
// 2. Use inside a ContentPage (or any container):
//      import { PokemonCollection } from './components/forinadex/PokemonCollection'
//      <PokemonCollection gistId="your-gist-id" className="my-collection" />
//
// 3. Customize via CSS variables or className on the root element.
//
// Requires: react only.

import { useCallback, useEffect, useState } from 'react'
import type { ForinaCollection, ForinaCollectionCard, ForinaCollectionTab } from './forina-collection'
import { COLLECTION_VERSION } from './forina-collection'
import './PokemonCollection.css'

const GIST_FILENAME = 'forina-collection.json'
const DEFAULT_TRACKER_URL = 'https://Diana-Nguyen.github.io/forinadex/'

export interface PokemonCollectionProps {
  gistId: string
  defaultTab?: ForinaCollectionTab
  /** URL to the ForinaDex tracker (manage collection link). */
  trackerUrl?: string
  /** Extra class on the root element for site-specific CSS overrides. */
  className?: string
}

function rootClass(className?: string) {
  return ['pokemon-collection', className].filter(Boolean).join(' ')
}

type LoadStatus = 'loading' | 'error' | 'ready'

function isValidCard(card: unknown): card is ForinaCollectionCard {
  if (!card || typeof card !== 'object') return false
  const c = card as Record<string, unknown>
  return (
    typeof c.cardId === 'string'
    && typeof c.cardName === 'string'
    && typeof c.setId === 'string'
    && typeof c.setName === 'string'
  )
}

function parseCollection(raw: string): ForinaCollection | null {
  try {
    const data = JSON.parse(raw) as ForinaCollection
    if (!data || !Array.isArray(data.owned) || !Array.isArray(data.wishlist)) return null
    if (data.version && data.version > COLLECTION_VERSION) {
      console.warn('ForinaDex: collection version newer than supported')
    }
    return {
      ...data,
      owned: data.owned.filter(isValidCard),
      wishlist: data.wishlist.filter(isValidCard),
    }
  } catch {
    return null
  }
}

function CardThumb({ card }: { card: ForinaCollectionCard }) {
  const [failed, setFailed] = useState(false)
  if (!card.imageUrl || failed) {
    return (
      <div
        className="pokemon-collection__thumb pokemon-collection__thumb--empty"
        aria-label={card.cardName}
      />
    )
  }
  return (
    <img
      src={card.imageUrl}
      alt={card.cardName}
      className="pokemon-collection__thumb"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

/** Group cards by set; sets ordered alphabetically by set name. */
function groupBySet(cards: ForinaCollectionCard[]): ForinaCollectionCard[][] {
  const map = new Map<string, ForinaCollectionCard[]>()
  for (const card of cards) {
    const list = map.get(card.setId) ?? []
    list.push(card)
    map.set(card.setId, list)
  }
  return [...map.values()].sort((a, b) =>
    (a[0]?.setName ?? '').localeCompare(b[0]?.setName ?? ''),
  )
}

function SkeletonGrid() {
  return (
    <div className="pokemon-collection__grid" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="pokemon-collection__skeleton" />
      ))}
    </div>
  )
}

export function PokemonCollection({
  gistId,
  defaultTab = 'owned',
  trackerUrl = DEFAULT_TRACKER_URL,
  className,
}: PokemonCollectionProps) {
  const [data, setData] = useState<ForinaCollection | null>(null)
  const [tab, setTab] = useState<ForinaCollectionTab>(defaultTab)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setTab(defaultTab)
  }, [gistId, defaultTab])

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!gistId) {
      setStatus('error')
      return
    }

    const controller = new AbortController()
    setStatus('loading')

    fetch(`https://api.github.com/gists/${gistId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Gist unavailable')
        return res.json()
      })
      .then((gist: { files?: Record<string, { content?: string; truncated?: boolean }> }) => {
        const file = gist.files?.[GIST_FILENAME]
        if (!file?.content || file.truncated) throw new Error('Collection file not found')
        const parsed = parseCollection(file.content)
        if (!parsed) throw new Error('Invalid collection data')
        setData(parsed)
        setStatus('ready')
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setData(null)
        setStatus('error')
      })

    return () => controller.abort()
  }, [gistId, reloadKey])

  if (status === 'loading') {
    return (
      <div className={rootClass(className)}>
        <SkeletonGrid />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={rootClass(className)}>
        <p className="pokemon-collection__message" role="alert">Collection unavailable right now.</p>
        <button type="button" className="pokemon-collection__retry" onClick={retry}>
          Retry
        </button>
      </div>
    )
  }

  const owned = data?.owned ?? []
  const wishlist = data?.wishlist ?? []
  const cards = tab === 'owned' ? owned : wishlist
  const setGroups = groupBySet(cards)

  return (
    <div className={rootClass(className)}>
      <div className="pokemon-collection__toolbar">
        <div className="pokemon-collection__tabs" role="tablist" aria-label="Collection">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'owned'}
            className={`pokemon-collection__tab${tab === 'owned' ? ' pokemon-collection__tab--active' : ''}`}
            onClick={() => setTab('owned')}
          >
            Owned ({owned.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'wishlist'}
            className={`pokemon-collection__tab${tab === 'wishlist' ? ' pokemon-collection__tab--active' : ''}`}
            onClick={() => setTab('wishlist')}
          >
            Wishlist ({wishlist.length})
          </button>
        </div>
        <a
          className="pokemon-collection__link"
          href={trackerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Manage on ForinaDex →
        </a>
      </div>

      {cards.length === 0 ? (
        <p className="pokemon-collection__message">
          {tab === 'owned' ? 'No cards owned yet.' : 'Wishlist is empty.'}
        </p>
      ) : (
        <div className="pokemon-collection__sets">
          {setGroups.map((setCards) => (
            <div key={setCards[0].setId} className="pokemon-collection__set-group">
              <div className="pokemon-collection__grid">
                {setCards.map((card) => (
                  <CardThumb key={card.cardId} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export type { ForinaCollection, ForinaCollectionCard, ForinaCollectionTab } from './forina-collection'
export { COLLECTION_VERSION } from './forina-collection'
