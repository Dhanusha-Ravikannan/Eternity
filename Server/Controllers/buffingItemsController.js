
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();






// export const createBuffingItem = async (req, res) => {
//   try {
//     let {
//       buffingEntryId,
//       scrapItems = [],
//       receiptWeight,
//       remarks,
//       wastage,
//       totalScrapWeight,
//       balance,
//     } = req.body;

//     if (!buffingEntryId) {
//       return res.status(400).json({ error: "buffingEntryId is required" });
//     }

//     const normalizedWastage = wastage === "Yes" || wastage === true;

//     // Fetch casting_customer_id
//     const buffingEntry = await prisma.buffingEntry.findUnique({
//       where: { id: buffingEntryId },
//       include: { castingItem: { select: { casting_customer_id: true } } },
//     });
//     const castingCustomerId = buffingEntry?.castingItem?.casting_customer_id;
//     if (!castingCustomerId) return res.status(400).json({ error: "Missing casting_customer_id" });

//     // Process Scrap Items
//     for (const item of scrapItems) {
//       let buffingItem;

//       if (item.id) {
//         // Update existing scrap item
//         buffingItem = await prisma.buffingItems.update({
//           where: { id: item.id },
//           data: {
//             type: "ScrapItems",
//             scrap_weight: item.weight,
//             item_purity: item.item_purity ?? 0,
//             scrap_remarks: item.scrap_remarks || "",
//             touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
//           },
//         });
//       } else {
//         // Create new scrap item
//         buffingItem = await prisma.buffingItems.create({
//           data: {
//             type: "ScrapItems",
//             scrap_weight: item.weight,
//             item_purity: item.item_purity ?? 0,
//             scrap_remarks: item.scrap_remarks || "",
//             buffingEntryId: { connect: { id: buffingEntryId } },
//             item: { connect: { id: item.buffing_item_id } },
//             touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
//           },
//         });
//       }

//       // Maintain stock
//       const existingStock = await prisma.stock.findFirst({
//         where: { buffing_item_id: buffingItem.id },
//       });

//       const stockData = {
//         item: { connect: { id: item.buffing_item_id } },
//         weight: item.weight,
//         touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
//         item_purity: item.item_purity ?? 0,
//         remarks: item.scrap_remarks || null,
//         casting_customer: { connect: { id: castingCustomerId } },
//       };

//       if (existingStock) {
//         await prisma.stock.update({ where: { id: existingStock.id }, data: stockData });
//       } else {
//         await prisma.stock.create({ data: { buffingItem: { connect: { id: buffingItem.id } }, ...stockData } });
//       }
//     }

//     // Upsert BuffingTotalBalance
//     const existingBalance = await prisma.buffingTotalBalance.findFirst({ where: { buffing_entry_id: buffingEntryId } });
//     const balanceData = { receipt_weight: receiptWeight, remarks, wastage: normalizedWastage, total_scrap_weight: totalScrapWeight, balance };

//     if (existingBalance) {
//       await prisma.buffingTotalBalance.update({ where: { id: existingBalance.id }, data: balanceData });
//     } else {
//       await prisma.buffingTotalBalance.create({ data: { buffing_entry_id: buffingEntryId, ...balanceData } });
//     }

//     return res.status(200).json({ message: "Buffing items, stock, and balance upserted successfully" });

//   } catch (error) {
//     console.error("Error in createBuffingItem:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };


export const createBuffingItem = async (req, res) => {
  try {
    let {
      buffingEntryId,
      scrapItems = [],
      receiptWeight,
      remarks,
      wastage,
      totalScrapWeight,
      balance,
    } = req.body;

    if (!buffingEntryId) {
      return res.status(400).json({ error: "buffingEntryId is required" });
    }

    // Normalize wastage
    const normalizedWastage = wastage === "Yes" || wastage === true;

    // STEP 1: Fetch casting_customer_id from BuffingEntry → CastingItem
    const buffingEntry = await prisma.buffingEntry.findUnique({
      where: { id: buffingEntryId },
      include: {
        castingItem: {
          select: { casting_customer_id: true },
        },
      },
    });

    const castingCustomerId = buffingEntry?.castingItem?.casting_customer_id;
    if (!castingCustomerId) {
      return res
        .status(400)
        .json({ error: "Missing casting_customer_id from BuffingEntry" });
    }

    // STEP 2: Process Scrap Items
    for (const item of scrapItems) {
      const existingItem = await prisma.buffingItems.findFirst({
        where: {
          // buffingEntryId: buffingEntryId,
          buffing_item_id: item.buffing_item_id,
          buffing_entry_id: buffingEntryId,
        },
      });

      let buffingItem;
      if (existingItem) {

        buffingItem = await prisma.buffingItems.update({
          where: { id: existingItem.id },
          data: {
            type: "ScrapItems",
            scrap_weight: item.weight,
            item_purity: item.item_purity ?? 0,
            scrap_remarks: item.scrap_remarks || "",
            buffingEntryId: { connect: { id: buffingEntryId } },
            item: { connect: { id: item.buffing_item_id } },        
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
          },
        });

      } else {
        
        buffingItem = await prisma.buffingItems.create({
          data: {
            type: "ScrapItems",
            scrap_weight: item.weight,
            item_purity: item.item_purity ?? 0,
            scrap_remarks: item.scrap_remarks || "",
            buffingEntryId: { connect: { id: buffingEntryId } },  
    
            item: { connect: { id: item.buffing_item_id } },           
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined, 
          },
        });
        
      }

      // STEP 3: Maintain stock
      const existingStock = await prisma.stock.findFirst({
        where: { buffing_item_id: buffingItem.id },
      });

      if (existingStock) {
        await prisma.stock.update({
          where: { id: existingStock.id },
          data: {
            item: { connect: { id: item.buffing_item_id } },
            weight: item.weight,
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
            item_purity: item.item_purity ?? 0,
            remarks: item.scrap_remarks || null,
            casting_customer: { connect: { id: castingCustomerId } },
          },
        });
      } else {
        await prisma.stock.create({
          data: {
            buffingItem: { connect: { id: buffingItem.id } },
            item: { connect: { id: item.buffing_item_id } },
            weight: item.weight,
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
            item_purity: item.item_purity ?? 0,
            remarks: item.scrap_remarks || null,
            casting_customer: { connect: { id: castingCustomerId } },
          },
        });
      }
    }

    // STEP 4: Upsert BuffingTotalBalance
    const existingBalance = await prisma.buffingTotalBalance.findFirst({
      where: { buffing_entry_id: buffingEntryId },
    });

    if (existingBalance) {
      await prisma.buffingTotalBalance.update({
        where: { id: existingBalance.id },
        data: {
          receipt_weight: receiptWeight,
          remarks,
          wastage: normalizedWastage,
          total_scrap_weight: totalScrapWeight,
          balance,
        },
      });
    } else {
      await prisma.buffingTotalBalance.create({
        data: {
          buffing_entry_id: buffingEntryId,
          receipt_weight: receiptWeight,
          remarks,
          wastage: normalizedWastage,
          total_scrap_weight: totalScrapWeight,
          balance,
        },
      });
    }

    return res.status(200).json({
      message: "Buffing items, stock, and balance upserted successfully",
    });
  } catch (error) {
    console.error("Error in createBuffingItem:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// GET /api/buffingitems
export const getAllBuffingItems = async (req, res) => {
  try {
    const entries = await prisma.buffingEntry.findMany({
      include: {
        BuffingItems: {
          include: {
            item: true,
            touch: true,
          },
        },
        BuffingTotalBalance: true,
      
      },
    });

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching buffing items:", error);
    res.status(500).json({ message: "Failed to fetch buffing items" });
  }
};

// GET /api/buffingitems/:id
export const getBuffingItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.buffingEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        BuffingItems: {
          include: {
            item: true,
            touch: true,
          },
        },
        BuffingTotalBalance: true,
      },
    });

    if (!entry) return res.status(404).json({ error: "Buffing entry not found" });

    res.json(entry);
  } catch (error) {
    console.error("Error fetching buffing entry:", error);
    res.status(500).json({ error: "Failed to fetch buffing entry" });
  }
};



export const deleteBuffingItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await prisma.buffingItems.findUnique({ where: { id: Number(id) } });

    if (!existingItem) {
      return res.status(404).json({ message: "Buffing item not found" });
    }

    await prisma.buffingItems.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Buffing item deleted successfully" });
  } catch (error) {
    console.error("Error deleting buffing item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
