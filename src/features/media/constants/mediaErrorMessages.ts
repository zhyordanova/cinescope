export const MEDIA_ERROR_MESSAGES = {
  cancelled: 'OMDb request cancelled.',
  missingApiKey:
    'Set EXPO_PUBLIC_OMDB_API_KEY before requesting OMDb data.',
  network:
    'Unable to reach OMDb. Check your connection and try again.',
  responseRead: 'Unable to read the OMDb response. Try again.',
  invalidJson: 'OMDb returned an invalid JSON response.',
  emptyQuery: 'A non-empty media search query is required.',
  invalidSearchType: 'Search type must be movie, series, or episode.',
  invalidSearchYear: 'Search year must be a four-digit integer.',
  invalidSearchPage:
    'Search page must be an integer between 1 and 100.',
  invalidId: 'A valid IMDb title ID is required.',
  mismatchedId:
    'OMDb returned a different IMDb title ID than requested.',
  http: (status: number) =>
    `OMDb request failed with HTTP status ${status}.`,
  invalidResponse: (field: string) =>
    `Invalid OMDb response: ${field}.`,
} as const;
