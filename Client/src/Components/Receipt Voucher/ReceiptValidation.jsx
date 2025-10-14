// const receiptValidation = (receipt, setReceiptErrors) => {
//     // helper function
//   const validateField = (value, name) => {
//     if (!value) return name;
//     if (value < 0) return "negative value";
//     if (!/^\d*\.?\d*$/.test(value)) return `valid ${name}`;
//     return null;
//   };

//   const errors = receipt.map((item) => {
//     const rowErrors = {};
//     if (!item.date) rowErrors.date = "date";
//     if (!item.type) rowErrors.type = "type";

//     if (item.type === "Cash") {
//       ["goldRate", "amount", "hallMark"].forEach((field) => {
//         const err = validateField(item[field], field);
//         if (err) rowErrors[field] = err;
//       });
//     }

//     if (item.type === "Gold") {
//       ["gold", "touch", "hallMark"].forEach((field) => {
//         const err = validateField(item[field], field);
//         if (err) rowErrors[field] = err;
//       });
//     }

//     return rowErrors;
//   });

//   setReceiptErrors(errors);
//   return errors.every((err) => Object.keys(err).length === 0);
// };

// export {
//    receiptValidation
// };


const receiptValidation = (receipt, setReceiptErrors) => {
  // helper function
  const validateField = (value, name) => {
    if (value === "" || value == null) return null; // allow empty (optional)
    if (value < 0) return "negative value";
    if (!/^\d*\.?\d*$/.test(value)) return `valid ${name}`;
    return null;
  };

  const errors = receipt.map((item) => {
    const rowErrors = {};

    if (!item.date) rowErrors.date = "date";
    if (!item.type) rowErrors.type = "type";

    if (item.type === "Cash") {
      ["goldRate", "amount"].forEach((field) => {
        const err = validateField(item[field], field);
        if (err) rowErrors[field] = err;
      });
      // hallMark is optional — validate only if provided
      if (item.hallMark)
        rowErrors.hallMark = validateField(item.hallMark, "hallMark");
    }

    if (item.type === "Gold") {
      ["gold", "touch"].forEach((field) => {
        const err = validateField(item[field], field);
        if (err) rowErrors[field] = err;
      });
      // hallMark optional for Gold too
      if (item.hallMark)
        rowErrors.hallMark = validateField(item.hallMark, "hallMark");
    }

    return rowErrors;
  });

  setReceiptErrors(errors);
  return errors.every((err) => Object.keys(err).length === 0);
};

export { receiptValidation };
