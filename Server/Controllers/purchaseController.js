import { PrismaClient } from "../generated/prisma/index.js";
const prisma  = new PrismaClient();

export const createPurchase = async(req,res) =>{
   try{
    const {name,createdAt,item,goldWeight,goldTouch,goldPurity,goldRate,goldtotalValue,silverWeight,silverPurity,silverRate,silverTouch,silvertotalValue} = req.body;
    const newCustomer = await prisma.addPurchaseStock.create(
        {
            data:{name,
                createdAt: new Date(createdAt),
                item,goldWeight,goldTouch,goldPurity,goldRate,goldtotalValue,silverWeight,silverPurity,silverRate,silverTouch,silvertotalValue}
        }
    )
    console.log(newCustomer)
    res.status(201).json(newCustomer)
   }catch(error){
    res.status(400).json(error)
   }

}

export const getPurchase = async (req,res) =>{ 
   try{
    const newPurchase = await prisma.addPurchaseStock.findMany();
    res.status(201).json(newPurchase)
   }catch(error){
    res.status(400).json(error)
   }

}

export const updatePurchase = async  (req,res) =>{
    const {id} = req.params;
    const {name,createdAt,item,goldWeight,goldTouch,goldPurity,goldRate,goldtotalValue,silverWeight,silverPurity,silverRate,silverTouch,silvertotalValue} = req.body;
    console.log("Incoming update data:", req.body);

try{
    const updated = await prisma.addPurchaseStock.update(
        {
            where: {id:Number(id)},
            data: {name,
                createdAt: new Date(createdAt),
                item,goldWeight,goldTouch,goldPurity,goldRate,goldtotalValue,silverWeight,silverPurity,silverRate,silverTouch,silvertotalValue}
        }
    )
    res.status(201).json(updated)

}catch(error){
    res.status(400).json(error)
}

}

export const deletePurchase =async (req,res) =>{
    const {id} = req.params;
    try{
        const deleted = await prisma.addPurchaseStock.delete(
            {
                where: {id:Number(id)}
            }
        )
        res.status(201).json(deleted);
    }catch(error){
        res.status(400).json(error)
    }
}
