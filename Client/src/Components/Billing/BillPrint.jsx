// BillPrint.jsx
// import React, { useEffect } from "react";
// const BillPrint = ({ content }) => {

//   useEffect(() => {
//     const printWindow = window.open("", "_blank");

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Bill Print</title>
//           <style>
//             @page { size: A6; margin: 5mm; }
//             body { font-family: Arial, sans-serif; font-size: 8pt; padding: 2mm; }
//             table { width: 100%; border-collapse: collapse; font-size: 8pt; }
//             th, td { border: 1px solid #555; padding: 2px; text-align: center; }
//             th { background: #eee; }
//           </style>
//         </head>
//         <body>
//           ${content}
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   }, [content]);

//   return null;
// };

// export default BillPrint;


import React, { useEffect } from "react";
const BillPrint = ({ content }) => {
  useEffect(() => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Print</title>
          <style>
            @page { size: A6; margin: 5mm; }
            @media print {
                .no-print { display: none !important; }
              }
            body { font-family: Arial, sans-serif; font-size: 8pt; padding: 2mm; }
            table { width: 100%; border-collapse: collapse; font-size: 8pt; }
            th, td { border: 1px solid #555; padding: 2px; text-align: center; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onafterprint = () => {
      printWindow.close();
    };

    printWindow.focus();
    printWindow.print();
  }, [content]);

  return null;
};

export default BillPrint;
