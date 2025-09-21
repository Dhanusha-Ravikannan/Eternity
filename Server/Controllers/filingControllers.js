import {PrismaClient} from '../generated/prisma/index.js';
const prisma = new PrismaClient();

  export const createFiling = async (req, res) => {
    try {
      const { name, email, address, phoneNumber, casting_item_id } = req.body;
  
      const newFiling = await prisma.addFiling.create({
        data: { name, email, address, phoneNumber },
      });
  
      const newLot = await prisma.lotInfo.create({
        data: {
          lotNumber: 1, 
          filing_customer_id: newFiling.id,
        },
      });
  
      let newLotMapper = null;
      if (casting_item_id) {
        newLotMapper = await prisma.lotFilingMapper.create({
          data: {
            filing_id: newFiling.id,
            lot_id: newLot.id,
            item_id: casting_item_id,
          },
        });
      }
  
      res.status(201).json({
        message: 'Filing, Lot, and Mapper created',
        filing: newFiling,
        lot: newLot,
        mapper: newLotMapper,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  export const getFiling = async (req, res) => {
    try {
      const filings = await prisma.addFiling.findMany({
        include: {
          lotInfo: true,
          lotFilingMapper: {
            include: {
              lotId: true,
              itemId: {
                include: {
                  item: true,
                  touch: true,
                },
              },
            },
          },
        },
      });
   
      res.status(200).json(filings);
    } catch (error) {
      console.error("Error in getFiling:", error);
      res.status(500).json({ error: error.message }); // ensure error response is valid JSON
    }
  };
  
  export const getFilingById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const filing = await prisma.addFiling.findUnique({
        where: { id: parseInt(id) },
        include: {
          lotInfo: true,
          lotFilingMapper: {
            include: {
              lotId: true,
              itemId: {
                include: {
                  item: true,
                  touch: true,
                },
              },
            },
          },
        },
      });
  
      if (!filing) {
        return res.status(404).json({ error: 'Filing not found' });
      }
  
      res.status(200).json(filing); //  Must return JSON
    } catch (error) {
      console.error("Error in getFilingById:", error);
      res.status(500).json({ error: error.message }); //  Always return valid JSON
    }
  };
  
  
  export const updateFiling = async (req, res) => {
    const { id } = req.params;
    const { name, email, address, phoneNumber } = req.body;
  
    try {
      const updatedFiling = await prisma.addFiling.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          address,
          phoneNumber,
        },
      });
  
      res.status(200).json({ message: 'Filing updated', filing: updatedFiling });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  
  export const deleteFiling = async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.addFiling.delete({
        where: { id: parseInt(id) },
      });
  
      res.status(200).json({ message: 'Filing deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  




  