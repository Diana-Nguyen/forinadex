# ForinaDex

A Pokémon TCG card collection tracker. Named after Forina — the hidden valley where Jirachi sleeps.

Track cards you own and cards on your wish list, then sync everything to a public GitHub Gist. A separate React widget lets any portfolio display your collection read-only.

## What's in this repo

| File | Purpose |
|---|---|
| `index.html` | Full tracker app — single file, no build step, deploys to GitHub Pages as-is |
| `PokemonCollection.tsx` | Read-only collection widget for a React portfolio |
| `PokemonCollection.css` | Default styles (CSS variables for theming) |
| `forina-collection.ts` | TypeScript types for the Gist JSON schema |

There is no `package.json`, bundler, or backend. Open `index.html` in a browser or serve it statically.

## Features

- Browse all Pokémon TCG sets (Base Set through modern releases)
- Mark cards as **owned** or **wishlisted** (mutually exclusive)
- **Owned** and **Wishlist** views show your full collection grouped by set
- Owned counts on each set tile (e.g. `12/102 owned`)
- Search sets and search cards within a set
- Auto-save to a public GitHub Gist (debounced, 2 seconds)
- Sets list cached locally for 24 hours
- Classic pixel Pokédex UI

## Getting started

You need two API credentials:

1. **GitHub Personal Access Token** — [create one with `gist` scope](https://github.com/settings/tokens/new?scopes=gist)
2. **Pokémon TCG API key** — [free signup at dev.pokemontcg.io](https://dev.pokemontcg.io) (takes about two minutes)

Optional: a **Gist ID** if you already have a collection saved. Leave blank on first use — ForinaDex creates a Gist automatically on your first save.

### Run locally

```bash
npx serve .
```

Then open the URL shown (usually `http://localhost:3000`) and click **OPEN** on the login screen.

You can also open `index.html` directly in a browser, though clipboard copy works best over HTTPS or localhost.

## How saving works

```
Toggle card → update in-memory collection → wait 2s → PATCH GitHub Gist
                                              (POST on first save)
```

Your Gist contains one file, `forina-collection.json`:

```json
{
  "version": 1,
  "lastUpdated": "2026-06-06T12:00:00.000Z",
  "owned": [
    {
      "cardId": "base1-4",
      "cardName": "Charizard",
      "setId": "base1",
      "setName": "Base Set",
      "imageUrl": "https://...",
      "addedAt": "2026-06-06T12:00:00.000Z"
    }
  ],
  "wishlist": []
}
```

After your first save, click **COPY GIST ID** in the sidebar. You'll need this ID for the portfolio widget.

Gists are always created as **public** so the read-only widget can fetch them without authentication.

Avoid editing the same Gist in two browser tabs at once — the last save wins.

## Security

Your GitHub PAT and Pokémon TCG API key are **never stored on disk**. They live in JavaScript memory for the session only — you re-enter them after every page refresh. This is intentional.

`localStorage` is used only for non-sensitive data:

| Key | Contents |
|---|---|
| `forina_gist_id` | Gist ID (after first save) |
| `forina_username` | GitHub username for display |
| `forina_avatar_url` | GitHub avatar URL |
| `forina_sets_cache` | Cached sets list (JSON) |
| `forina_sets_cache_ts` | Cache timestamp (24h TTL) |
| `forina_contrast` | Display contrast preference (`normal` / `high`) |
| `forina_grid_size` | Card grid size preference (`normal` / `large`) |

## Portfolio widget

Copy these files into your Vite + React + TypeScript project (e.g. `src/components/forinadex/`):

- `PokemonCollection.tsx`
- `PokemonCollection.css`
- `forina-collection.ts`

Image-only grid grouped by set (no labels — visual separation only). Inherits your page fonts and width.

```tsx
import { PokemonCollection } from './components/forinadex/PokemonCollection'

<PokemonCollection
  className="my-collection"
  defaultTab="owned"
  gistId="your-gist-id-here"
  trackerUrl="https://Diana-Nguyen.github.io/forinadex/"
/>
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `gistId` | `string` | required | Public Gist ID from the tracker |
| `defaultTab` | `'owned' \| 'wishlist'` | `'owned'` | Which tab to show first |
| `trackerUrl` | `string` | `https://Diana-Nguyen.github.io/forinadex/` | Link to manage your collection |
| `className` | `string` | — | Extra class on root for scoped CSS overrides |

Requires React only — no extra dependencies. Fetches the public Gist via `fetch()`; no API keys needed on the portfolio side.

### Customizing styles

**CSS variables** — set on `.pokemon-collection` or via `className`:

```css
.my-collection.pokemon-collection {
  --pc-grid-min-lg: 110px;
  --pc-thumb-radius: 8px;
  --pc-set-divider-color: rgb(255 255 255 / 0.12);
}
```

```tsx
<PokemonCollection gistId="..." className="my-collection" />
```

Or add overrides in your own site stylesheet — no extra files from this repo required.

**Available CSS variables:**

| Variable | Default | Controls |
|---|---|---|
| `--pc-grid-min` | `64px` | Min card column width (mobile) |
| `--pc-grid-min-md` | `80px` | Min column width (≥480px) |
| `--pc-grid-min-lg` | `96px` | Min column width (≥700px) |
| `--pc-grid-gap` / `-md` / `-lg` | `8px` / `10px` / `12px` | Grid gaps |
| `--pc-sets-gap` | `1.25rem` | Space between set groups |
| `--pc-set-divider-color` | `rgb(0 0 0 / 0.1)` | Line between set groups |
| `--pc-thumb-radius` | `4px` | Card image corner radius |
| `--pc-thumb-bg` | `rgb(0 0 0 / 0.05)` | Placeholder background |
| `--pc-tab-opacity` | `0.55` | Inactive tab opacity |
| `--pc-tab-active-opacity` | `1` | Active tab opacity |
| `--pc-tab-active-weight` | `600` | Active tab font weight |
| `--pc-link-opacity` | `0.75` | ForinaDex link opacity |
| `--pc-message-opacity` | `0.7` | Empty/error message opacity |

## Tech stack

**Tracker (`index.html`)**

- Vanilla JS (`<script type="module">`)
- Google Fonts only (Press Start 2P, VT323)
- [Pokémon TCG API v2](https://api.pokemontcg.io/v2/)
- [GitHub Gist API](https://docs.github.com/en/rest/gists)

**Widget**

- React + TypeScript
- Plain CSS

## Disclaimer

Pokédex-inspired fan project. Pokémon, Pokédex, and related marks are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc. This project is not affiliated with or endorsed by The Pokémon Company.

## License

ForinaDex source code is released under the [MIT License](https://opensource.org/licenses/MIT) (© 2026 Diana Nguyen). You may use, copy, modify, and distribute the code with attribution.

This license applies to source code in this repository only. It does not grant rights to Pokémon, Pokédex, or related trademarks or artwork. Card images and set data are provided via the [Pokémon TCG API](https://dev.pokemontcg.io/) and remain subject to their terms of use.
