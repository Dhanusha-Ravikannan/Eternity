export const calculatePurity = (givenGold, givenTouch) => {
    return (parseFloat(givenGold || 0) * parseFloat(givenTouch || 0)) / 100;
  };
  
  export const calculatePureValue = (finalTouch) => {
    return parseFloat(finalTouch || 0) / 100;
  };
  
  export const calculateFinalWeight = (purity, pureValue) => {
    return pureValue ? purity / pureValue : 0;
  };
  
  export const calculateCopper = (givenGold, finalWeight) => {
    return parseFloat(givenGold || 0) - finalWeight;
  };
  
  export const calculateAfterWeight = (items = []) => {
    return items.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  };
  
  export const calculateTotalItemWeight = (finalWeight, afterWeight) => {
    return finalWeight - afterWeight;
  };
  
  export const calculateTotalScrapWeight = (scrapItems = []) => {
    return scrapItems.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  };
  
  export const calculateTotalWastage = (totalItemWeight, totalScrapWeight) => {
    return totalItemWeight - totalScrapWeight;
  };
  
  export const calculateAfterWeightSumFromItems = (items = []) => {
    return items.reduce((sum, item) => sum + parseFloat(item.after_weight || 0), 0);
  };
  
// 1) Casting Process:

//   <div>Purity = Given Gold * Touch / 100 </div>
//   <div>Pure Value = Final Touch /100   </div>
//   <div>Before Weight = Purity / Pure Value </div>
//   <div>Copper = Given gold - Before Weight </div>
//   <div>Opening balance - Comes from Master casting table with respective name </div>
//   <div>Total Balance = Opening balance + Before weight </div>
//   <hr/>In Table - Purity = Weight * Touch / 100 
//   <div>Total Item weight = Sum of weight from Add product items table </div>
//   <div>Current Balance Weight = Total Balance - Total Item weight </div>
//   <div>Total Scrap weight = Sum of weight from Add scrap items table </div>
//   <div>Total Wastage = Current Balance Weight - Total Scrap weight </div>



//  2)  FILING PROCESS: 
// <> 
// After weight - (optional ) 
// Opening balance - Comes from Master Filing table with respective name
// Total Sum Balance = Opening Balance + Total 
// Purity = Weight * Touch / 100 
// Total Product Weight = Sum of weight from Add product items table
// Current Balance Weight = Total Balance - Total Item weight 
// Total Scrap weight = Sum of weight from Add scrap items table
// Balance = Current Balance Weight - Total Scrap weight 

// Monthly Wastage :

// Total Receipt: Sum of Weight column(main table ) 
// Balance: Sum of balance column(main table ) 
// Overall Wastage: Balance - Total Receipt
// Total wastage = Total Receipt *  Wastage(%) / 100 + Wastage Values (g) Optional:
// </>

// 3) SETTING PROCESS:

// Opening balance - Comes from Master Setting table with respective name
// Total Sum Balance =  Opening Balance + Total Issue 
// Total Product Weight = Receipt weight 
// Current Balance Weight = Total Sum Balance - Total Product Weight + Stone weight
// Total Scrap weight = Sum of weight from Add scrap items table
// Balance = Current Balance Weight - Total Scrap weight 
// Purity = weight * touch / 100 

// Monthly Wastage :

// Total Stone Count = sum of Stone Count (main table)
// Total Wastage= Total Stone Count * Wastage(%) / 100 + Wastage Values (g) Optional:
// Overall Balance= Sum of balance column(main table ) 
// Closing Balance = Overall Balance -Total Wastage


// 4) Buffing Process: 

// Total Sum Balance = Opening Balance + Total 
// Total Scrap Weight = Sum of weight from Add scrap items table
// Balance = Total Sum Balance - Receipt Weight

// Monthly Wastage : 

// Total Receipt = Receipt weight (main table)
// Total Wastage = Total Receipt *  Wastage(%) / 100 + Wastage Values (g) Optional: 
// Balance= Sum of balance column(main table )
// Overall Wastage = Balance - Total Wastage

