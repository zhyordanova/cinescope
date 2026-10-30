import type { MediaSummary } from '../types/media.types';

// OMDb summary snapshots validated on 2026-10-29; Details stays live.
export const beyondRealityMedia = [
  {
    id: 'tt1375666',
    title: 'Inception',
    year: '2010',
    type: 'movie',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
  {
    id: 'tt5753856',
    title: 'Dark',
    year: '2017–2020',
    type: 'series',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BMTUzNjQ2MTY5NV5BMl5BanBnXkFtZTgwOTAzNTQxNDM@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    year: '2014',
    type: 'movie',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
  {
    id: 'tt11280740',
    title: 'Severance',
    year: '2022–',
    type: 'series',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BZDI5YzJhODQtMzQyNy00YWNmLWIxMjUtNDBjNjA5YWRjMzExXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
  },
  {
    id: 'tt0133093',
    title: 'The Matrix',
    year: '1999',
    type: 'movie',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg',
  },
  {
    id: 'tt2085059',
    title: 'Black Mirror',
    year: '2011–',
    type: 'series',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BODcxMWI2NDMtYTc3NC00OTZjLWFmNmUtM2NmY2I1ODkxYzczXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
  {
    id: 'tt1130884',
    title: 'Shutter Island',
    year: '2010',
    type: 'movie',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BN2FjNWExYzEtY2YzOC00YjNlLTllMTQtNmIwM2Q1YzBhOWM1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
  {
    id: 'tt0475784',
    title: 'Westworld',
    year: '2016–2022',
    type: 'series',
    posterUrl:
      'https://m.media-amazon.com/images/M/MV5BMjM2MTA5NjIwNV5BMl5BanBnXkFtZTgwNjI2OTMxNTM@._V1_QL75_UX380_CR0,0,380,562_.jpg',
  },
] as const satisfies readonly MediaSummary[];
