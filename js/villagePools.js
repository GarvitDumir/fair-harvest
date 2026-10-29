function calculatePoolProgress(currentKg, targetKg = 500) {
  const percentage = Math.min(100, Math.round((currentKg / targetKg) * 100));
  const isReady = currentKg >= targetKg;

  return {
    percentage,
    isReady,
    statusText: isReady ? '🟢 Ready for Sale' : '🟡 Aggregating',
    remainingKg: Math.max(0, targetKg - currentKg)
  };
}

function calculateFreightSavings(totalFarmersInPool = 4) {
  const individualTruckCost = 8000;
  const pooledTruckCost = 3200;
  const totalSavings = individualTruckCost - pooledTruckCost;
  const savingsPercentage = Math.round((totalSavings / individualTruckCost) * 100);
  const costPerFarmer = Math.round(pooledTruckCost / Math.max(1, totalFarmersInPool));

  return {
    individualTruckCost,
    pooledTruckCost,
    savingsPercentage,
    costPerFarmer
  };
}

function calculateEscrowBreakdown(totalProduceValue) {
  const platformFee = Math.round(totalProduceValue * 0.02);
  const immediateFarmerPayout = Math.round(totalProduceValue * 0.50);
  const finalDeliveryPayout = Math.round(totalProduceValue * 0.50);

  return {
    platformFee,
    immediateFarmerPayout,
    finalDeliveryPayout,
    totalBuyerPayable: totalProduceValue + platformFee
  };
}