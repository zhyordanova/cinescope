type MockMedia = {
  id: string;
  title: string;
  type: 'movie' | 'series';
};

// Temporary fixtures for navigation; these are not OMDb responses.
export const mockMedia: readonly MockMedia[] = [
  { id: 'tt0133093', title: 'The Matrix', type: 'movie' },
  { id: 'tt0903747', title: 'Breaking Bad', type: 'series' },
  { id: 'tt1375666', title: 'Inception', type: 'movie' },
  { id: 'tt4574334', title: 'Stranger Things', type: 'series' },
  { id: 'tt0816692', title: 'Interstellar', type: 'movie' },
  { id: 'tt0944947', title: 'Game of Thrones', type: 'series' },
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    type: 'movie',
  },
  { id: 'tt0108778', title: 'Friends', type: 'series' },
  {
    id: 'tt0120737',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'movie',
  },
  { id: 'tt0386676', title: 'The Office', type: 'series' },
  { id: 'tt0468569', title: 'The Dark Knight', type: 'movie' },
  { id: 'tt11198330', title: 'House of the Dragon', type: 'series' },
];
