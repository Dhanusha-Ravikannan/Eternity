import { PrismaClient } from '../generated/prisma/index.js'; 
const prisma = new PrismaClient();

export const createCasting = async (req,res) =>{

    try{

        const {name,email, phoneNumber,address , balance} = req.body;
        const newCustomer = await prisma.addCasting.create(
            {
                data:{
                    name,
                    email,
                    phoneNumber,
                    address,
                    balance: balance === "" || balance == null ? null : parseFloat(balance),
                },
            }
        );
       
        res.status(201).json(newCustomer)
        console.log(newCustomer)
    }catch(error) {
        res.status(400).json(error)

    }

}


export const getCasting = async (req,res) =>{

    try{
        const casting = await prisma.addCasting.findMany({
            orderBy:{
                updatedAt:"desc"
            }
        })
        res.status(201).json(casting)
        console.log(casting)
    } catch (error) {
        res.status(400).json(error)

    }

}

export const updateCasting = async (req,res) =>{
    const {id} = req.params;
    const { name,email,phoneNumber,address, balance} = req.body;
    try{
        const updated = await prisma.addCasting.update(
            {
                where: {id: Number(id) },
                data: { 
                    name,
                    email,
                    phoneNumber,
                    address,
                    balance: balance === "" || balance == null ? null : parseFloat(balance),
                 }
            }
           
        );
        res.json(updated)
        console.log(updated)

    }catch(error){
        res.status(400).json({error:"casting member not found"} )
    }

}


export const deleteCasting = async (req,res) =>{
    const {id} = req.params;

    try{
        const deleted = await prisma.addCasting.delete(
            {
                where: {id: Number(id)}
            }
        )
        res.json(deleted)
        console.log(deleted)

    }catch(error){
        res.status(400).json( {  error:"casting member not found"}  )

    }

}