import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const addToStock = async (req, res) => {
  try {
    const { casting_item_id } = req.body;

    // Step 1: Get the casting item by ID
    const castingItem = await prisma.castingItems.findUnique({
      where: { id: Number(casting_item_id) },
      include: { item: true, castingEntry: true },
    });

    if (!castingItem) {
      return res.status(404).json({ error: "Casting item not found" });
    }

    if (castingItem.type !== "ScrapItems") {
      return res
        .status(400)
        .json({ error: "Only ScrapItems can be added to stock" });
    }

    const casting_customer_id = castingItem.castingEntry.casting_customer_id;

    // Step 2: Create Stock from casting item data
    const newStock = await prisma.stock.create({
      data: {
        casting_item_id: castingItem.id,
        item_id: castingItem.item_id,
        weight: castingItem.weight,
        touch_id: castingItem.touch_id,

        purity: castingItem.item_purity,
        remarks: castingItem.remarks,
        scrap_weight: castingItem.scrap_weight,
        scrap_wastage: castingItem.scrap_wastage,
        createdAt: new Date(),
        casting_customer_id: casting_customer_id,
      },
    });

    res.status(201).json(newStock);
  } catch (error) {
    console.error("Stock creation error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllStock = async (req, res) => {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        // Purchase details
        purchaseId: {
          include: {
            SupplierId: true,
            TouchId: true,
          },
        },
        item: true,
        touch: true,

        // Casting flow
        castingItem: {
          include: {
            castingEntry: {
              include: {
                casting_customer: true,
              },
            },
          },
        },

        // Filing flow
        filingItem: {
          include: {
            filing_entry: {
              include: {
                filing_person: true,
              },
            },
          },
        },

        // Setting flow
        settingItem: {
          include: {
            settingEntryId: {
              include: {
                setting_person: true,
              },
            },
          },
        },

        // Buffing flow
        buffingItem: {
          include: {
            buffingEntryId: {
              include: {
                buffing_person: true,
              },
            },
          },
        },
        casting_customer: true,
        customer_transaction:{
          include:{       
            customer:true,
            touch: true,
          }
        },

      },
    });

    const stockWithCustomerInfo = await Promise.all(
      stock.map(async (item) => {
        if (item.remarks && item.remarks.includes('From Customer Transaction')) {
          const customerIdMatch = item.remarks.match(/Customer Id (\d+)/);
          
          if (customerIdMatch) {
            const customerId = parseInt(customerIdMatch[1]);
            
            // Only fetch customer if not already included via casting_customer relation
            if (!item.casting_customer || item.casting_customer.id !== customerId) {
              const customer = await prisma.AddCustomer.findUnique({
                where: { id: customerId },
              });
              
              return {
                ...item,
                transactionCustomer: customer || null
              };
            }
          }
        }
        return item;
      })
    );



    res.status(200).json(stockWithCustomerInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reduceStockOnCastingCreate = async (castingEntry) => {
  try {
    console.log("Reducing stock for casting entry:", castingEntry);

    const { touch_id, given_gold } = castingEntry;

    if (!touch_id || !given_gold) return;

    let remainingToReduce = parseFloat(given_gold);

    const stocks = await prisma.stock.findMany({
      where: { touch_id: Number(touch_id) },
      orderBy: { createdAt: "asc" },
    });

    const totalAvailable = stocks.reduce((sum, s) => sum + s.weight, 0);

    if (totalAvailable < remainingToReduce) {
      throw new Error(
        `Insufficient stock: required ${remainingToReduce}, available ${totalAvailable}`
      );
    }

    for (const stock of stocks) {
      if (remainingToReduce <= 0) break;

      if (stock.weight >= remainingToReduce) {
        await prisma.stock.update({
          where: { id: stock.id },
          data: { weight: stock.weight - remainingToReduce },
        });
        remainingToReduce = 0;
      } else {
        await prisma.stock.update({
          where: { id: stock.id },
          data: { weight: 0 },
        });
        remainingToReduce -= stock.weight;
      }
    }

    console.log("Stock reduced successfully");
  } catch (error) {
    console.error("Error reducing stock:", error);
    throw error;
  }
};

export const addStockOnCastingDelete = async (castingEntry) => {
  try {
    console.log("Adding stock back for casting entry:", castingEntry);
    const { touch_id, given_gold } = castingEntry;

    if (!touch_id || !given_gold) return;

    const stock = await prisma.stock.findFirst({
      where: { touch_id: Number(touch_id) },
    });

    if (stock) {
      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          weight: stock.weight + parseFloat(given_gold),
        },
      });
    } else {
      console.warn(`No stock found for touch_id ${touch_id}`);
    }
  } catch (error) {
    console.error("Error adding stock back:", error);
  }
};

// READ BY ID
export const getStockById = async (req, res) => {
  const { id } = req.params;
  try {
    const stock = await prisma.stock.findUnique({
      where: { id: Number(id) },
      include: { castingItem: true },
    });

    if (!stock) return res.status(404).json({ error: "Stock not found" });

    res.status(200).json(stock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE
export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { casting_item_id } = req.body;

  try {
    const updatedStock = await prisma.stock.update({
      where: { id: Number(id) },
      data: {
        casting_item_id,
      },
    });

    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
export const deleteStock = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.stock.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
