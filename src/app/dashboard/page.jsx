'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import opencage from 'opencage-api-client'

const Dashboard = () => {
   const [showViewPopup, setShowViewPopup] = useState(false)
   const [bookings, setBookings] = useState([])
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
         departure_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         trunk: { type: 'airplane', budget: 'economy', origin_city: '', destination_city: '', price: 0 , to_before: 0, to_next: 0},
         arrival_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         total_price: 0
      },
      vacation: { hotel_budget: 'cheap', sightseeing_budget: 'cheap', total_price: 0 },
      inbound_trip: {
         departure_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0 , to_before: 0, to_next: 0},
         trunk: { type: 'airplane', budget: 'economy', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         arrival_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         total_price: 0
      },
      start_date: '01-01-1970',
      end_date: '01-01-1970',
      total_price: 0,
      price_per_pax: 0,
      origin: '',
      destination: '',
      persons: Array(1).fill({ nationality: '', passport_number: '', first_name: '', last_name: '' })
   })

   const [viewData, setViewData] = useState({
      registrar_email: '',
      outbound_trip: {
         departure_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         trunk: { type: 'airplane', budget: 'economy', origin_city: '', destination_city: '', price: 0 , to_before: 0, to_next: 0},
         arrival_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         total_price: 0
      },
      vacation: { hotel_budget: 'cheap', sightseeing_budget: 'cheap', total_price: 0 },
      inbound_trip: {
         departure_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0 , to_before: 0, to_next: 0},
         trunk: { type: 'airplane', budget: 'economy', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         arrival_feeder: { type: 'feeder', budget: 'cheap', origin_city: '', destination_city: '', price: 0, to_before: 0, to_next: 0 },
         total_price: 0
      },
      start_date: '01-01-1970',
      end_date: '01-01-1970',
      total_price: 0,
      price_per_pax: 0,
      origin: '',
      destination: '',
      persons: Array(1).fill({ nationality: '', passport_number: '', first_name: '', last_name: '' })
   })

   const handleInputChange = (e) => {
      console.log("input change called")
      const { name, value } = e.target
      console.log(`${name} || ${value}`)
      const keys = name.split('.')
      console.log(keys)
      setFormData((prevData) => {
         const updatedData = { ...prevData }
         let current = updatedData
         for (let i = 0; i < keys.length - 1; i++) {
            if (keys[i].includes('[')) {
               const [arrayKey, index] = keys[i].split(/[\[\]]/).filter(Boolean)
               current = current[arrayKey][index]
            } else {
               current = current[keys[i]]
            }
         }
         current[keys[keys.length - 1]] = value
         return updatedData
      })
      console.log("now ", formData)
   }

   const [outbound_departure_feeder_multiplier, setOutboundDepartureFeederMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 0.6,
         midrange: 1.3,
         luxurious: 2.5,
      }

      const selectedBudget = formData.outbound_trip.departure_feeder.budget
      setOutboundDepartureFeederMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.outbound_trip.departure_feeder.budget])

   const [outbound_flight_multiplier, setOutboundFlightMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         economy: 0.08,
         premium: 0.17,
         business: 0.45,
         first: 1.5
      }

      const selectedBudget = formData.outbound_trip.trunk.budget
      setOutboundFlightMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.outbound_trip.trunk.budget])

   const [outbound_arrival_feeder_multiplier, setOutboundArrivalFeederMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 0.6,
         midrange: 1.3,
         luxurious: 2.5,
      }

      const selectedBudget = formData.outbound_trip.arrival_feeder.budget
      setOutboundArrivalFeederMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.outbound_trip.arrival_feeder.budget])

   const [vacation_hotel_multiplier, setVacationHotelMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 30,
         midrange: 150,
         luxurious: 500,
      }

      const selectedBudget = formData.vacation.hotel_budget
      setVacationHotelMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.vacation.hotel_budget])

   const [vacation_sightseeing_multiplier, setVacationSightseeingMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 20,
         midrange: 100,
         luxurious: 800,
      }

      const selectedBudget = formData.vacation.sightseeing_budget
      setVacationSightseeingMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.vacation.sightseeing_budget])

   const [inbound_departure_feeder_multiplier, setInboundDepartureFeederMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 0.6,
         midrange: 1.3,
         luxurious: 2.5,
      }

      const selectedBudget = formData.inbound_trip.departure_feeder.budget
      setInboundDepartureFeederMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.inbound_trip.departure_feeder.budget])

   const [inbound_flight_multiplier, setInboundFlightMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         economy: 0.08,
         premium: 0.17,
         business: 0.45,
         first: 1.5
      }

      const selectedBudget = formData.inbound_trip.trunk.budget
      setInboundFlightMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.inbound_trip.trunk.budget])

   const [inbound_arrival_feeder_multiplier, setInboundArrivalFeederMultiplier] = useState(0.0)
   useEffect(() => {
      const budgetMultiplier = {
         cheap: 0.6,
         midrange: 1.3,
         luxurious: 2.5,
      }

      const selectedBudget = formData.inbound_trip.arrival_feeder.budget
      setInboundArrivalFeederMultiplier(budgetMultiplier[selectedBudget] || 0.0)
   }, [formData.inbound_trip.arrival_feeder.budget])

   useEffect(() => {
      console.log("changing prices")
      const outbound_trip_departure_feeder_price = general_info.origin_airport.to_before * outbound_departure_feeder_multiplier
      const outbound_trip_trunk_price = general_info.origin_airport.to_next * outbound_flight_multiplier
      const outbound_trip_arrival_feeder_price = general_info.destination_airport.to_next * outbound_arrival_feeder_multiplier
      const vacation_hotel_price = vacation_hotel_multiplier
      const vacation_sightseeing_price = vacation_sightseeing_multiplier
      const inbound_trip_departure_feeder_price = general_info.origin_airport.to_before * inbound_departure_feeder_multiplier
      const inbound_trip_trunk_price = general_info.origin_airport.to_next * inbound_flight_multiplier
      const inbound_trip_arrival_feeder_price = general_info.destination_airport.to_next * inbound_arrival_feeder_multiplier

      const outbound_trip_total_price = (
         outbound_trip_departure_feeder_price +
         outbound_trip_trunk_price +
         outbound_trip_arrival_feeder_price
      )
      const vacation_total_price = (
         vacation_hotel_price +
         vacation_sightseeing_price
      )
      const inbound_trip_total_price = (
         inbound_trip_departure_feeder_price +
         inbound_trip_trunk_price +
         inbound_trip_arrival_feeder_price
      )

      const vacation_day_count = Math.round((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) - 2
      const price_per_pax = outbound_trip_total_price + vacation_total_price + inbound_trip_total_price
      const total_price = price_per_pax * formData.persons.length

      setFormData(prevData => ({
         ...prevData,
         outbound_trip: {
            ...prevData.outbound_trip,
            departure_feeder: {
               ...prevData.outbound_trip.departure_feeder,
               origin_city: general_info.origin.city,
               destination_city: general_info.origin_airport.name,
               price: outbound_trip_departure_feeder_price,
               to_next: general_info.origin_airport.to_before
            },
            trunk: {
               ...prevData.outbound_trip.trunk,
               origin_city: general_info.origin_airport.iata_code,
               destination_city: general_info.destination_airport.iata_code,
               price: outbound_trip_trunk_price,
               to_next: general_info.origin_airport.to_next
            },
            arrival_feeder: {
               ...prevData.outbound_trip.arrival_feeder,
               origin_city: general_info.destination_airport.name,
               destination_city: general_info.destination.city,
               price: outbound_trip_arrival_feeder_price,
               to_before: general_info.destination_airport.to_next
            },
            total_price: outbound_trip_total_price
         },
         vacation: {
            ...prevData.vacation,
            total_price: vacation_total_price
         },
         vacation_day_count: vacation_day_count,
         inbound_trip: {
            ...prevData.inbound_trip,
            departure_feeder: {
               ...prevData.inbound_trip.departure_feeder,
               destination_city: general_info.destination_airport.city,
               origin_city: general_info.destination.city,
               price: inbound_trip_departure_feeder_price
            },
            trunk: {
               ...prevData.inbound_trip.trunk,
               destination_city: general_info.origin_airport.city,
               origin_city: general_info.destination_airport.city,
               price: inbound_trip_trunk_price
            },
            arrival_feeder: {
               ...prevData.inbound_trip.arrival_feeder,
               destination_city: general_info.origin.city,
               origin_city: general_info.origin_airport.city,
               price: inbound_trip_arrival_feeder_price
            },
            total_price: inbound_trip_total_price
         },
         price_per_pax: price_per_pax,
         total_price: total_price,
         origin: general_info.origin.city,
         destination: general_info.destination.city
      }))
   }, [
      general_info.origin_airport.to_before,
      general_info.origin_airport.to_next,
      general_info.destination_airport.to_next,
      outbound_departure_feeder_multiplier,
      outbound_flight_multiplier, 
      outbound_arrival_feeder_multiplier,
      inbound_departure_feeder_multiplier,
      inbound_flight_multiplier,
      inbound_arrival_feeder_multiplier,
      vacation_hotel_multiplier,
      vacation_sightseeing_multiplier,
      formData.end_date,
      formData.start_date,
      formData.persons,
      general_info.origin.city,
      general_info.destination.city
   ])

   const handleSubmit = () => {
      console.log(formData)
      setShowPopup(false)
   }

   const router = useRouter()
   const handleGoToHomepage = () => {
      router.push('/')
   }

   const handleBookingFinalization = async () => {
      console.log("enter booking finalization")
      try {
         const response = await fetch('http://localhost:8080/api/bookings/create-complex', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
         })
         if (!response.ok) {
            if (response.status === 409) {
               throw new Error('Booking already exists')
            }
            throw new Error('Network response was not ok')
         }
         setShowPopup(false)
         handleGetBookings()
      } catch (error) {
         console.error('Error:', error)
         alert(error.message)
      } 
   }

	const handleSignOut = () => {
		signOut()
	}

   useEffect(() => {
		if (status !== 'loading' && !session) {
			router.push('/')
		}
		if (session) {
			handleGetBookings()
		}
	}, [status, session, router])

   const handleGetBookings = async () => {
      console.log("enter booking get")
      try {
         const response = await fetch('http://localhost:8080/api/bookings/get-all', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: session.user.email})
         })
         if (!response.ok) {
            throw new Error('Network response was not ok')
         }

         const result = await response.json()
         setBookings(result)
         console.log(JSON.stringify(bookings))
         console.log('Success:', result)
      } catch (error) {
         console.error('Error:', error)
         alert(error.message)
      }
   }
      
   const handlePersonChange = (index, field, value) => {
      setFormData(prevFormData => {
         const updatedPersons = [...prevFormData.persons];
         updatedPersons[index] = {
            ...updatedPersons[index],
            [field]: value
         };
         return {
            ...prevFormData,
            persons: updatedPersons
         };
      });
   };

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
						onClick={handleGoToHomepage}
						className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
					>
						go to homepage
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
            {/* <button
               onClick={() => setShowPopup(true)}
               className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
            >
               Open Popup
            </button> */}

            {showPopup && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-12">
                  <div className="flex flex-col bg-white p-6 h-full text-gray-800 max-w-7xl overflow-y-auto rounded-lg shadow-lg">
                     <h2 className="flex flex-col justify-center items-center text-2xl mb-4">plan your travel ✈️</h2>
                     <div className="flex flex-col items-center mb-5 p-2 justify-center bg-emerald-50 border-2 gap-y-2 border-emerald-200 shadow-2xl rounded-lg">
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
                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-emerald-100 border-2 border-emerald-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">origin</p>
                              <select
                                 name="origin.country"
                                 value={general_info.origin.country}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
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
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
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
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
                              >
                                 <option value="">city</option>
                                 {origin_cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                       {city.name}
                                    </option>
                                 ))}
                              </select>
                           </div>

                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-emerald-100 border-2 border-emerald-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">destination</p>
                              <select
                                 name="destination.country"
                                 value={general_info.destination.country}
                                 onChange={handleGeneralInfoChange}
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
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
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
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
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
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
                        <div className="flex flex-row justify-center items-center gap-x-4">
                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-sky-100 border-2 border-sky-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">start date</p>
                              <input
                                 type="date"
                                 name="start_date"
                                 value={formData.start_date}
                                 onChange={handleInputChange}
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
                              />
                           </div>
                           <div className="flex flex-col w-full justify-center items-center gap-y-1 bg-sky-100 border-2 border-sky-300 shadow-xl rounded-lg p-2">
                              <p className="font-semibold text-lg text-emerald-800">end date</p>
                              <input
                                 type="date"
                                 name="end_date"
                                 value={formData.end_date}
                                 onChange={handleInputChange}
                                 className="w-full bg-white px-4 py-2 border rounded-lg"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center mb-5 p-2 justify-center bg-emerald-50 border-2 gap-y-2 border-emerald-200 shadow-2xl rounded-lg">
                        <div className="flex flex-row w-full justify-between items-center align-center mb-3 pl-2 pr-2">
                           <p className="font-bold text-2xl text-emerald-900">passenger info</p>
                           <button
                              onClick={() => setFormData(prevData => ({
                                 ...prevData,
                                 persons: [...prevData.persons, { nationality: '', passport_number: '', first_name: '', last_name: '' }]
                              }))}
                              className="px-4 py-1 font-bold text-xl text-emerald-100 bg-emerald-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
                           >
                              add person
                           </button>
                        </div>
                        {formData.persons.map((person, index) => (
                           <div key={index} className="flex flex-col w-full gap-y-2 bg-emerald-100 p-2 rounded-lg border-2 border-emerald-300">
                              <div className="flex flex-row justify-between items-center">
                                 <p className="font-semibold text-lg text-emerald-800">{`person ${index + 1}`}</p>
                                 <button
                                    onClick={() => setFormData(prevData => ({
                                       ...prevData,
                                       persons: prevData.persons.filter((_, i) => i !== index)
                                    }))}
                                    className="px-2 py-0 font-bold text-lg text-red-100 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300"
                                 >
                                    remove
                                 </button>
                              </div>
                              <input
                                 type="text"
                                 name={`persons.${index}.nationality`}
                                 placeholder="Nationality"
                                 value={person.nationality}
                                 onChange={(e) => handlePersonChange(index, 'nationality', e.target.value)}
                                 className="w-full px-4 py-2 border rounded-lg"
                              />
                              <input
                                 type="text"
                                 name={`persons.${index}.passport_number`}
                                 placeholder="Passport Number"
                                 value={person.passport_number}
                                 onChange={(e) => handlePersonChange(index, 'passport_number', e.target.value)}
                                 className="w-full px-4 py-2 border rounded-lg"
                              />
                              <input
                                 type="text"
                                 name={`persons.${index}.first_name`}
                                 placeholder="First Name"
                                 value={person.first_name}
                                 onChange={(e) => handlePersonChange(index, 'first_name', e.target.value)}
                                 className="w-full px-4 py-2 border rounded-lg"
                              />
                              <input
                                 type="text"
                                 name={`persons.${index}.last_name`}
                                 placeholder="Last Name"
                                 value={person.last_name}
                                 onChange={(e) => handlePersonChange(index, 'last_name', e.target.value)}
                                 className="w-full px-4 py-2 border rounded-lg"
                              />
                           </div>
                        ))}
                     </div>

                     <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col w-full gap-y-5 bg-emerald-50 p-2 rounded-lg border-2 border-emerald-200">
                           <div className="flex flex-row w-full justify-between items-center align-center -mb-3 pl-2 pr-2">
                              <p className="font-bold text-2xl text-emerald-900">itinerary</p>
                           </div>
                           <div className="flex flex-col w-full align-between items-center bg-slate-50 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <p className="">price/pax: <strong>{`$${Math.round(formData.outbound_trip.total_price)}`}</strong></p>
                                 <p className="font-semibold text-slate-400">{`${formData.start_date} -> ${new Date(new Date(formData.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`} <em className="text-xs">(1 day)</em></p>
                                 <p className="font-semibold text-slate-700">outbound trip</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">{`${general_info.origin.city} -> ${general_info.origin_airport.iata_code}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.origin_airport.to_before)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.outbound_trip.departure_feeder.price)}`}</strong></p>
                                       </div>
                                       <select
                                          name="outbound_trip.departure_feeder.budget"
                                          value={formData.outbound_trip.departure_feeder.budget}
                                          onChange={handleInputChange}
                                          className="bg-white w-full m-1 py-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                                 <div className="flex flex-row w-1/2 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${general_info.origin_airport.name}`}</p>
                                    </div>
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-lg font-semibold">{`${general_info.origin_airport.iata_code} ---> ${general_info.destination_airport.iata_code}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.origin_airport.to_next)}km`}</p>
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.outbound_trip.trunk.price)}`}</strong></p>
                                       </div>
                                       <div className="flex flex-row text-xs w-full">
                                          <select
                                             name="outbound_trip.trunk.budget"
                                             value={formData.outbound_trip.trunk.budget}
                                             onChange={handleInputChange}
                                             className="w-full bg-white py-1 m-1 border rounded-lg text-center"
                                          >
                                             <option value="">select class</option>
                                             <option value="economy">economy</option>
                                             <option value="premium">premium</option>
                                             <option value="business">business</option>
                                             <option value="first">first</option>
                                          </select>
                                       </div>
                                    </div>
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${general_info.destination_airport.name}`}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-md font-semibold text-center">{`${general_info.destination_airport.iata_code} -> ${general_info.destination.city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.destination_airport.to_next)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.outbound_trip.arrival_feeder.price)}`}</strong></p>
                                       </div>
                                       <select
                                          name="outbound_trip.arrival_feeder.budget"
                                          value={formData.outbound_trip.arrival_feeder.budget}
                                          onChange={handleInputChange}
                                          className="w-full bg-white py-1 m-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full align-between items-center bg-fuchsia-100 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <div className="flex flex-col justify-center items-begin">
                                    <p className="">price/pax: <strong>{`$${Math.round(formData.vacation.total_price * formData.vacation_day_count)}`}</strong></p>
                                    <p className="text-[0.6rem] italic">price/pax/day: <strong>{`$${Math.round(formData.vacation.total_price)}`}</strong></p>
                                 </div>
                                 <p className="font-semibold text-slate-400">{`${new Date(new Date(formData.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} -> ${new Date(new Date(formData.end_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`} <em className="text-xs">({`${Math.round((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) - 2}`} day/s)</em></p>
                                 <p className="font-semibold text-slate-700">vacation</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/2 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">Hotel/Homestay</p>
                                       <p className="text-[0.6rem] italic text-center">plan your stay at <br /> <strong>{`${general_info.destination.city}, ${general_info.destination.state}, ${general_info.destination.country}`}</strong></p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(vacation_hotel_multiplier)}`}</strong></p>
                                       </div>
                                       <select
                                          name="vacation.hotel_budget"
                                          value={formData.vacation.hotel_budget}
                                          onChange={handleInputChange}
                                          className="bg-white w-full m-1 py-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/2 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                    <p className="font-semibold text-center">Parks / Sightseeing</p>
                                       <p className="text-[0.6rem] italic text-center">choose parks / sightseeing budget <br /> <strong>{`${general_info.destination.city}, ${general_info.destination.state}, ${general_info.destination.country}`}</strong></p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(vacation_sightseeing_multiplier)}`}</strong></p>
                                       </div>
                                       <select
                                          name="vacation.sightseeing_budget"
                                          value={formData.vacation.sightseeing_budget}
                                          onChange={handleInputChange}
                                          className="w-full bg-white py-1 m-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full align-between items-center bg-slate-50 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <p className="">price/pax: <strong>{`$${Math.round(formData.inbound_trip.total_price)}`}</strong></p>
                                 <p className="font-semibold text-slate-400">{`${new Date(new Date(formData.end_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} -> ${formData.end_date}`} <em className="text-xs">(1 day)</em></p>
                                 <p className="font-semibold text-slate-700">return home</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-md font-semibold text-center">{`${general_info.destination.city} -> ${general_info.destination_airport.iata_code}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.destination_airport.to_next)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.inbound_trip.arrival_feeder.price)}`}</strong></p>
                                       </div>
                                       <select
                                          name="inbound_trip.arrival_feeder.budget"
                                          value={formData.inbound_trip.arrival_feeder.budget}
                                          onChange={handleInputChange}
                                          className="w-full bg-white py-1 m-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                                 <div className="flex flex-row w-1/2 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${general_info.origin_airport.name}`}</p>
                                    </div>
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-lg font-semibold">{`${general_info.destination_airport.iata_code} ---> ${general_info.origin_airport.iata_code}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.origin_airport.to_next)}km`}</p>
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.inbound_trip.trunk.price)}`}</strong></p>
                                       </div>
                                       <div className="flex flex-row text-xs w-full">
                                          <select
                                             name="inbound_trip.trunk.budget"
                                             value={formData.inbound_trip.trunk.budget}
                                             onChange={handleInputChange}
                                             className="w-full bg-white py-1 m-1 border rounded-lg text-center"
                                          >
                                             <option value="">select class</option>
                                             <option value="economy">economy</option>
                                             <option value="premium">premium</option>
                                             <option value="business">business</option>
                                             <option value="first">first</option>
                                          </select>
                                       </div>
                                    </div>
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${general_info.destination_airport.name}`}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">{`${general_info.origin_airport.iata_code} -> ${general_info.origin.city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(general_info.origin_airport.to_before)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(formData.inbound_trip.departure_feeder.price)}`}</strong></p>
                                       </div>
                                       <select
                                          name="inbound_trip.departure_feeder.budget"
                                          value={formData.inbound_trip.departure_feeder.budget}
                                          onChange={handleInputChange}
                                          className="bg-white w-full m-1 py-1 border rounded-lg text-center"
                                       >
                                          <option value="">select budget</option>
                                          <option value="cheap">cheap</option>
                                          <option value="midrange">mid-range</option>
                                          <option value="luxurious">luxurious</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full justify-between items-center align-center -mt-2 pl-2 pr-2">
                              <p className="text-2xl text-emerald-900">total price: <strong>{`$${Math.round(formData.total_price)}`}</strong></p>
                              <p className="text-sm text-emerald-700 italic">price/pax: <strong>{`$${Math.round(formData.price_per_pax)}`}</strong>{`, ${formData.persons.length}pax`}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex mt-4 w-full flex-row justify-center items-center italic text-xs text-center text-red-700">
                        <p>WARNING: ONCE A BOOKING IS FINALIZED, YOU CAN <b>ONLY DELETE</b> IT, YOU CAN <b>NOT</b> CHANGE ITS CONTENTS</p>
                     </div>
                     <div className="flex justify-between mt-1">
                        <button
                           onClick={() => setShowPopup(false)}
                           className="px-4 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 mr-2"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleBookingFinalization}
                           className="px-4 py-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300"
                        >
                           Finalize Booking
                        </button>
                     </div>
                  </div>
               </div>
            )}
				
				<button
					type="button"
					onClick={() => setShowPopup(true)}
					className="w-full px-6 py-3 bg-emerald-400 text-emerald-900 font-semibold rounded-lg hover:bg-emerald-500 transition duration-300"
				>
					🌍✈️🧳 create a new travel plan
				</button>

				<h2 className="text-2xl font-semibold mt-8 mb-4">browse all your travel plans</h2>

            <div className="flex flex-col gap-y-4">
               {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                     <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <div className="flex flex-row justify-between items-center">
                           <h3 className="text-xl font-semibold">{`${booking.Origin} ---> 🧳 ${booking.Destination}`}</h3>
                           <p className="italic">{booking.RegistrarEmail}</p>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                           <p className="">{`${booking.StartDate} -> ${booking.EndDate}`}</p>
                           <p className="font-semibold">{`${Math.round(booking.TotalPrice / booking.PricePerPax)} person/s`}</p>
                        </div>
                        <div className="mt-3 flex flex-row justify-between items-center">
                           <p className="text-sm">Price: <strong className="text-xl">${Math.round(booking.TotalPrice)}</strong></p>
                           <button
                              onClick={async () => {
                                 try {
                                    const response = await fetch('http://localhost:8080/api/bookings/get-complex', {
                                       method: 'POST',
                                       headers: {
                                          'Content-Type': 'application/json'
                                       },
                                       body: JSON.stringify({ booking_id: booking.ID })
                                    })
                                    if (!response.ok) {
                                       throw new Error('Network response was not ok')
                                    }
                                    const result = await response.json()
                                    setViewData(result)
                                    console.log(JSON.stringify(viewData))
                                    console.log('Booking data fetched successfully')
                                 } catch (error) {
                                    console.error('Error:', error)
                                    alert(error.message)
                                 } finally {
                                    setShowViewPopup(true)
                                 }
                              }}
                              className="ml-4 px-2 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
                           >
                              View
                           </button>
                           <button
                              onClick={async () => {
                                 try {
                                    const response = await fetch(`http://localhost:8080/api/bookings/delete`, {
                                       method: 'POST',
                                       headers: {
                                          'Content-Type': 'application/json'
                                       },
                                       body: JSON.stringify({ booking_id: booking.ID })
                                    })
                                    if (!response.ok) {
                                       throw new Error('Network response was not ok')
                                    }
                                    setBookings(bookings.filter((_, i) => i !== index))
                                    console.log('Booking deleted successfully')
                                 } catch (error) {
                                    console.error('Error:', error)
                                    alert(error.message)
                                 }
                              }}
                              className="ml-4 px-2 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300"
                           >
                              Delete
                           </button>
                        </div>
                     </div>
                  ))
               ) : (
                  <p>No bookings found.</p>
               )}
            </div>

				<button
					onClick={handleGetBookings}
					className="mt-4 text-sm italic px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 mb-4"
				>
					not seeing anything? click this button to refresh your travel plans
				</button>

            {showViewPopup && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-12">
                  <div className="flex flex-col bg-white p-6 h-full text-gray-800 max-w-7xl overflow-y-auto rounded-lg shadow-lg">
                     <h2 className="flex flex-col justify-center items-center text-2xl mb-4">booking details ✈️</h2>
                     <div className="flex flex-col items-center mb-5 p-2 justify-center bg-emerald-50 border-2 gap-y-2 border-emerald-200 shadow-2xl rounded-lg">
                        <div className="flex flex-row w-full justify-between items-center align-center mb-3 pl-2 pr-2">
                           <p className="font-bold text-2xl text-emerald-900">passenger info</p>
                        </div>
                        {viewData.persons.map((person, index) => (
                           <div key={index} className="flex flex-col w-full gap-y-2 bg-emerald-100 p-2 rounded-lg border-2 border-emerald-300">
                              <div className="flex flex-row justify-between items-center">
                                 <p className="font-semibold text-lg text-emerald-800">{`person ${index + 1}`}</p>
                              </div>
                              <div className="w-full bg-white px-4 py-2 border rounded-lg">
                              <strong>Nationality: </strong>{person.nationality}
                              </div>
                              <div className="w-full bg-white px-4 py-2 border rounded-lg">
                              <strong>Passport ID: </strong>{person.passport_number}
                              </div>
                              <div className="w-full bg-white px-4 py-2 border rounded-lg">
                              <strong>First Name: </strong>{person.first_name}
                              </div>
                              <div className="w-full bg-white px-4 py-2 border rounded-lg">
                              <strong>Last Name: </strong>{person.last_name}
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col w-full gap-y-5 bg-emerald-50 p-2 rounded-lg border-2 border-emerald-200">
                           <div className="flex flex-row w-full justify-between items-center align-center -mb-3 pl-2 pr-2">
                              <p className="font-bold text-2xl text-emerald-900">itinerary</p>
                           </div>
                           <div className="flex flex-col w-full align-between items-center bg-slate-50 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <p className="">price/pax: <strong>{`$${Math.round(viewData.outbound_trip.total_price)}`}</strong></p>
                                 <p className="font-semibold text-slate-400">{`${viewData.start_date} -> ${new Date(new Date(viewData.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`} <em className="text-xs">(1 day)</em></p>
                                 <p className="font-semibold text-slate-700">outbound trip</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">{`${viewData.outbound_trip.departure_feeder.origin_city} -> ${viewData.outbound_trip.trunk.origin_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.departure_feeder.to_next)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.outbound_trip.departure_feeder.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.outbound_trip.departure_feeder.budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-row w-1/2 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${viewData.outbound_trip.departure_feeder.destination_city}`}</p>
                                    </div>
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-lg font-semibold">{`${viewData.outbound_trip.trunk.origin_city} ---> ${viewData.outbound_trip.trunk.destination_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.trunk.to_next)}km`}</p>
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.outbound_trip.trunk.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.outbound_trip.trunk.budget || 'select budget'}
                                       </div>
                                    </div>
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${viewData.outbound_trip.arrival_feeder.origin_city}`}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-md font-semibold text-center">{`${viewData.outbound_trip.trunk.destination_city} -> ${viewData.outbound_trip.arrival_feeder.destination_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.arrival_feeder.to_before)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.outbound_trip.arrival_feeder.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.outbound_trip.arrival_feeder.budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full align-between items-center bg-fuchsia-100 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <div className="flex flex-col justify-center items-begin">
                                    <p className="">price/pax: <strong>{`$${Math.round(viewData.vacation.total_price * viewData.vacation_day_count)}`}</strong></p>
                                    <p className="text-[0.6rem] italic">price/pax/day: <strong>{`$${Math.round(viewData.vacation.total_price)}`}</strong></p>
                                 </div>
                                 <p className="font-semibold text-slate-400">{`${new Date(new Date(viewData.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} -> ${new Date(new Date(viewData.end_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`} <em className="text-xs">({`${Math.round((new Date(viewData.end_date) - new Date(viewData.start_date)) / (1000 * 60 * 60 * 24)) - 2}`} day/s)</em></p>
                                 <p className="font-semibold text-slate-700">vacation</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/2 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">Hotel/Homestay</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(vacation_hotel_multiplier)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.vacation.hotel_budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/2 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">Parks / Sightseeing</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(vacation_sightseeing_multiplier)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.vacation.sightseeing_budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full align-between items-center bg-slate-50 shadow-xl rounded-xl border border-slate-300">
                              <div className="flex flex-row w-full items-center justify-between p-2 pt-1 pb-0">
                                 <p className="">price/pax: <strong>{`$${Math.round(viewData.inbound_trip.total_price)}`}</strong></p>
                                 <p className="font-semibold text-slate-400">{`${new Date(new Date(viewData.end_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} -> ${viewData.end_date}`} <em className="text-xs">(1 day)</em></p>
                                 <p className="font-semibold text-slate-700">return home</p>
                              </div>
                              <div className="flex flex-row w-full">
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-md font-semibold text-center">{`${viewData.outbound_trip.arrival_feeder.destination_city} -> ${viewData.outbound_trip.trunk.destination_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.arrival_feeder.to_before)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.inbound_trip.arrival_feeder.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.inbound_trip.arrival_feeder.budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex flex-row w-1/2 justify-center items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${viewData.outbound_trip.arrival_feeder.origin_city}`}</p>
                                    </div>
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="text-lg font-semibold">{`${viewData.outbound_trip.trunk.destination_city} ---> ${viewData.outbound_trip.trunk.origin_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.trunk.to_next)}km`}</p>
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.inbound_trip.trunk.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.inbound_trip.trunk.budget || 'select budget'}
                                       </div>
                                    </div>
                                    <div className="w-1/4">
                                       <p className="text-[0.6rem] italic text-center">{`${viewData.outbound_trip.departure_feeder.destination_city}`}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col w-1/4 justify-between items-center bg-slate-100 rounded-xl border border-slate-300 m-1 p-2">
                                    <div className="flex flex-col w-full justify-center items-center">
                                       <p className="font-semibold text-center">{`${viewData.outbound_trip.trunk.origin_city} -> ${viewData.outbound_trip.departure_feeder.origin_city}`}</p>
                                       <p className="text-[0.6rem] italic">{`${Math.round(viewData.outbound_trip.departure_feeder.to_next)}km`}</p>
                                    </div>
                                    <div className="flex flex-col text-xs w-full">
                                       <div className="flex flex-row w-full justify-center items-center">
                                          <p className="text-xs text-center">price/pax: <strong>{`$${Math.round(viewData.inbound_trip.departure_feeder.price)}`}</strong></p>
                                       </div>
                                       <div className="w-full bg-white py-1 m-1 border rounded-lg text-center">
                                          {viewData.inbound_trip.arrival_feeder.budget || 'select budget'}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col w-full justify-between items-center align-center -mt-2 pl-2 pr-2">
                              <p className="text-2xl text-emerald-900">total price: <strong>{`$${Math.round(viewData.total_price)}`}</strong></p>
                              <p className="text-sm text-emerald-700 italic">price/pax: <strong>{`$${Math.round(viewData.price_per_pax)}`}</strong>{`, ${viewData.persons.length}pax`}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-between mt-1">
                        <button
                           onClick={() => setShowViewPopup(false)}
                           className="px-4 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 mr-2"
                        >
                           Close
                        </button>
                     </div>
                  </div>
               </div>
            )}
			</div>
		</div>
	)
}

export default Dashboard