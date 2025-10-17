import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


export const createExpenseVoucher = async (req, res) => {
  try {
    const { description, gold, touch_id, purity } = req.body;

    if (!touch_id || !gold) {
      return res.status(400).json({ error: "Touch and gold are required." });
    }

    // Step 1️ - Create new expense voucher entry
    const newVoucher = await prisma.expenseVoucher.create({
      data: {
        description,
        gold: parseFloat(gold),
        touch_id: parseInt(touch_id),
        purity: parseFloat(purity) || 0,
      },
    });

    // Step 2️ - Reduce stock for that touch
    // Find all stock entries for this touch
    const stockItems = await prisma.stock.findMany({
      where: { touch_id: parseInt(touch_id) },
      orderBy: { id: "asc" }, 
    });

    let remainingToDeduct = parseFloat(gold);

    for (const stock of stockItems) {
      if (remainingToDeduct <= 0) break;

      const currentWeight = parseFloat(stock.weight);
      const deduct = Math.min(currentWeight, remainingToDeduct);

      await prisma.stock.update({
        where: { id: stock.id },
        data: { weight: currentWeight - deduct },
      });

      remainingToDeduct -= deduct;
    }

    if (remainingToDeduct > 0) {
      console.warn(
        ` Not enough stock for touch ${touch_id}. Short by ${remainingToDeduct}g.`
      );
    }

    res.status(201).json({
      message: "Expense Voucher created successfully",
      voucher: newVoucher,
    });
  } catch (error) {
    console.error("Error creating Expense Voucher:", error);
    res.status(500).json({ error: "Failed to create Expense Voucher" });
  }
};


export const getAllExpenseVouchers = async (req, res) => {
  try {
    const vouchers = await prisma.expenseVoucher.findMany({
      orderBy: { createdAt: "desc" },
      include:{
        touchId: true
      }
    });

    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Error fetching expense vouchers:", error);
    res.status(500).json({ error: "Failed to fetch Expense Vouchers" });
  }
};
