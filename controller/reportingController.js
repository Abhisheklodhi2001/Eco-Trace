const Joi = require("joi");
const { calculateEmission, calculateScop3Emission } = require("../utils/calculationEmission");
const Reqporting = require('../models/reporting');
const { getSelectedColumn } = require("../models/common");

exports.getFacilityWiseScope = async (req, res) => {
    try {
        const schema = Joi.object({
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            }),
            facility_id: Joi.string().required().messages({
                "any.required": "Facility id is required",
                "string.empty": "Facikity id cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facility_id, year } = req.query;

        let facilities = await Reqporting.getFacilityById(facility_id);

        let totalScope1 = 0;
        let totalScope2 = 0;
        let totalScope3 = 0;

        facilities = await Promise.all(
            facilities.map(async (facility) => {

                let scope1 = 0;
                let scope2 = 0;
                let scope3 = 0;

                // Scope 1
                const [
                    combustion,
                    refrigerants,
                    fireExt,
                    companyVehicles,
                ] = await Promise.all([
                    Reqporting.getCombustionEmission(facility.id, year),
                    Reqporting.Allrefrigerants(facility.id, year),
                    Reqporting.Allfireextinguisher(facility.id, year),
                    Reqporting.getAllcompanyownedvehicles(facility.id, year),
                ]);

                scope1 += calculateEmission(combustion);
                scope1 += calculateEmission(refrigerants);
                scope1 += calculateEmission(fireExt);
                scope1 += calculateEmission(companyVehicles);

                // Scope 2
                const [electricity, steam] = await Promise.all([
                    Reqporting.getAllelectricity(facility.id, year),
                    Reqporting.getAllheatandsteam(facility.id, year),
                ]);

                scope2 += calculateEmission(electricity);
                scope2 += calculateEmission(steam);

                // Scope 3
                const [
                    purchaseGoods,
                    flightTravel,
                    hotelStay,
                    otherTransport,
                    procSoldProducts,
                    soldProducts,
                    wasteEOL,
                    waterSupply,
                    employeeCommute,
                    homeOffice,
                    wasteGenerated,
                    upstreamLease,
                    downstreamLease,
                    franchise,
                    investment,
                    upstreamVehicle,
                    downstreamVehicle,
                ] = await Promise.all([
                    Reqporting.purchaseGoodsDetails(facility.id, year),
                    Reqporting.flight_travelDetails(facility.id, year),
                    Reqporting.hotel_stayDetails(facility.id, year),
                    Reqporting.other_modes_of_transportDetails(facility.id, year),
                    Reqporting.processing_of_sold_products_categoryDetails(facility.id, year),
                    Reqporting.sold_product_categoryDetails(facility.id, year),
                    Reqporting.endoflife_waste_typeDetails(facility.id, year),
                    Reqporting.water_supply_treatment_categoryDetails(facility.id, year),
                    Reqporting.employee_commuting_categoryDetails(facility.id, year),
                    Reqporting.homeoffice_categoryDetails(facility.id, year),
                    Reqporting.waste_generated_emissionsDetails(facility.id, year),
                    Reqporting.upstreamLease_emissionDetails(facility.id, year),
                    Reqporting.downstreamLease_emissionDetails(facility.id, year),
                    Reqporting.franchise_categories_emissionDetails(facility.id, year),
                    Reqporting.investment_emissionsDetails(facility.id, year),
                    Reqporting.upstream_vehicle_storage_emissions(facility.id, year),
                    Reqporting.downstream_vehicle_storage_emissions(facility.id, year)
                ]);

                scope3 += calculateEmission(purchaseGoods);
                scope3 += calculateEmission(flightTravel);
                scope3 += calculateEmission(hotelStay);
                scope3 += calculateEmission(otherTransport);
                scope3 += calculateEmission(procSoldProducts);
                scope3 += calculateEmission(soldProducts);
                scope3 += calculateEmission(wasteEOL);
                scope3 += calculateEmission(waterSupply);
                scope3 += calculateEmission(employeeCommute);
                scope3 += calculateEmission(homeOffice);
                scope3 += calculateEmission(wasteGenerated);
                scope3 += calculateEmission(upstreamLease);
                scope3 += calculateEmission(downstreamLease);
                scope3 += calculateEmission(franchise);
                scope3 += calculateEmission(investment);
                scope3 += calculateEmission(upstreamVehicle);
                scope3 += calculateEmission(downstreamVehicle);
                scope3 += calculateScop3Emission(combustion);
                scope3 += calculateScop3Emission(companyVehicles);
                scope3 += calculateScop3Emission(electricity);
                scope3 += calculateScop3Emission(steam);

                scope1 = Number(parseFloat(scope1 / 1000).toFixed(3));
                scope2 = Number(parseFloat(scope2 / 1000).toFixed(3));
                scope3 = Number(parseFloat(scope3 / 1000).toFixed(3));

                totalScope1 += scope1;
                totalScope2 += scope2;
                totalScope3 += scope3;

                return {
                    id: facility.id,
                    facility: facility.AssestType,
                    scope1,
                    scope2,
                    scope3,
                    total: scope1 + scope2 + scope3
                };
            })
        );
        return res.status(200).json({
            success: true,
            message: "Facilities scope emissions",
            data: facilities,
            totals: {
                scope1: totalScope1,
                scope2: totalScope2,
                scope3: totalScope3,
                total: totalScope1 + totalScope2 + totalScope3
            }
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: 'Interval server error ' + error.message, success: false })
    }
};

exports.getCategoryWiseScope1Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            combustionRaw,
            refrigerantsRaw,
            fireExtRaw,
            companyVehiclesRaw
        ] = await Promise.all([
            Reqporting.getCombustionScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.AllrefrigerantsScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.AllfireextinguisherScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllcompanyownedvehiclesScope1Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const combustion = fillMonthly(combustionRaw);
        const refrigerants = fillMonthly(refrigerantsRaw);
        const fireExt = fillMonthly(fireExtRaw);
        const vehicles = fillMonthly(companyVehiclesRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Stationary Combustion",
                ...combustion,
                total: Object.values(combustion).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Refrigerants",
                ...refrigerants,
                total: Object.values(refrigerants).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Fire Extinguisher",
                ...fireExt,
                total: Object.values(fireExt).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Company Owned Vehicles",
                ...vehicles,
                total: Object.values(vehicles).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Scope 1" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getCategoryWiseScope2Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            electricityRaw, steamRaw
        ] = await Promise.all([
            Reqporting.getAllelectricityScope2Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllheatandsteamScope2Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const electricity = fillMonthly(electricityRaw);
        const steam = fillMonthly(steamRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Electricity",
                ...electricity,
                total: Object.values(electricity).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Heat and Steam",
                ...steam,
                total: Object.values(steam).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Scope 2" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            combustionRaw,
            companyVehiclesRaw,
            electricityRaw,
            steamRaw,
            purchaseGoodsRaw,
            flightTravelRaw,
            hotelStayRaw,
            otherTransportRaw,
            procSoldProductsRaw,
            soldProductsRaw,
            wasteEOLRaw,
            waterSupplyRaw,
            employeeCommuteRaw,
            homeOfficeRaw,
            wasteGeneratedRaw,
            upstreamLeaseRaw,
            downstreamLeaseRaw,
            franchiseRaw,
            investmentRaw,
            upstreamVehicleRaw,
            downstreamVehicleRaw
        ] = await Promise.all([
            Reqporting.getCombustionScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllcompanyownedvehiclesScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllelectricityScope2Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllheatandsteamScope2Emission(facilitiesdata, year, finalyeardata),
            Reqporting.purchaseGoodsDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.flight_travelDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.hotel_stayDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.other_modes_of_transportDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.processing_of_sold_products_categoryDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.sold_product_categoryDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.endoflife_waste_typeDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.water_supply_treatment_categoryDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.employee_commuting_categoryDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.homeoffice_categoryDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.waste_generated_emissionsDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.upstreamLease_emissionDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.downstreamLease_emissionDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.franchise_categories_emissionDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.investment_emissionsDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.upstream_vehicle_storage_emissionsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.downstream_vehicle_storage_emissionsScope3Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        function fillMonthlyScope3(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.scope3_emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const combustion = fillMonthlyScope3(combustionRaw);
        const companyVehicles = fillMonthlyScope3(companyVehiclesRaw);
        const electricity = fillMonthlyScope3(electricityRaw);
        const steam = fillMonthlyScope3(steamRaw);
        const purchaseGoods = fillMonthly(purchaseGoodsRaw);
        const flightTravel = fillMonthly(flightTravelRaw);
        const hotelStay = fillMonthly(hotelStayRaw);
        const otherTransport = fillMonthly(otherTransportRaw);
        const procSoldProducts = fillMonthly(procSoldProductsRaw);
        const soldProducts = fillMonthly(soldProductsRaw);
        const wasteEOL = fillMonthly(wasteEOLRaw);
        const waterSupply = fillMonthly(waterSupplyRaw);
        const employeeCommute = fillMonthly(employeeCommuteRaw);
        const homeOffice = fillMonthly(homeOfficeRaw);
        const wasteGenerated = fillMonthly(wasteGeneratedRaw);
        const upstreamLease = fillMonthly(upstreamLeaseRaw);
        const downstreamLease = fillMonthly(downstreamLeaseRaw);
        const franchise = fillMonthly(franchiseRaw);
        const investment = fillMonthly(investmentRaw);
        const upstreamVehicle = fillMonthly(upstreamVehicleRaw);
        const downstreamVehicle = fillMonthly(downstreamVehicleRaw);

        const fuelEnergy = {};
        months.forEach(m => {
            fuelEnergy[m] =
                combustion[m] +
                companyVehicles[m] +
                electricity[m] +
                steam[m];
        });
        fuelEnergy.total = Object.values(fuelEnergy).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0);

        const bussinessTravel = {};
        months.forEach(m => {
            bussinessTravel[m] =
                flightTravel[m] +
                hotelStay[m] +
                otherTransport[m];
        });
        bussinessTravel.total = Object.values(bussinessTravel).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Purchased goods and services",
                ...purchaseGoods,
                total: Object.values(purchaseGoods).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            // {
            //     category: "Flight Travel",
            //     ...flightTravel,
            //     total: Object.values(flightTravel).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            // },
            // {
            //     category: "Hotel Stay",
            //     ...hotelStay,
            //     total: Object.values(hotelStay).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            // },
            // {
            //     category: "Other Modes Of Transport",
            //     ...otherTransport,
            //     total: Object.values(otherTransport).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            // },
            {
                category: "Fuel and Energy-related Activities",
                ...fuelEnergy
            },
            {
                category: "Upstream Transportation and Distribution",
                ...upstreamVehicle,
                total: Object.values(upstreamVehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Water Supply and Treatment",
                ...waterSupply,
                total: Object.values(waterSupply).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Waste generated in operations",
                ...wasteGenerated,
                total: Object.values(wasteGenerated).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Business Travel",
                ...bussinessTravel
            },
            {
                category: "Employee Commuting",
                ...employeeCommute,
                total: Object.values(employeeCommute).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Home Office",
                ...homeOffice,
                total: Object.values(homeOffice).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Upstream Leased Assets",
                ...upstreamLease,
                total: Object.values(upstreamLease).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Downstream Leased Assets",
                ...downstreamLease,
                total: Object.values(downstreamLease).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Processing of Sold Products",
                ...procSoldProducts,
                total: Object.values(procSoldProducts).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Use of Sold Products",
                ...soldProducts,
                total: Object.values(soldProducts).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "End-of-Life Treatment of Sold Products",
                ...wasteEOL,
                total: Object.values(wasteEOL).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Downstream Transportation and Distribution",
                ...downstreamVehicle,
                total: Object.values(downstreamVehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Franchises",
                ...franchise,
                total: Object.values(franchise).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            // {
            //     category: "Investments",
            //     ...investment,
            //     total: Object.values(investment).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            // },
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Scope 3" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getStationaryCombustionSubCategoryWiseScope1Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            LiquidfuelsRaw,
            SolidFuelsRaw,
            BiomassRaw,
            GaseousFuelRaw,
            BiofuelRaw,
            BiogasRaw
        ] = await Promise.all([
            Reqporting.getAllLiquidFuelScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllSolidFuelScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllBiomassScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllGaseousFuelScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllBioFuelScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllBiogasScope1Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const Liquidfuels = fillMonthly(LiquidfuelsRaw);
        const SolidFuels = fillMonthly(SolidFuelsRaw);
        const Biomass = fillMonthly(BiomassRaw);
        const GaseousFuel = fillMonthly(GaseousFuelRaw);
        const Biofuel = fillMonthly(BiofuelRaw);
        const Biogas = fillMonthly(BiogasRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Liquid fuels",
                ...Liquidfuels,
                total: Object.values(Liquidfuels).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Solid fuels",
                ...SolidFuels,
                total: Object.values(SolidFuels).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Biomass",
                ...Biomass,
                total: Object.values(Biomass).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Gaseous Fuel",
                ...GaseousFuel,
                total: Object.values(GaseousFuel).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Biofuel",
                ...Biofuel,
                total: Object.values(Biofuel).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Biogas",
                ...Biogas,
                total: Object.values(Biogas).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getCompanyVehiclesSubCategoryWiseScope1Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            DeliveryVehicleRaw,
            PassengerVehicleRaw
        ] = await Promise.all([
            Reqporting.getAllDeliveryVehicleScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllPassengerVehicleScope1Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const DeliveryVehicle = fillMonthly(DeliveryVehicleRaw);
        const PassengerVehicle = fillMonthly(PassengerVehicleRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Delivery Vehicle",
                ...DeliveryVehicle,
                total: Object.values(DeliveryVehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Passenger Vehicle",
                ...PassengerVehicle,
                total: Object.values(PassengerVehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getElectricitySubCategoryWiseScope2Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });
        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;

        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const LocationRaw = await Reqporting.getAllLocationBasedScope2Emission(facilitiesdata, year, finalyeardata);
        const MarketRaw = await Reqporting.getAllMarketBasedScope2Emission(facilitiesdata, year, finalyeardata);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }
        const Location = fillMonthly(LocationRaw);
        const Market = fillMonthly(MarketRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Location Based",
                ...Location,
                total: Object.values(Location).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Market Based",
                ...Market,
                total: Object.values(Market).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];
        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getHeatAndSteamSubCategoryWiseScope1Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            heatsteamRaw, coolingRaw
        ] = await Promise.all([
            Reqporting.getAllDistrictHeatAndSteamScope2Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllDistrictCoolingScope2Emission(facilitiesdata, year, finalyeardata)
        ]);


        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const heatsteam = fillMonthly(heatsteamRaw);
        const cooling = fillMonthly(coolingRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "District heat and steam",
                ...heatsteam,
                total: Object.values(heatsteam).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "District Cooling",
                ...cooling,
                total: Object.values(cooling).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getPurchaseGoodsAndServicesSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            standardGoodsRaw,
            capitalGoodsRaw,
            standardServicesRaw
        ] = await Promise.all([
            Reqporting.getAllStandardGoodsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllCapitalGoodsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllStandardServicesScope3Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const standardGoods = fillMonthly(standardGoodsRaw);
        const capitalGoods = fillMonthly(capitalGoodsRaw);
        const standardServices = fillMonthly(standardServicesRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Standard Goods",
                ...standardGoods,
                total: Object.values(standardGoods).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Capital Goods",
                ...capitalGoods,
                total: Object.values(capitalGoods).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Standard Services",
                ...standardServices,
                total: Object.values(standardServices).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({ success: true, data: response });
    } catch (erorr) {
        return res.status(500).json({ error: true, message: 'Interval server error ' + error.message, success: false })
    }
};

exports.getFuelRelatedServicesSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;

        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            combustionRaw,
            companyVehiclesRaw,
            electricityRaw,
            steamRaw
        ] = await Promise.all([
            Reqporting.getCombustionScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllcompanyownedvehiclesScope1Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllelectricityScope2Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllheatandsteamScope2Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.scope3_emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const combustion = fillMonthly(combustionRaw);
        const vehicles = fillMonthly(companyVehiclesRaw);
        const electricity = fillMonthly(electricityRaw);
        const steam = fillMonthly(steamRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Stationary Combustion",
                ...combustion,
                total: Object.values(combustion).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Company Owned Vehicles",
                ...vehicles,
                total: Object.values(vehicles).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Electricity",
                ...electricity,
                total: Object.values(electricity).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Heat and Steam",
                ...steam,
                total: Object.values(steam).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: 'Interval server error ' + error.message, success: false });
    }
};

exports.getWaterSupplyTreatmentSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });
        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            waterWithdrawnRaw,
            waterDischargeRaw
        ] = await Promise.all([
            Reqporting.getAllWhaterWithdrawnScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterDischargeScope3Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const waterWithdrawn = fillMonthly(waterWithdrawnRaw);
        const waterDischarge = fillMonthly(waterDischargeRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Water withdrawn",
                ...waterWithdrawn,
                total: Object.values(waterWithdrawn).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Water discharged",
                ...waterDischarge,
                total: Object.values(waterDischarge).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };

        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);

        response.push(totalRow);

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getWasteGeneratedSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });
        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }

        let months = finalyear;

        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            waterGeneratedReuseRaw,
            waterGeneratedRecyclingRaw,
            waterGeneratedIncinerationRaw,
            waterGeneratedCompostingRaw,
            waterGeneratedLandfillRaw,
            waterGeneratedAnaerobicDigestionRaw
        ] = await Promise.all([
            Reqporting.getAllWaterGeneratedReuseScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterGeneratedRecyclingScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterGeneratedIncinerationScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterGeneratedCompostingScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterGeneratedLandfillScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.getAllWaterGeneratedAnaerobicDigestionScope3Emission(facilitiesdata, year, finalyeardata)
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const waterGeneratedReuse = fillMonthly(waterGeneratedReuseRaw);
        const waterGeneratedRecycling = fillMonthly(waterGeneratedRecyclingRaw);
        const waterGeneratedIncineration = fillMonthly(waterGeneratedIncinerationRaw);
        const waterGeneratedComposting = fillMonthly(waterGeneratedCompostingRaw);
        const waterGeneratedLandfill = fillMonthly(waterGeneratedLandfillRaw);
        const waterGeneratedAnaerobicDigestion = fillMonthly(waterGeneratedAnaerobicDigestionRaw);

        /// ---- Build Final Response ---- ///
        let response = [
            {
                category: "Reuse",
                ...waterGeneratedReuse,
                total: Object.values(waterGeneratedReuse).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Recycling",
                ...waterGeneratedRecycling,
                total: Object.values(waterGeneratedRecycling).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Incineration",
                ...waterGeneratedIncineration,
                total: Object.values(waterGeneratedIncineration).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Composting",
                ...waterGeneratedComposting,
                total: Object.values(waterGeneratedComposting).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Landfill",
                ...waterGeneratedLandfill,
                total: Object.values(waterGeneratedLandfill).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Anaerobic Digestion",
                ...waterGeneratedAnaerobicDigestion,
                total: Object.values(waterGeneratedAnaerobicDigestion).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];
        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });
        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getBusinessTravelSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }
        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";
        const [
            flightTravelRaw,
            hotelStayRaw,
            otherTransportRaw
        ] = await Promise.all([
            Reqporting.flight_travelDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.hotel_stayDetailsScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.other_modes_of_transportDetailsScope3Emission(facilitiesdata, year, finalyeardata),
        ]);
        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const flightTravel = fillMonthly(flightTravelRaw);
        const hotelStay = fillMonthly(hotelStayRaw);
        const otherTransport = fillMonthly(otherTransportRaw);

        /// ---- Build Final Response ---- ///

        let response = [
            {
                category: "Flight Travel",
                ...flightTravel,
                total: Object.values(flightTravel).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Hotel Stay",
                ...hotelStay,
                total: Object.values(hotelStay).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Other Modes Of Transport",
                ...otherTransport,
                total: Object.values(otherTransport).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getUpstreamTransportationSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }
        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            vehicleRaw,
            storageRaw
        ] = await Promise.all([
            Reqporting.upstreamVehiclesScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.upstreamStorageFacilityScope3Emission(facilitiesdata, year, finalyeardata),
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const vehicle = fillMonthly(vehicleRaw);
        const storage = fillMonthly(storageRaw);

        /// ---- Build Final Response ---- ///

        let response = [
            {
                category: "Vehicles",
                ...vehicle,
                total: Object.values(vehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Storage facility",
                ...storage,
                total: Object.values(storage).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getDownstreamTransportationSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }
        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            vehicleRaw,
            storageRaw
        ] = await Promise.all([
            Reqporting.downsteamVehiclesScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.downstreamStorageFacilityScope3Emission(facilitiesdata, year, finalyeardata),
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const vehicle = fillMonthly(vehicleRaw);
        const storage = fillMonthly(storageRaw);

        /// ---- Build Final Response ---- ///

        let response = [
            {
                category: "Vehicles",
                ...vehicle,
                total: Object.values(vehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Storage facility",
                ...storage,
                total: Object.values(storage).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getUpstreamLeaseSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }
        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            facilityRaw,
            vehicleRaw
        ] = await Promise.all([
            Reqporting.upsteamFacilityScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.upsteamVehicleFacilityScope3Emission(facilitiesdata, year, finalyeardata),
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const facility = fillMonthly(facilityRaw);
        const vehicle = fillMonthly(vehicleRaw);

        /// ---- Build Final Response ---- ///

        let response = [
            {
                category: "Facilities",
                ...facility,
                total: Object.values(facility).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Vehicles",
                ...vehicle,
                total: Object.values(vehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};

exports.getDownstreamLeaseSubCategoryWiseScope3Emission = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const schema = Joi.object({
            facilities: Joi.string().required().messages({
                "any.required": "Facilities id is required",
                "string.empty": "Facilities id cannot be empty"
            }),
            year: Joi.string().required().messages({
                "any.required": "Year is required",
                "string.empty": "Year cannot be empty"
            })
        });
        const { error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, error: error.details[0].message, message: error.details[0].message });

        const { facilities, year } = req.query;
        let finalyear = "";
        let finalyeardata = "2";
        const financialyear = await getSelectedColumn("financial_year_setting", ` where user_id = '${user_id}'`, "*");
        if (financialyear.length > 0) {
            let final_year = financialyear[0].financial_year;
            if (final_year == "2") {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "1";
            }
        } else {
            finalyear = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            finalyeardata = "2";
        }
        let months = finalyear;
        let facilitiesdata = facilities != '0' ? facilities.replace(/\[|\]/g, "") : "0";

        const [
            facilityRaw,
            vehicleRaw
        ] = await Promise.all([
            Reqporting.downsteamFacilityScope3Emission(facilitiesdata, year, finalyeardata),
            Reqporting.downsteamVehicleFacilityScope3Emission(facilitiesdata, year, finalyeardata),
        ]);

        function fillMonthly(raw) {
            let obj = {};
            months.forEach(m => obj[m] = 0);
            raw.forEach(r => {
                if (r.month in obj) {
                    obj[r.month] = Number(parseFloat(r.emission / 1000).toFixed(3) || 0);
                }
            });
            return obj;
        }

        const facility = fillMonthly(facilityRaw);
        const vehicle = fillMonthly(vehicleRaw);

        /// ---- Build Final Response ---- ///

        let response = [
            {
                category: "Facilities",
                ...facility,
                total: Object.values(facility).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            },
            {
                category: "Vehicles",
                ...vehicle,
                total: Object.values(vehicle).reduce((a, b) => Number(parseFloat(a + b).toFixed(3)), 0)
            }
        ];

        /// ---- Add Total Row ---- ///
        let totalRow = { category: "Total" };
        months.forEach(m => {
            totalRow[m] = response.reduce((sum, row) => sum + Number(row[m]), 0);
        });

        totalRow.total = response.reduce((sum, row) => sum + Number(row.total), 0);
        response.push(totalRow);
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server erorr " + error.message, success: false })
    }
};