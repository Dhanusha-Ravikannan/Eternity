import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const createSupplier = async(req,res)=>{
    try{
        const {name,phoneNumber,email,address} = req.body;
        const newName = await prisma.addSupplierItem.create(
            {
                data:{name, phoneNumber,email,address}
            }
        )
        res.status(201).json(newName)
    }catch(error){
        res.status(400).json(error)
    }
}

export const getSupplier = async(req,res) =>{
    try{
        const allItems = await prisma.addSupplierItem.findMany();
        res.status(201).json(allItems)

    }catch(error){
        res.status(400).json(error)
    }
}

export const updateSupplier = async(req,res) =>{
    const {id} = req.params;
    const {name,phoneNumber,email,address} = req.body;
    try{
        const updated = await prisma.addSupplierItem.update(
            {
                where: {id: Number(id)},
                data: {name,phoneNumber,email,address}
            }
        )
        res.status(201).json(updated)

    }catch(error){
        res.status(400).json(error)
    }
}

export const deleteSupplier = async (req,res) =>{
    const {id} = req.params;

    try{
        const deleted = await prisma.addSupplierItem.delete(
            {
                where:{id:Number(id)},
            }
        )
        res.status(201).json(deleted)

    }catch(error){
        res.status(400).json(error)
    }
}

