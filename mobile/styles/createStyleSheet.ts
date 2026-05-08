import { StyleSheet as RNStyleSheet } from 'react-native';
import { AppTheme } from './theme';

type StyleFunction<T> = (theme: AppTheme) => T;
type StyleObject = Record<string, any>;

export function createStyleSheet<T extends StyleObject>(styleFunction: StyleFunction<T>) {
  return (theme: AppTheme): RNStyleSheet.NamedStyles<T> => {
    const styles = styleFunction(theme);
    return RNStyleSheet.create(styles) as RNStyleSheet.NamedStyles<T>;
  };
}

// For compatibility with existing code expecting StyleSheet.create pattern
export const StyleSheet = {
  create: createStyleSheet,
};
