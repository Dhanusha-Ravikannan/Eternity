import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

//  POST - http://localhost:5000/api/filingentry

export const createFilingEntry = async (req, res) => {
  try {
    const { filing_person_id, lot_number, itemIds } = req.body;

    if (
      !filing_person_id ||
      !lot_number ||
      !Array.isArray(itemIds) ||
      itemIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "filing_person_id, lot_number, and at least one casting_item_id are required",
      });
    }

    // const lot = await prisma.lotInfo.findFirst({
    //   where: { lotNumber: parseInt(lot_number), IsActive: true , filing_customer_id:filing_person_id},
    // });
    const LotId = await prisma.LotInfo.findFirst({
      where: {
        lotNumber: parseInt(lot_number),
        filing_customer_id: parseInt(filing_person_id),
      },
    });

    if (!LotId) {
      return res
        .status(404)
        .json({
          error:
            "Lot not found with the given lot_number or Given Lot is Not Active",
        });
    }

      // ✅ Block if lot is closed / inactive
      if (LotId.IsActive === false || LotId.status === "Closed") {
        return res.status(400).json({
          error: "This jobcard/lot is closed. You cannot assign new items.",
        });
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
            lot_id: LotId.id,
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
            const casting = lm.itemId || {};

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
        filing_customer_id: filing_person_id,
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
      // filing_person_name: entry.filing_person?.name || "",
  filing_person: {
    id: entry.filing_person?.id,
    name: entry.filing_person?.name || "",
    phoneNumber: entry.filing_person?.phoneNumber || "",
    address: entry.filing_person?.address || "",
    email: entry.filing_person?.email || "",
    balance: entry.filing_person?.balance ?? 0,
  },

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
        isactive: mapper.lotId.IsActive,
        item_id: mapper.item_id,
        item_name: mapper.itemId?.item?.name || "",
        filing_id: mapper.filing_id,
        filing_person_name: mapper.filingId?.name || "",
        filing_entry_id: mapper.filing_entry_id,
      })),
      filingTotalBalance: entry.filingTotalBalance.map((balance) => ({
        id: balance.id,
        createdAt: balance.createdAt,
        after_weight: balance.after_weight ?? null,
        total_product_weight: balance.total_product_weight ?? 0,
        current_balance_weight: balance.current_balance_weight ?? 0,
        total_scrap_weight: balance.total_scrap_weight ?? 0,
        wastage: balance.wastage ?? false,
        balance: balance.balance ?? 0,
        filing_entry_id: balance.filing_entry_id,
        opening_balance: balance.opening_balance ?? 0,
        total_sum_balance: balance.total_sum_balance ?? 0,
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

export const getReportFillingEntries = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build date filter if provided
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    const entries = await prisma.filingEntry.findMany({
      where: {
        ...dateFilter,
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
        filingItems: {
          include: {
            filingitem: true,
            touch: true,
          },
        },
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
      orderBy: { createdAt: "desc" },
    });

    if (!entries || entries.length === 0) {
      return res.status(404).json({ message: "No filing entries found" });
    }

    console.log("Fetched Entries:", entries);

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
        lot_number: mapper.lotId?.lotNumber || "",
        lot_name: mapper.lotId?.lot_no || "",
        isactive: mapper.lotId?.IsActive || false,
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
    console.error("Error in getAllFilingEntries:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllProcessEntries = async (req, res) => {
  try {
    const { fromDate, toDate, processType } = req.query;

    // Build date filter if provided
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(fromDate),
          lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    let result = [];

    // Handle Casting Entries
    if (!processType || processType === "casting") {
      const castingEntries = await prisma.castingEntry.findMany({
        where: {
          ...dateFilter,
        },
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

      const formattedCastingEntries = castingEntries.map((entry) => {
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
          processType: "casting",
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

      result = [...result, ...formattedCastingEntries];
    }

    // Handle Filing Entries
    if (!processType || processType === "filing") {
      const filingEntries = await prisma.filingEntry.findMany({
        where: {
          ...dateFilter,
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
          filingItems: {
            include: {
              filingitem: true,
              touch: true,
            },
          },
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
        orderBy: { createdAt: "desc" },
      });

      const formattedFilingEntries = filingEntries.map((entry) => ({
        processType: "filing",
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
          lot_number: mapper.lotId?.lotNumber || "",
          lot_name: mapper.lotId?.lot_no || "",
          isactive: mapper.lotId?.IsActive || false,
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

      result = [...result, ...formattedFilingEntries];
    }

    // Handle Setting Entries
    if (!processType || processType === "setting") {
      const settingEntries = await prisma.settingEntry.findMany({
        where: {
          ...dateFilter,
        },
        include: {
          setting_person: true,
          settingTotalBalance: true,
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
            },
          },
          SettingItems: {
            include: {
              item: true,
              touch: true,
            },
          },
          LotSettingMapper: {
            include: {
              itemId: {
                include: {
                  filingitem: true,
                  touch: true,
                },
              },
              lotId: true,
              settingId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedSettingEntries = settingEntries.map((entry) => ({
        processType: "setting",
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
        filingItems: entry.filingItems || [],
        settingItems: entry.SettingItems || [],

        lotSettingMapper: entry.LotSettingMapper.map((mapper) => ({
          lot_id: mapper.lot_id,
          lot_number: mapper.lotId?.lotNumber || "",
          lot_name: mapper.lotId?.lot_no || "",
          isactive: mapper.lotId?.IsActive || false,
          filing_item_id: mapper.filing_item_id,
          filing_item_name: mapper.itemId?.filingitem?.name || "",
          setting_id: mapper.setting_id,
          setting_person_name: mapper.settingId?.name || "",
          setting_entry_id: mapper.setting_entry_id,
        })),

        settingTotalBalance: entry.settingTotalBalance.map((balance) => ({
          receipt_weight: balance.receipt_weight ?? null,
          stone_count: balance.stone_count ?? null,
          stone_weight: balance.stone_weight ?? null,
          total_product_weight: balance.total_product_weight ?? null,
          current_balance_weight: balance.current_balance_weight ?? null,
          total_scrap_weight: balance.total_scrap_weight ?? null,
          wastage: balance.wastage ?? null,
          balance: balance.balance ?? null,
        })),
      }));

      result = [...result, ...formattedSettingEntries];
    }

    // Handle Buffing Entries
    if (!processType || processType === "buffing") {
      const buffingEntries = await prisma.buffingEntry.findMany({
        where: {
          ...dateFilter,
        },
        include: {
          buffing_person: true,
          BuffingTotalBalance: true,
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
            },
          },
          setting_items: {
            include: {
              item: true,
              touch: true,
            },
          },
          BuffingItems: {
            include: {
              item: true,
              touch: true,
            },
          },
          LotBuffingMapper: {
            include: {
              settingItemId: {
                include: {
                  item: true,
                  touch: true,
                },
              },
              filingItemId: {
                include: {
                  filingitem: true,
                  touch: true,
                },
              },
              lotId: true,
              buffingId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedBuffingEntries = buffingEntries.map((entry) => ({
        processType: "buffing",
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
        filingItems: entry.filingItems || [],
        settingItems: entry.settingItems || [],
        buffingItems: entry.BuffingItems || [],

        lotBuffingMapper: entry.LotBuffingMapper.map((mapper) => ({
          lot_id: mapper.lot_id,
          lot_number: mapper.lotId?.lotNumber || "",
          lot_name: mapper.lotId?.lot_no || "",
          isactive: mapper.lotId?.IsActive || false,
          setting_item_id: mapper.setting_item_id,
          setting_item_name: mapper.settingItemId?.item?.name || "",
          filing_item_id: mapper.filing_item_id,
          filing_item_name: mapper.filingItemId?.filingitem?.name || "",
          buffing_id: mapper.buffing_id,
          buffing_person_name: mapper.buffingId?.name || "",
          buffing_entry_id: mapper.buffing_entry_id,
        })),

        buffingTotalBalance: entry.BuffingTotalBalance.map((balance) => ({
          receipt_weight: balance.receipt_weight ?? null,
          total_scrap_weight: balance.total_scrap_weight ?? null,
          wastage: balance.wastage ?? null,
          balance: balance.balance ?? null,
        })),
      }));

      result = [...result, ...formattedBuffingEntries];
    }

    // Sort all entries by date
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (result.length === 0) {
      return res.status(404).json({ message: "No entries found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllProcessEntries:", error);
    res.status(500).json({ error: error.message });
  }
};
