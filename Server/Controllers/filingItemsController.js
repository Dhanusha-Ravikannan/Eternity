// app.use("/api/filingitems",filingItemsRoutes);

import { PrismaClient, CASTINGENTRYTYPE } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createFilingItem = async (req, res) => {
  const { filing_entry_id, items, totalBalance } = req.body;

  try {
    const entry = await prisma.filingEntry.findUnique({
      where: { id: filing_entry_id },
      include: {
        castingItem: {
          select: {
            casting_customer_id: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: "Filing Entry not found" });
    }
    const castingCustomerId = entry.castingItem?.casting_customer_id;

    if (!castingCustomerId) {
      return res
        .status(400)
        .json({ error: "Casting customer ID is missing in filing entry" });
    }
    const result = await prisma.$transaction(async (tx) => {
      const processedItems = await Promise.all(
        items.map(async (item) => {
          const prismaType =
            item.type === "ProductItems"
              ? "Items"
              : item.type === "ScrapItems"
              ? "ScrapItems"
              : null;

          if (!prismaType) {
            throw new Error(`Invalid filing item type: ${item.type}`);
          }

          let filingItem;
          if (item.id) {
            // Update existing
            filingItem = await tx.filingItems.update({
              where: { id: item.id },
              data: {
                filing_entry_id,
                type: prismaType,
                filing_item_id: item.filing_item_id,
                weight: item.weight,
                touch_id: item.touch_id,
                item_purity: item.item_purity,
                remarks: item.remarks || null,
                stone_option: item.stone_option || null,
                lot_filing_mapper_id: item.lot_filing_mapper_id || null,
              },
            });
          } else {
            // Create new
            filingItem = await tx.filingItems.create({
              data: {
                filing_entry_id,
                type: prismaType,
                filing_item_id: item.filing_item_id,
                weight: item.weight,
                touch_id: item.touch_id,
                item_purity: item.item_purity,
                remarks: item.remarks || null,
                stone_option: item.stone_option || null,
                lot_filing_mapper_id: item.lot_filing_mapper_id || null,
              },
            });
          }

          if (prismaType === "ScrapItems") {
            if (item.id) {
              // Update existing stock linked to this filingItem
              await tx.stock.updateMany({
                where: { filing_item_id: item.id },
                data: {
                  weight: item.weight,
                  item_purity: item.item_purity,
                  remarks: item.remarks || null,
                  item_id: item.filing_item_id,
                  touch_id: item.touch_id,
                  casting_customer_id: castingCustomerId,
                },
              });
            } else {
              // Create new stock row for new scrap item
              await tx.stock.create({
                data: {
                  weight: item.weight,
                  item_purity: item.item_purity,
                  remarks: item.remarks || null,
                  item: { connect: { id: item.filing_item_id } },
                  touch: { connect: { id: item.touch_id } },
                  casting_customer: { connect: { id: castingCustomerId } },
                  filingItem: { connect: { id: filingItem.id } },
                },
              });
            }
          }
          return filingItem;
        })
      );

      // Update or create filingTotalBalance record:
      // You might want to upsert it instead of just create to avoid duplicates
      const existingBalance = await tx.filingTotalBalance.findFirst({
        where: { filing_entry_id },
      });

      let balanceRecord;
      if (existingBalance) {
        balanceRecord = await tx.filingTotalBalance.update({
          where: { id: existingBalance.id },
          data: {
            after_weight: totalBalance.after_weight || null,
            total_product_weight: totalBalance.total_product_weight,
            current_balance_weight: totalBalance.current_balance_weight,
            total_scrap_weight: totalBalance.total_scrap_weight || null,
            wastage: totalBalance.wastage ?? false,
            balance: totalBalance.balance,
          },
        });
      } else {
        balanceRecord = await tx.filingTotalBalance.create({
          data: {
            filing_entry_id,
            after_weight: totalBalance.after_weight || null,
            total_product_weight: totalBalance.total_product_weight,
            current_balance_weight: totalBalance.current_balance_weight,
            total_scrap_weight: totalBalance.total_scrap_weight || null,
            wastage: totalBalance.wastage ?? false,
            balance: totalBalance.balance,
          },
        });
      }

      return { createdItems: processedItems, balanceRecord };
    });

    // Send only selected fields to avoid circular JSON error
    res.status(201).json({
      message: "Filing data saved successfully",
      items: result.createdItems.map((item) => ({
        id: item.id,
        filing_entry_id: item.filing_entry_id,
        type: item.type,
        filing_item_id: item.filing_item_id,
        weight: item.weight,
        touch_id: item.touch_id,
        item_purity: item.item_purity,
        remarks: item.remarks,
        stone_option: item.stone_option,
        lot_filing_mapper_id: item.lot_filing_mapper_id,
      })),
      totalBalance: {
        id: result.balanceRecord.id,
        filing_entry_id: result.balanceRecord.filing_entry_id,
        after_weight: result.balanceRecord.after_weight,
        total_product_weight: result.balanceRecord.total_product_weight,
        current_balance_weight: result.balanceRecord.current_balance_weight,
        total_scrap_weight: result.balanceRecord.total_scrap_weight,
        wastage: result.balanceRecord.wastage,
        balance: result.balanceRecord.balance,
        createdAt: result.balanceRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving filing data:", error);
    res.status(500).json({ error: "Failed to save filing data" });
  }
};

export const getAllFilingItems = async (req, res) => {
  try {
    const items = await prisma.filingItems.findMany({
      include: {
        filingitem: true,
        touch: true,
        filing_entry: true,
      },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching filing items:", error);
    res.status(500).json({ message: "Failed to fetch filing items" });
  }
};

export const getFilingItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.filingItems.findUnique({
      where: { id: parseInt(id) },
      include: {
        touch: true,
        stock: true,
        setting_entry: true,
        buffing_entry: true,
        filing_wastage: true,
        filing_entry: true,
      },
    });

    if (!item) return res.status(404).json({ error: "Filing item not found" });

    res.json(item);
  } catch (error) {
    console.error("Error fetching filing item:", error);
    res.status(500).json({ error: "Failed to fetch filing item" });
  }
};

export const deleteFilingItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await prisma.filingItems.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ message: "Filing item not found" });
    }

    await prisma.filingItems.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Filing item deleted successfully" });
  } catch (error) {
    console.error("Error deleting filing item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET - http://localhost:5000/api/filingitems/filingitems/available

// export const getAvailableFilingItems = async (req, res) => {
//   try {
//     const items = await prisma.filingItems.findMany({
//       where: {
//         type: "Items",
//         lot_setting_mapper: {
//           none: {},
//         },

//       },
//       include: {
//         filingitem: true,
//         touch: true,
//       },
//     });

//     // Append status field to each item
//     const result = items.map((item) => ({
//       ...item,
//       status: "Unassigned",
//     }));

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Failed to fetch unassigned filing items", err);
//     res.status(500).json({ error: "Failed to fetch unassigned filing items" });
//   }
// };

export const getAvailableFilingItems = async (req, res) => {
  try {
    const items = await prisma.filingItems.findMany({
      where: {
        type: "Items",
      },
      include: {
        filingitem: true,
        touch: true,
        lot_setting_mapper: true, // mappings for setting assignments
        LotBuffingMapper: true, // mappings for buffing assignments
      },
    });

    const result = items.map((item) => {
      // Assigned if either mapping exists
      const isAssigned =
        (item.lot_setting_mapper && item.lot_setting_mapper.length > 0) ||
        (item.LotBuffingMapper && item.LotBuffingMapper.length > 0);

      return {
        ...item,
        status: isAssigned ? "Assigned" : "Unassigned",
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch filing items", err);
    res.status(500).json({ error: "Failed to fetch filing items" });
  }
};

export const createFilingWastage = async (req, res) => {



  try {
    const {
      total_receipt,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
      lotId,
      filing_person_id,
    } = req.body;

     const lotIdNumber = await prisma.LotInfo.findFirst({
      where: {
        filing_customer_id: parseInt(filing_person_id),
        lotNumber: parseInt(lotId),
      },
    });

    const filingWastage = await prisma.filingWastage.create({
      data: {
        total_receipt: parseFloat(total_receipt) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
        balance: parseFloat(balance) || 0,
        wastage_percentage: parseInt(wastage_percentage) || 0,
        given_gold: given_gold ? parseFloat(given_gold) : null,
        add_wastage: add_wastage ? parseFloat(add_wastage) : null,
        overall_wastage: parseFloat(overall_wastage) || 0,
        closing_balance: parseFloat(closing_balance) || 0,
        opening_balance: parseFloat(opening_balance) || 0,
        filing_lot_id: parseInt(lotIdNumber.id),
        filing_person_id: parseInt(filing_person_id),
      },
    });

    res.status(201).json(filingWastage);
  } catch (error) {
    console.error("Error creating filing wastage:", error);
    res.status(500).json({ message: "Failed to create filing wastage record" });
  }
};

export const updateFilingWastage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      total_receipt,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
    } = req.body;

    const filingWastage = await prisma.filingWastage.update({
      where: { id: parseInt(id) },
      data: {
        total_receipt: parseFloat(total_receipt) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
        balance: parseFloat(balance) || 0,
        wastage_percentage: parseInt(wastage_percentage) || 0,
        given_gold: given_gold ? parseFloat(given_gold) : null,
        add_wastage: add_wastage ? parseFloat(add_wastage) : null,
        overall_wastage: parseFloat(overall_wastage) || 0,
        closing_balance: parseFloat(closing_balance) || 0,
        opening_balance: parseFloat(opening_balance) || 0,
      },
    });

    res.status(200).json(filingWastage);
  } catch (error) {
    console.error("Error updating filing wastage:", error);
    res.status(500).json({ message: "Failed to update filing wastage record" });
  }
};

export const getFilingWastageByEntryId = async (req, res) => {
  try {
    const { filingPersonId, lotNumber } = req.params;

    const lotId = await prisma.LotInfo.findFirst({
      where: {
        filing_customer_id: parseInt(filingPersonId),
        lotNumber: parseInt(lotNumber),
      },
    });

    const wastageRecords = await prisma.filingWastage.findMany({
      where: {
        filing_person_id: parseInt(filingPersonId),
        filing_lot_id: parseInt(lotId.id),
      },
      include: {
        filingLotId: true,
        filingPersonId: true,
      },
    });

    res.status(200).json(wastageRecords);
  } catch (error) {
    console.error("Error fetching filing wastage:", error);
    res.status(500).json({ message: "Failed to fetch filing wastage records" });
  }
};

export const closeJobcardAndCreateNewLot = async (req, res) => {
  try {
    const { filing_person_id, current_lot_number } = req.body;

    const currentActiveLot = await prisma.LotInfo.findFirst({
      where: {
        filing_customer_id: parseInt(filing_person_id),
        IsActive: true,
      },
    });

    console.log("currentActiveLot", currentActiveLot, filing_person_id);

    let lastClosingBalance = 0;

    if (currentActiveLot) {
      const lastWastage = await prisma.filingWastage.findFirst({
        where: { filing_lot_id: currentActiveLot.id },
        orderBy: { id: "desc" },
      });

      if (lastWastage) {
        lastClosingBalance = lastWastage.closing_balance || 0;
      }

      console.log("lot numberrr", lastWastage, lastClosingBalance);

      await prisma.LotInfo.update({
        where: { id: currentActiveLot.id },
        data: { IsActive: false },
      });
    }

    console.log("lot numberrr", currentActiveLot, lastClosingBalance);

    const newLotNumber = currentActiveLot ? currentActiveLot.lotNumber + 1 : 1;

    const newLot = await prisma.LotInfo.create({
      data: {
        lotNumber: newLotNumber,
        filing_customer_id: parseInt(filing_person_id),
        IsActive: true,
      },
    });

    await prisma.FilingWastage.create({
      data: {
        filing_person_id: parseInt(filing_person_id),
        filing_lot_id: newLot.id,
        opening_balance: lastClosingBalance,
        closing_balance: 0,
        total_receipt: 0,
        total_wastage: 0,
        balance: 0,
        wastage_percentage: 0,
        given_gold: 0,
        add_wastage: 0,
        overall_wastage: 0,
      },
    });

    res.status(200).json({
      message:
        "Jobcard closed, new lot created, and FilingWastage initialized successfully",
      newLotNumber: newLot.lotNumber,
      newLotId: newLot.id,
      opening_balance: lastClosingBalance,
    });
  } catch (error) {
    console.error("Error closing jobcard:", error);
    res
      .status(500)
      .json({ message: "Failed to close jobcard and create new lot" });
  }
};



