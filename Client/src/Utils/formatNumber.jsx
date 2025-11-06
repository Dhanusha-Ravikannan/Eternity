
export const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.000"; // fallback for invalid/empty values
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };
  