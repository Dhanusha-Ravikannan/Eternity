import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

// Create customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phoneNumber, address, email, balance } = req.body;
    const newCustomer = await prisma.addCustomer.create({
      data: { 
        name, 
        phoneNumber, 
        address, 
        email,
        balance: balance === "" || balance == null ? null : parseFloat(balance),

       },
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  const customers = await prisma.addCustomer.findMany({
    orderBy:{
      updatedAt:'desc'
    }
  });
  res.json(customers);
};

// Update customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, address, email, balance } = req.body;
  try {
    const updated = await prisma.addCustomer.update({
      where: { id: Number(id) },
      data: { 
        name, 
        phoneNumber, 
        address, 
        email,
        balance: balance === "" || balance == null ? null : parseFloat(balance),
      
       },
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: "Customer not found" });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.addCustomer.delete({ where: { id: Number(id) } });
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(404).json({ error: "Customer not found" });
  }
};

// export const getHallmarkByCustomerId = async (req, res) => {
//   try {
//     const { customerId } = req.params;

//     const hallmark = await prisma.hallmark.findMany({
//       where: {
//         customer_id: parseInt(customerId),
//       },
//       include: {
//         customer: true 
//       }
//     });

//     if (hallmark.length === 0) {
//       return res.status(200).json({ balance: 0 });
//     }

//     res.status(200).json(hallmark);
//   } catch (error) {
//     console.error("Error fetching hallmark:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


export const getHallmarkByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const parsedId = parseInt(customerId);

    // Fetch hallmark records with related customer
    const hallmark = await prisma.hallmark.findMany({
      where: { customer_id: parsedId },
      include: { customer: true },
    });

    if (hallmark.length === 0) {
      // If no hallmark records, still fetch customer details
      const customer = await prisma.addCustomer.findUnique({
        where: { id: parsedId },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Return balance: 0 with customer info
      return res.status(200).json([
        {
          balance: 0,
          customer: customer,
        },
      ]);
    }

    // If hallmark records exist, return them (already includes customer)
    res.status(200).json(hallmark);
  } catch (error) {
    console.error("Error fetching hallmark:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
