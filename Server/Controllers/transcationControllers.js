import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createTransaction = async (req, res) => {
  try {
    const { date, type, value, touch, purity,goldRate, customerId } = req.body;
    console.log("Backend received request body:", req.body);

    if (!date || !type || !value || !customerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = await prisma.customerTransaction.create({
      data: {
        date: new Date(date),
        type,
        goldRate: goldRate? parseFloat(goldRate) : null,
        value: parseFloat(value),
        touch: touch ? parseFloat(touch) : null,
        purity: purity ? parseFloat(purity) : null,
        customer: {
          connect: {
            id: parseInt(customerId),
          },
        },
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
      orderBy: { date: "desc" },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


