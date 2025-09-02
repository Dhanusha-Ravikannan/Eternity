import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

// CREATE - Single BuffingEntry for multiple setting/filing items

export const createBuffingEntry = async (req, res) => {
  try {
    const { buffing_person_id, lot_number, items } = req.body;

    // Extract setting/filing item IDs
    const settingItemIds =
      items?.map((i) => i.setting_item_id).filter(Boolean) || [];
    const filingItemIds =
      items?.map((i) => i.filing_item_id).filter(Boolean) || [];

    if (
      !buffing_person_id ||
      !lot_number ||
      (settingItemIds.length === 0 && filingItemIds.length === 0)
    ) {
      return res.status(400).json({
        error:
          "buffing_person_id, lot_number, and at least one setting_item_id or filing_item_id are required",
      });
    }

    // Find lot by lot_number
    const lot = await prisma.lotInfo.findFirst({
      where: {
        lotNumber: parseInt(lot_number),
        IsActive: true,
        buffing_customer_id: buffing_person_id,
      },
    });
    if (!lot) {
      return res.status(404).json({
        error: "Lot not found with the given lot_number or Not Active",
      });
    }

    // Get castingItemId from first filing or setting item
    let castingItemId = null;

    if (filingItemIds.length > 0) {
      const firstFilingItem = await prisma.filingItems.findUnique({
        where: { id: filingItemIds[0] },
        select: {
          filing_entry: {
            select: { casting_item_id: true },
          },
        },
      });
      if (!firstFilingItem) {
        return res.status(400).json({ error: "First filing item not found" });
      }
      castingItemId = firstFilingItem.filing_entry.casting_item_id;
    } else if (settingItemIds.length > 0) {
      const firstSettingItem = await prisma.settingItems.findUnique({
        where: { id: settingItemIds[0] },
        select: {
          settingEntryId: {
            select: { casting_item_id: true },
          },
        },
      });
      if (!firstSettingItem) {
        return res.status(400).json({ error: "First setting item not found" });
      }
      castingItemId = firstSettingItem.settingEntryId.casting_item_id;
    }

    // Create BuffingEntry
    const buffingEntry = await prisma.buffingEntry.create({
      data: {
        buffing_person: { connect: { id: buffing_person_id } },
        castingItem: { connect: { id: castingItemId } },
      },
      include: {
        buffing_person: true,
        filing_items: true,
        setting_items: true,
      },
    });

    // Map all selected filing + setting items in LotBuffingMapper
    await Promise.all([
      ...filingItemIds.map((filingItemId) =>
        prisma.lotBuffingMapper.create({
          data: {
            buffing_id: buffing_person_id,
            lot_id: lot.id,
            filing_item_id: filingItemId,
            buffing_entry_id: buffingEntry.id,
          },
        })
      ),
      ...settingItemIds.map((settingItemId) =>
        prisma.lotBuffingMapper.create({
          data: {
            buffing_id: buffing_person_id,
            lot_id: lot.id,
            setting_item_id: settingItemId,
            buffing_entry_id: buffingEntry.id,
          },
        })
      ),
    ]);

    // Fetch full item details
    const fullFilingItems = await prisma.filingItems.findMany({
      where: { id: { in: filingItemIds } },
      include: { filingitem: true, touch: true },
    });

    const fullSettingItems = await prisma.settingItems.findMany({
      where: { id: { in: settingItemIds } },
      include: { item: true, touch: true },
    });

    return res.status(201).json({
      message: "Single BuffingEntry created for multiple items successfully",
      entry: {
        ...buffingEntry,
        filing_items: fullFilingItems,
        setting_items: fullSettingItems,
      },
    });
  } catch (error) {
    console.error("Error creating single buffing entry:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || error,
    });
  }
};

// GET - Buffing Entries by Person ID

/* export const getBuffingEntriesByPersonId = async (req, res) => {
  try {
    const buffing_person_id = parseInt(req.params.buffing_person_id);
    const lotNumber = parseInt(req.params.lotNumber);

    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: lotNumber,
      },
    });

    if (!buffing_person_id) {
      return res.status(400).json({ error: "buffing_person_id is required" });
    }
    const entries = await prisma.buffingEntry.findMany({
      where: {
        buffing_person_id,
        LotBuffingMapper: {
          some: {
            lotId: {
              id: parseInt(LotId.id),
            },
          },
        },
      },
      include: {
        buffing_person: true,
        castingItem: {
          include: {
            item: true,
            touch: true,
          },
        },
        filing_items: {
          include: {
            filingitem: true,
            touch: true,
            filing_entry: { include: { filing_person: true } },
          },
        },
        setting_items: {
          include: {
            item: true,
            touch: true,
            settingEntryId: {
              include: {
                setting_person: true,
              },
            },
          },
        },
        LotBuffingMapper: {
          include: {
            lotId: true,
            filingItemId: {
              include: {
                filingitem: true,
                touch: true,
                filing_entry: {
                  include: { filing_person: true },
                },
              },
            },
            settingItemId: {
              include: {
                item: true,
                touch: true,
                settingEntryId: {
                  include: { setting_person: true },
                },
              },
            },
            buffingEntry: true,
          },
        },
        BuffingTotalBalance: true,
        BuffingItems:{
          include:{
            item: true,
            touch:true,
            stock:true,
          }
          
        }
      },
      orderBy: { id: "asc" },
    });

    // if (!entries || entries.length === 0) {
    //   return res .status(404)   .json({ message: "No buffing entries found for this person" });
    // }

    if (!entries || entries.length === 0) {
      return res.status(200).json([]);
    }

    const result = entries.map((entry) => {
      const totalBalance = entry.BuffingTotalBalance?.[0] || {};
      const buffingWastageEntry = entry.BuffingWastage?.[0] || {};

      return {
        id: entry.id,
        createdAt: entry.createdAt,
        buffing_person_id: entry.buffing_person_id,
        buffing_person_name: entry.buffing_person?.name || "",

        casting_item_id: entry.casting_item_id,
        casting_item_weight: entry.castingItem?.weight || 0,
        casting_item_type: entry.castingItem?.type || "",
        casting_item_purity: entry.castingItem?.item_purity || 0,
        casting_item_remarks: entry.castingItem?.remarks || "",
        item_name: entry.castingItem?.item?.name || "",
        touch: entry.castingItem?.touch?.touch || "",

        // Filing + Setting items combined
        items: [
          ...entry.filing_items.map((f) => ({
            id: f.id,
            type: f.type,
            item_name: f.filingitem?.name || "",
            weight: f.weight || 0,
            purity: f.item_purity || 0,
            touch: f.touch?.touch || "",
            remarks: f.remarks || "",
            stone_option: f.stone_option || "",
            filing_entry_id: f.filing_entry_id,
            filing_person_name: f.filing_entry?.filing_person?.name || "",
          })),
          ...entry.setting_items.map((s) => ({
            id: s.id,
            type: s.type,
            item_name: s.item?.name || "",
            weight: s.scrap_weight || 0,
            purity: s.item_purity || 0,
            touch: s.touch?.touch || "",
            remarks: s.scrap_remarks || "",
            setting_entry_id: s.setting_entry_id,
            setting_person_name: s.settingEntryId?.setting_person?.name || "",
          })),
        ],

        // Lot Mapper
        lotBuffingMapper: entry.LotBuffingMapper.map((mapper) => ({
            lot_id: mapper.lot_id,
            lot_number: mapper.lotId?.lotNumber || "",
            filing_item_id: mapper.filing_item_id,
            setting_item_id: mapper.setting_item_id,
            filing_item_name: mapper.filingItemId?.filingitem?.name || "",
            filing_item_weight: mapper.filingItemId?.weight || null,
            filing_item_touch: mapper.filingItemId?.touch?.touch || "",
            filing_item_purity: mapper.filingItemId?.item_purity || null,
            filing_item_remarks: mapper.filingItemId?.remarks || "",
            setting_item_name: mapper.settingItemId?.item?.name || "",
            buffing_entry_id: mapper.buffing_entry_id,
          })),

          buffingItems: entry.BuffingItems.map((b) => ({
            id: b.id,
            createdAt: b.createdAt,
            item_name: b.item?.name || "",
            scrap_weight: b.scrap_weight || 0,
            touch: b.touch?.touch || "",
            item_purity: b.item_purity || 0,
            scrap_remarks: b.scrap_remarks || "",
          })),
          

        // Flattened Total Balance
        receiptWeight: totalBalance.receipt_weight ?? null,
        remarks: totalBalance.remarks ?? "",
        wastage: totalBalance.wastage ? "Yes" : "No",
        totalScrapWeight: totalBalance.total_scrap_weight ?? null,
        balance: totalBalance.balance ?? null,

        // Wastage
        wastageSummary: {
          total_receipt: buffingWastageEntry.total_receipt ?? null,
          total_wastage: buffingWastageEntry.total_wastage ?? null,
          balance: buffingWastageEntry.balance ?? null,
          wastage_percentage: buffingWastageEntry.wastage_percentage ?? null,
          overall_wastage: buffingWastageEntry.overall_wastage ?? null,
        },
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getBuffingEntriesByPersonId:", error);
    res.status(500).json({ error: error.message });
  }
}; */

export const getBuffingEntriesByPersonId = async (req, res) => {
  try {
    const buffing_person_id = parseInt(req.params.buffing_person_id);
    if (!buffing_person_id) {
      return res.status(400).json({ error: "buffing_person_id is required" });
    }

    const lotNumber = parseInt(req.params.lotNumber);

    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: lotNumber,
        buffing_customer_id: buffing_person_id,
      },
    });

    console.log("LotId:", LotId);

    const entries = await prisma.buffingEntry.findMany({
      where: {
        buffing_person_id,
        LotBuffingMapper: {
          some: {
            lotId: {
              id: parseInt(LotId.id),
            },
          },
        },
      },
      include: {
        buffing_person: true,
        castingItem: {
          include: {
            item: true,
            touch: true,
          },
        },
        filing_items: {
          include: {
            filingitem: true,
            touch: true,
            filing_entry: { include: { filing_person: true } },
          },
        },
        setting_items: {
          include: {
            item: true,
            touch: true,
            settingEntryId: {
              include: {
                setting_person: true,
              },
            },
          },
        },
        LotBuffingMapper: {
          include: {
            lotId: true,
            filingItemId: {
              include: {
                filingitem: true,
                touch: true,
                filing_entry: {
                  include: { filing_person: true },
                },
              },
            },
            settingItemId: {
              include: {
                item: true,
                touch: true,
                settingEntryId: {
                  include: { setting_person: true },
                },
              },
            },
            buffingEntry: true,
          },
        },
        BuffingTotalBalance: true,
        BuffingItems: {
          include: {
            item: true,
            touch: true,
            stock: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    // if (!entries || entries.length === 0) {
    //   return res .status(404)   .json({ message: "No buffing entries found for this person" });
    // }

    if (!entries || entries.length === 0) {
      return res.status(200).json([]);
    }

    const result = entries.map((entry) => {
      const totalBalance = entry.BuffingTotalBalance?.[0] || {};
      const buffingWastageEntry = entry.BuffingWastage?.[0] || {};

      return {
        id: entry.id,
        createdAt: entry.createdAt,
        buffing_person_id: entry.buffing_person_id,
        buffing_person_name: entry.buffing_person?.name || "",

        casting_item_id: entry.casting_item_id,
        casting_item_weight: entry.castingItem?.weight || 0,
        casting_item_type: entry.castingItem?.type || "",
        casting_item_purity: entry.castingItem?.item_purity || 0,
        casting_item_remarks: entry.castingItem?.remarks || "",
        item_name: entry.castingItem?.item?.name || "",
        touch: entry.castingItem?.touch?.touch || "",

        // Filing + Setting items combined
        items: [
          ...entry.filing_items.map((f) => ({
            id: f.id,
            type: f.type,
            item_name: f.filingitem?.name || "",
            weight: f.weight || 0,
            purity: f.item_purity || 0,
            touch: f.touch?.touch || "",
            remarks: f.remarks || "",
            stone_option: f.stone_option || "",
            filing_entry_id: f.filing_entry_id,
            filing_person_name: f.filing_entry?.filing_person?.name || "",
          })),
          ...entry.setting_items.map((s) => ({
            id: s.id,
            type: s.type,
            item_name: s.item?.name || "",
            weight: s.scrap_weight || 0,
            purity: s.item_purity || 0,
            touch: s.touch?.touch || "",
            remarks: s.scrap_remarks || "",
            setting_entry_id: s.setting_entry_id,
            setting_person_name: s.settingEntryId?.setting_person?.name || "",
          })),
        ],

        // Lot Mapper
        lotBuffingMapper: entry.LotBuffingMapper.map((mapper) => ({
          lot_id: mapper.lot_id,
          lot_number: mapper.lotId?.lotNumber || "",
          isactive: mapper.lotId.IsActive,
          filing_item_id: mapper.filing_item_id,
          setting_item_id: mapper.setting_item_id,
          filing_item_name: mapper.filingItemId?.filingitem?.name || "",
          filing_item_weight: mapper.filingItemId?.weight || null,
          filing_item_touch: mapper.filingItemId?.touch?.touch || "",
          filing_item_purity: mapper.filingItemId?.item_purity || null,
          filing_item_remarks: mapper.filingItemId?.remarks || "",
          setting_item_name: mapper.settingItemId?.item?.name || "",
          buffing_entry_id: mapper.buffing_entry_id,
        })),

        buffingItems: entry.BuffingItems.map((b) => ({
          id: b.id,
          createdAt: b.createdAt,
          item_name: b.item?.name || "",
          scrap_weight: b.scrap_weight || 0,
          touch: b.touch?.touch || "",
          item_purity: b.item_purity || 0,
          scrap_remarks: b.scrap_remarks || "",
        })),

        // Flattened Total Balance
        receiptWeight: totalBalance.receipt_weight ?? null,
        remarks: totalBalance.remarks ?? "",
        wastage: totalBalance.wastage ? "Yes" : "No",
        totalScrapWeight: totalBalance.total_scrap_weight ?? null,
        balance: totalBalance.balance ?? null,

        // Wastage
        wastageSummary: {
          total_receipt: buffingWastageEntry.total_receipt ?? null,
          total_wastage: buffingWastageEntry.total_wastage ?? null,
          balance: buffingWastageEntry.balance ?? null,
          wastage_percentage: buffingWastageEntry.wastage_percentage ?? null,
          overall_wastage: buffingWastageEntry.overall_wastage ?? null,
        },
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getBuffingEntriesByPersonId:", error);
    res.status(500).json({ error: error.message });
  }
};
