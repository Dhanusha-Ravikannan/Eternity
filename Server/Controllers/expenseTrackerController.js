import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


export const createExpenseVoucher = async (req, res) => {
  try {
    const { date,description, gold, touch_id, purity } = req.body;

    if (!touch_id || !gold) {
      return res.status(400).json({ error: "Touch and gold are required." });
    }

    // Create new expense voucher entry
    const newVoucher = await prisma.expenseVoucher.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description,
        gold: parseFloat(gold),
        touch_id: parseInt(touch_id),
        purity: parseFloat(purity) || 0,
      },
    });

    // Reduce stock for that touch
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


export const updateExpenseVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, gold, touch_id, purity } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Voucher ID is required." });
    }

    const existingVoucher = await prisma.expenseVoucher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingVoucher) {
      return res.status(404).json({ error: "Expense Voucher not found." });
    }


    const oldTouch = existingVoucher.touch_id;
    const oldGold = parseFloat(existingVoucher.gold);

    const oldStock = await prisma.stock.findMany({
      where: { touch_id: oldTouch },
      orderBy: { id: "asc" },
    });

    for (const stock of oldStock) {
      await prisma.stock.update({
        where: { id: stock.id },
        data: { weight: stock.weight + oldGold },
      });
      break; 
    }


    const newTouch = parseInt(touch_id);
    const newGold = parseFloat(gold);

    const newStock = await prisma.stock.findMany({
      where: { touch_id: newTouch },
      orderBy: { id: "asc" },
    });

    let remainingToDeduct = newGold;

    for (const stock of newStock) {
      if (remainingToDeduct <= 0) break;

      const currentWeight = parseFloat(stock.weight);
      const deduct = Math.min(currentWeight, remainingToDeduct);

      await prisma.stock.update({
        where: { id: stock.id },
        data: { weight: currentWeight - deduct },
      });

      remainingToDeduct -= deduct;
    }


    const updatedVoucher = await prisma.expenseVoucher.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : existingVoucher.date,
        description,
        gold: newGold,
        touch_id: newTouch,
        purity: parseFloat(purity) || 0,
      },
    });

    return res.status(200).json({
      message: "Expense Voucher updated successfully.",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Error updating Expense Voucher:", error);
    res.status(500).json({ error: "Failed to update Expense Voucher." });
  }
};


export const deleteExpenseVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Voucher ID is required." });
    }

    const voucher = await prisma.expenseVoucher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Expense Voucher not found." });
    }

    const stockItems = await prisma.stock.findMany({
      where: { touch_id: voucher.touch_id },
      orderBy: { id: "asc" },
    });

    for (const stock of stockItems) {
      await prisma.stock.update({
        where: { id: stock.id },
        data: { weight: stock.weight + parseFloat(voucher.gold) },
      });
      break; 
    }

    await prisma.expenseVoucher.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "Expense Voucher deleted successfully." });
  } catch (error) {
    console.error("Error deleting Expense Voucher:", error);
    res.status(500).json({ error: "Failed to delete Expense Voucher." });
  }
};


