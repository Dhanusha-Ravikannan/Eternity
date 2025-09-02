import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient;

export const createTouchItems =  async (req,res) =>{
    try{
        const {touch} = req.body;
        const newTouch = await prisma.addTouch.create(
            {
                data:{touch}
            }
        ) 
        res.status(201).json(newTouch)
        console.log(newTouch)

    }catch(error){
        res.status(400).json(error)
    }
}

export const getTouchItems = async(req,res) =>{
    try{
        const allItems = await prisma.addTouch.findMany();
        res.status(201).json(allItems)

    }catch(error){
        res.send(400).json(error)
    }
}


export const updateTouchItems = async(req,res) =>{
    const {id} = req.params;
    const {touch} = req.body;
    try{
        const updated = await prisma.addTouch.update(
            {
                where:{id: Number(id)},
                data : {touch}
            }
        )
        res.status(201).json(updated)

    }catch(error){
        res.status(400).json(error)
    }
}

export const deleteTouchItems = async(req,res) =>{
    const {id} = req.params;
    try{
        const deleted = await prisma.addTouch.delete(
            {
                where: {id:Number(id)}
            }
        )
        res.status(201).json(deleted)

    }catch(error){
        res.status(400).json(error)
    }
}