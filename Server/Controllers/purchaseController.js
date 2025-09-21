import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();



export const savePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplierId,
      createdAt,
      item,        // Gold / Silver (enum ITEMTYPE)
      weight,
      touch_id,
      purity,
      rate,
      totalValue,
      remarks,
    } = req.body;

    //  Validate supplier
    const supplierExists = await prisma.addSupplierItem.findUnique({
      where: { id: supplierId },
    });
    if (!supplierExists) {
      return res.status(400).json({ error: "Supplier not found" });
    }

    //  Validate touch
    const touchExists = await prisma.addTouch.findUnique({
      where: { id: touch_id },
    });
    if (!touchExists) {
      return res.status(400).json({ error: "Touch not found" });
    }

    let purchase;
    if (id) {
      //  Update purchase
      purchase = await prisma.addPurchaseStock.update({
        where: { id: Number(id) },
        data: {
          supplierId,
          createdAt: new Date(createdAt),
          item,
          weight,
          touch_id,
          purity,
          rate,
          totalValue,
          remarks,
        },
        include: { SupplierId: true, TouchId: true },
      });

      //  Update linked stock entry
      await prisma.stock.updateMany({
        where: { purchase_id: Number(id) },
        data: {
          item_type: item,
          weight,
          touch_id,
          item_purity: purity,
          remarks,
        },
      });
    } else {
      //  Create purchase
      purchase = await prisma.addPurchaseStock.create({
        data: {
          supplierId,
          createdAt: new Date(createdAt),
          item,
          weight,
          touch_id,
          purity,
          rate,
          totalValue,
          remarks,
        },
        include: { SupplierId: true, TouchId: true },
      });

      //  Create stock entry linked to this purchase
      await prisma.stock.create({
        data: {
          purchase_id: purchase.id,
          item_type: item,       
          weight,
          touch_id,
          item_purity: purity,
          remarks,
          casting_customer_id: null, 
        },
      });
    }

    res.status(id ? 200 : 201).json(purchase);
  } catch (error) {
    console.error("Save Purchase Error:", error);
    res.status(400).json({
      error: "Failed to save purchase",
      detail: error.message,
    });
  }
};


// export const savePurchase = async (req, res) => {
//     try {
//       const { id } = req.params; 
//       const {
//         supplierId,
//         createdAt,
//         item,
//         weight,
//         touch_id,
//         purity,
//         rate,
//         totalValue,
//         remarks,
//       } = req.body;
  
//       // Validate supplier
//       const supplierExists = await prisma.addSupplierItem.findUnique({
//         where: { id: supplierId },
//       });
//       if (!supplierExists) {
//         return res.status(400).json({ error: "Supplier not found" });
//       }
  
//       // Validate touch
//       const touchExists = await prisma.addTouch.findUnique({
//         where: { id: touch_id },
//       });
//       if (!touchExists) {
//         return res.status(400).json({ error: "Touch not found" });
//       }
  
//       let purchase;
//       if (id) {
//         //  Update case
//         purchase = await prisma.addPurchaseStock.update({
//           where: { id: Number(id) },
//           data: {
//             supplierId,
//             createdAt: new Date(createdAt),
//             item,
//             weight,
//             touch_id,
//             purity,
//             rate,
//             totalValue,
//             remarks,
//           },
//           include: { SupplierId: true, TouchId: true },
//         });
//       } else {
//         //  Create case
//         purchase = await prisma.addPurchaseStock.create({
//           data: {
//             supplierId,
//             createdAt: new Date(createdAt),
//             item,
//             weight,
//             touch_id,
//             purity,
//             rate,
//             totalValue,
//             remarks,
//           },
//           include: { SupplierId: true, TouchId: true },
//         });
//       }
  
//       res.status(id ? 200 : 201).json(purchase);
//     } catch (error) {
//       console.error("Save Purchase Error:", error);
//       res.status(400).json({
//         error: "Failed to save purchase",
//         detail: error.message,
//       });
//     }
//   };
  

export const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      createdAt,
      item,
      weight,
      touch_id,
      purity,
      rate,
      totalValue,
      remarks,
    } = req.body;

    // Validate supplier
    const supplierExists = await prisma.addSupplierItem.findUnique({
      where: { id: supplierId },
    });
    if (!supplierExists) {
      return res.status(400).json({ error: "Supplier not found" });
    }

    // Validate touch
    const touchExists = await prisma.addTouch.findUnique({
      where: { id: touch_id },
    });
    if (!touchExists) {
      return res.status(400).json({ error: "Touch not found" });
    }


    const newPurchase = await prisma.addPurchaseStock.create({
      data: {
        supplierId,
        createdAt: new Date(createdAt),
        item,
        weight,
        touch_id,
        purity,
        rate,
        totalValue,
        remarks,
      },
      include: {
        SupplierId: true, 
        TouchId: true,    
      },
    });

    res.status(201).json(newPurchase);
  } catch (error) {
    console.error("Create Purchase Error:", error);
    res.status(400).json({ error: "Failed to create purchase", detail: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const {
    supplierId,
    createdAt,
    item,
    weight,
    touch_id,
    purity,
    rate,
    totalValue,
    remarks,
  } = req.body;

  try {
    // Validate supplier
    const supplierExists = await prisma.addSupplierItem.findUnique({
      where: { id: supplierId },
    });
    if (!supplierExists) {
      return res.status(400).json({ error: "Supplier not found" });
    }

    // Validate touch
    const touchExists = await prisma.addTouch.findUnique({
      where: { id: touch_id },
    });
    if (!touchExists) {
      return res.status(400).json({ error: "Touch not found" });
    }

    //  update with include
    const updated = await prisma.addPurchaseStock.update({
      where: { id: Number(id) },
      data: {
        supplierId,
        createdAt: new Date(createdAt),
        item,
        weight,
        touch_id,
        purity,
        rate,
        totalValue,
        remarks,
      },
      include: {
        SupplierId: true, 
        TouchId: true,    
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Purchase Error:", error);
    res.status(400).json({ error: "Failed to update purchase", detail: error.message });
  }
};

export const getPurchase = async (req, res) => {
  try {
    const purchases = await prisma.addPurchaseStock.findMany({
      include: {
        SupplierId: true,
        TouchId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Get Purchase Error:", error);
    res.status(400).json({ error: "Failed to fetch purchases", detail: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.addPurchaseStock.delete({
      where: { id: Number(id) },
    });
    res.status(201).json(deleted);
  } catch (error) {
    res.status(400).json({ error: "Failed to delete purchase", detail: error.message });
  }
};
