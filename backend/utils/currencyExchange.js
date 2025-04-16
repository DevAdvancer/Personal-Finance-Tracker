const axios = require('axios');

// Cache exchange rates to minimize API calls
const exchangeRateCache = {
  rates: null,
  lastUpdated: null,
  ttl: 3600000 // 1 hour in milliseconds
};

// Example rates (fallback if API is unavailable)
const fallbackRates = {
  USD: 1,
  INR: 74.5,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.2,
  CAD: 1.25,
  AUD: 1.36
};

// Fetch latest exchange rates from API
const fetchExchangeRates = async () => {
  try {
    // Check if we have cached rates that are still fresh
    if (
      exchangeRateCache.rates &&
      exchangeRateCache.lastUpdated &&
      (Date.now() - exchangeRateCache.lastUpdated) < exchangeRateCache.ttl
    ) {
      return exchangeRateCache.rates;
    }

    // Replace with your actual API key and preferred currency API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey) {
      console.warn('No exchange rate API key found, using fallback rates');
      exchangeRateCache.rates = fallbackRates;
      exchangeRateCache.lastUpdated = Date.now();
      return fallbackRates;
    }

    // Example using exchangerate-api.com
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);

    if (response.data && response.data.conversion_rates) {
      // Cache the rates
      exchangeRateCache.rates = response.data.conversion_rates;
      exchangeRateCache.lastUpdated = Date.now();
      return response.data.conversion_rates;
    } else {
      throw new Error('Invalid response from exchange rate API');
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);

    // Use fallback rates if API call fails
    console.warn('Using fallback exchange rates');
    exchangeRateCache.rates = fallbackRates;
    exchangeRateCache.lastUpdated = Date.now();
    return fallbackRates;
  }
};

// Convert amount from one currency to another
const convert = async (amount, fromCurrency, toCurrency) => {
  try {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1
      };
    }

    // Get latest exchange rates
    const rates = await fetchExchangeRates();

    // Get exchange rates for both currencies relative to USD
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
    }

    // Calculate the direct exchange rate
    const exchangeRate = toRate / fromRate;

    // Convert the amount
    const convertedAmount = amount * exchangeRate;

    return {
      originalAmount: amount,
      convertedAmount,
      exchangeRate
    };
  } catch (error) {
    console.error('Currency conversion error:', error.message);

    // In case of error, return original amount
    return {
      originalAmount: amount,
      convertedAmount: amount,
      exchangeRate: 1,
      error: error.message
    };
  }
};

// Get all supported currencies
const getSupportedCurrencies = async () => {
  try {
    const rates = await fetchExchangeRates();
    return Object.keys(rates);
  } catch (error) {
    console.error('Error getting supported currencies:', error.message);
    return Object.keys(fallbackRates);
  }
};

// Format amount according to currency locale
const formatAmount = (amount, currency) => {
  try {
    const currencyFormatMap = {
      USD: 'en-US',
      INR: 'en-IN',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      AUD: 'en-AU'
    };

    const locale = currencyFormatMap[currency] || 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    console.error('Error formatting amount:', error.message);
    return `${currency} ${amount}`;
  }
};

module.exports = {
  convert,
  getSupportedCurrencies,
  formatAmount,
  fetchExchangeRates
};
