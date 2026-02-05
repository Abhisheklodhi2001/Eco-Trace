const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset,
    category,
    subcategory
  ) => {
    return db.query(`select  'Purchase Goods' as category,pgc.product_category,pgc.productcodestandard, pgcef.product as Product, top.typesofpurchasename as Type_of_Purchase, pgc.unit, pgc.productcode, dbu.tenantName as user_name, \
                     pgc.emission as Emission,  pgc.year as Years, pgc.month as Months, pgc.supplier as vendor, pgc.supplierspecificEF as vendor_ef, pgc.supplierunit as vendor_ef_unit, pgc.valuequantity as quantity \
                     from  purchase_goods_categories pgc,   \`dbo.typesofpurchase\`   top,  \`dbo.tenants\` dbu,  \
                     purchase_goods_categories_ef pgcef where  pgc.year =${year} and pgc.month in (${month}) and pgc.status ='S' AND  top.typesofpurchasename LIKE '%${category}%' AND pgcef.product LIKE '%${subcategory}%' \
                       and pgc.facilities in (${facility}) and dbu.id= pgc.user_id \
                     and pgc.product_category = pgcef.id  and top.id = pgc.typeofpurchase ORDER BY pgc.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },
  getPurchaseGoodsReportCount: async (
    facility,
    year,
    month,
  ) => {
    return db.query(`SELECT COUNT(*) AS total FROM purchase_goods_categories pgc WHERE pgc.year = ${year} AND pgc.month IN (${month})AND pgc.status = 'S' AND pgc.facilities IN (${facility})`);
  },

  getReportCombustionEmissionFuel: async (user_id, facility, year, month) => {
    return await db.query(`select COALESCE('Stationary Combustion', '')  as  tablename,B.Id as subcategoryID,B.Item as subcatName,A.ReadingValue as readingValue,A.Unit as unit,A.Status as status,Year as year ,Month as month, A.Scope3GHGEmission as emission,BlendType as blendType,E.scope3_kgCO2e_kg,E.scope3_kg_CO2e_litres,E.scope3_kgCO2e_kwh,E.scope3_kgCO2e_tonnes,E.kgCO2e_kg,E.kgCO2e_kwh,E.cv_perlitre,E.kgCO2e_litre,E.kgCO2e_tonnes, BlendPercent as blendPercent,A.*,TypeName as typeName,facility_id  from stationarycombustionde A  LEFT JOIN  subcategoryseeddata B ON B.Id  = A.SubCategoriesID JOIN  stationarycombustion E ON E.SubCatTypeID  = A.TypeID AND TRIM(E.Item) = TRIM(A.TypeName) where A.facility_id= ${facility} AND A.year = ${year} AND A.month IN (${month}) AND status = 'S' GROUP BY A.id ORDER BY A.id DESC`);
  },

  getReportAllelectricityFuel: async (user_id, facility, year, month) => {
    return await db.query(`SELECT 
              COALESCE('Electricity', '')  as  tablename,
              S.Id AS subcategoryID,
              S.Item AS subcatName,
              A.Unit AS unit,
              A.Status AS status,
              A.months AS month,
              A.year AS year,
              A.scop3_GHGEmission AS emission,
              A.TypeName AS typeName,
              A.readingValue AS readingValue,
              A.FileName AS FileName,
              A.RegionID AS RegionID,
              A.emission_factor AS emission_factor,
              A.SourceName AS SourceName,
              A.user_id AS user_id,
              A.id AS id,
              A.facilities,
              B.RegionName
            FROM \`dbo.renewableelectricityde\` A
            LEFT JOIN (
                SELECT RegionID, MIN(RegionName) AS RegionName
                FROM \`dbo.electricity\`
                GROUP BY RegionID
            ) B ON B.RegionID = A.RegionID
            LEFT JOIN \`subcategoryseeddata\` S ON S.Id = A.SubCategorySeedID
            WHERE A.facilities = ${facility}
              AND A.year = ${year}
              AND A.months IN (${month})
              AND status = 'S'
            ORDER BY A.id DESC`);
  },

  getReportAllheatandsteamScope3: async (user_id, facility, year, month) => {
    return await db.query(`SELECT COALESCE('Heat and Steam', '') AS tablename, S.Id AS subcategoryID, S.Item AS subcatName, A.Unit AS unit, CASE WHEN A.Status = 'P' THEN 'Pending' ELSE 'Approved' END AS status, A.months AS month, A.scop3GHGEmission AS emission, B.Item AS typeName, A.* FROM \`dbo.heatandsteamde\` A LEFT JOIN subcategoryseeddata S ON S.Id = A.SubCategorySeedID LEFT JOIN \`dbo.heatandsteam\` B ON B.ID = A.typeID WHERE A.facilities = ${facility} AND A.year = ${year} AND A.months IN (${month}) AND status = 'S' ORDER BY A.id DESC`);
  },

  getReportAllVehiclede: async (user_id, facility, year, month) => {
    return await db.query(`SELECT COALESCE('Company Owned Vehicles', '') AS tablename, S.Id AS subcategoryID, S.Item AS subcatName, A.Unit AS unit, A.Status AS status, A.months AS month, A.Scope3_GHGEmission AS emission, B.Item AS typeName, A.* FROM \`dbo.vehiclede\` A LEFT JOIN subcategoryseeddata S ON S.Id = A.SubCategorySeedID LEFT JOIN companyownedvehicles B ON B.ID = A.vehicleTypeID WHERE A.facilities = ${facility} AND A.year = ${year} AND A.months IN (${month}) AND status = 'S' ORDER BY A.id DESC`);
  },

  getSingleReportCount: async (facility, year, monthCondition, table_name, facility_column_name) => {
    let monthFilter = monthCondition ? `AND ${monthCondition}` : '';

    const sql = `
      SELECT COUNT(*) AS total 
      FROM ${table_name}  
      WHERE year = ${year} 
      ${monthFilter}
      AND status = 'S' 
      AND ${facility_column_name} IN (${facility})
    `;

    return db.query(sql);
  },


  getDownStreamVehicleReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select a.vehicle_type as category, a.sub_category as subcategory, a.no_of_vehicles as quantity,a.unit_of_mass as  unit , a.emission, a.facility_id as facility, a.distance_travelled_km, a.mass_of_product_trans , a.storage_facility_type, a.year, a.month, a.avg_no_of_days, a.area_occupied, a.no_of_vehicles \
                    ,dbu.tenantName as user_name from  downstream_vehicle_storage_emissions a, \`dbo.tenants\` dbu  where  dbu.id= a.user_id and a.status  ='S'  and a.facility_id ='${facility}' and a.year ='${year}' and a.month in (${month}) ORDER BY a.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getUpStreamVehicleReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select a.vehicle_type, vehicletypes.vehicle_type AS category, a.sub_category as subcategory, a.no_of_vehicles as quantity,a.unit_of_mass as  unit , a.emission, a.facility_id as facility, a.distance_travelled_km, a.mass_of_product_trans , a.storage_facility_type, a.year, a.month, a.avg_no_of_days, a.area_occupied, a.no_of_vehicles \
                    ,dbu.tenantName as user_name from  upstream_vehicle_storage_emissions a, \`dbo.tenants\` dbu, vehicletypes   where  dbu.id= a.user_id and a.status  ='S'  and a.facility_id ='${facility}' and a.year ='${year}' AND vehicletypes.id = a.vehicle_type AND a.month in (${month}) ORDER BY a.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFranchiseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.franchise_type as category, f.sub_category as subcategory, f.franchise_space as quantity,f.unit as  unit , f.emission, f.facility_id as facility, f.year, f.month,  dbu.tenantName as user_name\
                    from  franchise_categories_emission f, \`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getInvestmentEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category as category, f.sub_category as subcategory, (CASE f.equity_share WHEN 0 THEN f.equity_of_projectcost ELSE f.equity_share END)  as quantity,f.unit as  unit , f.emission, f.facilities as facility, f.year, f.month,dbu.tenantName as user_name \
                    from  investment_emissions f, \`dbo.tenants\` dbu  where dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getStationaryCombustionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.SubCategoriesID as category_id, f.TypeName as subcategory, f.ReadingValue as quantity,f.Unit as  unit ,f.GHGEmission as emission, f.facility_id as facility, f.year, f.month, f.BlendType, f.BlendPercent, dbu.tenantName as user_name \
                    from  stationarycombustionde f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month IN(${month}) ORDER BY f.SubmissionDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },


  getCategoryBySeedId: async (id) => {
    return db.query("select item from subcategoryseeddata where id = ?", [id]);
  },

  getUpstreamLeaseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category, f.sub_category as subcategory, f.franchise_space as quantity, f.unit , f.emission, f.facility_id as facility, f.year, f.month, f.scope1_emission, f.scope2_emission, f.no_of_vehicles, f.distance_travelled, f.status,  dbu.tenantName as user_name\
                    from  upstreamLease_emission f, \`dbo.tenants\` dbu where f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' AND dbu.Id = f.user_id AND f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getDownstreamLeaseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category, f.sub_category as subcategory, f.franchise_space as quantity, f.unit , f.emission, f.facility_id as facility, f.year, f.month, f.scope1_emission, f.scope2_emission, f.no_of_vehicles, f.distance_travelled, f.status, dbu.tenantName as user_name \
                    from  downstreamLease_emission f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getWasteGeneratedEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.product AS category, f.waste_type AS subcategory, f.method AS method, f.total_waste as quantity, unit , f.emission, f.facility_id as facility, f.year, f.month, dbu.tenantName as user_name \
                    from  waste_generated_emissions f, \`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFlightTravelReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.flight_Type as flight_type, f.flight_Class as flight_class, 'from', 'to', f.no_of_passengers, f.distance as distance,f.return_flight,   f.emission, f.distance, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  flight_travel  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getOtherTransportReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.mode_of_trasport as vehicle_type,type,  f.fuel_type as fuel_type, f.no_of_passengers, f.distance_travelled as distance,f.no_of_trips , f.emission, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  other_modes_of_transport  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHotelStayReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.country_of_stay,f.type_of_hotel ,  f.no_of_occupied_rooms, 	f.no_of_nights_per_room, f.emission, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  hotel_stay  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getEmployeeCommutingReport: async (
    user_id,
    facility,
    year,
    pageSize,
    offset
  ) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities ='${facility}' and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(`SELECT f.*, dbu.tenantName AS user_name, C.category, S.subcategory FROM employee_commuting_category f, \`dbo.tenants\` dbu, employee_community_typeoftransport C, employee_community_typeoftransport S WHERE dbu.id = f.user_id AND C.category_id = f.typeoftransport AND S.id = f.subtype AND f.status = 'S' AND f.facilities = '${facility}' AND f.year = '${year}' GROUP BY f.id ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHomeOfficeReport: async (
    user_id,
    facility,
    year,
    //month,
    pageSize,
    offset
  ) => {
    /*return db.query(`select typeofhomeoffice, noofemployees, noofdays, noofmonths, emission, facilities, year, month \
                    from  homeoffice_category where status  ='S'  and facilities ='${facility}' and year ='${year}' and month in (${month}) ORDER BY created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);*/

    return db.query(`select f.typeofhomeoffice, f.noofemployees, f.noofdays, f.noofmonths, f.emission, f.facilities, f.year, month,dbu.tenantName as user_name \
                    from  homeoffice_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getSoldProductReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.type , f.productcategory, f.no_of_Items ,f.no_of_Items_unit ,f.electricity_use, f.electricity_usage, f.electricity_per_usage,dbu.tenantName as user_name, \
                     f.fuel_type, f.fuel_consumed, f.fuel_consumed_usage, f.fuel_consumed_per_usage, f.referigentused, f.referigerantleakage, f.referigerant_usage, f.referigerant_per_usage ,f.emission, f.facilities, f.year, f.month \
                    from  sold_product_category  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },
  getSoldProductbyId: async (id) => {
    return db.query("select item from sold_product_category_ef where id = ?", [
      id,
    ]);
  },

  getEndOfLifeTreatmentReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.waste_type, f.subcategory, f.total_waste, f.waste_unit, f.emission, f.landfill, f.combustion, f.recycling, f.composing, f.facilities, f.year, f.month ,dbu.tenantName as user_name\
                    from  endof_lifetreatment_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getWasteTypebyId: async (id) => {
    return db.query("select type from endoflife_waste_type where id = ?", [
      id,
    ]);
  },

  getProOfSoldGoodsReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.intermediate_category as category, f.calculation_method, f.processing_acitivity, f.sub_activity, f.emission, f.unit, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  processing_of_sold_products_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getRefrigerantReport: async (user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.refamount , f.GHGEmission as emission, f.unit, f.subCategoryTypeId as sub_id, f.TypeName, f.facilities, f.year, f.months,dbu.tenantName as user_name \
                    from  \`dbo.refrigerantde\`  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month})  ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getReferigerantbyId: async (id) => {
    return db.query("select item from \`dbo.refrigents\` where subCatTypeID = ?", [
      id,
    ]);
  },

  getFireExtinguisherReport: async (user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.numberofextinguisher , f.GHGEmission as emission, f.unit, f.quantityOfCO2makeup as quantity, f.SubCategorySeedID as sub_id, f.facilities, f.year, f.months, dbu.tenantName as user_name \
                    from  \`dbo.fireextinguisherde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFireExtbyId: async (id) => {
    return db.query("select item from \`dbo.fireextinguisher\` where SubCategorySeedID = ?", [
      id,
    ]);
  },

  getElecricityReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.readingValue as reading_value, f.unit, f.GHGEmission as emission, f.energy, f.sourcename, f.facilities, f.year, f.months, f.SubCategorySeedID, dbu.tenantName as user_name\
                    from  \`dbo.renewableelectricityde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHeatandSteamReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.readingValue as reading_value, f.unit, f.GHGEmission as emission, energy, f.facilities, f.year, f.months ,dbu.tenantName as user_name \
                    from  \`dbo.heatandsteamde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },


  getWaterSupplyandTreatment: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.water_supply ,f.water_treatment, f.water_supply_unit, f.water_treatment_unit, f.emission, f.facilities, f.year, f.month, dbu.tenantName as user_name \
                    from  \`water_supply_treatment_category\`  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getCompanyOwnedVehicles: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.vehicleTypeID, f.NoOfVehicles as No_of_vehicles , f.GHGEmission as emission, f.Unit as unit ,  f.ModeOfDE as Mode_of_vehicle , f.ModeofDEID, f.AvgPeoplePerTrip, f.TotalnoOftripsPerVehicle, f.facilities, f.year, f.months, f.value,dbu.tenantName as user_name \
                    from  \`dbo.vehiclede\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months IN(${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getVehicle: async (id) => {
    return db.query("select item, ItemType from \`companyownedvehicles\` where ID = ?", [
      id,
    ]);
  },
};
