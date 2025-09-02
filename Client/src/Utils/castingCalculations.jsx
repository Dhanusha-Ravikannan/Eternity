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
  