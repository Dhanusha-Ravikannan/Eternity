import { ITEMTYPE, PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

// export const createTransaction = async (req, res) => {
//   try {
//     console.log("Sssssssssssss", req.body);
//     const { date, type, value, touchId, purity, goldRate, customerId } =
//       req.body;
//     console.log("Backend received request body:", req.body);

//     if (!date || !type || !value || !customerId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const transaction = await prisma.customerTransaction.create({
//       data: {
//         date: new Date(date),
//         type,
//         goldRate: goldRate ? parseFloat(goldRate) : null,
//         value: parseFloat(value),
//         ...(touchId ? { touch: { connect: { id: parseInt(touchId) } } } : {}),
//         purity: purity ? parseFloat(purity) : null,
//         customer: {
//           connect: {
//             id: parseInt(customerId),
//           },
//         },
//       },
//     });

//     const stock = await prisma.stock.create({
//       data: {
//         casting_item_id: null,
//         filing_item_id: null,
//         setting_item_id: null,
//         buffing_item_id: null,
//         item_type: "Gold", 
//         item_id: null,
//         weight: value?parseFloat(value):0,
//         touch_id: touchId ? parseInt(touchId) : null,
//         item_purity: purity ? parseFloat(purity) : 0, 
//         remarks: `From Customer Transaction of Customer Id - ${customerId}`,
//         casting_customer_id: null,
//         purchase_id: null,
//         customer_transaction_id: customerId,
//       },
//     });

//     res.status(201).json(transaction);
//   } catch (error) {
//     console.error("Error creating transaction:", error);
//     console.error("Prisma error details:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }; 



export const createTransaction = async (req, res) => {
  try {
    const { date, type, value, touchId, purity, goldRate, customerId } = req.body;

    if (!date || !type || !value || !customerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    //  Step 1: Create new transaction
    const transaction = await prisma.customerTransaction.create({
      data: {
        date: new Date(date),
        type,
        goldRate: goldRate ? parseFloat(goldRate) : null,
        value: parseFloat(value),
        ...(touchId ? { touch: { connect: { id: parseInt(touchId) } } } : {}),
        purity: purity ? parseFloat(purity) : null,
        customer: { connect: { id: parseInt(customerId) } },
      },
    });

    //  Step 2: Add stock entry
    await prisma.stock.create({
      data: {
        casting_item_id: null,
        filing_item_id: null,
        setting_item_id: null,
        buffing_item_id: null,
        item_type: "Gold",
        item_id: null,
        weight: value ? parseFloat(value) : 0,
        touch_id: touchId ? parseInt(touchId) : null,
        item_purity: purity ? parseFloat(purity) : 0,
        remarks: `From Customer Transaction of Customer Id - ${customerId}`,
        casting_customer_id: null,
        purchase_id: null,
        customer_transaction_id: transaction.id,
      },
    });

    //  Step 3: Fetch all transactions for this customer to compute total purity
    const allTransactions = await prisma.customerTransaction.findMany({
      where: { customerId: parseInt(customerId) },
    });

    const totalPuritySum = allTransactions.reduce(
      (sum, txn) => sum + (parseFloat(txn.purity) || 0),
      0
    );

    //  Step 4: Fetch the customer details
    const customer = await prisma.addCustomer.findUnique({
      where: { id: parseInt(customerId) },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    //  Step 5: Determine correct opening balance
    let openingBalance = 0;

    if (customer.openingBalance !== null && customer.openingBalance !== undefined) {
      // If openingBalance column exists and has value
      openingBalance = parseFloat(customer.openingBalance);
    } else {
      // Otherwise use initial balance as opening balance (only once)
      openingBalance = parseFloat(customer.balance) || 0;

      // Save this as fixed openingBalance for future consistency
      await prisma.addCustomer.update({
        where: { id: parseInt(customerId) },
        data: { openingBalance },
      });
    }

    //  Step 6: Compute totalBalance = fixed opening + totalPuritySum
    const totalBalance = openingBalance + totalPuritySum;

    //  Step 7: Update customer's current balance
    await prisma.addCustomer.update({
      where: { id: parseInt(customerId) },
      data: { balance: totalBalance },
    });

    res.status(201).json({
      message: "Transaction created and customer balance updated successfully.",
      transaction,
      totalBalance,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getAllTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const transactions = await prisma.customerTransaction.findMany({
      where: { customerId: parseInt(customerId) },
      include: { touch: true,customer:true },
      orderBy: { date: "desc" },

      include:{
        touch:true,
        customer:true
      }
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllTransactionsWithoutCustomer = async (req, res) => {
  try {

    const transactions = await prisma.customerTransaction.findMany({
      include: { touch: true,customer:true },
      orderBy: { date: "desc" },

      include:{
        touch:true,
        customer:true
      }
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
