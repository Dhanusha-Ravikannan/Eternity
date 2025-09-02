import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import customerRoutes from "./Routes/customerRoutes.js";
import castingRoutes from "./Routes/castingRoutes.js";
import filingRoutes from "./Routes/filingRoutes.js";
import settingRoutes from "./Routes/settingRoutes.js";
import buffingRoutes from "./Routes/buffingRoutes.js";
import additemRoutes from "./Routes/additemRoutes.js";
import supplierRoutes from "./Routes/supplierRoutes.js";
import purchaseRoutes from "./Routes/purchaseRoutes.js";
import transactionRoutes from "./Routes/transcationRoutes.js";
import castingentryRoutes from "./Routes/castingEntryRoutes.js";
import castingItemsRoutes from "./Routes/castingItemsRoutes.js";
import castingStockRoutes from "./Routes/castingStockRoutes.js";
import filingEntryRoutes from "./Routes/filingEntryRoutes.js";
import addTouchRoutes from "./Routes/addTouchRoutes.js";
import filingItemsRoutes from "./Routes/filingItemsRoutes.js";
import settingEntryRoutes from './Routes/settingEntryRoutes.js';
import settingItemsRoutes from './Routes/settingItemsRoutes.js';
import buffingEntryRoutes from './Routes/buffingEntryRoutes.js';
import buffingItemsRoutes from './Routes/buffingItemsRoutes.js';

const app = express();
const PORT = process.env.PORT ||  5000;

// app.use(express.json());
app.use(express.json({
  strict: true, 
}));

app.use(cors());
dotenv.config();

app.use("/api/customers",customerRoutes);
app.use("/api/casting",castingRoutes);
app.use("/api/filing",filingRoutes);
app.use("/api/setting",settingRoutes);
app.use("/api/buffing",buffingRoutes);
app.use("/api/additem",additemRoutes);
app.use("/api/addtouch",addTouchRoutes);
app.use("/api/addsupplier", supplierRoutes);
app.use("/api/purchase",purchaseRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/castingentry",castingentryRoutes);
app.use("/api/castingitems",castingItemsRoutes);
app.use("/api/stock",castingStockRoutes);
app.use("/api/filingentry",filingEntryRoutes );
app.use("/api/filingitems",filingItemsRoutes);
app.use("/api/settingentry", settingEntryRoutes )
app.use("/api/settingitems", settingItemsRoutes);
app.use("/api/buffingentry", buffingEntryRoutes)
app.use("/api/buffingitems", buffingItemsRoutes)


app.get("/", (req, res) => {
  res.send("Hellooo");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
