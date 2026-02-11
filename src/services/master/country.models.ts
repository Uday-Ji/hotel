import { BaseEntity } from '@/types/common.types';

export interface Country extends BaseEntity {
  countryCode: string;
  countryName: string;
  isoCode2: string;
  isoCode3: string;
  phoneCode?: string;
  currencyId?: number;
  currencyCode?: string;
  region?: string;
  continent?: string;
}

export interface CreateCountryRequest {
  countryCode: string;
  countryName: string;
  isoCode2: string;
  isoCode3: string;
  phoneCode?: string;
  currencyId?: number;
  region?: string;
  continent?: string;
}