import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// Lazy load components

const Login = lazy(() => import("./Components/Login/Login"));
const Navbar = lazy(() => import("./Components/Navbar/Navbar"));
const Customer = lazy(() => import("./Components/Customer/Customer"));
const Goldsmith = lazy(() => import("./Components/Goldsmith/Goldsmith"));
const Filing = lazy(() => import("./Components/LotProcess/FilingProcess/Filing"));
const Setting = lazy(() => import("./Components/LotProcess/SettingProcess/Setting"));
const Buffing = lazy(() => import("./Components/LotProcess/BuffingProcess/Buffing"));
const MasterCustomer = lazy(() => import("./Components/Master/MasterCustomer"));
const MasterFiling = lazy(() => import("./Components/Master/MasterFiling"));
const MasterSetting = lazy(() => import("./Components/Master/MasterSetting"));
const MasterBuffing = lazy(() => import("./Components/Master/MasterBuffing"));
const MasterGoldsmith = lazy(() => import("./Components/Master/MasterCasting"));
const MasterAddItems = lazy(() => import("./Components/Master/MasterAddItems"));
const MasterPurchaseStock = lazy(() => import("./Components/Master/MasterPurchaseStock"));
const MasterAddSupplier = lazy(() => import("./Components/Master/MasterAddSupplier"));
const CustomerTranscation = lazy(() => import("./Components/Customer/CustomerTranscation"));
const Stock = lazy(() => import("./Components/LotProcess/Stock"));
const FilingLot = lazy(() => import("./Components/LotProcess/FilingProcess/FilingLot"));
const BuffingLot = lazy(() => import("./Components/LotProcess/BuffingProcess/BuffingLot"));
const SettingLot = lazy(() => import("./Components/LotProcess/SettingProcess/SettingLot"));
const Billing = lazy(() => import("./Components/Billing/Billing"));
const MasterAddTouch = lazy(() => import("./Components/Master/MasterAddTouch"));
const SalesReport = lazy(() => import("./Components/Report/SalesReport"));
const StockReport = lazy(() => import("./Components/Report/StockReport"));
const ReceiptReport = lazy(() => import("./Components/Report/ReceiptReport"));
const CastingMeltingReports = lazy(() => import("./Components/Report/CastingMeltingReports"));
const SettingReports = lazy(() => import("./Components/Report/SettingReports"));
const FilingReports = lazy(() => import("./Components/Report/FilingReports"));
const BuffingReports = lazy(() => import("./Components/Report/BuffingReports"));
const WorkerReport = lazy(() => import("./Components/Report/workerReport"));
const FilingLotDetails = lazy(() => import("./Components/LotProcess/FilingProcess/FilingLotDetails"));
const BuffingLotDetails = lazy(() => import("./Components/LotProcess/BuffingProcess/BuffingLotDetails"));
const SettingLotDetails = lazy(() => import("./Components/LotProcess/SettingProcess/SettingLotDetails"));
const MasterNavbar = lazy(() => import("./Components/Master/MasterNavbar"));
const CastingEntry = lazy(() => import("./Components/LotProcess/CastingProcess/CastingEntry"));
const QCStock = lazy(() => import("./Components/Master/QCStock"));
const CustomerReport = lazy(() => import("./Components/Report/CustomerReport"));
const TouchWisePurchaseReport = lazy(() => import("./Components/Report/TouchWisePurchaseReports"));
const ReceiptVoucher = lazy(()=>import("./Components/Receipt Voucher/ReceiptVoucher"));
const ExpenseVoucher = lazy (()=> import("./Components/Expense Voucher/ExpenseVoucher"))


const Loader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize:'1.5rem',
      fontWeight:'bold'
    }}
  > Loading...
    <CircularProgress /> 
  </Box>
);

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customertranscation" element={<CustomerTranscation />} />
          <Route path="/master" element={<MasterNavbar />} />
          <Route path="/goldsmith" element={<Goldsmith />} />
          <Route path="/casting" element={<CastingEntry />} />
          <Route path="/filing" element={<Filing />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/buffing" element={<Buffing />} />
          <Route path="/mastercustomer" element={<MasterCustomer />} />
          <Route path="/masterfiling" element={<MasterFiling />} />
          <Route path="/mastersetting" element={<MasterSetting />} />
          <Route path="/masterbuffing" element={<MasterBuffing />} />
          <Route path="/mastercasting" element={<MasterGoldsmith />} />
          <Route path="/masteritems" element={<MasterAddItems />} />
          <Route path="/mastertouch" element={<MasterAddTouch />} />
          <Route path="/masterpurchasestock" element={<MasterPurchaseStock />} />
          <Route path="/mastersupplier" element={<MasterAddSupplier />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/filingLotDetails/:id/:name/:lotNumber/:balance" element={<FilingLotDetails />} />
          <Route path="/filinglot/:id/:name/:lotNumber" element={<FilingLot />} />
          <Route path="/settinglot/:id/:name/:lotNumber" element={<SettingLot />} />
          <Route path="/settingLotDetails/:id/:name/:lotNumber" element={<SettingLotDetails />} />
          <Route path="/buffinglot/:id/:name/:lotNumber" element={<BuffingLot />} />
          <Route path="/buffingLotDetails/:id/:name/:lotNumber" element={<BuffingLotDetails />} />
          <Route path="/qcstock" element={<QCStock />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/castingMeltingrreports" element={<CastingMeltingReports />} />
          <Route path="/settingreports" element={<SettingReports />} />
          <Route path="/filingreports" element={<FilingReports />} />
          <Route path="/buffingreports" element={<BuffingReports />} />
          <Route path="/customerreport" element={<CustomerReport />} />
          <Route path="/salesreport" element={<SalesReport />} />
          <Route path="/stockreport" element={<StockReport />} />
          <Route path="/receiptreport" element={<ReceiptReport />} />
          <Route path="/workerreport" element={<WorkerReport />} />
          <Route path="/purchasereport" element={<TouchWisePurchaseReport />} />
          <Route path="/receiptvoucher" element={<ReceiptVoucher/>} />
          <Route path="/expensevoucher" element={<ExpenseVoucher/>}/>
          
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;



