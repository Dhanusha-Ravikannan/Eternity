import React, { useEffect } from "react";

const BillPrint = ({ viewBill, printRef }) => {
  useEffect(() => {
    if (!viewBill || !printRef?.current) return;

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Saved Bill</title>
          <style>
            @page { size: A6; margin: 5mm; }
            body {
              font-family: Arial, sans-serif;
              font-size: 8pt;
              line-height: 1.1;
              padding: 2mm;
              color: #000;
            }
            h4 {
              text-align: center;
              margin: 0 0 5px 0;
              font-size: 10pt;
            }

            .bill-header {
              width: 100%;
              margin-bottom: 6px;
              font-size: 8pt;
              line-height: 1.3;
            }

            .bill-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }

            .bill-row .left {
              text-align: left;
              flex: 1;
            }

            .bill-row .right {
              text-align: right;
              flex: 1;
            }

            .bill div {
              display: flex;
              flex-direction: column;
              font-size: 8pt;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              font-size: 8pt;
            }

            th, td {
              border: 1px solid #555;
              padding: 2px 4px;
              text-align: center;
            }

            th { background: #f0f0f0; }
            tfoot td { font-weight: bold; }

            .billdetails, .balance, .bal {
              font-size: 7pt;
              margin-top: 4px;
            }

            .balance-line {
              display: flex;
              justify-content: space-between;
              font-size: 7pt;
              margin-top: 1rem;
            }

            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for the window to render content before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);

  }, [viewBill, printRef]);

  return null; // This component only triggers print, doesn’t render anything itself
};

export default BillPrint;
