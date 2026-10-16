import { useState } from 'react';
import { FlatList, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text, TextInput, Pressable, SafeAreaView } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { useAppTheme } from '@/theme/theme';
import { Button, styles } from './ui';
import type { CatalogChoice } from './catalog-flow';
export function SelectionPicker({ label, value, choices, onSelect, disabled = false }:
 { label: string; value: string; choices: CatalogChoice[]; onSelect: (value: string) => void; disabled?: boolean }) {
  const { t } = useLanguage(); const { dark } = useAppTheme();
  const [open, setOpen] = useState(false), [search, setSearch] = useState('');
  const selected = choices.find(c => c.value === value)?.text ?? value;
  const close = () => { setOpen(false); setSearch(''); };
  return <View style={{ gap: 6 }}>
    <Text>{t(label)}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${t(label)}: ${selected || t('Select a result')}`}
      disabled={disabled} onPress={() => setOpen(true)} style={[styles.input, { opacity: disabled ? .45 : 1 }]}>
      <Text>{selected || t('Select a result')} ▾</Text>
    </Pressable>
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: dark ? '#101722' : '#FFFFFF' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 16 }}>
          <Text style={styles.title}>{t(label)}</Text>
          <TextInput accessibilityLabel={t('Search choices')} placeholder={t('Search choices')} value={search}
            onChangeText={setSearch} autoCorrect={false} style={styles.input} />
          <FlatList data={choices.filter(c => c.text.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))}
            keyExtractor={item => item.value} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
            ListEmptyComponent={<Text>{t('No matching choices.')}</Text>}
            renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }}
              onPress={() => { close(); onSelect(item.value); }} style={{ minHeight: 52, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#94A3B8' }}>
              <Text>{item.text}{item.value === value ? ' ✓' : ''}</Text>
            </Pressable>} />
          <Button title="Cancel" onPress={close} />
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  </View>;
}
