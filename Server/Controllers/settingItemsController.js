import { PrismaClient, CASTINGENTRYTYPE } from "../generated/prisma/index.js";
const prisma =new PrismaClient();


export const createSettingItem = async (req, res) => {
  try {
    let {
      settingEntryId,
      items = [],
      scrapItems = [],
      receiptWeight,
      stoneCount,
      stoneWeight,
      totalProductWeight,
      currentBalanceWeight,
      wastage,
      totalScrapWeight,
      balance,
    } = req.body;

    //  Only validate settingEntryId
    if (!settingEntryId) {
      return res.status(400).json({
        error: "settingEntryId is required",
      });
    }

    // Merge both arrays (optional, can be empty)
    const finalItems = [...items, ...scrapItems];

    const normalizedWastage = wastage === "Yes" || wastage === true;

    // STEP 1: Fetch casting_customer_id from related settingEntry → castingItem
    const settingEntry = await prisma.settingEntry.findUnique({
      where: { id: settingEntryId },
      include: {
        castingItem: {
          select: {
            casting_customer_id: true,
            casting_entry_id: true,
          },
        },
      },
    });

    const castingCustomerId = settingEntry?.castingItem?.casting_customer_id;

    if (!castingCustomerId) {
      return res.status(400).json({
        error:
          "Missing casting_customer_id from related SettingEntry or CastingItem",
      });
    }

    // STEP 2: Process items (only if provided)
    for (const item of finalItems) {
      const existingItem = await prisma.settingItems.findFirst({
        where: {
          setting_entry_id: settingEntryId,
          setting_item_id: item.setting_item_id,
        },
      });

      let settingItem;

      if (existingItem) {
        settingItem = await prisma.settingItems.update({
          where: { id: existingItem.id },
          data: {
            type: "ScrapItems", //  always ScrapItems, no need to pass in body
            scrap_weight: item.weight,
            touch_id: item.touch_id || null,
            item_purity: item.purity || 0,
            scrap_remarks: item.remarks || null,
          },
        });
      } else {
        settingItem = await prisma.settingItems.create({
          data: {
            setting_entry_id: settingEntryId,
            setting_item_id: item.setting_item_id,
            type: "ScrapItems", // always ScrapItems
            scrap_weight: item.weight,
            touch_id: item.touch_id || null,
            item_purity: item.purity || 0,
            scrap_remarks: item.remarks || null,
          },
        });
      }

      // STEP 3: Maintain stock (only for ScrapItems)
      const existingStock = await prisma.stock.findFirst({
        where: { setting_item_id: settingItem.id },
      });

      if (existingStock) {
        await prisma.stock.update({
          where: { id: existingStock.id },
          data: {
            item: { connect: { id: item.setting_item_id } },
            weight: item.weight,
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
            item_purity: item.purity || 0,
            remarks: item.remarks || null,
            casting_customer: { connect: { id: castingCustomerId } },
          },
        });
      } else {
        await prisma.stock.create({
          data: {
            settingItem: { connect: { id: settingItem.id } },
            item: { connect: { id: item.setting_item_id } },
            weight: item.weight,
            touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
            item_purity: item.purity || 0,
            remarks: item.remarks || null,
            casting_customer: { connect: { id: castingCustomerId } },
          },
        });
      }
    }

    // STEP 4: Upsert settingTotalBalance
    const existingBalance = await prisma.settingTotalBalance.findFirst({
      where: { setting_entry_id: settingEntryId },
    });

    if (existingBalance) {
      await prisma.settingTotalBalance.update({
        where: { id: existingBalance.id },
        data: {
          receipt_weight: receiptWeight,
          stone_count: stoneCount,
          stone_weight: stoneWeight,
          total_product_weight: totalProductWeight,
          current_balance_weight: currentBalanceWeight,
          wastage: normalizedWastage,
          total_scrap_weight: totalScrapWeight,
          balance: balance,
        },
      });
    } else {
      await prisma.settingTotalBalance.create({
        data: {
          setting_entry_id: settingEntryId,
          receipt_weight: receiptWeight,
          stone_count: stoneCount,
          stone_weight: stoneWeight,
          total_product_weight: totalProductWeight,
          current_balance_weight: currentBalanceWeight,
          wastage: normalizedWastage,
          total_scrap_weight: totalScrapWeight,
          balance: balance,
        },
      });
    }

    return res.status(200).json({
      message:
        "Setting items, stock, and balance upserted successfully (items optional)",
    });
  } catch (error) {
    console.error("Error in createSettingItem:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const createSettingItem = async (req, res) => {
//   try {
//     let {
//       settingEntryId,
//       items,
//       scrapItems,
//       receiptWeight,
//       stoneCount,
//       stoneWeight,
//       totalProductWeight,
//       currentBalanceWeight,
//       wastage,
//       totalScrapWeight,
//       balance,
//     } = req.body;

//     const finalItems = items || scrapItems || [];

//     if (!settingEntryId || finalItems.length === 0) {
//       return res.status(400).json({
//         error: "settingEntryId and at least one item (Scrap or Product) are required",
//       });
//     }

//     const normalizedWastage = wastage === "Yes" || wastage === true;

//     //  STEP 1: Fetch casting_customer_id from related settingEntry -> castingItem
//     const settingEntry = await prisma.settingEntry.findUnique({
//       where: { id: settingEntryId },
//       include: {
//         castingItem: {
//           select: { 
//             casting_customer_id: true ,
//             casting_entry_id: true,
//           }
//         }
//       }
//     });

//     const castingCustomerId = settingEntry?.castingItem?.casting_customer_id;

//     if (!castingCustomerId) {
//       return res.status(400).json({
//         error: "Missing casting_customer_id from related SettingEntry or CastingItem"
//       });
//     }

//     //  Process each item
//     for (const item of finalItems) {
//       const existingItem = await prisma.settingItems.findFirst({
//         where: {
//           setting_entry_id: settingEntryId,
//           setting_item_id: item.setting_item_id,
//         },
//       });

//       let settingItem;

//       if (existingItem) {
//         settingItem = await prisma.settingItems.update({
//           where: { id: existingItem.id },
//           data: {
//             type: item.type || "ScrapItems",
//             scrap_weight: item.weight,
//             touch_id: item.touch_id || null,
//             item_purity: item.purity || 0,
//             scrap_remarks: item.remarks || null,
//           },
//         });
//       } else {
//         settingItem = await prisma.settingItems.create({
//           data: {
//             setting_entry_id: settingEntryId,
//             setting_item_id: item.setting_item_id,
//             type: item.type || "ScrapItems",
//             scrap_weight: item.weight,
//             touch_id: item.touch_id || null,
//             item_purity: item.purity || 0,
//             scrap_remarks: item.remarks || null,
//           },
//         });
//       }

//       //  STEP 2: Create stock record if ScrapItems
//       if ((item.type || "ScrapItems") === "ScrapItems") {

//         // Check if stock exists for this settingItem
// const existingStock = await prisma.stock.findFirst({
//   where: {
//     setting_item_id: settingItem.id,
//   },
// });

// if (existingStock) {
//   //  Update existing stock record
//   await prisma.stock.update({
//     where: { id: existingStock.id },
//     data: {
//       item: { connect: { id: item.setting_item_id } },
//       weight: item.weight,
//       touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
//       item_purity: item.purity || 0,
//       remarks: item.remarks || null,
//       casting_customer: { connect: { id: castingCustomerId } },
//     },
//   });
// } else {
//   //  Create new stock record
//   await prisma.stock.create({
//     data: {
//       settingItem: { connect: { id: settingItem.id } },
//       item: { connect: { id: item.setting_item_id } },
//       weight: item.weight,
//       touch: item.touch_id ? { connect: { id: item.touch_id } } : undefined,
//       item_purity: item.purity || 0,
//       remarks: item.remarks || null,
//       casting_customer: { connect: { id: castingCustomerId } },
//     },
//   });
// }
//       }
//     }

//     //  STEP 3: Upsert settingTotalBalance
//     const existingBalance = await prisma.settingTotalBalance.findFirst({
//       where: { setting_entry_id: settingEntryId },
//     });

//     if (existingBalance) {
//       await prisma.settingTotalBalance.update({
//         where: { id: existingBalance.id },
//         data: {
//           receipt_weight: receiptWeight,
//           stone_count: stoneCount,
//           stone_weight: stoneWeight,
//           total_product_weight: totalProductWeight,
//           current_balance_weight: currentBalanceWeight,
//           wastage: normalizedWastage,
//           total_scrap_weight: totalScrapWeight,
//           balance: balance,
//         },
//       });
//     } else {
//       await prisma.settingTotalBalance.create({
//         data: {
//           setting_entry_id: settingEntryId,
//           receipt_weight: receiptWeight,
//           stone_count: stoneCount,
//           stone_weight: stoneWeight,
//           total_product_weight: totalProductWeight,
//           current_balance_weight: currentBalanceWeight,
//           wastage: normalizedWastage,
//           total_scrap_weight: totalScrapWeight,
//           balance: balance,
//         },
//       });
//     }

//     return res.status(200).json({
//       message: "Setting items, stock, and balance upserted successfully",
//     });

//   } catch (error) {
//     console.error("Error in createSettingItem:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getAllSettingItems = async (req, res) => {
  try {
    const items = await prisma.settingItems.findMany({
      include: {      
        touch: true,   
        settingEntryId: true,  
        // settingEntryId: {  
        //   include: {
        //     castingItem: true,  
        //     filingItems: true,       
        //     settingWastage: true,   
        //     settingTotalBalance: true, 
        //   }
        // }   
      },
    });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching setting items:", error);
    res.status(500).json({ message: "Failed to fetch setting items" });
  }
};

export const getSettingItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.settingItems.findUnique({
      where: { id: parseInt(id) },
      include: {       
        touch: true,
        stock: true,
        settingEntryId: true,
        buffing_entry: true,
        setting_wastage:true,
  
      },
    });

    if (!item) return res.status(404).json({ error: "Setting item not found" });

    res.json(item);
  } catch (error) {
    console.error("Error fetching setting item:", error);
    res.status(500).json({ error: "Failed to fetch setting item" });
  }
};


export const deleteSettingItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await prisma.settingItems.findUnique({ where: { id: Number(id) } });

    if (!existingItem) {
      return res.status(404).json({ message: "Setting item not found" });
    }

    await prisma.settingItems.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Setting item deleted successfully" });
  } catch (error) {
    console.error("Error deleting setting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






export const createSettingWastage = async (req, res) => {

  try {
    const {
      total_stone_count,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
      lotId,
      setting_person_id,
    } = req.body;

     const lotIdNumber = await prisma.LotInfo.findFirst({
      where: {
        setting_customer_id: parseInt(setting_person_id),
        lotNumber: parseInt(lotId),
      },
    });

    const settimgastage = await prisma.settingWastage.create({
      data: {
        total_stone_count: parseFloat(total_stone_count) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
        balance: parseFloat(balance) || 0,
        wastage_percentage: parseInt(wastage_percentage) || 0,
        given_gold: given_gold ? parseFloat(given_gold) : null,
        add_wastage: add_wastage ? parseFloat(add_wastage) : null,
        overall_wastage: parseFloat(overall_wastage) || 0,
        closing_balance: parseFloat(closing_balance) || 0,
        opening_balance: parseFloat(opening_balance) || 0,
        setting_lot_id: parseInt(lotIdNumber.id),
        setting_person_id: parseInt(setting_person_id),
      },
    });

    res.status(201).json(settimgastage);


  } catch (error) {
    console.error("Error creating setting wastage:", error);
    res.status(500).json({ message: "Failed to create setting wastage record" });
  }
};

export const updateSettingWastage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      total_stone_count,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
    } = req.body;

    console.log("Ssss", req.body)

    const settingWastage = await prisma.settingWastage.update({
      where: { id: parseInt(id) },
      data: {
        total_stone_count: parseFloat(total_stone_count) || 0,
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

    res.status(200).json(settingWastage);
  } catch (error) {
    console.error("Error updating setting wastage:", error);
    res.status(500).json({ message: "Failed to update setting wastage record" });
  }
};

export const getSettingWastageByEntryId = async (req, res) => {
  try {
    const { settingPersonId, lotNumber } = req.params;

    const lotId = await prisma.LotInfo.findFirst({
      where: {
        setting_customer_id: parseInt(settingPersonId),
        lotNumber: parseInt(lotNumber),
      },
    });

    const wastageRecords = await prisma.settingWastage.findMany({
      where: {
        setting_person_id: parseInt(settingPersonId),
        setting_lot_id: parseInt(lotId.id),
      },
      include: {
        settingLotId: true,
        settingPersonId: true,
      },
    });

    res.status(200).json(wastageRecords);
  } catch (error) {
    console.error("Error fetching setting wastage:", error);
    res.status(500).json({ message: "Failed to fetch setting wastage records" });
  }
};

export const closeJobcardAndCreateNewLot = async (req, res) => {
  try {
    const { setting_person_id, current_lot_number } = req.body;

    const currentActiveLot = await prisma.LotInfo.findFirst({
      where: {
        setting_customer_id: parseInt(setting_person_id),
        IsActive: true,
      },
    });

    console.log("currentActiveLot", currentActiveLot);

    let lastClosingBalance = 0;

    if (currentActiveLot) {
      const lastWastage = await prisma.settingWastage.findFirst({
        where: { setting_lot_id: currentActiveLot.id },
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
        setting_customer_id: parseInt(setting_person_id),
        IsActive: true,
      },
    });

    await prisma.settingWastage.create({
      data: {
        setting_person_id: parseInt(setting_person_id),
        setting_lot_id: newLot.id,
        opening_balance: lastClosingBalance,
        closing_balance: 0,
        total_stone_count: 0,
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
        "Jobcard closed, new lot created, and setting Wastage initialized successfully",
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

