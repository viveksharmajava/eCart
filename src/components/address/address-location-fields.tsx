'use client';

import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { listIndianStates, lookupPostalCode } from '@/services/party.service';
import { ApiError } from '@/services/http.client';
import {
  ADDRESS_FIELD_ERROR_CLASS,
  type AddressRequiredField,
} from '@/lib/address-validation';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

export interface AddressLocationValue {
  postalCode: string;
  city: string;
  state: string;
  stateCode?: string;
}

interface AddressLocationFieldsProps {
  value: AddressLocationValue;
  onChange: (patch: Partial<AddressLocationValue>) => void;
  disabled?: boolean;
  invalidFields?: AddressRequiredField[];
  onClearInvalid?: (field: AddressRequiredField) => void;
}

export function AddressLocationFields({
  value,
  onChange,
  disabled,
  invalidFields = [],
  onClearInvalid,
}: AddressLocationFieldsProps) {
  const [postalLookupError, setPostalLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const lastLookedUp = useRef<string>('');

  const postalInvalid = invalidFields.includes('postalCode');
  const cityInvalid = invalidFields.includes('city');
  const stateInvalid = invalidFields.includes('state');

  const { data: states = [] } = useQuery({
    queryKey: ['indian-states'],
    queryFn: listIndianStates,
    staleTime: 24 * 60 * 60 * 1000,
  });

  async function lookupIfComplete(postalCode: string) {
    if (postalCode.length !== 6 || lastLookedUp.current === postalCode) {
      return;
    }
    lastLookedUp.current = postalCode;
    setLookingUp(true);
    setPostalLookupError('');
    try {
      const details = await lookupPostalCode(postalCode);
      onChange({
        postalCode: details.postalCode,
        city: details.city,
        state: details.stateName,
        stateCode: details.stateCode,
      });
      onClearInvalid?.('postalCode');
      onClearInvalid?.('city');
      onClearInvalid?.('state');
    } catch (err) {
      lastLookedUp.current = '';
      const message =
        err instanceof ApiError ? err.message : 'Unable to look up postal code';
      setPostalLookupError(message);
    } finally {
      setLookingUp(false);
    }
  }

  function handlePostalChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    if (digits !== value.postalCode) {
      lastLookedUp.current = '';
    }
    onChange({ postalCode: digits });
    onClearInvalid?.('postalCode');
    if (digits.length < 6) {
      setPostalLookupError('');
      return;
    }
    void lookupIfComplete(digits);
  }

  function handleStateChange(stateCode: string) {
    const selected = states.find((s) => s.stateCode === stateCode);
    onChange({
      stateCode,
      state: selected?.stateName ?? '',
    });
    onClearInvalid?.('state');
  }

  return (
    <>
      <div>
        <label
          className={cn('text-sm font-medium', postalInvalid && 'text-destructive')}
        >
          Postal code *
        </label>
        <Input
          className={cn('mt-1', postalInvalid && ADDRESS_FIELD_ERROR_CLASS)}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="6-digit PIN code"
          value={value.postalCode}
          disabled={disabled}
          aria-invalid={postalInvalid}
          onChange={(e) => handlePostalChange(e.target.value)}
          onBlur={() => {
            if (value.postalCode.length === 6) {
              void lookupIfComplete(value.postalCode);
            }
          }}
        />
        {lookingUp && (
          <p className="mt-1 text-xs text-muted-foreground">Looking up city and state…</p>
        )}
        {postalLookupError && (
          <p className="mt-1 text-xs text-destructive">{postalLookupError}</p>
        )}
      </div>
      <div>
        <label className={cn('text-sm font-medium', cityInvalid && 'text-destructive')}>
          City *
        </label>
        <Input
          className={cn('mt-1', cityInvalid && ADDRESS_FIELD_ERROR_CLASS)}
          autoComplete="address-level2"
          value={value.city}
          disabled={disabled}
          aria-invalid={cityInvalid}
          onChange={(e) => {
            onChange({ city: e.target.value });
            onClearInvalid?.('city');
          }}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={cn('text-sm font-medium', stateInvalid && 'text-destructive')}>
          State *
        </label>
        <Select
          value={value.stateCode || undefined}
          onValueChange={handleStateChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn('mt-1', stateInvalid && ADDRESS_FIELD_ERROR_CLASS)}
            aria-invalid={stateInvalid}
          >
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.stateCode} value={state.stateCode}>
                {state.stateName} ({state.stateCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
