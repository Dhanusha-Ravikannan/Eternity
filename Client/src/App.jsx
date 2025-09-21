// import React from "react";
// import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
// import Login from "./Components/Login/Login";
// import Navbar from "./Components/Navbar/Navbar";
// import Customer from "./Components/Customer/Customer";
// import Goldsmith from "./Components/Goldsmith/Goldsmith";
// import Filing from "./Components/LotProcess/FilingProcess/Filing";
// import Setting from "./Components/LotProcess/SettingProcess/Setting";
// import Buffing from "./Components/LotProcess/BuffingProcess/Buffing";
// import MasterCustomer from "./Components/Master/MasterCustomer";
// import MasterFiling from "./Components/Master/MasterFiling";
// import MasterSetting from "./Components/Master/MasterSetting";
// import MasterBuffing from "./Components/Master/MasterBuffing";
// import MasterGoldsmith from "./Components/Master/MasterCasting";
// import MasterAddItems from "./Components/Master/MasterAddItems";
// import MasterPurchaseStock from "./Components/Master/MasterPurchaseStock";
// import MasterAddSupplier from "./Components/Master/MasterAddSupplier";
// import CustomerTranscation from "./Components/Customer/CustomerTranscation";
// import Stock from "./Components/LotProcess/Stock";
// import FilingLot from "./Components/LotProcess/FilingProcess/FilingLot";
// import BuffingLot from "./Components/LotProcess/BuffingProcess/BuffingLot";
// import SettingLot from "./Components/LotProcess/SettingProcess/SettingLot";
// import Billing from "./Components/Billing/Billing";
// import Report from "./Components/Report/Report";
// import MasterAddTouch from "./Components/Master/MasterAddTouch";
// import SalesReport from "./Components/Report/SalesReport";
// import StockReport from "./Components/Report/StockReport";
// import ReceiptReport from "./Components/Report/ReceiptReport";
// import CastingMeltingReports from "./Components/Report/CastingMeltingReports";
// import SettingReports from "./Components/Report/SettingReports";
// import FilingReports from "./Components/Report/FilingReports";
// import BuffingReports from "./Components/Report/BuffingReports";
// import WorkerReport from "./Components/Report/workerReport";
// import FilingLotDetails from "./Components/LotProcess/FilingProcess/FilingLotDetails";
// import BuffingLotDetails from "./Components/LotProcess/BuffingProcess/BuffingLotDetails";
// import SettingLotDetails from "./Components/LotProcess/SettingProcess/SettingLotDetails";
// import MasterNavbar from "./Components/Master/MasterNavbar";
// import CastingEntry from "./Components/LotProcess/CastingProcess/CastingEntry";
// import QCStock from "./Components/Master/QCStock";
// import CustomerReport from "./Components/Report/CustomerReport";
// import TouchWisePurchaseReport from "./Components/Report/TouchWisePurchaseReports";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/navbar" element={<Navbar />} />
//         <Route path="/customer" element={<Customer />} />
//         <Route path="/customertranscation" element={<CustomerTranscation />} />
//         <Route path="/master" element={<MasterNavbar />} />

//         <Route path="/goldsmith" element={<Goldsmith />} />
//         <Route path="/casting" element={<CastingEntry />} />
//         <Route path="/filing" element={<Filing />} />
//         <Route path="/setting" element={<Setting />} />
//         <Route path="/buffing" element={<Buffing />} />

//         <Route path="/mastercustomer" element={<MasterCustomer />} />
//         <Route path="/masterfiling" element={<MasterFiling />} />
//         <Route path="/mastersetting" element={<MasterSetting />} />
//         <Route path="/masterbuffing" element={<MasterBuffing />} />
//         <Route path="/mastercasting" element={<MasterGoldsmith />} />
//         <Route path="/masteritems" element={<MasterAddItems />} />
//         <Route path="/mastertouch" element={<MasterAddTouch />} />
//         <Route path="/masterpurchasestock" element={<MasterPurchaseStock />} />
//         <Route path="/mastersupplier" element={<MasterAddSupplier />} />
//         <Route path="/stock" element={<Stock />} />
//         <Route
//           path="/filingLotDetails/:id/:name/:lotNumber"
//           element={<FilingLotDetails />}
//         />
//         <Route path="/filinglot/:id/:name/:lotNumber" element={<FilingLot />} />
//         <Route
//           path="/settinglot/:id/:name/:lotNumber"
//           element={<SettingLot />}
//         />
//         <Route
//           path="/settingLotDetails/:id/:name/:lotNumber"
//           element={<SettingLotDetails />}
//         />
//         <Route
//           path="/buffinglot/:id/:name/:lotNumber"
//           element={<BuffingLot />}
//         />
//         <Route
//           path="/buffingLotDetails/:id/:name/:lotNumber"
//           element={<BuffingLotDetails />}
//         />
//         <Route path="/qcstock" element={<QCStock />} />

//         <Route path="/billing" element={<Billing />} />
//         <Route path="/report" element={<Report />} />
//         <Route
//           path="/castingMeltingrreports"
//           element={<CastingMeltingReports />}
//         />
//         <Route path="/settingreports" element={<SettingReports />} />
//         <Route path="/filingreports" element={<FilingReports />} />
//         <Route path="/buffingreports" element={<BuffingReports />} />
//         <Route path="/customerreport" element={<CustomerReport />} />
//         <Route path="/salesreport" element={<SalesReport />} />
//         <Route path="/stockreport" element={<StockReport />} />
//         <Route path="/receiptreport" element={<ReceiptReport />} />
//         <Route path="/workerreport" element={<WorkerReport />} />
//         <Route path="/purchasereport" element={<TouchWisePurchaseReport />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;








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
//const Report = lazy(() => import("./Components/Report/Report"));
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
//const BillingReport = lazy (()=> import("./Components/Report/BillingReport"))

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
          <Route path="/filingLotDetails/:id/:name/:lotNumber" element={<FilingLotDetails />} />
          <Route path="/filinglot/:id/:name/:lotNumber" element={<FilingLot />} />
          <Route path="/settinglot/:id/:name/:lotNumber" element={<SettingLot />} />
          <Route path="/settingLotDetails/:id/:name/:lotNumber" element={<SettingLotDetails />} />
          <Route path="/buffinglot/:id/:name/:lotNumber" element={<BuffingLot />} />
          <Route path="/buffingLotDetails/:id/:name/:lotNumber" element={<BuffingLotDetails />} />
          <Route path="/qcstock" element={<QCStock />} />
          <Route path="/billing" element={<Billing />} />
          {/* <Route path="/report" element={<Report />} /> */}
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
         {/*  <Route path="/billingreport" element={<BillingReport/>}/> */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;



