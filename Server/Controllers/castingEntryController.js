import { PrismaClient } from "../generated/prisma/index.js";

const { reduceStockOnCastingCreate, addStockOnCastingDelete } = await import(
  "./castingStockController.js"
);

const prisma = new PrismaClient();

// CREATE Casting Entry

// export const createCastingEntry = async (req, res) => {
//   try {
//     const {
//       date,
//       given_gold,
//       casting_customer_id,
//       touch_id,
//       final_touch,
//       final_weight,
//       pure_value,
//       purity,
//       copper,
//     } = req.body;

//     // Validation
//     if (
//       !date ||
//       isNaN(given_gold) ||
//       isNaN(final_touch) ||
//       isNaN(final_weight) ||
//       isNaN(pure_value) ||
//       isNaN(purity) ||
//       isNaN(copper) ||
//       !casting_customer_id ||
//       !touch_id
//     ) {
//       return res.status(400).json({ error: "Invalid input values" });
//     }

//     // Create casting entry
//     const newEntry = await prisma.castingEntry.create({
//       data: {
//         date: new Date(date),
//         given_gold: parseFloat(given_gold),
//         final_touch: parseFloat(final_touch),
//         final_weight: parseFloat(final_weight),
//         pure_value: parseFloat(pure_value),
//         purity: parseFloat(purity),
//         copper: parseFloat(copper),
//         casting_customer_id: Number(casting_customer_id),
//         touch_id: Number(touch_id),
//       },
//     });

//     await reduceStockOnCastingCreate(newEntry);

//     res.status(201).json(newEntry); // flat response, includes id directly

//     // res.status(201).json({ message: "Casting entry created successfully", data: newEntry });
//   } catch (error) {
//     console.error("Error creating casting entry:", error);
//     res.status(500).json({ error: "Failed to create casting entry" });
//   }
// };

export const createCastingEntry = async (req, res) => {
  try {
    const {
      date,
      given_gold,
      casting_customer_id,
      touch_id,
      final_touch,
      final_weight,
      pure_value,
      purity,
      copper,

      //  Add these new ones
      opening_balance,
      total_sum_balance,
      total_item_weight,
      current_balance_weight,
      total_scrap_weight,
      total_wastage,
    } = req.body;

    // Validation
    if (
      !date ||
      isNaN(given_gold) ||
      isNaN(final_touch) ||
      isNaN(final_weight) ||
      isNaN(pure_value) ||
      isNaN(purity) ||
      isNaN(copper) ||
      !casting_customer_id ||
      !touch_id
    ) {
      return res.status(400).json({ error: "Invalid input values" });
    }

    //  Create casting entry
    const newEntry = await prisma.castingEntry.create({
      data: {
        date: new Date(date),
        given_gold: parseFloat(given_gold),
        final_touch: parseFloat(final_touch),
        final_weight: parseFloat(final_weight),
        pure_value: parseFloat(pure_value),
        purity: parseFloat(purity),
        copper: parseFloat(copper),
        casting_customer_id: Number(casting_customer_id),
        touch_id: Number(touch_id),
        opening_balance: parseFloat(opening_balance) || 0, 
        total_sum_balance: parseFloat(total_sum_balance) || 0,
      },
    });

    //  Step 2 — Create related CastiingTotalBalance record
    await prisma.castiingTotalBalance.create({
      data: {
        item_entry: newEntry.id, // link to casting entry
        total_item_weight: parseFloat(total_item_weight) || 0,
        current_balance_weight: parseFloat(current_balance_weight) || 0,
        total_scrap_weight: parseFloat(total_scrap_weight) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
      },
    });

    //  Step 3 — Update AddCasting.balance with total_wastage
    if (casting_customer_id && total_wastage != null && !isNaN(total_wastage)) {
      await prisma.addCasting.update({
        where: { id: Number(casting_customer_id) },
        data: { balance: parseFloat(total_wastage) || 0 },
      });
    }
    


// if (casting_customer_id && total_wastage != null) {
//   await prisma.addCasting.update({
//     where: { id: Number(casting_customer_id) },
//     data: { balance: parseFloat(total_wastage) || 0 },
//   });
// }

    //  Update the customer balance to reflect total wastage
    // if (casting_customer_id && total_wastage != null) {
    //   await prisma.addCasting.update({
    //     where: { id: Number(casting_customer_id) },
    //     data: { balance: parseFloat(total_wastage) || 0 },
    //   });
    // }

    //  Optional: reduce stock after creating both
    await reduceStockOnCastingCreate(newEntry);

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating casting entry:", error);
    res.status(500).json({ error: "Failed to create casting entry" });
  }
};


// Post - http://localhost:5000/api/castingentry

// GET ALL Casting Entries

export const getAllCastingEntry = async (req, res) => {
  try {
    const entries = await prisma.castingEntry.findMany({
      include: {
        items: {
          include: {
            item: true,
            touch: true,
          },
        },
        casting_customer: true,
        touch: true,
        CastiingTotalBalance: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedEntries = entries.map((entry) => {
      const productItems = entry.items.filter((i) => i.type === "Items");
      const scrapItems = entry.items.filter((i) => i.type === "ScrapItems");

      const totalItemWeight = productItems.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );
      const totalScrapWeight = scrapItems.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );

      return {
        id: entry.id,
        date: entry.date,
        createdAt: entry.createdAt,
        given_gold: entry.given_gold,
        final_touch: entry.final_touch,
        final_weight: entry.final_weight,
        pure_value: entry.pure_value,
        purity: entry.purity,
        copper: entry.copper,
        customer: entry.casting_customer,
        touch: entry.touch,
        casting_customer_id: entry.casting_customer_id,
        touch_id: entry.touch_id,
        productQty: productItems.length,
        scrapQty: scrapItems.length,
        productItems: productItems.map((i) => i.item.name),
        scrapItems: scrapItems.map((i) => i.item.name),
        totalItemWeight: totalItemWeight,
        totalScrapWeight: totalScrapWeight,
        currentBalanceWeight:
          entry.CastiingTotalBalance[0]?.current_balance_weight || 0,
        totalWastage: entry.CastiingTotalBalance[0]?.total_wastage || 0,
      };
    });

    res.status(200).json(formattedEntries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

// READ Casting Entry by ID

export const getCastingEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await prisma.castingEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            item: true,
            touch: true,
          },
        },
        casting_customer: true,
        touch: true,
        CastiingTotalBalance: true,
      },
    });

    if (!entry) {
      return res.status(404).json({ error: "Casting entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching entry:", error);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
};

// UPDATE Casting Entry

export const updateCastingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      given_gold,
      touch_id,
      purity,
      final_touch,
      pure_value,
      copper,
      final_weight,
      casting_customer_id,
      items,
      scrapItems,
    } = req.body;

    // Step 1: Update the main casting entry
    const updatedEntry = await prisma.castingEntry.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(date),
        given_gold: parseFloat(given_gold),
        touch_id: parseFloat(touch_id),
        purity: parseFloat(purity),
        final_touch: parseFloat(final_touch),
        pure_value: parseFloat(pure_value),
        copper: parseFloat(copper),
        final_weight: parseFloat(final_weight),
        casting_customer_id: parseInt(casting_customer_id),
      },
    });

    console.log(" Updated casting entry:", updatedEntry);

    // Step 2: Delete previous castingItems
    await prisma.castingItems.deleteMany({
      where: { casting_entry_id: parseInt(id) },
    });

    console.log(" Deleted previous casting items");

    // Step 3: Format and re-insert all items
    const formattedItems = [
      ...(items || []).map((item) => ({
        ...item,
        casting_entry_id: parseInt(id),
        casting_customer_id: parseInt(casting_customer_id),
        createdAt: new Date(),
      })),
      ...(scrapItems || []).map((item) => ({
        ...item,
        casting_entry_id: parseInt(id),
        casting_customer_id: parseInt(casting_customer_id),
        createdAt: new Date(),
      })),
    ];

    if (formattedItems.length > 0) {
      await prisma.castingItems.createMany({ data: formattedItems });
      console.log(" Re-created casting items:", formattedItems.length);
    } else {
      console.log(" No casting items provided to re-create");
    }

    res.status(200).json({
      message: "Casting entry and items updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ error: "Failed to update casting entry" });
  }
};

export const deleteCastingEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Get all casting items related to this casting entry
    const relatedCastingItems = await prisma.castingItems.findMany({
      where: { casting_entry_id: parseInt(id) },
    });

    // Loop through each casting item and delete dependent records
    for (const item of relatedCastingItems) {
      const castingItemId = item.id;

      // Delete FilingEntries
      await prisma.filingEntry.deleteMany({
        where: { casting_item_id: castingItemId },
      });

      // Delete SettingEntries
      await prisma.settingEntry.deleteMany({
        where: { casting_item_id: castingItemId },
      });

      // Delete BuffingEntries
      await prisma.buffingEntry.deleteMany({
        where: { casting_item_id: castingItemId },
      });

      // Delete Stock linked to this casting item
      await prisma.stock.deleteMany({
        where: { casting_item_id: castingItemId },
      });
    }

    // Now delete all casting items for this casting entry
    await prisma.castingItems.deleteMany({
      where: { casting_entry_id: parseInt(id) },
    });

    const entryToDelete = await prisma.castingEntry.findUnique({
      where: { id: parseInt(id) },
    });

    // Call add stock function
    if (entryToDelete) {
      await addStockOnCastingDelete(entryToDelete);
    }

    // Finally, delete the casting entry itself
    await prisma.castingEntry.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      message: "Casting entry and all related items deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ error: "Failed to delete casting entry" });
  }
};
