import { useSyncExternalStore } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useResponsiveWidth() {
  const { width } = useWindowDimensions();
  const isHydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return Platform.OS === 'web' && !isHydrated ? 0 : width;
}
