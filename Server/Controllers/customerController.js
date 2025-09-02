import { PrismaClient } from '../generated/prisma/index.js'; 
const prisma = new PrismaClient();


// Create customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phoneNumber, address, email } = req.body;
    const newCustomer = await prisma.addCustomer.create({
      data: { name, phoneNumber, address, email },
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  const customers = await prisma.addCustomer.findMany();
  res.json(customers);
};

// Update customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, address, email } = req.body;
  try {
    const updated = await prisma.addCustomer.update({
      where: { id: Number(id) },
      data: { name, phoneNumber, address, email },
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
