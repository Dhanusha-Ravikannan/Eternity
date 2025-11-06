import { Prisma, PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createReceiptVoucher = async (req, res) => {
  try {
    const { customerId, received, pureBalance, hallmarkBalance } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    if (!received || !received.length) {
      return res.status(400).json({ error: "Receipt data is missing" });
    }

    const custId = parseInt(customerId);

    // 1️ Verify customer exists
    const existingCustomer = await prisma.addCustomer.findUnique({
      where: { id: custId },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // 2️ Create ReceiptVoucher + update/create Stock

    const createdReceipts = await Promise.all(
      received.map(async (item) => {
        let touchId = null;
    
        //  If type is Cash, set default touch to 100
        if (item.type === "Cash") {
          let cashTouch = await prisma.addTouch.findFirst({
            where: { touch: 100 },
          });
    
          if (!cashTouch) {
            cashTouch = await prisma.addTouch.create({
              data: { touch: 100 },
            });
          }
    
          touchId = cashTouch.id;
        } else if (item.touch) {
          const touchExists = await prisma.addTouch.findUnique({
            where: { id: parseInt(item.touch) },
          });
          if (!touchExists) {
            throw new Error(`Touch with ID ${item.touch} not found`);
          }
          touchId = parseInt(item.touch);
        }
    
        //  Create receipt entry
        const receipt = await prisma.receiptVoucher.create({
          data: {
            customer_id: custId,
            date: item.date || new Date().toISOString().split("T")[0],
            type: item.type || null,
            gold_rate: parseFloat(item.goldRate) || 0,
            gold: parseFloat(item.gold) || 0,
            purity: parseFloat(item.purity) || 0,
            amount: parseFloat(item.amount) || 0,
            hallmark: parseFloat(item.hallMark) || 0,
            touch_id: touchId,
          },
        });
    
// STOCK TABLE HANDLING
        const weight = parseFloat(item.gold) || 0;
        const purity = parseFloat(item.purity) || 0;
        const type =
          item.type === "Cash"
            ? "Cash"
            : item.type === "Silver"
            ? "Silver"
            : "Gold";   
        //  When type is "Cash", weight must be purity
        const finalWeight = type === "Cash" ? purity : weight;
    
await prisma.stock.create({
  data: {
    customer_id: custId,
    item_type: type,
    weight: finalWeight,
    touch_id: touchId,
    item_purity: purity,
    remarks: `Receipt voucher added (${type})`,
  },
});
    
        return receipt;
      })
    );
    
    // 3️ Update customer pure balance
    await prisma.addCustomer.update({
      where: { id: custId },
      data: {
        openingBalance: parseFloat(pureBalance.toFixed(3)),
      },
    });

    // 4️ Update or create hallmark balance
    const existingHallmark = await prisma.hallmark.findFirst({
      where: { customer_id: custId },
    });

    if (existingHallmark) {
      await prisma.hallmark.update({
        where: { id: existingHallmark.id },
        data: { balance: parseFloat(hallmarkBalance.toFixed(3)) },
      });
    } else {
      await prisma.hallmark.create({
        data: {
          customer_id: custId,
          balance: parseFloat(hallmarkBalance.toFixed(3)),
        },
      });
    }

    // 5️ Return success
    return res.status(201).json({
      message: "Receipt vouchers and stock updated successfully",
      receipts: createdReceipts,
    });
  } catch (error) {
    console.error("Error saving receipt:", error.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// export const createReceiptVoucher = async (req, res) => {
//     try {
//       const { customerId, received, pureBalance, hallmarkBalance } = req.body;
  
//       if (!customerId) {
//         return res.status(400).json({ error: "Customer ID is required" });
//       }
  
//       if (!received || !received.length) {
//         return res.status(400).json({ error: "Receipt data is missing" });
//       }
  
//       const custId = parseInt(customerId);
  
//       // 1️ Verify the customer exists
//       const existingCustomer = await prisma.addCustomer.findUnique({
//         where: { id: custId },
//       });
  
//       if (!existingCustomer) {
//         return res.status(404).json({ error: "Customer not found" });
//       }
  
//       // 2️ Create ReceiptVoucher entries (one per received item)
//       const createdReceipts = await Promise.all(
//         received.map(async (item) => {
//           // Optional: validate touch_id exists if provided
//           let touchId = null;
//           if (item.touch) {
//             const touchExists = await prisma.addTouch.findUnique({
//               where: { id: parseInt(item.touch) },
//             });
//             if (!touchExists) {
//               throw new Error(`Touch with ID ${item.touch} not found`);
//             }
//             touchId = parseInt(item.touch);
//           }
  
//           return prisma.receiptVoucher.create({
//             data: {
//               customer_id: custId,
//               date: item.date || new Date().toISOString().split("T")[0], 
//               type: item.type || null,
//               gold_rate: parseFloat(item.goldRate) || 0,
//               gold: parseFloat(item.gold) || 0,
//               purity: parseFloat(item.purity) || 0,
//               amount: parseFloat(item.amount) || 0,
//               hallmark: parseFloat(item.hallMark) || 0,
//               touch_id: item.touch ? parseInt(item.touch) : null

//             },
//           });
//         })
//       );
  
//       // 3️ Update AddCustomer openingBalance
//       await prisma.addCustomer.update({
//         where: { id: custId },
//         data: {
//           openingBalance: parseFloat(pureBalance.toFixed(3)),
//         },
//       });
  
//       // 4️ Update or create Hallmark balance
//       const existingHallmark = await prisma.hallmark.findFirst({
//         where: { customer_id: custId },
//       });
  
//       if (existingHallmark) {
//         await prisma.hallmark.update({
//           where: { id: existingHallmark.id },
//           data: { balance: parseFloat(hallmarkBalance.toFixed(3)) },
//         });
//       } else {
//         await prisma.hallmark.create({
//           data: {
//             customer_id: custId,
//             balance: parseFloat(hallmarkBalance.toFixed(3)),
//           },
//         });
//       }
  
//       // 5️ Return success response
//       return res.status(201).json({
//         message: "Receipt vouchers saved successfully",
//         receipts: createdReceipts,
//       });
  
//     } catch (error) {
//       console.error("Error saving receipt:", error.message || error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   };


export const getAllReceiptVouchers = async (req, res) => {
  try {
    const receipts = await prisma.receiptVoucher.findMany({
      orderBy: { date: "desc" },
      include: {
        customerId:true,
        touchId: true,    
      },
    });

    const receiptsWithHallmark = await Promise.all(
      receipts.map(async (r) => {
        const hallmark = await prisma.hallmark.findFirst({
          where: { customer_id: r.customer_id },
        });
        return { ...r, hallMarkBalance: hallmark?.balance ?? 0 };
      })
    );

    return res.status(200).json({ receipts: receiptsWithHallmark });
  } catch (error) {
    console.error("Error fetching receipt vouchers:", error.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
