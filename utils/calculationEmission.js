function calculateEmission(array) {
  if (!array || !Array.isArray(array)) return 0;

  return array.reduce((sum, item) => {
    const emission = parseFloat(item.emission || 0);
    return sum + emission;
  }, 0);
};

function calculateScop3Emission(array) {
  if (!array || !Array.isArray(array)) return 0;

  return array.reduce((sum, item) => {
    const emission = parseFloat(item.scope3_emission || 0);
    return sum + emission;
  }, 0);
};

module.exports = {calculateEmission, calculateScop3Emission};