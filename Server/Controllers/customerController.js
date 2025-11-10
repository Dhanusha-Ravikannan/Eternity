import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();
import { getCustomerBalance } from "../Utils/getCustomerBal.js"


// Create customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phoneNumber, address, email, balance } = req.body;
    const newCustomer = await prisma.addCustomer.create({
      data: { 
        name, 
        phoneNumber, 
        address, 
        email,
        // balance: balance === "" || balance == null ? null : parseFloat(balance),
        balance: balance === "" || balance == null ? 0 : parseFloat(balance),

       },
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  const customers = await prisma.addCustomer.findMany({
    orderBy:{
      updatedAt:'desc'
    },
    include:{
      hallmarks:{
        select:{balance:true}
      }
    }
  });
  res.json(customers);
};

// Update customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, address, email, balance } = req.body;
  try {
    const updated = await prisma.addCustomer.update({
      where: { id: Number(id) },
      data: { 
        name, 
        phoneNumber, 
        address, 
        email,
        balance: balance === "" || balance == null ? null : parseFloat(balance),
      
       },
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: "Customer not found" });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.addCustomer.delete({ where: { id: Number(id) } });
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(404).json({ error: "Customer not found" });
  }
};

// export const getHallmarkByCustomerId = async (req, res) => {
//   try {
//     const { customerId } = req.params;

//     const hallmark = await prisma.hallmark.findMany({
//       where: {
//         customer_id: parseInt(customerId),
//       },
//       include: {
//         customer: true 
//       }
//     });

//     if (hallmark.length === 0) {
//       return res.status(200).json({ balance: 0 });
//     }

//     res.status(200).json(hallmark);
//   } catch (error) {
//     console.error("Error fetching hallmark:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


export const getHallmarkByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const parsedId = parseInt(customerId);

    // Fetch hallmark records with related customer
    const hallmark = await prisma.hallmark.findMany({
      where: { customer_id: parsedId },
      include: { customer: true },
    });

    if (hallmark.length === 0) {
      // If no hallmark records, still fetch customer details
      const customer = await prisma.addCustomer.findUnique({
        where: { id: parsedId },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Return balance: 0 with customer info
      return res.status(200).json([
        {
          balance: 0,
          customer: customer,
        },
      ]);
    }

    // If hallmark records exist, return them (already includes customer)
    res.status(200).json(hallmark);
  } catch (error) {
    console.error("Error fetching hallmark:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getCustomerReportDetailsById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const customer = await prisma.addCustomer.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         //  Receipt Voucher details
//         receipt_voucher: {
//           include: {
//             touchId: true, // include touch info (optional)
//           },
//         },

//         //  Customer Transactions
//         transactions: {
//           include: {
//             touch: true, // Include touch details used in transactions
//             stock: true, // Include related stock entries if any
//           },
//         },

//         //  Bills (with nested BillItems and ReceivedItems)
//         bills: {
//           include: {
//             billItems: {
//               include: {
//                 qcStock: {
//                   include: {
//                     itemId: true, // Include item details from AddItem
//                     touchId: true,
//                   },
//                 },
//               },
//             },
//             receivedItems: true,
//           },
//         },

//         // Optional: Include Hallmark details if you want
//         hallmarks: true,
//       },
//     });

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     res.status(200).json(customer);
//   } catch (error) {
//     console.error("Error fetching customer details:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };


// http://localhost:5000/api/customers/customerReport/1

export const getCustomerReportDetailsById = async (req, res) => {
  const { id } = req.params;
  const { fromDate, toDate } = req.query;

  try {
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    //  Initialize date filter
    let dateFilter = {};
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include full day range

      dateFilter = {
        gte: from,
        lte: to,
      };
    }

    //  Fetch customer with related filtered data
    const customer = await prisma.addCustomer.findUnique({
      where: { id: customerId },
      include: {
        receipt_voucher: {
          where: fromDate && toDate ? { createdAt: dateFilter } : undefined,
          include: {
            touchId: true,
          },
        },

        //  Transactions (filtered by date)
        transactions: {
          where: fromDate && toDate ? { createdAt: dateFilter } : undefined,
          include: {
            touch: true,
            stock: true,
          },
        },

        //  Bills (filtered by date)
        bills: {
          where: fromDate && toDate ? { createdAt: dateFilter } : undefined,
          include: {
            billItems: {
              include: {
                qcStock: {
                  include: {
                    itemId: true,
                    touchId: true,
                  },
                },
              },
            },
            receivedItems: true,
          },
        },

        //  Hallmark details (optional, no date filter)
        hallmarks: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    //  Combine summary view (optional)
    const summary = {
      totalBills: customer.bills?.length || 0,
      totalReceipts: customer.receipt_voucher?.length || 0,
      totalTransactions: customer.transactions?.length || 0,
      totalHallmarks: customer.hallmarks?.length || 0,
    };

    //  Send combined response
    res.status(200).json({
      customerDetails: customer,
      summary,
      filterRange:
        fromDate && toDate ? { from: fromDate, to: toDate } : "All Time",
    });
  } catch (error) {
    console.error("Error fetching customer report details:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




export const customerReport = async (req, res) => {
  try {
    const { id } = req.params; 
    const { fromDate, toDate } = req.query;

    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    let dateFilter = {};
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); 

      dateFilter = { gte: from, lte: to };
    }

    const billWhere = fromDate && toDate ? { createdAt: dateFilter, customer_id: customerId } : { customer_id: customerId };
    const billReceiveWhere = fromDate && toDate ? { createdAt: dateFilter } : {};
    const receiptVoucherWhere = fromDate && toDate ? { createdAt: dateFilter, customer_id: customerId } : { customer_id: customerId };
    const transactionWhere = fromDate && toDate ? { createdAt: dateFilter, customerId } : { customerId };

    const bills = await prisma.bill.findMany({
      where: billWhere,
      include: {
        billItems: true,
        receivedItems: true,
      },
    });

    const billReceives = await prisma.receivedItem.findMany({
      where: billReceiveWhere,
    });

    const receipts = await prisma.receiptVoucher.findMany({
      where: receiptVoucherWhere,
      include: { touchId: true },
    });

    const transactions = await prisma.customerTransaction.findMany({
      where: transactionWhere,
      include: {
        touch: true,
        stock: true,
      },
    });

    const combinedData = [
      ...bills.map((bill) => ({ type: "Bill", info: bill })),
      ...billReceives.map((receive) => ({ type: "BillReceive", info: receive })),
      ...receipts.map((receipt) => ({ type: "ReceiptVoucher", info: receipt })),
      ...transactions.map((tran) => ({ type: "Transaction", info: tran })),
    ];

    const overallBalance = await getCustomerBalance(customerId);

    const summary = {
      totalBills: bills.length,
      totalReceipts: receipts.length,
      totalTransactions: transactions.length,
      totalBillReceives: billReceives.length,
    };

    res.status(200).json({
      data: combinedData,
      summary,
      overallBalance,
      filterRange:
        fromDate && toDate ? { from: fromDate, to: toDate } : "All Time",
    });
  } catch (error) {
    console.error("Error in customerReport:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



