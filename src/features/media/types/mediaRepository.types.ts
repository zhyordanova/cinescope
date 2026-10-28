import type { MediaType } from './media.types';

export type RequestOptions = {
  signal?: AbortSignal;
};

export type SearchMediaOptions = RequestOptions & {
  type?: MediaType;
  year?: number;
  page?: number;
};
