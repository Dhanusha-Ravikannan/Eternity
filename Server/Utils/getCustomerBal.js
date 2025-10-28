import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const getCustomerBalance = async (customerId) => {
    // 1️ Calculate Total Billed Amount
    const billTotal = await prisma.bill.aggregate({
      _sum: {
        total_pure: true,
      },
      where: {
        customer_id: parseInt(customerId)
      },
    });
  
    // 2️ Calculate Total Received from Bill Receipts
    const billReceiveTotal = await prisma.receivedItem.aggregate({
      _sum: {
        purity_weight: true
      },
      // where: {
      //   customer_id: parseInt(customerId),
      // },
    });
  
    // 3️ Calculate Total from Receipt Vouchers
    const receiptVoucherTotal = await prisma.receiptVoucher.aggregate({
      _sum: {
         purity: true,  
      },
      where: {
        customer_id: parseInt(customerId)
      },
    });
  
    // 4️ Calculate Total from Customer Transactions
    const custTranTotal = await prisma.customerTransaction.aggregate({
      _sum: {
        purity: true,  
      },
      where: {
         customerId: parseInt(customerId),
      },
    });
  
    // 5️ Compute the Final Customer Balance
    // Formula:
    // Overall Balance = Total Bills - (Total Received + Receipt Vouchers + Transactions)
    return (
      (billTotal._sum.total_pure || 0) -
      ((billReceiveTotal._sum.purity_weight || 0) +
        (receiptVoucherTotal._sum.purity || 0) +
        (custTranTotal._sum.purity || 0))
    );
  };
  
  

