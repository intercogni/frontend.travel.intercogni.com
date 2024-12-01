'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import opencage from 'opencage-api-client'

const Dashboard = () => {
   const [general_info, setGeneralInfo] = useState({
      origin: {
         country: '',
         state: '',
         city: '',
         lat: 0.0,
         long: 0.0,
         to_next: 0.0
      },
      origin_airport: {
         city: '',
         name: '',
         lat: 0.0,
         long: 0.0,
         iata_code: '',
         to_before: 0.0,
         to_next: 0.0
      },
      destination_airport: {
         city: '',
         name: '',
         lat: 0.0,
         long: 0.0,
         iata_code: '',
         to_before: 0.0,
         to_next: 0.0
      },
      destination: {
         country: '',
         state: '',
         city: '',
         lat: 0.0,
         long: 0.0,
         to_before: 0.0
      }
   })

   const origin_countries = Country.getAllCountries()
   const origin_states = general_info.origin.country ? State.getStatesOfCountry(general_info.origin.country) : []
   const origin_cities = general_info.origin.state && general_info.origin.country ? City.getCitiesOfState(general_info.origin.country, general_info.origin.state) : []
   const [origin_latlong, setOriginLatlong] = useState([0, 0])
   const handleOriginLatlong = async () => {
      console.log(`querying for ${general_info.origin.city}, ${general_info.origin.state}, ${general_info.origin.country}`)
      const result = await opencage.geocode({ q: `${general_info.origin.city}`, key: '3407b7bd68464ed89c94c7da66572e1f' })
      
      if (result.results.length > 0) {
         const { lat, lng } = result.results[0].geometry;
         console.log(`Latitude: ${lat}, Longitude: ${lng}`);
         setOriginLatlong([lat, lng])
      } else {
         console.log("No coordinates found for the given location");
      }
   }

   useEffect(() => {
      handleOriginLatlong()
   }, [general_info.origin.city])


   const destination_countries = Country.getAllCountries()
   const destination_states = general_info.destination.country ? State.getStatesOfCountry(general_info.destination.country) : []
   const destination_cities = general_info.destination.state && general_info.destination.country ? City.getCitiesOfState(general_info.destination.country, general_info.destination.state) : []
   const [destination_latlong, setDestinationLatlong] = useState([0, 0])
   const handleDestinationLatlong = async () => {
      console.log(`querying for ${general_info.destination.city}, ${general_info.destination.state}, ${general_info.destination.country}`)
      const result = await opencage.geocode({ q: `${general_info.destination.city}`, key: '3407b7bd68464ed89c94c7da66572e1f' })
      
      if (result.results.length > 0) {
         const { lat, lng } = result.results[0].geometry;
         console.log(`Latitude: ${lat}, Longitude: ${lng}`);
         setDestinationLatlong([lat, lng])
      } else {
         console.log("No coordinates found for the given location");
      }
   }

   useEffect(() => {
      handleDestinationLatlong()
   }, [general_info.destination.city])

   const handleGeneralInfoChange = (e) => {
      console.log("general_info change called")
      const { name, value } = e.target
      console.log(`${name} || ${value}`)
      const keys = name.split('.')
      setGeneralInfo((prevData) => {
         const updatedData = { ...prevData }
         let current = updatedData
         for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]]
         }
         current[keys[keys.length - 1]] = value
         return updatedData
      })
      console.log(general_info)
   }

   // useEffect(() => {
   //    updateGeneralInfo();
   // }, [general_info]);

   const updateGeneralInfo = async () => {
      console.log("enter update general info")
      let data = general_info
      // await handleOriginLatlong()
      // await handleDestinationLatlong()
      data.origin.lat = await origin_latlong[0]
      data.origin.long = await origin_latlong[1]
      data.destination.lat = await destination_latlong[0]
      data.destination.long = await destination_latlong[1]
      await console.log(data)
      try {
         const response = await fetch('http://localhost:8080/api/set-general-info', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
         })
         if (!response.ok) {
            throw new Error('Network response was not ok')
         }
         const result = await response.json()
         setGeneralInfo(result)
         console.log(JSON.stringify(general_info))
         console.log('Success:', result)
      } catch (error) {
         console.error('Error:', error)
      }
   }

	const { data: session, status } = useSession()

   const [showPopup, setShowPopup] = useState(false)
   const [formData, setFormData] = useState({
      registrar_email: '',
      outbound_trip: {
         departure_feeder: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         trunk: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         arrival_feeder: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         total_price: 0
      },
      vacation: { city: '', hotel_budget: '', sightseeing_budget: '', total_price: 0 },
      vacation_day_count: 0,
      inbound_trip: {
         departure_feeder: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         trunk: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         arrival_feeder: { type: '', budget: '', origin_city: '', destination_city: '', price: 0 },
         total_price: 0
      },
      total_days: 0,
      total_price: 0,
      persons: Array(10).fill({ nationality: '', passport_number: '', first_name: '', last_name: '' })
   })

   const handleInputChange = (e) => {
      console.log("input change called")
      const { name, value } = e.target
      console.log(`${name} || ${value}`)
      const keys = name.split('.')
      setFormData((prevData) => {
         const updatedData = { ...prevData }
         let current = updatedData
         for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]]
         }
         current[keys[keys.length - 1]] = value
         return updatedData
      })
      console.log(formData)
   }

   const handleSubmit = () => {
      console.log(formData)
      setShowPopup(false)
   }

	const handleSignOut = () => {
		signOut()
	}

   const handleDummy = () => {

	}

	if (status === 'loading') {
		return <div className="text-center text-white">Loading...</div>
	}

	if (!session) {
		return null
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 p-6 md:p-12 text-white">
			<div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg text-gray-800">
				<h1 className="text-3xl mb-4 flex flex-row align-center justify-center">dashboard | <img src={session.user.image} alt="User Avatar" className="inline-block h-8 w-8 rounded-full mr-2 ml-2" /><strong>{session.user.name}</strong></h1>
				{/* Generate RSA Key Pair Button */}
				<div className="flex justify-between mb-6">
					<button
						onClick={handleDummy}
						className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
					>
						settings
					</button>
					<div>
						<button
							onClick={handleSignOut}
							className="px-6 py-2 bg-red-600 text-white rounded-full text-lg hover:bg-red-700 transition duration-300"
						>
						🚪sign out
						</button>
					</div>
				</div>

				<h2 className="text-2xl font-semibold mt-8 mb-4">🌍✈️🧳 create a new travel plan</h2>
            <button
               onClick={() => setShowPopup(true)}
               className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
            >
               Open Popup
            </button>

            {showPopup && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-12">
                  <div className="flex flex-col bg-white p-6 h-full text-gray-800 max-w-7xl overflow-y-auto rounded-lg shadow-lg">
                     <h2 className="flex flex-col justify-center items-center text-2xl mb-4">plan your travel ✈️</h2>
                     <div className="flex flex-col items-center mb-5 p-2 justify-center bg-emerald-100 border-2 border-emerald-200 shadow-2xl rounded-lg">
                        <div className="flex flex-row w-full justify-between items-center align-center mb-3 pl-2 pr-2">
                           <p className="font-bold text-2xl text-emerald-900">general info</p>
                           <button
                              onClick={updateGeneralInfo}
                              className="px-4 py-1 font-bold text-xl text-emerald-100 bg-emerald-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
                           >
                              apply
                           </button>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-x-4">
                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-emerald-200 border-2 border-emerald-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">origin</p>
                              <select
                                 name="origin.country"
                                 value={general_info.origin.country}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">country</option>
                                 {origin_countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                       {country.name}
                                    </option>
                                 ))}
                              </select>

                              <select
                                 name="origin.state"
                                 value={general_info.origin.state}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">state/province</option>
                                 {origin_states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                       {state.name}
                                    </option>
                                 ))}
                              </select>

                              <select
                                 name="origin.city"
                                 value={general_info.origin.city}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">city</option>
                                 {origin_cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                       {city.name}
                                    </option>
                                 ))}
                              </select>
                           </div>

                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-emerald-200 border-2 border-emerald-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">destination</p>
                              <select
                                 name="destination.country"
                                 value={general_info.destination.country}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">country</option>
                                 {destination_countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                       {country.name}
                                    </option>
                                 ))}
                              </select>

                              <select
                                 name="destination.state"
                                 value={general_info.destination.state}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">state/province</option>
                                 {destination_states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                       {state.name}
                                    </option>
                                 ))}
                              </select>

                              <select
                                 name="destination.city"
                                 value={general_info.destination.city}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full px-4 py-2 border rounded-lg"
                              >
                                 <option value="">city</option>
                                 {destination_cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                       {city.name}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col w-full gap-y-20">
                           <div className="flex flex-col w-full align-between items-center bg-slate-50 shadow-xl rounded-xl border border-slate-300">
                              <p className="font-bold">outbound trip</p>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/4 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1">
                                    <p className="text-lg font-semibold">{`${general_info.origin.city} -> ${general_info.origin_airport.iata_code}`}</p>
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.departure_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-2/3 m-1 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">taxi</option>
                                       <option value="bus">bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.departure_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-2/3 m-1 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                                 <div className="flex flex-col w-1/2 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1">
                                    <p className="text-lg font-semibold">{`${general_info.origin_airport.iata_code} -> ${general_info.destination_airport.iata_code}`}</p>
                                    <div className="flex flex-row w-full">
                                       <div>
                                          <p>{`${general_info.origin_airport.name}`}</p>
                                       </div>
                                       <select
                                          name="outbound_trip.departure_feeder.budget"
                                          value={formData.outbound_trip.trunk.budget}
                                          onChange={handleInputChange}
                                          className="w-2/3 m-1 border rounded-lg"
                                       >
                                          <option value="">select class</option>
                                          <option value="economy">economy</option>
                                          <option value="premium">premium</option>
                                          <option value="business">business</option>
                                          <option value="first">first</option>
                                       </select>
                                       <div>
                                          <p>{`${general_info.destination_airport.name}`}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/4 justify-center items-center border border-gray-900">
                                    <p className="text-lg font-semibold">arrival feeder</p>
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.arrival_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-2/3 m-1 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">taxi</option>
                                       <option value="bus">bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.arrival_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-2/3 m-1 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col border border-gray-900">
                              <div className="flex flex-col items-center justify-center w-full">
                                 <p className="text-lg font-semibold">departure feeder</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.departure_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Taxi</option>
                                       <option value="bus">Bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.departure_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center justify-center w-full">
                                 <p className="text-lg font-semibold">trunk</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.trunk.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Airplane</option>
                                       <option value="bus">Cruise Ship</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.trunk.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center justify-center w-full">
                                 <p className="text-lg font-semibold">arrival feeder</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.arrival_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Taxi</option>
                                       <option value="bus">Bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.arrival_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col align-between items-center border border-gray-900">
                              <p>return home</p>
                              <div className="flex flex-col items-center justify-center w-full border border-gray-900">
                                 <p className="text-lg font-semibold">airport feeder</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.departure_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Taxi</option>
                                       <option value="bus">Bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.departure_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center justify-center w-full">
                                 <p className="text-lg font-semibold">trunk</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.trunk.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Airplane</option>
                                       <option value="bus">Cruise Ship</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.trunk.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="flex flex-col items-center justify-center w-full">
                                 <p className="text-lg font-semibold">arrival feeder</p>
                                 <div className="flex space-x-4 w-80">
                                    <select
                                       name="outbound_trip.departure_feeder.type"
                                       value={formData.outbound_trip.arrival_feeder.type}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">type?</option>
                                       <option value="taxi">Taxi</option>
                                       <option value="bus">Bus</option>
                                    </select>

                                    <select
                                       name="outbound_trip.departure_feeder.budget"
                                       value={formData.outbound_trip.arrival_feeder.budget}
                                       onChange={handleInputChange}
                                       className="w-1/2 px-4 py-2 border rounded-lg"
                                    >
                                       <option value="">budget?</option>
                                       <option value="economy">economy</option>
                                       <option value="premium">premium</option>
                                       <option value="business">business</option>
                                       <option value="first">first</option>
                                    </select>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* <input
                           type="number"
                           name="outbound_trip.departure_feeder.price"
                           placeholder="Outbound Departure Feeder Price"
                           value={formData.outbound_trip.departure_feeder.price}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="text"
                           name="vacation.city"
                           placeholder="Vacation City"
                           value={formData.vacation.city}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="text"
                           name="vacation.hotel_budget"
                           placeholder="Vacation Hotel Budget"
                           value={formData.vacation.hotel_budget}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="text"
                           name="vacation.sightseeing_budget"
                           placeholder="Vacation Sightseeing Budget"
                           value={formData.vacation.sightseeing_budget}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="number"
                           name="vacation.total_price"
                           placeholder="Vacation Total Price"
                           value={formData.vacation.total_price}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="number"
                           name="vacation_day_count"
                           placeholder="Vacation Day Count"
                           value={formData.vacation_day_count}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="number"
                           name="total_days"
                           placeholder="Total Days"
                           value={formData.total_days}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                           type="number"
                           name="total_price"
                           placeholder="Total Price"
                           value={formData.total_price}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border rounded-lg"
                        /> */}
                        {/* {formData.persons.map((person, index) => (
                           <div key={index} className="space-y-2">
                           <input
                              type="text"
                              name={`persons[${index}].nationality`}
                              placeholder={`Person ${index + 1} Nationality`}
                              value={person.nationality}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border rounded-lg"
                           />
                           <input
                              type="text"
                              name={`persons[${index}].passport_number`}
                              placeholder={`Person ${index + 1} Passport Number`}
                              value={person.passport_number}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border rounded-lg"
                           />
                           <input
                              type="text"
                              name={`persons[${index}].first_name`}
                              placeholder={`Person ${index + 1} First Name`}
                              value={person.first_name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border rounded-lg"
                           />
                           <input
                              type="text"
                              name={`persons[${index}].last_name`}
                              placeholder={`Person ${index + 1} Last Name`}
                              value={person.last_name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border rounded-lg"
                           />
                           </div>
                        ))} */}
                     </div>
                     <div className="flex justify-end mt-4">
                        <button
                           onClick={() => setShowPopup(false)}
                           className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 mr-2"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleSubmit}
                           className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
                        >
                           Submit
                        </button>
                     </div>
                  </div>
               </div>
            )}
				
				<button
					type="button"
					onClick={handleDummy}
					className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
				>
					add travel plan
				</button>

				<h2 className="text-2xl font-semibold mt-8 mb-4">browse all your travel plans</h2>

				{/* <ul className="space-y-4">
					{files.length === 0 ? (
						<li className="text-center text-gray-500">...such emptiness...</li>
					) : (
						[...show_file].reverse().map((file) => (
							<li key={file.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
								<div className="max-w-xs overflow-x-auto">
									<p className="font-semibold">{file.filename}</p>
									<p className="text-sm text-gray-600">{file.encryption_type.toUpperCase()}</p>
									<p className="text-xs text-gray-600 italic">{file.email}</p>
								</div>
								<div className="flex flex-col">
									{file.email === session.user.email ? (
										<div className="flex flex-row items-end space-y-2">
											<div>
												<button
													onClick={() => handleDummy}
													className="shadow-lg font-semibold px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-300"
												>
														Download
												</button>
											</div>

											<div className="ml-2">
												<button
													onClick={() => {
														setGlobFileId(file.id)
														setShowGiveAccessPopup(true)
													}}
													className="shadow-lg italic px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition duration-300"
												>
														Give Access
												</button>
											</div>
										</div>
									) : (
										<button
											onClick={() => {
												setGlobFileId(file.id)
												setShowDownloadWithAuthPopup(true)
											}}
											className="shadow-lg font-semibold px-4 py-2 bg-slate-600 text-white rounded-full hover:bg-yellow-700 transition duration-300"
										>
											Download w/ Authorization
										</button>
									)}
									{file.filename.endsWith('.pdf') && (file.email == session.user.email) &&  (
										<button
											onClick={() => {
											}}
											className="mt-2 text-xs shadow-lg italic px-4 py-1.5 bg-sky-800 text-white rounded-full hover:bg-blue-700 transition duration-300"
										>
											{`Validate/Check PDF Digital Signature`}
										</button>
									)}
								</div>
							</li>
						))
					)}
				</ul> */}

				<button
					onClick={handleDummy}
					className="mt-4 text-sm italic px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 mb-4"
				>
					not seeing anything? click this button to refresh your travel plans
				</button>
			</div>
		</div>
	)
}

export default Dashboard