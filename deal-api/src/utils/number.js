const isNumeric = (value) =>
  (typeof value === 'number') && value === Number(value) && Number.isFinite(value);

const isInteger = (value) => Number.isInteger(value);

const decimalsCount = (numb) => {
  const decimals = numb.toString().split('.')[1];
  if (decimals) {
    return decimals.length;
  }
  return 0;
};

const stripDecimals = (numb) => {
  const withoutDecimals = numb.toString().split('.')[0];
  return Number(withoutDecimals);
};

const roundNumber = (value, digits) => {
  let modifiedValue = value;
  let d = digits;

  if (!digits) {
    d = 2;
  }

  modifiedValue *= 10 ** d;
  modifiedValue = Math.round(modifiedValue);
  modifiedValue /= 10 ** d;
  return modifiedValue;
};

const sanitizeCurrency = (originalValue = '') => {
  const sanitizedValue = originalValue.replace(/[,]/g, '');
  return {
    originalValue,
    sanitizedValue,
    isCurrency: Number(sanitizedValue).toFixed(2) === sanitizedValue,
  };
};

module.exports = {
  isNumeric,
  isInteger,
  decimalsCount,
  stripDecimals,
  roundNumber,
  sanitizeCurrency,
};
