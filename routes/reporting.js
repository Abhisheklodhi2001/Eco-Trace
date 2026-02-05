const express = require("express");
const reportingController = require("../controller/reportingController");
const auth = require("../middleware/auth");
const router = express.Router();

router.get('/get-facility-wise-scope', auth, reportingController.getFacilityWiseScope);
router.get('/get-category-wise-scope1-emission', auth, reportingController.getCategoryWiseScope1Emission);
router.get('/get-category-wise-scope2-emission', auth, reportingController.getCategoryWiseScope2Emission);
router.get('/get-category-wise-scope3-emission', auth, reportingController.getCategoryWiseScope3Emission);
router.get('/get-stationarycombustion-sub-category-wise-scope1-emission', auth, reportingController.getStationaryCombustionSubCategoryWiseScope1Emission);
router.get('/get-companyvehicles-sub-category-wise-scope1-emission', auth, reportingController.getCompanyVehiclesSubCategoryWiseScope1Emission);
router.get('/get-electricity-sub-category-wise-scope2-emission', auth, reportingController.getElectricitySubCategoryWiseScope2Emission);
router.get('/get-heatandsteam-sub-category-wise-scope2-emission', auth, reportingController.getHeatAndSteamSubCategoryWiseScope1Emission);
router.get('/get-purchasedgoodsservices-sub-category-wise-scope3-emission', auth, reportingController.getPurchaseGoodsAndServicesSubCategoryWiseScope3Emission);
router.get('/get-fuelrelatedservices-sub-category-wise-scope3-emission', auth, reportingController.getFuelRelatedServicesSubCategoryWiseScope3Emission);
router.get('/get-watersupplytreatment-sub-category-wise-scope3-emission', auth, reportingController.getWaterSupplyTreatmentSubCategoryWiseScope3Emission);
router.get('/get-wastegenerated-sub-category-wise-scope3-emission', auth, reportingController.getWasteGeneratedSubCategoryWiseScope3Emission);
router.get('/get-businesstravel-sub-category-wise-scope3-emission', auth, reportingController.getBusinessTravelSubCategoryWiseScope3Emission);
router.get('/get-upstreamtransportation-sub-category-wise-scope3-emission', auth, reportingController.getUpstreamTransportationSubCategoryWiseScope3Emission);
router.get('/get-downstreamtransportation-sub-category-wise-scope3-emission', auth, reportingController.getDownstreamTransportationSubCategoryWiseScope3Emission);
router.get('/get-upstreamLease-sub-category-wise-scope3-emission', auth, reportingController.getUpstreamLeaseSubCategoryWiseScope3Emission);
router.get('/get-downstreamLease-sub-category-wise-scope3-emission', auth, reportingController.getDownstreamLeaseSubCategoryWiseScope3Emission);

module.exports = router;
