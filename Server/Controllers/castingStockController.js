import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


export const addToStock = async (req, res) => {
  try {
    const { casting_item_id } = req.body;

    // Step 1: Get the casting item by ID
    const castingItem = await prisma.castingItems.findUnique({
      where: { id: Number(casting_item_id) },
      include: { item: true , // include related item if needed
      castingEntry: true,}
    });

    if (!castingItem) {
      return res.status(404).json({ error: "Casting item not found" });
    }

    if (castingItem.type !== "ScrapItems") {
      return res.status(400).json({ error: "Only ScrapItems can be added to stock" });
    }

    const casting_customer_id = castingItem.castingEntry.casting_customer_id

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
        casting_customer_id:casting_customer_id
      }
    });

    res.status(201).json(newStock);
  } catch (error) {
    console.error("Stock creation error:", error);
    res.status(400).json({ error: error.message });
  }
};


// READ ALL
export const getAllStock = async (req, res) => {
  try {
    const stock = await prisma.stock.findMany({
      include:{
        item: true,
        castingItem:{
          include:{
            castingEntry:{
              include:{
                casting_customer: true
              },
            },
          },
        },
        filingItem:{
          include:{
            filing_entry:{
              include:{
                filing_person:true
              }
            }
          }
        },
        settingItem:{
          include:{
            settingEntryId:{
              include:{
                setting_person:true
              }
            }
          }
        },
        buffingItem:{
          include:{
            buffingEntryId:{
              include:{
                buffing_person:true
              }
            }
          }

        }
      },
    });

    res.status(200).json(stock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ BY ID
export const getStockById = async (req, res) => {
  const { id } = req.params;
  try {
    const stock = await prisma.stock.findUnique({
      where: { id: Number(id) },
      include: { castingItem: true }
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
        casting_item_id
      }
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
      where: { id: Number(id) }
    });

    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
