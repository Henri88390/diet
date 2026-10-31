import type { Money } from "./models";

export type CountryCode = "DE" | "FR" | "ES" | "IT" | "NL" | "BE" | "AT" | "PL" | "GB" | "US" | "AU";

export type CountryOption = {
  code: CountryCode;
  name: string;
  locale: string;
  currencyCode: string;
  /** Synthetic local-minor-unit multiplier; not sourced from Lidl or market data. */
  modeledPriceFactor: number;
};

/**
 * Explicit demo markets and synthetic factors. These values are not retailer
 * quotes, market research, exchange rates, or verified local price indices.
 */
export const countries: CountryOption[] = [
  { code: "DE", name: "Germany", locale: "de-DE", currencyCode: "EUR", modeledPriceFactor: 1.00 },
  { code: "FR", name: "France", locale: "fr-FR", currencyCode: "EUR", modeledPriceFactor: 1.04 },
  { code: "ES", name: "Spain", locale: "es-ES", currencyCode: "EUR", modeledPriceFactor: 0.96 },
  { code: "IT", name: "Italy", locale: "it-IT", currencyCode: "EUR", modeledPriceFactor: 1.02 },
  { code: "NL", name: "Netherlands", locale: "nl-NL", currencyCode: "EUR", modeledPriceFactor: 1.03 },
  { code: "BE", name: "Belgium", locale: "nl-BE", currencyCode: "EUR", modeledPriceFactor: 1.03 },
  { code: "AT", name: "Austria", locale: "de-AT", currencyCode: "EUR", modeledPriceFactor: 1.04 },
  { code: "PL", name: "Poland", locale: "pl-PL", currencyCode: "PLN", modeledPriceFactor: 3.6 },
  { code: "GB", name: "United Kingdom", locale: "en-GB", currencyCode: "GBP", modeledPriceFactor: 0.94 },
  { code: "US", name: "United States", locale: "en-US", currencyCode: "USD", modeledPriceFactor: 1.1 },
  { code: "AU", name: "Australia", locale: "en-AU", currencyCode: "AUD", modeledPriceFactor: 1.7 }
];

export const DEFAULT_COUNTRY: CountryCode = "DE";

export function getCountry(code: CountryCode): CountryOption {
  return countries.find((country) => country.code === code) ?? countries[0];
}

/** All currently supported currencies have two minor-unit digits. */
const currencySymbols: Record<string, string> = { EUR: "€", PLN: "zł", GBP: "£", USD: "$", AUD: "A$" };

export function getCurrencySymbol(currencyCode: string): string {
  return currencySymbols[currencyCode] ?? currencyCode;
}

export function formatMoney(money: Money, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(money.amountMinorUnits / 100);
}
