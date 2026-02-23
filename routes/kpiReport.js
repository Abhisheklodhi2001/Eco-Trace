const express = require("express");
const auth = require("../middleware/auth");

const kpiReportController = require("../controller/kpiReportController");
const router = express.Router();

router.post("/kpiInventory", auth, kpiReportController.kpiInventory);
router.get("/kpiItemsList", auth, kpiReportController.kpiItemsList);
router.post("/kpiInventoryFuelConsumption", auth, kpiReportController.kpiInventoryFuelConsumption);
router.post("/getKpiInventoryStationaryCombustionde", auth, kpiReportController.getKpiInventoryStationaryCombustionde);
router.post("/kpiInventoryEnergyUse", auth, kpiReportController.kpiInventoryEnergyUse);
router.post("/kpiInventoryPassengerVehicleEmission", auth, kpiReportController.kpiInventoryPassengerVehicleEmission);
router.post("/kpiInventoryTransportVehicle", auth, kpiReportController.kpiInventoryTransportVehicle);
router.post("/kpiInventoryBusinessTravel", auth, kpiReportController.kpiInventoryBusinessTravel);
router.post("/kpiInventoryEmployeeCommute", auth, kpiReportController.kpiInventoryEmployeeCommute);
router.post("/kpiInventoryWasteGenerated", auth, kpiReportController.kpiInventoryWasteGenerated);
router.post("/kpiInventoryWaterUsage", auth, kpiReportController.kpiInventoryWaterUsage);
router.post("/kpiInventoryGeneralData", auth, kpiReportController.kpiInventoryGeneralData);
router.post("/addKpiTarget", auth, kpiReportController.addKpiTarget);
router.get("/getKpiTargetByUserId", auth, kpiReportController.getKpiTargetByUserId);
router.post("/addKpiInventory", auth, kpiReportController.addKpiInventory);
router.post("/getKpiInventoryByFacilityIdAndYear", auth, kpiReportController.getKpiInventoryByFacilityIdAndYear);
router.post("/getKpiInventoryByFacilityIdAndYearAndKpiId", auth, kpiReportController.getKpiInventoryByFacilityIdAndYearAndKpiId);
router.post("/getKpiInventoryDashboard", auth, kpiReportController.getKpiInventoryDashboard);
router.post("/getKpiInventoryEmissionIntensity", auth, kpiReportController.getKpiInventoryEmissionIntensity);


// trigger kpi inventory calculation
router.get("/triggerKpiInventoryCalculation", auth, kpiReportController.triggerKpiInventoryCalculation);
router.post("/addTriggerKpiTarget", auth, kpiReportController.addTriggerKpiTarget);

// STEP APIs
router.post("/step1", kpiReportController.kpiStep1);
router.post("/step2", kpiReportController.kpiStep2);
router.post("/step3", kpiReportController.kpiStep3);
router.post("/step4", kpiReportController.kpiStep4);

module.exports = router;