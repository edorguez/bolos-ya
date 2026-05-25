import { useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

export interface PickerOption {
  label: string;
  value: string;
}

interface PickerFieldProps {
  label?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  error?: boolean;
  placeholder?: string;
  search?: boolean;
  searchPlaceholder?: string;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: theme.spacing.sm,
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : 10,
    minHeight: 44,
  },
  dropdownError: {
    borderColor: theme.colors.error,
  },
  dropdownText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.ash,
  },
  icon: {
    marginRight: 0,
  },
  containerStyle: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.stoneSurface,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  itemContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  itemText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  selectedItem: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  searchInput: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stoneSurface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
}));

export function PickerField({
  label,
  selectedValue,
  onValueChange,
  options,
  error,
  placeholder,
  search = false,
  searchPlaceholder,
}: PickerFieldProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  const ref = useRef<any>(null);

  return (
    <View style={styles.container as any}>
      {label ? <Text style={styles.label as any}>{label}</Text> : null}
      <Dropdown
        ref={ref}
        style={[styles.dropdown as any, error && (styles.dropdownError as any)]}
        containerStyle={styles.containerStyle as any}
        placeholderStyle={styles.placeholderText as any}
        selectedTextStyle={styles.dropdownText as any}
        iconStyle={styles.icon as any}
        inputSearchStyle={styles.searchInput as any}
        itemTextStyle={styles.itemText as any}
        activeColor={theme.colors.surfaceContainerHigh}
        data={options}
        labelField="label"
        valueField="value"
        value={selectedValue || null}
        placeholder={placeholder || 'Selecciona...'}
        search={search}
        searchPlaceholder={searchPlaceholder || 'Buscar...'}
        onChangeText={() => {}}
        onChange={(item: any) => {
          onValueChange(item.value);
        }}
        iconColor={theme.colors.ash}
        selectedTextProps={{ numberOfLines: 1 }}
      />
    </View>
  );
}
