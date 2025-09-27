import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();


const  allocatePurity = (transactions, totalPureToUse) => {
  let remainingPurity = totalPureToUse;
  const updates = [];

  for (const tx of transactions) {
    if (remainingPurity <= 0) break;

    const currentUsed = tx.usedPurity || 0;
    const available = (tx.purity || 0) - currentUsed;

    if (available <= 0) continue; 

    const purityToConsume = Math.min(available, remainingPurity);

    updates.push({
      id: tx.id,
      newUsedPurity: currentUsed + purityToConsume,
    });

    remainingPurity -= purityToConsume;
  }

  return updates;
}


export const createBill = async (req, res) => {
  try {
    const {
      customerId,
      date,
      time,
      goldRate,
      totalPure,
      totalAmount,
      customerBalance,
      grandTotal,
      cashBalance,
      pureBalance,
      prevHallmark,
      hallmarkBalance,
      billItems,
      receivedItems,
      excessPure,
    } = req.body;

    console.log("Received bill data:", req.body);

     const transactions = await prisma.customerTransaction.findMany({
      where: { customerId: parseInt(customerId) },
      orderBy: { date: "asc" }, 
    });

     console.log("Received bill data:",transactions);


    const updates = allocatePurity(transactions, parseFloat(totalPure));

    for (const u of updates) {
      await prisma.customerTransaction.update({
        where: { id: u.id },
        data: { usedPurity: u.newUsedPurity },
      });
    }

    const latestBill = await prisma.bill.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const billNo = latestBill
      ? `BILL-${parseInt(latestBill.bill_no.split("-")[1]) + 1}`
      : "BILL-1";

    const bill = await prisma.bill.create({
      data: {
        customer_id: parseInt(customerId),
        bill_no: billNo,
        date,
        time,
        gold_rate: parseFloat(goldRate),
        total_pure: parseFloat(totalPure),
        total_amount: parseFloat(totalAmount),
        customer_balance: parseFloat(customerBalance),
        grand_total: parseFloat(grandTotal),
        cash_balance: parseFloat(cashBalance),
        pure_balance: parseFloat(pureBalance),
        prev_hallmark: parseFloat(prevHallmark),
        hallmark_balance: parseFloat(hallmarkBalance),
        billItems: {
          create: billItems.map((item) => ({
            qc_stock_id: item.id,
            item_name: item.itemId.name,
            weight: parseFloat(item.weight),
            stone_weight: item.stone_weight
              ? parseFloat(item.stone_weight)
              : null,
            total_weight: parseFloat(item.totalWeight),
            touchId: parseFloat(item.touchId),
            pure: parseFloat(item.pure),
            amount: parseFloat(item.amount),
            addItemId: parseInt(item.itemId.id),
          })),
        },
        receivedItems: {
          create: receivedItems.map((item) => ({
            date: item.date,
            type: "Gold",
            gold_rate: parseFloat(item.goldRate),
            gold: item.gold ? parseFloat(item.gold) : null,
            touchId: item.touchId ? parseFloat(item.touchId) : null,
            purity_weight: parseFloat(item.purityWeight),
            amount: item.amount ? parseFloat(item.amount) : null,
            hallmark_charge: item.hallmarkCharge
              ? parseFloat(item.hallmarkCharge)
              : null,
          })),
        },
      },
      include: {
        billItems: true,
        receivedItems: true,
      },
    });

    if (excessPure > 0) {
      await prisma.customerTransaction.create({
        data: {
          customerId: parseInt(customerId),
          purity: parseFloat(excessPure),
          type: "GOLD",
          value: 0,
          date: new Date(),
        },
      });
    }

    const existing = await prisma.hallmark.findFirst({
      where: { customer_id: parseInt(customerId) },
    });

    if (existing) {
      await prisma.hallmark.update({
        where: { id: existing.id },
        data: { balance: parseFloat(hallmarkBalance) + existing.balance },
      });
    } else {
      await prisma.hallmark.create({
        data: {
          customer_id: parseInt(customerId),
          balance: parseFloat(hallmarkBalance),
        },
      });
    }

    res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        billItems: true,
        receivedItems: true,


        // billItems:{
        //   include:{
        //     touch:true
        //   }
        // },
        // receivedItems:{
        //   include:{
        //     touch: true
        //   }
        // }
       
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        billItems: {
          include: {
            qcStock: {
              include: {
                item: true,
                touch: true,
              },
            },
          },
        },
        receivedItems: true,
      },
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.status(200).json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBillsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bills = await prisma.bill.findMany({
      where: {
        customer_id: parseInt(customerId),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        billItems: true,
        receivedItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching customer bills:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
