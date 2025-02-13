const countriesData = require('../consts/countries-cities.json')

const getCountries = async (search = '') => {
  console.log(`📌 Countries request, search="${search}"`)

  let filteredCountries = countriesData.data.map(item => item.country)

  if (search.length >= 3) {
    filteredCountries = filteredCountries.filter(country =>
      country.toLowerCase().includes(search.toLowerCase())
    )
  }

  console.log(`✅ found countries:`, filteredCountries.slice(0, 4))

  return {
    error: false,
    data: filteredCountries.slice(0, 4),
    total: filteredCountries.length
  }
}

const getCitiesByCountry = async (countryName, search = '') => {
  const country = countriesData.data.find(
    item => item.country.toLowerCase() === countryName.toLowerCase()
  )

  if (!country) {
    return {
      error: true,
      msg: 'Country not found',
      data: []
    }
  }

  let filteredCities = country.cities

  if (search.length >= 3) {
    filteredCities = filteredCities
      .filter(city => city.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 4)
  } else {
    filteredCities = []
  }

  return {
    error: false,
    msg: 'Cities retrieved successfully',
    data: filteredCities
  }
}

module.exports = {
  getCountries,
  getCitiesByCountry,
}
