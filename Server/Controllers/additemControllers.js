import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient;

export const createAddItems =  async (req,res) =>{
    try{
        const {name} = req.body;
        const newName = await prisma.addItem.create(
            {
                data:{name}
            }
        ) 
        res.status(201).json(newName)
        console.log(newName)

    }catch(error){
        res.status(400).json(error)
    }
}

export const getAddItems = async(req,res) =>{
    try{
        const allItems = await prisma.addItem.findMany();
        res.status(201).json(allItems)

    }catch(error){
        res.send(400).json(error)
    }
}


export const updateAddItems = async(req,res) =>{
    const {id} = req.params;
    const {name} = req.body;
    try{
        const updated = await prisma.addItem.update(
            {
                where:{id: Number(id)},
                data : {name}
            }
        )
        res.status(201).json(updated)

    }catch(error){
        res.status(400).json(error)
    }
}

export const deleteAddItems = async(req,res) =>{
    const {id} = req.params;
    try{
        const deleted = await prisma.addItem.delete(
            {
                where: {id:Number(id)}
            }
        )
        res.status(201).json(deleted)

    }catch(error){
        res.status(400).json(error)
    }
}