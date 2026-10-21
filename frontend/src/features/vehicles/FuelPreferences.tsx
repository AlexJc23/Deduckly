import { useState } from 'react';
import { View, Text } from '@/theme/components';
import { useLanguage } from '@/i18n/language';
import { usePremium } from '@/features/subscriptions/hooks/use-premium';
import { getAccountGeneration } from '@/features/auth/services/account-boundary';
import { useFuelAssumptions } from './use-fuel-assumptions';
import { savePrice, saveFuelArea } from './store';
import { Field } from './ui';
import { useFuelPriceEditor } from './use-fuel-price-editor';

export function FuelPreferences() {
    const state = useFuelAssumptions();
    const { t } = useLanguage();
    const { isPremium } = usePremium();
    const [error, setError] = useState(false);

    const assumptions = state.assumptions;
    const owner = state.owner;
    const generation = getAccountGeneration();
    const fuel = assumptions?.fuelType ?? 'gasoline';
    const price = useFuelPriceEditor(
        state.data?.prices[fuel] ?? '',
        `${generation}:${owner ?? 'guest'}:${fuel}`,
        owner
            ? value => {
                    if (generation !== getAccountGeneration()) {
                        return Promise.reject(new Error('Account changed'));
                    }
                    return savePrice(owner, fuel, value);
                }
            : undefined,
        true,
    );

    const persist = (operation: Promise<unknown>) => {
        void operation
            .then(() => setError(false))
            .catch(() => setError(true));
    };

    return (
        <View style={{ gap: 12, marginBottom: 20 }}>
            <Text>{t('Fuel-aware offer preferences')}</Text>
            <Text>
                {assumptions
                    ? assumptions.vehicle
                    : t('Set your default vehicle in Settings → My Vehicles.')}
            </Text>

            {assumptions && owner && (
                <Field
                    label={
                        assumptions.fuelType === 'electric'
                            ? 'Electricity price (USD / kWh)'
                            : 'Fuel price (USD / US gallon)'
                    }
                    value={price.value}
                    numeric
                    onChange={price.change}
                    onBlur={price.commit}
                />
            )}



            {!price.parsed.valid && (
                <Text>{t('Enter a price from $0 to $100, or leave it blank.')}</Text>
            )}
            {(error || price.error) && (
                <Text>{t('Price could not be saved on this device.')}</Text>
            )}
        </View>

    );
}
