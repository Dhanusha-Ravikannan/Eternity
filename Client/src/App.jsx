import React from 'react';
import {BrowserRouter,Routes,Route, Outlet} from 'react-router-dom'
import Login from './Components/Login/Login';
import Navbar from './Components/Navbar/Navbar';
import Customer from './Components/Customer/Customer';
import Goldsmith from './Components/Goldsmith/Goldsmith';
import Filing from './Components/LotProcess/FilingProcess/Filing';
import Setting from './Components/LotProcess/SettingProcess/Setting';
import Buffing from './Components/LotProcess/BuffingProcess/Buffing';
import MasterCustomer from './Components/Master/MasterCustomer';
import MasterFiling from './Components/Master/MasterFiling';
import MasterSetting from './Components/Master/MasterSetting';
import MasterBuffing from './Components/Master/MasterBuffing';
import MasterGoldsmith from './Components/Master/MasterCasting';
import MasterAddItems from './Components/Master/MasterAddItems';
import MasterPurchaseStock from './Components/Master/MasterPurchaseStock';
import MasterAddSupplier from './Components/Master/MasterAddSupplier';
import CustomerTranscation from './Components/Customer/CustomerTranscation';
import Stock from './Components/LotProcess/Stock';
import FilingLot from './Components/LotProcess/FilingProcess/FilingLot';
import BuffingLot from './Components/LotProcess/BuffingProcess/BuffingLot';
import SettingLot from './Components/LotProcess/SettingProcess/SettingLot';
import MasterJewelStock from './Components/Master/MasterJewelStock';
import Billing from './Components/Billing/Billing';
import Report from './Components/Report/Report';
import MasterAddTouch from './Components/Master/MasterAddTouch';
import SalesReport from './Components/Report/SalesReport';
import CustomerReport from './Components/Report/CustomerReport';
import StockReport from './Components/Report/StockReport';
import ReceiptReport from './Components/Report/ReceiptReport';
import CastingMeltingReports from './Components/Report/CastingMeltingReports';
import SettingReports from './Components/Report/SettingReports';
import FilingReports from './Components/Report/FilingReports';
import BuffingReports from './Components/Report/BuffingReports';
import FilingLotDetails from './Components/LotProcess/FilingProcess/FilingLotDetails';
import BuffingLotDetails from './Components/LotProcess/BuffingProcess/BuffingLotDetails';
import SettingLotDetails from './Components/LotProcess/SettingProcess/SettingLotDetails';
import MasterNavbar from './Components/Master/MasterNavbar';
import CastingEntry from './Components/LotProcess/CastingProcess/CastingEntry';


const App = () => {
  return (
    <BrowserRouter> 
    <Routes> 
    <Route path='/' element={<Login/>} />
    <Route path='/navbar' element={<Navbar/>} />
    <Route path='/customer' element={<Customer/>}/>
    <Route path='/customertranscation' element={<CustomerTranscation/>}/>
    <Route path='/master' element={<MasterNavbar/>} />

    <Route path='/goldsmith' element={<Goldsmith/>} />
    <Route path='/casting' element={<CastingEntry/>}/>
    <Route path='/filing' element={<Filing/>}/>
    <Route path='/setting' element={<Setting/>}/>
    <Route path='/buffing' element={<Buffing/>}/> 

    <Route path='/mastercustomer' element={<MasterCustomer/>} />
    <Route path='/masterfiling' element={<MasterFiling/>} />
    <Route path='/mastersetting' element={<MasterSetting/>} />
    <Route path='/masterbuffing' element={<MasterBuffing/>} />
    <Route path='/mastercasting' element={<MasterGoldsmith/>}/>
    <Route path='/masteritems' element={<MasterAddItems/>} />
    <Route path='/mastertouch' element={<MasterAddTouch />} />
    <Route path='/masterpurchasestock' element={<MasterPurchaseStock/>} />
    <Route path='/mastersupplier' element={<MasterAddSupplier />} />
    <Route path='/stock' element={<Stock/>} />
    <Route path='/filingLotDetails/:id/:name/:lotNumber' element={<FilingLotDetails/>}/> 
    <Route path='/filinglot/:id/:name/:lotNumber' element={<FilingLot />} />
    <Route path='/settinglot/:id/:name/:lotNumber' element={<SettingLot />} />
    <Route path='/settingLotDetails/:id/:name/:lotNumber' element={<SettingLotDetails />} />
    <Route path='/buffinglot/:id/:name/:lotNumber' element={<BuffingLot/>}/>
    <Route path='/buffingLotDetails/:id/:name/:lotNumber' element={<BuffingLotDetails/>}/>
    <Route path='/masterjewel' element={< MasterJewelStock />} />
    <Route path='/billing' element={<Billing />}/>
    <Route path='/report' element={< Report/>}/>
    <Route path='/castingMeltingrreports'  element={< CastingMeltingReports/>}/>
    <Route path='/settingreports' element={< SettingReports />}/>
    <Route path='/filingreports' element={< FilingReports />}/>
    <Route path='/buffingreports' element={< BuffingReports  />}/>
    <Route path='/customerreport' element={< CustomerReport/>}/>
    <Route path='/salesreport' element={<SalesReport />}/>
    <Route path='/stockreport' element={< StockReport/>}/>
    <Route path='/receiptreport' element={< ReceiptReport/>}/>

   </Routes>
    </BrowserRouter>
   
  )
}

export default App





