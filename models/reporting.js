const db = require("../utils/database");

module.exports = {
    getFacilityById: async (id) => {
        return await db.query(`SELECT id, id AS ID, AssestName AS AssestType,AssestType AS name, CountryId AS country_code FROM \`dbo.facilities\` WHERE id IN (${id})`);
    },

    getCombustionEmission: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}'  and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        return db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year from stationarycombustionde A ${where}`);
    },

    Allrefrigerants: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.GHGEmission) as emission,A.Year AS emission_year,COALESCE('Refrigerants', '')  as  category   from `dbo.refrigerantde` A " + where);
    },

    Allfireextinguisher: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.GHGEmission) as emission,A.Year AS emission_year,COALESCE('Fire Extinguisher', '')  as  category    from `dbo.fireextinguisherde` A " + where);
    },

    getAllcompanyownedvehicles: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.Scope3_GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Company Owned Vehicles', '')  as  category    from `dbo.vehiclede` A  " + where);
    },

    getAllelectricity: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.GHGEmission) as emission,SUM(A.scop3_GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    getAllheatandsteam: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.scop3GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    purchaseGoodsDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}'  and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    flight_travelDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Business Travel', '')  as  category  from flight_travel A " + where);
    },

    hotel_stayDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select   SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Business Travel', '')  as  category  from hotel_stay A " + where);
    },

    other_modes_of_transportDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Business Travel', '')  as  category from other_modes_of_transport A " + where);
    },

    sold_product_categoryDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Use of Sold Products', '')  as  category   from sold_product_category A " + where);
    },

    processing_of_sold_products_categoryDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Processing of Sold Products', '')  as  category from processing_of_sold_products_category A " + where);
    },

    endoflife_waste_typeDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('End-of-Life Treatment of Sold Products', '')  as  category from endof_lifetreatment_category A " + where);
    },

    water_supply_treatment_categoryDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Water Supply and Treatment', '')  as  category from water_supply_treatment_category A " + where);
    },

    employee_commuting_categoryDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A " + where);
    },

    homeoffice_categoryDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Home Office', '')  as  category from homeoffice_category A " + where);
    },

    waste_generated_emissionsDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Waste generated in operations', '')  as  category from waste_generated_emissions A " + where);
    },

    upstreamLease_emissionDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Upstream Leased Assets', '')  as  category  from upstreamLease_emission A " + where);
    },

    downstreamLease_emissionDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Downstream Leased Assets', '')  as  category from downstreamLease_emission A " + where);
    },

    franchise_categories_emissionDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Franchises', '')  as  category  from franchise_categories_emission A  " + where);
    },

    investment_emissionsDetails: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Investments', '')  as  category  from investment_emissions A  " + where);
    },

    upstream_vehicle_storage_emissions: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Upstream Transportation and Distribution', '')  as  category from upstream_vehicle_storage_emissions A  " + where);
    },

    downstream_vehicle_storage_emissions: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstream_vehicle_storage_emissions A  " + where);
    },

    getCombustionScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}'  and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    AllrefrigerantsScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,A.Year AS emission_year,A.months AS month, COALESCE('Refrigerants', '')  as  category   from `dbo.refrigerantde` A " + where);
    },

    AllfireextinguisherScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,A.Year AS emission_year,COALESCE('Fire Extinguisher', '')  as  category, A.months AS month from `dbo.fireextinguisherde` A " + where);
    },

    getAllcompanyownedvehiclesScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.Scope3_GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Company Owned Vehicles', '')  as  category, A.months AS month from `dbo.vehiclede` A  " + where);
    },

    getAllelectricityScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select SUM(A.GHGEmission) as emission,SUM(A.scop3_GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    getAllheatandsteamScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND (A.typeID = 3 OR A.typeID = 4) And Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.scop3GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    purchaseGoodsDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}'  and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    flight_travelDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Flight Travel', '')  as  category  from flight_travel A " + where);
    },

    hotel_stayDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select   SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Hotel Stay', '')  as  category  from hotel_stay A " + where);
    },

    other_modes_of_transportDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Other Modes Of Transport', '')  as  category from other_modes_of_transport A " + where);
    },

    processing_of_sold_products_categoryDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Processing of Sold Products', '')  as  category from processing_of_sold_products_category A " + where);
    },

    sold_product_categoryDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Use of Sold Products', '')  as  category   from sold_product_category A " + where);
    },

    endoflife_waste_typeDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('End-of-Life Treatment of Sold Products', '')  as  category from endof_lifetreatment_category A " + where);
    },

    water_supply_treatment_categoryDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water Supply and Treatment', '')  as  category from water_supply_treatment_category A " + where);
    },

    employee_commuting_categoryDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A " + where);
    },

    homeoffice_categoryDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Home Office', '')  as  category from homeoffice_category A " + where);
    },

    waste_generated_emissionsDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Waste generated in operations', '')  as  category from waste_generated_emissions A " + where);
    },

    upstreamLease_emissionDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Upstream Leased Assets', '')  as  category  from upstreamLease_emission A " + where);
    },

    downstreamLease_emissionDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Leased Assets', '')  as  category from downstreamLease_emission A " + where);
    },

    franchise_categories_emissionDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Franchises', '')  as  category  from franchise_categories_emission A  " + where);
    },

    investment_emissionsDetailsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Investments', '')  as  category  from investment_emissions A  " + where);
    },

    upstream_vehicle_storage_emissionsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select  SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Upstream Transportation and Distribution', '')  as  category from upstream_vehicle_storage_emissions A  " + where);
    },

    downstream_vehicle_storage_emissionsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstream_vehicle_storage_emissions A  " + where);
    },

    getAllLiquidFuelScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 1 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllSolidFuelScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 2 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllBiomassScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 5 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllGaseousFuelScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 3 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllBioFuelScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 4 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllBiogasScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategoriesID = 6 and Status = 'S' `;

        if (facilities != '0') where += `  and A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month` : where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`;

        return await db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Year AS emission_year, A.Month AS month from stationarycombustionde A ${where}`);
    },

    getAllPassengerVehicleScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategorySeedID = 10 and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.Scope3_GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Company Owned Vehicles', '')  as  category, A.months AS month from `dbo.vehiclede` A  " + where);
    },

    getAllLocationBasedScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.SubCategorySeedID = 9 and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select SUM(A.GHGEmission) as emission,SUM(A.scop3_GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    getAllMarketBasedScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.SubCategorySeedID = 1002 and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select SUM(A.GHGEmission) as emission,SUM(A.scop3_GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    getAllDeliveryVehicleScope1Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND SubCategorySeedID = 11 and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.Scope3_GHGEmission) as scope3_emission,A.Year AS emission_year,COALESCE('Company Owned Vehicles', '')  as  category, A.months AS month from `dbo.vehiclede` A  " + where);
    },

    getAllDistrictHeatAndSteamScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND typeID = 3 and A.Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.scop3GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    getAllDistrictCoolingScope2Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND typeID = 4 and Status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months` : where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`;

        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.scop3GHGEmission) as scope3_emission,A.Year AS emission_year, A.months AS month, COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    getAllStandardGoodsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND typeofpurchase = 1 and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    getAllCapitalGoodsScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND typeofpurchase = 2 and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    getAllStandardServicesScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND typeofpurchase = 3 and status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    getAllWhaterWithdrawnScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.withdrawn_emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water withdrawn', '')  as  category from water_supply_treatment_category A " + where);
    },

    getAllWaterDischargeScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND status = 'S'`;

        if (facilities != '0') where += `  and  A.facilities IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.treatment_emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water discharged', '')  as  category from water_supply_treatment_category A " + where);
    },

    getAllWaterGeneratedReuseScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'reuse' AND A.year = '${year}' AND status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water reused', '')  as  category from waste_generated_emissions A " + where);
    },

    getAllWaterGeneratedRecyclingScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'recycling' AND A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`
        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water recycled', '')  as  category from waste_generated_emissions A " + where);
    },

    getAllWaterGeneratedIncinerationScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'incineration' AND A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`
        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water incinerated', '')  as  category from waste_generated_emissions A " + where);
    },

    getAllWaterGeneratedCompostingScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'composting' AND A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`
        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water composted', '')  as  category from waste_generated_emissions A " + where);
    },

    getAllWaterGeneratedLandfillScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'landfill' AND A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`
        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water landfilled', '')  as  category from waste_generated_emissions A " + where);
    },

    getAllWaterGeneratedAnaerobicDigestionScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where A.method = 'anaerobic_digestion' AND A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`
        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;
        return db.query("select SUM(A.emission) as emission,A.year AS emission_year, A.month AS month, COALESCE('Water treated via anaerobic digestion', '')  as  category from waste_generated_emissions A " + where);
    },

    upstreamVehiclesScope3Emission: async (facilities, year, finalyeardata) => {
        console.log(facilities, year, finalyeardata);
        
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(CAST(A.emission AS DECIMAL(10,2)) - CAST(A.emission_storage AS DECIMAL(10,2))) as emission,A.year AS emission_year, A.month AS month,COALESCE('Upstream Transportation and Distribution', '')  as  category from upstream_vehicle_storage_emissions A " + where);
    },

    upstreamStorageFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission_storage) as emission,A.year AS emission_year, A.month AS month,COALESCE('Upstream Storage', '')  as  category from upstream_vehicle_storage_emissions A " + where);
    },

    downsteamVehiclesScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(CAST(A.emission AS DECIMAL(10,2)) - CAST(A.emission_storage AS DECIMAL(10,2))) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstream_vehicle_storage_emissions A " + where);
    },

    downstreamStorageFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.emission_storage) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Storage', '')  as  category from downstream_vehicle_storage_emissions A " + where);
    },

    upsteamFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(CAST(A.emission AS DECIMAL(10,2)) - CAST(A.vehicle_emission AS DECIMAL(10,2))) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Transportation and Distribution', '')  as  category from upstreamLease_emission A " + where);
    },

    upsteamVehicleFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.vehicle_emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Storage', '')  as  category from upstreamLease_emission A " + where);
    },

    downsteamFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(CAST(A.emission AS DECIMAL(10,2)) - CAST(A.vehicle_emission AS DECIMAL(10,2))) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstreamLease_emission A " + where);
    },

    downsteamVehicleFacilityScope3Emission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;

        if (facilities != '0') where += `  and  A.facility_id IN (${facilities})`

        finalyeardata == '2' ? where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month` : where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`;

        return db.query("select SUM(A.vehicle_emission) as emission,A.year AS emission_year, A.month AS month,COALESCE('Downstream Storage', '')  as  category from downstreamLease_emission A " + where);
    }
};