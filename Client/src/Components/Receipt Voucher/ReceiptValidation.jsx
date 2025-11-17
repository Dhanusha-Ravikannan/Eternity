const receiptValidation = (receipt, setReceiptErrors) => {
  const validateField = (value, name) => {
    if (value === "" || value == null) return null; 
    if (value < 0) return "negative value";
    if (!/^\d*\.?\d*$/.test(value)) return `valid ${name}`;
    return null;
  };

  const errors = receipt.map((item) => {
    const rowErrors = {};

    if (!item.date) rowErrors.date = "date";
    if (!item.type) rowErrors.type = "required";

    if (item.type === "Cash") {
      ["goldRate", "amount"].forEach((field) => {
        const err = validateField(item[field], field);
        if (err) rowErrors[field] = err;
      });

      const hallmarkErr = validateField(item.hallMark, "hallMark");
      if (hallmarkErr) rowErrors.hallMark = hallmarkErr;
    }

    if (item.type === "Gold") {
      ["gold", "touch"].forEach((field) => {
        const err = validateField(item[field], field);
        if (err) rowErrors[field] = err;
      });

      const hallmarkErr = validateField(item.hallMark, "hallMark");
      if (hallmarkErr) rowErrors.hallMark = hallmarkErr;
    }

    return rowErrors;
  });

  setReceiptErrors(errors);
  return errors.every((err) => Object.keys(err).length === 0);
};

export { receiptValidation };
