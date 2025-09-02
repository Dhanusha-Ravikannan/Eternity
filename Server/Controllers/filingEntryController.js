import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

//  POST - http://localhost:5000/api/filingentry

export const createFilingEntry = async (req, res) => {
  try {
    const { filing_person_id, lot_number, itemIds } = req.body;

    if (
      !filing_person_id || !lot_number || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        error:
          "filing_person_id, lot_number, and at least one casting_item_id are required",
      });
    }

    const lot = await prisma.lotInfo.findFirst({
      where: { lotNumber: parseInt(lot_number), IsActive: true , filing_customer_id:filing_person_id},
    });

    if (!lot) {   
      return res
        .status(404)
        .json({ error: "Lot not found with the given lot_number or Given Lot is Not Active" });
    }

    //  Create a single FilingEntry
    const filingEntry = await prisma.filingEntry.create({
      data: {
        filing_person: { connect: { id: filing_person_id } },
        castingItem: { connect: { id: itemIds[0] } }, // just a placeholder
      },
      include: {
        filing_person: true,
        filingItems: true,
      },
    });

    //  Map each item to this FilingEntry
    await Promise.all(
      itemIds.map((itemId) =>
        prisma.lotFilingMapper.create({
          data: {
            filing_id: filing_person_id,
            lot_id: lot.id,
            item_id: itemId,
            filing_entry_id: filingEntry.id,
          },
        })
      )
    );

    //  Now fetch full item details for each item in the mapping
    const fullItems = await prisma.castingItems.findMany({
      where: {
        id: { in: itemIds },
      },
      include: {
        item: true,
        touch: true,
      },
    });

    //  Respond with FilingEntry + all associated items
    return res.status(201).json({
      message: "Single FilingEntry created for multiple items successfully",
      entry: {
        ...filingEntry,
        castingItems: fullItems,
      },
    });
  } catch (error) {
    console.error(
      "Error creating single filing entry for multiple items:",
      error
    );
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || error,
    });
  }
};

export const getAllFilingEntries = async (req, res) => {
  try {
    const entries = await prisma.filingEntry.findMany({
      include: {
        castingItem: {
          include: {
            item: true,
          },
        },
        filing_person: true,
        filingItems: true,
        LotFilingMapper: {
          include: {
            lotId: true,
            itemId: {
              include: {
                item: true,
              },
            },
            filingId: true,
          },
        },
      },
    });

    const flatEntries = entries.map((entry) => {
      const castingItem = entry.castingItem || {};

      return {
        id: entry.id,
        createdAt: entry.createdAt,
        filing_person_id: entry.filing_person_id,
        casting_item_id: entry.casting_item_id,

        // Flattened related data
        filing_person_name: entry.filing_person?.name || "",
        casting_item_weight: castingItem.weight || 0,
        casting_item_type: castingItem.type || "",
        casting_item_purity: castingItem.item_purity || 0,
        casting_item_remarks: castingItem.remarks || "",
        item_name: castingItem.item?.name || "",

        filingItems: entry.filingItems,

        // Expanded LotFilingMapper array with full castingItem info included
        lotFilingMapper: entry.LotFilingMapper.map((mapper) => ({
          lot_id: mapper.lot_id,
          lot_name: mapper.lotId?.lot_no || "",
          item_id: mapper.item_id,
          item_name: mapper.itemId?.item?.name || "",
          filing_id: mapper.filing_id,
          filing_person_name: mapper.filingId?.name || "",
          filing_entry_id: mapper.filing_entry_id,

          // Casting item details
          casting_item_id: entry.casting_item_id,
          casting_item_weight: castingItem.weight || 0,
          casting_item_type: castingItem.type || "",
          casting_item_purity: castingItem.item_purity || 0,
          casting_item_remarks: castingItem.remarks || "",
          casting_item_name: castingItem.item?.name || "",
        })),
      };
    });

    res.status(200).json(flatEntries);
  } catch (error) {
    console.error("Error fetching filing entries:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getFilingEntryById = async (req, res) => {
  const { id } = req.params;

  try {
    const filingEntryId = parseInt(id);

    const lotMappers = await prisma.lotFilingMapper.findMany({
      where: {
        filing_entry_id: filingEntryId,
      },
      include: {
        lotId: true,
        itemId: {
          include: {
            item: true,
            touch: true,
          },
        },
        filingId: true,
      },
    });

    const parentFilingEntry = await prisma.filingEntry.findUnique({
      where: {
        id: filingEntryId,
      },
      include: {
        filing_person: true,
        filingItems: true,
      },
    });

    if (!parentFilingEntry) {
      return res.status(404).json({ error: "Filing entry not found" });
    }

    const grouped = {
      [id]: [
        {
          id: parentFilingEntry.id,
          lotFilingMapper: lotMappers.map((lm) => {
            const casting = lm.itemId || {}; // Already joined CastingItems via itemId

            return {
              id: lm.id,
              lot_id: lm.lot_id,
              lot_name: lm.lotId?.lot_no || "",
              item_id: lm.item_id,
              item_name: casting.item?.name || "",
              filing_id: lm.filing_id,
              filing_person_name: lm.filingId?.name || "",
              filing_entry_id: lm.filing_entry_id,

              // Casting item details from itemId (CastingItems)
              casting_item_id: casting.id || null,
              casting_item_item_id: casting.item_id || null,
              casting_item_item_name: casting.item?.name || "",
              casting_item_weight: casting.weight || 0,
              casting_item_type: casting.type || "",
              casting_item_remarks: casting.remarks || "",
              casting_item_touch_id: casting.touch?.id || null,
              casting_item_touch_name: casting.touch?.touch || "",
              casting_item_purity: casting.item_purity || 0,
            };
          }),
        },
      ],
    };

    res.status(200).json(grouped);
  } catch (error) {
    console.error("Error in getFilingEntryById:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getFilingEntryByFilingId = async (req, res) => {
  try {
    const { filing_id } = req.params;
    console.log("Received filing_id:", filing_id);

    if (!filing_id) {
      return res.status(400).json({ error: "filing_id is required in params" });
    }

    const entries = await prisma.filingEntry.findMany({
      where: {
        LotFilingMapper: {
          some: {
            filing_id: parseInt(filing_id),
          },
        },
      },
      include: {
        castingItem: {
          include: {
            item: true,
          },
        },
        filing_person: true,
        filingItems: true,
        LotFilingMapper: {
          where: {
            filing_id: parseInt(filing_id),
          },
          include: {
            lotId: true,
            itemId: {
              include: {
                item: true,
              },
            },
            filingId: true,
          },
        },
      },
    });

    const groupedEntries = entries.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      filing_person_id: entry.filing_person_id,
      casting_item_id: entry.casting_item_id,
      filing_person_name: entry.filing_person?.name || "",
      casting_item_weight: entry.castingItem?.weight || 0,
      casting_item_type: entry.castingItem?.type || "",
      casting_item_purity: entry.castingItem?.item_purity || 0,
      casting_item_remarks: entry.castingItem?.remarks || "",
      item_name: entry.castingItem?.item?.name || "",
      filingItems: entry.filingItems,
      lotFilingMapper: entry.LotFilingMapper.map((mapper) => ({
        lot_id: mapper.lot_id,
        lot_name: mapper.lotId?.lot_no || "",
        item_id: mapper.item_id,
        item_name: mapper.itemId?.item?.name || "",
        filing_id: mapper.filing_id,
        filing_person_name: mapper.filingId?.name || "",
      })),
    }));

    res.status(200).json(groupedEntries);
  } catch (error) {
    console.error("Error fetching entries by filing_id:", error);
    res.status(500).json({ error: error.message });
  }
};
  
export const getFilingEntriesByPersonId = async (req, res) => {
  try {
    const filing_person_id = parseInt(req.params.filing_person_id);
    const lotNumber = parseInt(req.params.lotNumber);

    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: lotNumber,
      },
    });

    const entries = await prisma.filingEntry.findMany({
      where: {
        filing_person_id: filing_person_id,
        LotFilingMapper: {
          some: {
            lotId: {
              id: parseInt(LotId.id),
            },
          },
        },
      },
      include: {
        filing_person: true,
        filingTotalBalance: true,
        castingItem: {
          include: {
            item: true,
            touch: true,
          },
        },
        filingItems: true,
        LotFilingMapper: {
          include: {
            itemId: {
              include: {
                item: true,
                touch: true,
              },
            },
            lotId: true,
            filingId: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!entries || entries.length === 0) {
      return res
        .status(404)
        .json({ message: "No entries found for this person" });
    }

    // Flatten and enrich the data for frontend usage
    const result = entries.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      filing_person_id: entry.filing_person_id,
      filing_person_name: entry.filing_person?.name || "",
      casting_item_id: entry.casting_item_id,
      casting_item_weight: entry.castingItem?.weight || 0,
      casting_item_type: entry.castingItem?.type || "",
      casting_item_purity: entry.castingItem?.item_purity || 0,
      casting_item_remarks: entry.castingItem?.remarks || "",
      item_name: entry.castingItem?.item?.name || "",
      filingItems: entry.filingItems || [],

      castingItems: entry.LotFilingMapper.map((mapper) => ({
        id: mapper.item_id,
        item_name: mapper.itemId?.item?.name || "",
        weight: mapper.itemId?.weight || 0,
        type: mapper.itemId?.type || "",
        purity: mapper.itemId?.item_purity || 0,
        remarks: mapper.itemId?.remarks || "",
        touch: mapper.itemId?.touch?.touch || "",
      })),

      lotFilingMapper: entry.LotFilingMapper.map((mapper) => ({
        lot_id: mapper.lot_id,
        lot_name: mapper.lotId?.lot_no || "",
        isactive:mapper.lotId.IsActive,
        item_id: mapper.item_id,
        item_name: mapper.itemId?.item?.name || "",
        filing_id: mapper.filing_id,
        filing_person_name: mapper.filingId?.name || "",
        filing_entry_id: mapper.filing_entry_id,
      })),

      filingTotalBalance: entry.filingTotalBalance.map((balance) => ({
        after_weight: balance.after_weight ?? null,
        total_product_weight: balance.total_product_weight ?? null,
        current_balance_weight: balance.current_balance_weight ?? null,
        total_scrap_weight: balance.total_scrap_weight ?? null,
        wastage: balance.wastage ?? null,
        balance: balance.balance ?? null,
      })),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getFilingEntriesByPersonId:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFilingEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { filing_person_id, casting_item_id } = req.body;

    const updatedEntry = await prisma.filingEntry.update({
      where: { id },
      data: {
        filing_person_id,
        casting_item_id,
      },
    });

    res
      .status(200)
      .json({ message: "Filing Entry updated", entry: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFilingEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.filingEntry.delete({
      where: { id },
    });

    res.status(200).json({ message: "Filing Entry deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
