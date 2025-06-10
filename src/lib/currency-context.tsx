"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Currency = "USD" | "INR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  currencySymbol: string;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (1 USD to other currencies)
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  INR: 83.16, // Example exchange rate (1 USD = 83.16 INR)
};

// Currency symbols
const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  const formatAmount = (amount: number): string => {
    const convertedAmount = amount * exchangeRates[currency];
    return convertedAmount.toFixed(2);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        currencySymbol: currencySymbols[currency],
        exchangeRate: exchangeRates[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
} 