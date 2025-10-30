import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


export const createSettingEntry = async (req, res) => {
  try {
    const { setting_person_id, lot_number, items } = req.body;

    // Convert items array into plain array of filing item IDs
    const filingItemIds = items?.map((i) => i.filing_item_id) || [];


    // Validate
    if (
      !setting_person_id ||
      !lot_number ||
      !Array.isArray(filingItemIds) ||
      filingItemIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "setting_person_id, lot_number, and at least one filing_item_id are required",
      });
    }

    // Find lot by lot_number
    // const lot = await prisma.lotInfo.findFirst({
    //   where: { lotNumber: parseInt(lot_number) },
    // });

    // if (!lot) {
    //   return res
    //     .status(404)
    //     .json({ error: "Lot not found with the given lot_number" });
    // }
    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: parseInt(lot_number),
        setting_customer_id: parseInt(setting_person_id),
      },
    });
 
 
    if (!LotId) {
      return res
        .status(404)
        .json({ error: "Lot not found with the given lot_number" });
    }

      // ✅ Block creation if the lot is closed or inactive
      if (LotId.IsActive === false || LotId.status === "Closed") {
        return res.status(400).json({
          error: "This jobcard/lot is closed. You cannot assign new items.",
        });
      }
 

    // Get the first filing item's casting_item_id from its filing_entry relation
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

    const castingItemId = firstFilingItem.filing_entry.casting_item_id;

    // Always create a new SettingEntry
    const settingEntry = await prisma.settingEntry.create({
      data: {
        setting_person: { connect: { id: setting_person_id } },
        castingItem: { connect: { id: castingItemId } },
      },
      include: {
        setting_person: true,
        filingItems: true,
      },
    });

    //  Now create LotSettingMapper for all filing items
    await Promise.all(
      filingItemIds.map((filingItemId) =>
        prisma.lotSettingMapper.create({
          data: {
            setting_id: setting_person_id,
            lot_id: LotId.id,
            filing_item_id: filingItemId,
            setting_entry_id: settingEntry.id,
          },
        })
      )
    );

    // Fetch full filing items with details
    const fullItems = await prisma.filingItems.findMany({
      where: { id: { in: filingItemIds } },
      include: { filingitem: true, touch: true },
    });

    return res.status(201).json({

      message:
        "Single SettingEntry created for multiple filing items successfully",
      entry: {
        ...settingEntry,
        filingItems: fullItems,
      },
    });
  } catch (error) {
    console.error(
      "Error creating single setting entry for multiple items:",
      error
    );
    return res.status(500).json({
      error: "Internal server error",
      details: error?.message || error,
    });
  }
};

// GET /api/settingentry/byId/:id
export const getSettingEntryById = async (req, res) => {
  try {
    const settingEntryId = parseInt(req.params.id);
    if (!settingEntryId) {
      return res.status(400).json({ error: "settingEntryId is required" });
    }

    // Fetch the setting entry
    const entry = await prisma.settingEntry.findUnique({
      where: { id: settingEntryId },
      include: {
        setting_person: true,
        castingItem: { include: { item: true, touch: true } },
        filingItems: {
          include: {
            filing_entry: { include: { filing_person: true } },
            touch: true,
            stock: true,
            filingitem: true,
          },
        },
        LotSettingMapper: {
          include: {
            lotId: true,
            itemId: {
              include: {
                filingitem: true,
                touch: true,
                filing_entry: { include: { filing_person: true } },
              },
            },
            settingEntry: true,
          },
        },
        settingTotalBalance: true,
        SettingItems: { include: { item: true, touch: true } },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: "Setting entry not found" });
    }

    // Flatten filing items
    const filingItems = [
      ...entry.filingItems.map((f) => ({
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
      ...entry.LotSettingMapper.map((mapper) => ({
        id: mapper.itemId?.id,
        type: mapper.itemId?.type,
        item_name: mapper.itemId?.filingitem?.name || "",
        weight: mapper.itemId?.weight || 0,
        purity: mapper.itemId?.item_purity || 0,
        touch: mapper.itemId?.touch?.touch || "",
        remarks: mapper.itemId?.remarks || "",
        stone_option: mapper.itemId?.stone_option || "",
        filing_entry_id: mapper.itemId?.filing_entry_id || null,
        filing_person_name:
          mapper.itemId?.filing_entry?.filing_person?.name || "",
      })),
    ];

    const totalBalance = entry.settingTotalBalance?.[0] || {};

    const result = {
      id: entry.id,
      createdAt: entry.createdAt,
      setting_person_id: entry.setting_person_id,
      setting_person_name: entry.setting_person?.name || "",

      casting_item_id: entry.casting_item_id,
      casting_item_weight: entry.castingItem?.weight || 0,
      casting_item_type: entry.castingItem?.type || "",
      casting_item_purity: entry.castingItem?.item_purity || 0,
      casting_item_remarks: entry.castingItem?.remarks || "",
      item_name: entry.castingItem?.item?.name || "",
      touch: entry.castingItem?.touch?.touch || "",

      filingItems,

      // Lot mapper
      lotSettingMapper: entry.LotSettingMapper.map((mapper) => ({
        lot_id: mapper.lot_id,
        lot_number: mapper.lotId?.lotNumber || "",
        isactive: mapper.lotId.IsActive,
        filing_item_id: mapper.filing_item_id,
        filing_item_name: mapper.itemId?.filingitem?.name || "",
        filing_entry_id: mapper.itemId?.filing_entry_id || null,
        filing_person_name:
          mapper.itemId?.filing_entry?.filing_person?.name || "",
        setting_entry_id: mapper.setting_entry_id,
      })),

      // Total balance
      receiptWeight: totalBalance.receipt_weight ?? null,
      stoneCount: totalBalance.stone_count ?? null,
      stoneWeight: totalBalance.stone_weight ?? null,
      remarks: totalBalance.remarks ?? "",
      wastage: totalBalance.wastage ? "Yes" : "No",
      totalProductWeight: totalBalance.total_product_weight ?? null,
      currentBalanceWeight: totalBalance.current_balance_weight ?? null,
      totalScrapWeight: totalBalance.total_scrap_weight ?? null,
      balance: totalBalance.balance ?? null,
      openBalance: totalBalance.open_balance ?? null,
      totalSumBalance: totalBalance.total_sum_balance ?? null,

      scrapItems:
        entry.SettingItems?.map((si) => ({
          id: si.id,
          type: si.type,
          itemName: si.item?.name || "",
          weight: si.scrap_weight || 0,
          purity: si.item_purity || 0,
          touch: si.touch?.touch || "",
          touch_id: si.touch?.id,
          item_id: si.item?.id,
          remarks: si.scrap_remarks || "",
        })) || [],
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSettingEntryById:", error);
    res.status(500).json({ error: error.message });
  }
};



// GET - http://localhost:5000/api/settingentry/person/:id

export const getSettingEntriesByPersonId = async (req, res) => {
  try {
    const setting_person_id = parseInt(req.params.setting_person_id);
    if (!setting_person_id) {
      return res.status(400).json({ error: "setting_person_id is required" });
    }
    const lotNumber = parseInt(req.params.lotNumber);
    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: lotNumber,
        setting_customer_id: setting_person_id,
      },
    });
    console.log('lot id', LotId)


    const entries = await prisma.settingEntry.findMany({
      where: {
        setting_person_id,
        LotSettingMapper: {
          some: {
            lotId: {
              id: parseInt(LotId.id),
            },
          },
        },
      },
      include: {
        setting_person: true,
        castingItem: {
          include: {
            item: true,
            touch: true,
          },
        },
        filingItems: {
          include: {
            filing_entry: {
              include: {
                filing_person: true,
              },
            },
            touch: true,
            stock: true,
            filingitem: true,
          },
        },
        LotSettingMapper: {
          include: {
            lotId: true,
            itemId: {
              include: {
                filingitem: true,
                touch: true,
                filing_entry: {
                  include: {
                    filing_person: true,
                  },
                },
              },
            },
            settingEntry: true,
          },
        },
        settingTotalBalance: true,
        SettingItems: {
          include: {
            item: true,
            touch: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
console.log('entries:', entries)
    if (!entries || entries.length === 0) {
      // return res.status(404) .json({ message: "No setting entries found for this person" });
      return res.status(200).json([]);
    }

    const result = entries.map((entry) => {
      const totalBalance = entry.settingTotalBalance?.[0] || {};
      const settingWastageEntry = entry.settingWastage?.[0] || {};

      return {
        id: entry.id,
        createdAt: entry.createdAt,
        setting_person_id: entry.setting_person_id,
        setting_person_name: entry.setting_person?.name || "",

        casting_item_id: entry.casting_item_id,
        casting_item_weight: entry.castingItem?.weight || 0,
        casting_item_type: entry.castingItem?.type || "",
        casting_item_purity: entry.castingItem?.item_purity || 0,
        casting_item_remarks: entry.castingItem?.remarks || "",
        item_name: entry.castingItem?.item?.name || "",
        touch: entry.castingItem?.touch?.touch || "",

        // Combined filing items (direct + lot)
        filingItems: [
          ...entry.filingItems.map((f) => ({
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

          ...entry.LotSettingMapper.map((mapper) => ({
            id: mapper.itemId?.id,
            type: mapper.itemId?.type,
            item_name: mapper.itemId?.filingitem?.name || "",
            weight: mapper.itemId?.weight || 0,
            purity: mapper.itemId?.item_purity || 0,
            touch: mapper.itemId?.touch?.touch || "",
            remarks: mapper.itemId?.remarks || "",
            stone_option: mapper.itemId?.stone_option || "",
            filing_entry_id: mapper.itemId?.filing_entry_id || null,
            filing_person_name:
              mapper.itemId?.filing_entry?.filing_person?.name || "",
          })),
        ],

        // Lot mapper
        lotSettingMapper: entry.LotSettingMapper.map((mapper) => ({
          lot_id: mapper.lot_id,
          lot_number: mapper.lotId?.lotNumber || "",
          isactive: mapper.lotId.IsActive,
          filing_item_id: mapper.filing_item_id,
          filing_item_name: mapper.itemId?.filingitem?.name || "",
          filing_entry_id: mapper.itemId?.filing_entry_id || null,
          filing_person_name:
            mapper.itemId?.filing_entry?.filing_person?.name || "",
          setting_entry_id: mapper.setting_entry_id,
        })),

        //  Flattened Total Balance
        receiptWeight: totalBalance.receipt_weight ?? null,
        stoneCount: totalBalance.stone_count ?? null,
        stoneWeight: totalBalance.stone_weight ?? null,
        remarks: totalBalance.remarks ?? "",
        wastage: totalBalance.wastage ? "Yes" : "No",
        totalProductWeight: totalBalance.total_product_weight ?? null,
        currentBalanceWeight: totalBalance.current_balance_weight ?? null,
        totalScrapWeight: totalBalance.total_scrap_weight ?? null,
        balance: totalBalance.balance ?? null,
        openBalance: totalBalance.open_balance ?? null,         // <-- added
        totalSumBalance: totalBalance.total_sum_balance ?? null,

        scrapItems:
          entry.SettingItems?.map((si) => ({
            id: si.id,
            type: si.type,
            itemName: si.item?.name || "",
            weight: si.scrap_weight || 0,
            purity: si.item_purity || 0,
            touch: si.touch?.touch || "",
            touch_id: si.touch?.id,
            item_id: si.item?.id,
            remarks: si.scrap_remarks || "",
          })) || [],
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSettingEntriesByPersonId:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getLotSettingMapperWithItems = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const lotSettingMapper = await prisma.lotSettingMapper.findMany({
      where: {
        setting_entry_id: parseInt(id),
      },
      include: {
        settingEntry: {
          include: {
            SettingItems: {
              include: {
                item: true,
                touch: true,
              },
            },
            settingTotalBalance: true,
          },
        },
        lotId: true,
        settingId: true,
        itemId: true,
      },
    });

    res.json(lotSettingMapper);
  } catch (error) {
    console.error("Error fetching LotSettingMapper with Setting Items:", error);
    res.status(500).json({ error: error.message });
  }
};



// GET - http://localhost:5000/api/settingentry/lotsettingmapper

export const getAllLotSettingMapperWithItems = async (req, res) => {
  try {
    const lotSettingMappers = await prisma.lotSettingMapper.findMany({
      include: {
        lotId: true,
        settingId: true,
        itemId: {
          include: {
            filingitem: true,
            touch: true,
            LotBuffingMapper: true,
          },
        },
        settingEntry: {
          include: {
            SettingItems: {
              include: {
                item: true,
                touch: true,
              },
            },
            settingTotalBalance: true,
          },
        },
      },
    });

    // Filter only entries with settingTotalBalance
    const filteredMappers = lotSettingMappers.filter(
      (mapper) =>
        mapper.settingEntry?.settingTotalBalance &&
        mapper.settingEntry.settingTotalBalance.length > 0
    );

    // Group by settingEntryId
    const grouped = Object.values(
      filteredMappers.reduce((acc, mapper) => {
        const entry = mapper.settingEntry;
        if (!entry || !mapper.itemId) return acc;

        const balance = entry.settingTotalBalance[0];
        const entryId = entry.id;

        if (!acc[entryId]) {
          acc[entryId] = {
            settingEntryId: entryId,
            lotNumber: mapper.lotId?.lotNumber || "-",
            settingName: mapper.settingId?.name || "-",
            stoneCount: balance?.stone_count || "-",
            stoneWeight: balance?.stone_weight || "-",
            status: "Unassigned", // default
            items: [],
          };
        }

        // Push item details
        acc[entryId].items.push({
          id: mapper.itemId.id,
          item: mapper.itemId.filingitem?.name || "-",
          weight: mapper.itemId.weight || 0,
          touch: mapper.itemId.touch?.touch || "-",
          purity: mapper.itemId.item_purity || "-",
          remarks: mapper.itemId.remarks || "-",
        });

        // Determine common status: if any item has LotBuffingMapper, mark entry as Assigned
        const isAssigned = mapper.itemId.LotBuffingMapper?.length > 0;
        if (isAssigned) {
          acc[entryId].status = "Assigned";
        }

        return acc;
      }, {})
    );

    res.json(grouped);
  } catch (error) {
    console.error("Error fetching grouped LotSettingMapper:", error);
    res.status(500).json({ error: error.message });
  }
};




export const getReportSettingEntries = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build date filter if provided
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(new Date(toDate).setHours(23, 59, 59, 999))
        }
      };
    }

    const entries = await prisma.settingEntry.findMany({
      where: {
        ...dateFilter
      },
      include: {
        setting_person: true,
        castingItem: {
          include: {
            item: true,
            touch: true,
          },
        },
        filingItems: {
          include: {
            filingitem: true,
            touch: true,
            lotFilingMapperId: {
              include: {
                lotId: true,
                filingId: true,
              },
            },
            filing_entry: {
              include: {
                filing_person: true,
              },
            },
          },
        },
        
        LotSettingMapper: {
          include: {
            lotId: true,
            settingId: true,
            itemId: {
              include: {
                filingitem: true,
                touch: true,
              },
            },
          },
        },
        settingTotalBalance: true,
        SettingItems: {
          include: {
            item: true,
            touch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!entries || entries.length === 0) {
      return res.status(404).json({ message: "No setting entries found" });
    }

    console.log("Fetched Setting Entries:", entries);

    const result = entries.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      setting_person_id: entry.setting_person_id,
      setting_person_name: entry.setting_person?.name || "",
      casting_item_id: entry.casting_item_id,
      casting_item_weight: entry.castingItem?.weight || 0,
      casting_item_type: entry.castingItem?.type || "",
      casting_item_purity: entry.castingItem?.item_purity || 0,
      casting_item_remarks: entry.castingItem?.remarks || "",
      item_name: entry.castingItem?.item?.name || "",

      filingItems: entry.filingItems.map((item) => ({
        id: item.id,
        type: item.type,
        filing_item_id: item.filing_item_id,
        filing_item_name: item.filingitem?.name || "",
        weight: item.weight,
        touch: item.touch?.touch || 0,
        item_purity: item.item_purity,
        remarks: item.remarks || "",
      })),

      settingItems: entry.SettingItems.map((item) => ({
        id: item.id,
        type: item.type,
        item_name: item.item?.name || "",
        scrap_weight: item.scrap_weight,
        item_purity: item.item_purity,
        touch: item.touch?.touch || 0,
        scrap_remarks: item.scrap_remarks || "",
      })),

      lotSettingMapper: entry.LotSettingMapper.map((mapper) => {
        const filingItem = mapper.itemId;
      
        return {
          lot_id: mapper.lot_id,
          lot_number: mapper.lotId?.lotNumber || "",
          lot_name: mapper.lotId?.lot_no || "",
          isactive: mapper.lotId?.IsActive || false,
          filing_item_id: mapper.filing_item_id,
          filing_item_name: filingItem?.filingitem?.name || "",
          weight: filingItem?.weight || 0,
          item_purity: filingItem?.item_purity || 0,
          touch: filingItem?.touch?.touch || 0,
          stone_option: filingItem?.stone_option || null,
          remarks: filingItem?.remarks || "",
          setting_entry_id: mapper.setting_entry_id,
          setting_person_name: mapper.settingId?.name || "",
        };
      }),
      
      settingTotalBalance: entry.settingTotalBalance.map((balance) => ({
        receipt_weight: balance.receipt_weight,
        stone_count: balance.stone_count,
        stone_weight: balance.stone_weight,
        remarks: balance.remarks,
        wastage: balance.wastage,
        total_product_weight: balance.total_product_weight,
        current_balance_weight: balance.current_balance_weight,
        total_scrap_weight: balance.total_scrap_weight,
        balance: balance.balance,
      })),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getReportSettingEntries:", error);
    res.status(500).json({ error: error.message });
  }
};


