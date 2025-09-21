import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createBuffing = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, casting_item_id } = req.body;

    const newBuffing = await prisma.addBuffing.create({
      data: { name, email, address, phoneNumber },
    });

    const newLot = await prisma.lotInfo.create({
      data: {
        lotNumber: 1,
        buffing_customer_id: newBuffing.id,
      },
    });

    let newLotMapper = null;
    if (casting_item_id) {
      newLotMapper = await prisma.lotBuffingMapper.create({
        data: {
          buffing_id: newBuffing.id,
          lot_id: newLot.id,
          item_id: casting_item_id,
        },
      });
    }

    res.status(201).json({
      message: "Buffing, Lot, and Mapper created",
      buffing: newBuffing,
      lot: newLot,
      mapper: newLotMapper,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBuffing = async (req, res) => {
  try {
    const buffings = await prisma.addBuffing.findMany({
      include: {
        lotInfo: true,
        buffingMapper: {
          include: {
            lotId: true,
          },
        },
      },
    });

    res.json(buffings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBuffingById = async (req, res) => {
  const { id } = req.params;

  try {
    const buffing = await prisma.addBuffing.findUnique({
      where: { id: Number(id) },
      include: {
        lotInfo: true,
        buffingMapper: {
          include: {
            lotId: true,
          },
        },
      },
    });

    if (!buffing) {
      return res.status(404).json({ message: "Buffing member not found" });
    }

    res.status(200).json(buffing);
  } catch (error) {
    console.error("Error in getBuffingById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBuffing = async (req, res) => {
  const { id } = req.params;
  const { name, email, address, phoneNumber } = req.body;
  try {
    const updated = await prisma.addBuffing.update({
      where: { id: Number(id) },
      data: { name, email, address, phoneNumber },
    });
    res.status(201).json(updated);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const deleteBuffing = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBuffing = await prisma.addBuffing.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(deletedBuffing);
  } catch (error) {
    console.error("Error deleting buffing:", error);
    res.status(400).json({ error: error.message });
  }
};

export const createBuffingWastage = async (req, res) => {
  try {
    const {
      total_receipt,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
      lotId,
      buffing_person_id,
    } = req.body;

      const lotIdNumber = await prisma.LotInfo.findFirst({
      where: {
        buffing_customer_id: parseInt(buffing_person_id),
        lotNumber: parseInt(lotId),
      },
    });


    const filingWastage = await prisma.buffingWastage.create({
      data: {
        total_receipt: parseFloat(total_receipt) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
        balance: parseFloat(balance) || 0,
        wastage_percentage: parseInt(wastage_percentage) || 0,
        given_gold: given_gold ? parseFloat(given_gold) : null,
        add_wastage: add_wastage ? parseFloat(add_wastage) : null,
        overall_wastage: parseFloat(overall_wastage) || 0,
        closing_balance: parseFloat(closing_balance) || 0,
        opening_balance: parseFloat(opening_balance) || 0,
        buffing_lot_id: parseInt(lotIdNumber.id),
        buffing_person_id: parseInt(buffing_person_id),
      },
    });

    res.status(201).json(filingWastage);
  } catch (error) {
    console.error("Error creating filing wastage:", error);
    res.status(500).json({ message: "Failed to create filing wastage record" });
  }
};

export const updateBuffingWastage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      total_receipt,
      total_wastage,
      balance,
      wastage_percentage,
      given_gold,
      add_wastage,
      overall_wastage,
      closing_balance,
      opening_balance,
    } = req.body;

    const filingWastage = await prisma.buffingWastage.update({
      where: { id: parseInt(id) },
      data: {
        total_receipt: parseFloat(total_receipt) || 0,
        total_wastage: parseFloat(total_wastage) || 0,
        balance: parseFloat(balance) || 0,
        wastage_percentage: parseInt(wastage_percentage) || 0,
        given_gold: given_gold ? parseFloat(given_gold) : null,
        add_wastage: add_wastage ? parseFloat(add_wastage) : null,
        overall_wastage: parseFloat(overall_wastage) || 0,
        closing_balance: parseFloat(closing_balance) || 0,
        opening_balance: parseFloat(opening_balance) || 0,
      },
    });

    res.status(200).json(filingWastage);
  } catch (error) {
    console.error("Error updating filing wastage:", error);
    res.status(500).json({ message: "Failed to update filing wastage record" });
  }
};



export const getBuffingWastageByEntryId = async (req, res) => {
  try {
    const { buffingPersonId, lotNumber } = req.params;


      const lotId = await prisma.LotInfo.findFirst({
      where: {
        buffing_customer_id: parseInt(buffingPersonId),
        lotNumber: parseInt(lotNumber),
      },
    });

    const wastageRecords = await prisma.buffingWastage.findMany({
      where: {
        buffing_person_id: parseInt(buffingPersonId),
        buffing_lot_id: parseInt(lotId.id),
      },
      include: {
        buffingLotId: true,
        buffingPersonId: true,
      },
    });

    res.status(200).json(wastageRecords);
  } catch (error) {
    console.error("Error fetching filing wastage:", error);
    res.status(500).json({ message: "Failed to fetch filing wastage records" });
  }
};

export const closeJobcardAndCreateNewLot = async (req, res) => {
  try {
    const { buffing_person_id, current_lot_number } = req.body;

    const currentActiveLot = await prisma.LotInfo.findFirst({
      where: {
        buffing_customer_id: parseInt(buffing_person_id),
        IsActive: true,
      },
    });

    let lastClosingBalance = 0;

    if (currentActiveLot) {
      const lastWastage = await prisma.buffingWastage.findFirst({
        where: { buffing_lot_id: currentActiveLot.id },
        orderBy: { id: "desc" },
      });

      console.log("last wastage", lastWastage);

      if (lastWastage) {
        lastClosingBalance = lastWastage.closing_balance || 0;
      }

      await prisma.LotInfo.update({
        where: { id: currentActiveLot.id },
        data: { IsActive: false },
      });
    }

    console.log("lot numberrr", currentActiveLot);

    const newLotNumber = currentActiveLot ? currentActiveLot.lotNumber + 1 : 1;

    const newLot = await prisma.LotInfo.create({
      data: {
        lotNumber: newLotNumber,
        buffing_customer_id: parseInt(buffing_person_id),
        IsActive: true,
      },
    });

    await prisma.buffingWastage.create({
      data: {
        buffing_person_id: parseInt(buffing_person_id),
        buffing_lot_id: newLot.id,
        opening_balance: lastClosingBalance,
        closing_balance: 0,
        total_receipt: 0,
        total_wastage: 0,
        balance: 0,
        wastage_percentage: 0,
        given_gold: 0,
        add_wastage: 0,
        overall_wastage: 0,
      },
    });

    res.status(200).json({
      message:
        "Jobcard closed, new lot created, and FilingWastage initialized successfully",
      newLotNumber: newLot.lotNumber,
      newLotId: newLot.id,
      opening_balance: lastClosingBalance,
    });
  } catch (error) {
    console.error("Error closing jobcard:", error);
    res
      .status(500)
      .json({ message: "Failed to close jobcard and create new lot" });
  }
};
