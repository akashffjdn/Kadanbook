import { Button, Input, Sheet, type SheetRef, Text } from '@/components/ui';
import { useSettingsStore } from '@/store/settings.store';
import { CreditCard } from 'lucide-react-native';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

/**
 * UPI ID setting sheet.
 *
 * Design refs:
 *  - Google Pay setup (single field, validate inline, save)
 *  - PhonePe profile UPI handle row
 *
 * Validates `name@bank` shape — empty allowed (clears the value).
 */
const UPI_RE = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;

export const UpiIdSheet = memo(
  forwardRef<SheetRef>((_props, ref) => {
    const stored = useSettingsStore((s) => s.upiId);
    const setUpiId = useSettingsStore((s) => s.setUpiId);
    const [value, setValue] = useState(stored);
    const [error, setError] = useState<string | undefined>();

    // Re-sync local field when sheet re-opens
    useEffect(() => {
      setValue(stored);
      setError(undefined);
    }, [stored]);

    const handleSave = useCallback(() => {
      const trimmed = value.trim();
      if (trimmed && !UPI_RE.test(trimmed)) {
        setError('Format like rajan@okaxis');
        return;
      }
      setUpiId(trimmed);
      toast.success(trimmed ? 'UPI ID saved' : 'UPI ID cleared');
      (ref as React.RefObject<SheetRef>)?.current?.close();
    }, [value, setUpiId, ref]);

    return (
      <Sheet
        ref={ref}
        snapPoints={['65%']}
        title="Your UPI ID"
        subtitle="Customers send money to this address"
      >
        <Input
          label="UPI ID"
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (error) setError(undefined);
          }}
          placeholder="rajan@okaxis"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          error={error}
          hint="Your bank's UPI handle. Leave empty to clear."
          leftIcon={<CreditCard size={20} color="#A0A0A0" />}
        />
        <View style={{ marginTop: 24 }}>
          <Button label="Save" onPress={handleSave} size="xl" />
        </View>
      </Sheet>
    );
  }),
);
UpiIdSheet.displayName = 'UpiIdSheet';
