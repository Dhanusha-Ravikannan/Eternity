import {PrismaClient} from "../generated/prisma/index.js";
const prisma = new PrismaClient();




export const createSetting = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, casting_item_id } = req.body;

    const newSetting = await prisma.addSetting.create({
      data: { name, email, address, phoneNumber },
    });

    const newLot = await prisma.lotInfo.create({
      data: {
        lotNumber: 1,
        setting_customer_id: newSetting.id,
      },
    });

    let newLotMapper = null;
    if (casting_item_id) {
      newLotMapper = await prisma.lotSettingMapper.create({
        data: {
          setting_id: newSetting.id,
          lot_id: newLot.id,
          item_id: casting_item_id,
        },
      });
    }

    res.status(201).json({
      message: 'Setting, Lot, and Mapper created',
      setting: newSetting,
      lot: newLot,
      mapper: newLotMapper,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const getSetting = async (req, res) => {
    try {
      const settings = await prisma.addSetting.findMany({
        include: {
          lotInfo: true,
          settingMapper: {
            include: {
              lotId: true, 
            },
          },
        },
      });  
      res.json(settings); 
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  export const getSettingById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const setting = await prisma.addSetting.findUnique({
        where: { id: Number(id) },
        include: {
          lotInfo: true,
          settingMapper: {
            include: {
              lotId: true 
            }
          },
        }
      });
  
      if (!setting) {
        return res.status(404).json({ message: "Setting member not found" });
      }
  
      res.status(200).json(setting);
    } catch (error) {
      console.error("Error in getSettingById:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  
export const updateSetting = async (req,res) =>{
    const {id} = req.params;
    const {name,email,phoneNumber,address} =req.body
    try{
        const updated = await prisma.addSetting.update({
            where:{id:Number(id)},
            data:{name,email,phoneNumber,address}
        })
        res. status(201).json(updated)

    }catch(error){
        res.status(400).json(error)
    }
}

export const deleteSetting = async (req, res) => {
    const { id } = req.params; 
    try {
      const deletedSetting = await prisma.addSetting.delete({
        where: { id: Number(id) }
      });
      res.status(200).json(deletedSetting);
    } catch (error) {
      console.error("Error deleting setting:", error);
      res.status(400).json({ error: error.message });
    }
  };
