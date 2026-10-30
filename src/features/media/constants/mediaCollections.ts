import { beyondRealityMedia } from '../data/beyondRealityMedia';
import type { MediaCollection } from '../types/mediaCollection.types';

export const MEDIA_COLLECTIONS = [
  {
    id: 'beyond-reality',
    title: 'Beyond Reality',
    source: 'curated',
    items: beyondRealityMedia,
  },
  {
    id: 'batman-on-screen',
    title: 'Batman on Screen',
    source: 'search',
    query: 'Batman',
    allowedTypes: ['movie', 'series'],
    maxItems: 10,
  },
  {
    id: 'journeys-and-discoveries',
    title: 'Journeys & Discoveries',
    source: 'search',
    query: 'Journey',
    allowedTypes: ['movie', 'series'],
    maxItems: 10,
  },
  {
    id: 'holiday-magic',
    title: 'Holiday Magic',
    source: 'search',
    query: 'Christmas',
    allowedTypes: ['movie', 'series'],
    maxItems: 10,
  },
] as const satisfies readonly MediaCollection[];
