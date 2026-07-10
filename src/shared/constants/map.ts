import type { StyleSpecification } from 'maplibre-gl'

export const DEFAULT_MAP_STYLE = 'vworld-satellite'

export interface MapStyleOption {
  value: string
  label: string
}

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  { value: 'vworld-satellite', label: '위성 지도' },
  { value: 'vworld-base', label: '일반 지도' },
]

export const RAW_VWORLD_API_KEY = (
  import.meta as ImportMeta & {
    env: Record<string, string | undefined>
  }
).env.VITE_VWORLD_API_KEY

const MAPLIBRE_GLYPHS_URL =
  'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'

export const OSM_RASTER_TILE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster-tiles',
      type: 'raster',
      source: 'osm-raster-tiles',
    },
  ],
}

export function createVWorldTileStyle(
  mode: 'base' | 'satellite',
): StyleSpecification {
  const safeApiKey = encodeURIComponent(String(RAW_VWORLD_API_KEY ?? '').trim())
  if (!safeApiKey) return OSM_RASTER_TILE_STYLE

  return {
    version: 8,
    glyphs: MAPLIBRE_GLYPHS_URL,
    sources: {
      'vworld-base': {
        type: 'raster',
        tiles: [
          `https://api.vworld.kr/req/wmts/1.0.0/${safeApiKey}/Base/{z}/{y}/{x}.png`,
        ],
        tileSize: 256,
        minzoom: 6,
        maxzoom: 19,
        attribution: 'VWorld',
      },
      'vworld-satellite': {
        type: 'raster',
        tiles: [
          `https://api.vworld.kr/req/wmts/1.0.0/${safeApiKey}/Satellite/{z}/{y}/{x}.jpeg`,
        ],
        tileSize: 256,
        minzoom: 6,
        maxzoom: 19,
        attribution: 'VWorld',
      },
    },
    layers: [
      {
        id: 'vworld-base',
        type: 'raster',
        source: 'vworld-base',
        layout: {
          visibility: mode === 'base' ? 'visible' : 'none',
        },
      },
      {
        id: 'vworld-satellite',
        type: 'raster',
        source: 'vworld-satellite',
        layout: {
          visibility: mode === 'base' ? 'none' : 'visible',
        },
      },
    ],
  }
}

export function getMapLibreStyle(style: string | null | undefined) {
  if (style === 'vworld-base') return createVWorldTileStyle('base')
  if (style === 'osm') return OSM_RASTER_TILE_STYLE
  return createVWorldTileStyle('satellite')
}
