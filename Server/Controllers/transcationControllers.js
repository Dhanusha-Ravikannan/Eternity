import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createTransaction = async (req, res) => {
  try {
    console.log("Sssssssssssss", req.body);
    const { date, type, value, touchId, purity, goldRate, customerId } =
      req.body;
    console.log("Backend received request body:", req.body);

    if (!date || !type || !value || !customerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = await prisma.customerTransaction.create({
      data: {
        date: new Date(date),
        type,
        goldRate: goldRate ? parseFloat(goldRate) : null,
        value: parseFloat(value),
        ...(touchId ? { touch: { connect: { id: parseInt(touchId) } } } : {}),
        purity: purity ? parseFloat(purity) : null,
        customer: {
          connect: {
            id: parseInt(customerId),
          },
        },
      },
    });

    const stock = await prisma.stock.create({
      data: {
        casting_item_id: null,
        filing_item_id: null,
        setting_item_id: null,
        buffing_item_id: null,
        item_type: "Gold", 
        item_id: null,
        weight: 0,
        touch_id: touchId ? parseInt(touchId) : null,
        item_purity: purity ? parseFloat(purity) : 0, 
        remarks: `From Customer Transaction of Customer Id - ${customerId}`,
        casting_customer_id: null,
        purchase_id: null,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    console.error("Prisma error details:", error);
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
