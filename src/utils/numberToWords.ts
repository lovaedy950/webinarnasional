/**
 * Helper function to convert numbers into Indonesian words (Terbilang)
 * e.g., 40000 -> "Empat Puluh Ribu Rupiah"
 */
export const numberToWordsIndonesian = (num: number): string => {
  if (num <= 0) return 'Nol Rupiah';

  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  const convert = (n: number): string => {
    let result = '';
    if (n < 12) {
      result = units[n];
    } else if (n < 20) {
      result = convert(n - 10) + ' Belas';
    } else if (n < 100) {
      result = convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
    } else if (n < 200) {
      result = 'Seratus ' + convert(n - 100);
    } else if (n < 1000) {
      result = convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
    } else if (n < 2000) {
      result = 'Seribu ' + convert(n - 1000);
    } else if (n < 1000000) {
      result = convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
    } else if (n < 1000000000) {
      result = convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
    }
    return result.trim();
  };

  const words = convert(Math.floor(num));
  return `${words} Rupiah`.replace(/\s+/g, ' ');
};

/**
 * Converts a month number (1-12) to Roman numerals for official invoice numbering
 */
export const getRomanMonth = (monthIndex: number): string => {
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanMonths[monthIndex] || 'VIII';
};
