
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


export const createCastingItem = async (req, res) => {
  const { items, balanceData } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items are required." });
  }

  const casting_entry_id = items[0]?.casting_entry_id;

  if (!casting_entry_id) {
    return res.status(400).json({ error: "casting_entry_id is missing." });
  }

  try {
    const castingEntry = await prisma.castingEntry.findUnique({
      where: { id: casting_entry_id },
      select: { casting_customer_id: true },
    });

    if (!castingEntry) {
      return res.status(404).json({ error: "Casting entry not found." });
    }

    const createdItems = await prisma.$transaction(async (tx) => {
      const savedItems = [];

      for (const item of items) {
        let savedItem;

        if (item.id) {
          // Update casting item
          savedItem = await tx.castingItems.update({
            where: { id: item.id },
            data: {
              ...item,
              casting_customer_id: castingEntry.casting_customer_id,
            },
          });

          // Update stock if ScrapItem
          if (item.type === "ScrapItems") {
            const existingStock = await tx.stock.findFirst({
              where: { casting_item_id: item.id },
            });

            if (existingStock) {
              await tx.stock.update({
                where: { id: existingStock.id },
                data: {
                  item_id: parseInt(item.item_id),
                  touch_id: item.touch_id,
                  item_purity: item.item_purity,
                  remarks: item.remarks,
                  weight: item.weight,
                },
              });
            } else {
              await tx.stock.create({
                data: {
                  item_id: parseInt(item.item_id),
                  touch_id: item.touch_id,
                  item_purity: item.item_purity,
                  remarks: item.remarks,
                  casting_item_id: item.id,
                  weight: item.weight,
                  casting_customer_id: castingEntry.casting_customer_id,
                },
              });
            }
          }
        } else {
          // Create new casting item
          savedItem = await tx.castingItems.create({
            data: {
              ...item,
              casting_customer_id: castingEntry.casting_customer_id,
            },
          });

          // Create stock entry if ScrapItem
          if (item.type === "ScrapItems") {
            await tx.stock.create({
              data: {
                item_id: parseInt(item.item_id),
                touch_id: item.touch_id,
                item_purity: item.item_purity,
                remarks: item.remarks,
                casting_item_id: savedItem.id,
                weight: item.weight,
                casting_customer_id: castingEntry.casting_customer_id,
              },
            });
          }
        }

        savedItems.push(savedItem);
      }

      // Save balance entry
      if (balanceData) {
        const existingBalance = await tx.castiingTotalBalance.findFirst({
          where: { item_entry: casting_entry_id },
        });

        if (existingBalance) {
          await tx.castiingTotalBalance.update({
            where: { id: existingBalance.id },
            data: {
              total_item_weight: balanceData.total_item_weight,
              current_balance_weight: balanceData.current_balance_weight,
              total_scrap_weight: balanceData.total_scrap_weight,
              total_wastage: balanceData.total_wastage,
            },
          });
        } else {
          await tx.castiingTotalBalance.create({
            data: {
              total_item_weight: balanceData.total_item_weight,
              current_balance_weight: balanceData.current_balance_weight,
              total_scrap_weight: balanceData.total_scrap_weight,
              total_wastage: balanceData.total_wastage,
              item_entry: casting_entry_id,
            },
          });
        }
      }

      return savedItems;
    });

    res.status(201).json({ message: "Items and balance saved", items: createdItems });
  } catch (error) {
    console.error("Error saving casting items and stock:", error);
    res.status(500).json({ error: "Failed to save casting items and stock." });
  }
};


export const getAllCastingItems = async (req, res) => {
  try {
    const items = await prisma.castingItems.findMany(
      {
        include:{
          item:true,
          casting_customer:true,
          castingEntry:{
            select: {
              id: true,
              date: true,
            }
          },
          touch:true
        }
      }
    );
    console.log('All casting Items',items);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ (by ID)
export const getCastingItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.castingItems.findMany({
      where: {
        casting_entry_id: Number(id),
      },
      include: {
        item: true,
        touch: true,
      },
    });
    
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteCastingItem = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.castingItems.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Casting item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableCastingItems = async (req, res) => {
  try {
    const items = await prisma.castingItems.findMany({
      where: {
        type: "Items",
        filingEntry: {
          none: {},  // Not assigned to FilingEntry
        },
        filingLotMapper: {
          none: {},  // Not assigned to LotFilingMapper
        },
      },
      include: {
        item: true,
        touch: true,
      },
    });

    // Append status field to each item
    const result = items.map((item) => ({
      ...item,
      status: "Unassigned",
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch unassigned casting items", err);
    res.status(500).json({ error: "Failed to fetch unassigned casting items" });
  }
};


