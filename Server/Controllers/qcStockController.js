import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


// Create or Update QC Stock
export const createQCStock = async (req, res) => {
  try {
    const {
      id,
      date,
      item_id,
      weight,
      stoneWeight,
      finalWeight,
      touch_id,
      purity,
      remarks,
    } = req.body;

    let qcStock;

    if (id) {
      // Update existing record
      qcStock = await prisma.qcStock.update({
        where: { id: Number(id) },
        data: {
          date: date ? new Date(date) : new Date(),
          item_id: Number(item_id),
          weight: parseFloat(weight),
          stone_weight: parseFloat(stoneWeight),
          final_weight: parseFloat(finalWeight),
          touch_id: Number(touch_id),
          purity: parseFloat(purity),
          remarks,
        },
        include: {
          itemId: true,
          touchId: true,
        },
      });
    } else {
      // Create new record
      qcStock = await prisma.qcStock.create({
        data: {
          date: date ? new Date(date) : new Date(),
          item_id: Number(item_id),
          weight: parseFloat(weight),
          stone_weight: parseFloat(stoneWeight),
          final_weight: parseFloat(finalWeight),
          touch_id: Number(touch_id),
          purity: parseFloat(purity),
          remarks,
        },
        include: {
          itemId: true,
          touchId: true,
        },
      });
    }

    res.status(200).json(qcStock);
  } catch (error) {
    console.error("Error saving QC Stock:", error);
    res.status(500).json({ error: "Failed to save QC Stock" });
  }
};

//  Get All QC Stocks

export const getQCStock = async (req, res) => {
  try {
    const qcStocks = await prisma.qcStock.findMany({
      include: {
        itemId: true,
        touchId: true,
        BillItem: {
          include: {
            bill: {
              include: { customer: true },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    // Add computed status field
    const formatted = qcStocks.map((stock) => {
      // Check if BillItem exists and has at least one item
      const hasBillItems = stock.BillItem && stock.BillItem.length > 0;
      
      return {
        ...stock,
        status: hasBillItems ? "Moved" : "Not Moved",
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching QC Stock:", error);
    res.status(500).json({ error: "Failed to fetch QC Stock" });
  }
};


export const getUnUsedQCStock = async (req, res) => {
  try {
    // Step 1: Get all qc_stock_id already used in BillItem
    const usedStock = await prisma.billItem.findMany({
      select: { qc_stock_id: true },
    });

    const usedIds = usedStock.map((item) => item.qc_stock_id);

    // Step 2: Fetch qcStock excluding already used ones
    const qcStocks = await prisma.qcStock.findMany({
      where: {
        id: {
          notIn: usedIds, // exclude those used in BillItem
        },
      },
      include: {
        itemId: true,
        touchId: true,
      },
      orderBy: { id: "desc" },
    });

    res.json(qcStocks);
  } catch (error) {
    console.error("Error fetching QC Stock:", error);
    res.status(500).json({ error: "Failed to fetch QC Stock" });
  }
};


//  Update QC Stock

export const updateQCStock = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      item_id,
      weight,
      stoneWeight,
      finalWeight,
      touch_id,
      purity,
      remarks,
    } = req.body;

    const updated = await prisma.qcStock.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : undefined,
        item_id: Number(item_id),
        weight: parseFloat(weight),
        stone_weight: parseFloat(stoneWeight),
        final_weight: parseFloat(finalWeight),
        touch_id: Number(touch_id),
        purity: parseFloat(purity),
        remarks,
      },
      include: {
        itemId: true,
        touchId: true,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating QC Stock:", error);
    res.status(500).json({ error: "Failed to update QC Stock" });
  }
};

//  Delete QC Stock
export const deleteQCStock = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.qcStock.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "QC Stock deleted successfully" });
  } catch (error) {
    console.error("Error deleting QC Stock:", error);
    res.status(500).json({ error: "Failed to delete QC Stock" });
  }
};
