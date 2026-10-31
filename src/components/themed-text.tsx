import {
  Platform,
  StyleSheet,
  Text,
  type TextProps,
  useWindowDimensions,
} from 'react-native';

import {
  Breakpoints,
  Colors,
  Fonts,
  ThemeColor,
  Typography,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const size = width >= Breakpoints.desktop ? 'desktop' : 'mobile';
  const responsiveStyle =
    type === 'title' || type === 'subtitle'
      ? {
          fontSize: Typography.fontSizes[type][size],
          lineHeight: Typography.lineHeights[type][size],
        }
      : undefined;

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'textPrimary'] },
        styles[type],
        responsiveStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.sans,
    fontSize: Typography.fontSizes.body,
    lineHeight: Typography.lineHeights.body,
    fontWeight: Typography.fontWeights.regular,
  },
  small: {
    fontFamily: Fonts.sans,
    fontSize: Typography.fontSizes.small,
    lineHeight: Typography.lineHeights.small,
    fontWeight: Typography.fontWeights.regular,
  },
  smallBold: {
    fontFamily: Fonts.sans,
    fontSize: Typography.fontSizes.small,
    lineHeight: Typography.lineHeights.small,
    fontWeight: Typography.fontWeights.bold,
  },
  title: {
    fontFamily: Fonts.sans,
    fontWeight: Typography.fontWeights.semibold,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontWeight: Typography.fontWeights.semibold,
  },
  link: {
    fontFamily: Fonts.sans,
    lineHeight: Typography.lineHeights.link,
    fontSize: Typography.fontSizes.link,
  },
  linkPrimary: {
    fontFamily: Fonts.sans,
    lineHeight: Typography.lineHeights.link,
    fontSize: Typography.fontSizes.link,
    color: Colors.accent,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight:
      Platform.select({ android: Typography.fontWeights.bold }) ??
      Typography.fontWeights.regular,
    fontSize: Typography.fontSizes.code,
  },
});
