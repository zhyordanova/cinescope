import type { MediaSummary, MediaType } from './media.types';

export type HomeMediaType = Exclude<MediaType, 'episode'>;

type CollectionDefinition = {
  id: string;
  title: string;
};

export type CuratedMediaCollection = CollectionDefinition & {
  source: 'curated';
  items: readonly MediaSummary[];
};

export type SearchMediaCollection = CollectionDefinition & {
  source: 'search';
  query: string;
  allowedTypes: readonly HomeMediaType[];
  maxItems: number;
};

export type MediaCollection =
  CuratedMediaCollection | SearchMediaCollection;
