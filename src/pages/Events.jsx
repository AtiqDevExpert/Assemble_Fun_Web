import React, { useEffect, useState, Fragment } from "react";
import Header from "../components/Header";
import axios from "axios";
import eventLogo from "../assets/event-img.png";
import { Dialog, Transition } from "@headlessui/react";
import { useFormik } from "formik";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { toast } from "sonner";
import { storage } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ClipLoader } from "react-spinners";
import Loader from "../components/Loader";
import CustomDateTimePicker from "../components/DateTimePicker";

const Events = () => {
  var AssembleToken = localStorage.getItem("AssembleToken");
  const config = {
    headers: { Authorization: `Bearer ${AssembleToken}` },
  };
  const [date,setDate ]=useState(new Date());
  const [time,setTime]=useState(new Date());
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime,setEventTime] = useState(new Date())
  
  const handleDateChange = (date) => {
    // Format the date as DD-MM-YYYY
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  
    console.log("handleDateChange", formattedDate);
    setDate(date);
    setEventDate(formattedDate)
  };
  
  const handleTimeChange = (date) => {
    // Format the time as HH:mm:ss AM/PM
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  
    console.log("handleTimeChange", formattedTime);
    setTime(date);
    setEventTime(formattedTime)
  };
  

  const [events, setEvents] = useState([]);
  const [openCreateEventModal, setOpenCreateEventModal] = useState(false);
  const [openEditEventModal, setOpenEditEventModal] = useState(false);
  const [updateEvent, setUpdateEvent] = useState(false);
  const [address, setAddress] = useState("");
  const [formatedAddress, setFormatedAddress] = useState("");
  const [eventImg, setEventImg] = useState("");
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventId, setEventId] = useState("");
  const [loader, setLoader] = useState(false);
  const [editEventID, setEditEventId] = useState(null)
  useEffect(() => {
    axios.get(`${window.$BackEndURL}/api/events/getallevents`).then((res) => {
      // console.log(res?.data?.events);
      setEvents(res?.data?.events);
    });
  }, [updateEvent]);

  const handleSelect = async (selectedAddress) => {
    try {
      const results = await geocodeByAddress(selectedAddress);
      const latLng = await getLatLng(results[0]);

      console.log("Formatted Address:", selectedAddress);
      setAddress(selectedAddress)
      console.log("Latitude:", latLng.lat);
      console.log("Longitude:", latLng.lng);
      setFormatedAddress({
        address: selectedAddress,
        longitude: latLng.lng,
        latitude: latLng.lat,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileChange = async (e) => {
    setLoader(true)
    const file = e.target.files[0];

    if (file) {
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setEventImg(downloadURL);
        toast.success("File uploaded successfully:");
        setLoader(false)
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Error uploading file:");
        setLoader(false)
      }
    }
  };

  const handleEditEvent = (id) => {
    setEventId(id);
    try {
      setLoader(true)
      axios
        .get(`${window.$BackEndURL}/api/events/getevent/${id}`)
        .then((res) => {
          console.log("singleEvent>>>>", res);
          setEditEventId(res?.data?.event?._id)
          setCurrentEvent(res?.data?.event);
          setEventImg(res?.data?.event?.event_image);
          setAddress(res?.data?.event?.event_location?.address);
          setOpenEditEventModal(true);
          setLoader(false)
        });
    } catch (error) {
      console.log(error);
    }
  };

  const EventForm = useFormik({
    initialValues: {},
    onSubmit: async (values) => {
     
      setLoader(true)
      const json = {
        event_title: values.event_title,
        event_date: values.event_date,
        event_time: values.event_time,
        event_description: values.event_description,
        event_location: {
          address: formatedAddress?.address,
          neighborhood: values.neighborhood,
          venue_name: values.venue_name,
          latitude: formatedAddress?.latitude,
          longitude: formatedAddress?.longitude,
        },
        event_tags: [values.tag1, values.tag2, values.tag3, values.tag4],
        ticket_link: values.ticket_link,
        event_image: eventImg,
      };
      console.log(json);
      try {
        axios
          .post(`${window.$BackEndURL}/api/events/create`, json, config)
          .then((res) => {
            console.log(res);
            toast.success(res?.data?.message);
            setEvents((prev) => [...prev, res?.data?.event]);
            setLoader(false)
            setOpenCreateEventModal(false);
            EventForm.resetForm();
          });
      } catch (error) {
        console.log(error);
      }
    },
    enableReinitialize: true,
  });

  const EditEventForm = useFormik({
    initialValues: {
      event_title: currentEvent?.event_title,
      event_description: currentEvent?.event_description,
      ticket_link: currentEvent?.ticket_link,
      event_date: currentEvent?.event_date,
      event_time: currentEvent?.event_time,
      address: currentEvent?.event_location.address,
      latitude: currentEvent?.event_location.latitude,
      longitude: currentEvent?.event_location.longitude,
      neighborhood: currentEvent?.event_location.neighborhood,
      venue_name: currentEvent?.event_location.venue_name,
      tag1: currentEvent?.event_tags[0],
      tag2: currentEvent?.event_tags[1],
      tag3: currentEvent?.event_tags[2],
      tag4: currentEvent?.event_tags[3],
      event_image: currentEvent?.event_image,
    },
    onSubmit: async (values) => {
      setLoader(true)
      const json = {
        event_title: values.event_title,
        event_date: values.event_date,
        event_time: values.event_time,
        event_description: values.event_description,
        event_location: {
          address: formatedAddress.address,
          latitude: formatedAddress.latitude,
          longitude: formatedAddress.longitude,
          neighborhood: values.neighborhood,
          venue_name: values.venue_name,
        },
        event_tags: [values.tag1, values.tag2, values.tag3, values.tag4],
        ticket_link: values.ticket_link,
        event_image: eventImg,
      };
      console.log(json);
      try {
        axios
          .put(
            `${window.$BackEndURL}/api/events/updateevent/${eventId}`,
            json,
            config
          )
          .then((res) => {
            console.log(res);
            toast.success(res?.data?.message);
            setLoader(false)
            setOpenEditEventModal(false);
            setUpdateEvent(!updateEvent);
          });
      } catch (error) {
        console.log(error);
      }
    },
    enableReinitialize: true,
  });

  const handleDeleteEvent = (id) => {
    try {
      setLoader(true)
      axios
        .delete(`${window.$BackEndURL}/api/events/deleteevent/${id}`, config)
        .then((res) => {
          console.log(res?.data);
          toast.success(res?.data?.message);
          const updatedEvents = events?.filter(
            (e) => e._id !== res?.data?.deletedEvent?._id
          );
          if(openEditEventModal === true){
            setOpenEditEventModal(false);
            setEditEventId(null)
          }
          setLoader(false)
          setEvents(updatedEvents);
        });
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };
  
  return (
    <>
      <Header />
      <div className="w-full flex flex-col items-center sm:px-14 px-10 mt-8">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium pl-2">All Events</span>
          <button
            className="bg-black text-white sm:px-6 px-4 sm:py-4 py-3 rounded-full text-xs font-medium"
            onClick={() => {
              setOpenCreateEventModal(true);
              setAddress("");
            }}
          >
            NEW EVENT
          </button>
        </div>
        <div class="container">
          <ul class="responsive-table">
            <li class="table-header font-semibold">
              <div class="col col-1">
                <img src={eventLogo} className="w-10 h-10" />
              </div>
              <div class="col col-2">Event Title</div>
              <div class="col col-3">Neighborhood</div>
              <div class="col col-4">Date</div>
              <div class="col col-5">Tags</div>
              <div class="col col-6 pl-6">Actions</div>
            </li>
            {events?.map((event) => (
              <li class="table-row text-gray-800 text-xs " key={event?._id}>
                <div class="col col-1">
                  <img src={event?.event_image} className="w-12 h-14" />
                </div>
                <div class="col col-2">{event?.event_title}</div>
                <div class="col col-3">
                  {event.event_location?.neighborhood}
                </div>
                <div class="col col-4">{event?.event_date?.split("T")[0]}</div>
                <div class="col col-5 flex gap-x-2">
                  {event?.event_tags?.map((tag, index) => (
                    tag && <span
                      key={index}
                      className="bg-[#DCDFE7B2] px-2 py-1 rounded-full "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div class="flex gap-x-3 col col-6">
                  <div
                    className="flex w-28 h-11 justify-center items-center font-medium bg-white rounded-full cursor-pointer"
                    onClick={() => handleEditEvent(event?._id)}
                  >
                    <span className=" hover:text-indigo-900 text-base">
                      View/
                      <span className="sr-only">, {event._id}</span>
                    </span>
                    <span className=" hover:text-indigo-900 text-base">
                      Edit
                      <span className="sr-only">, {event._id}</span>
                    </span>
                  </div>
                  <div
                    className="flex w-28 h-11 justify-center items-center font-medium text-red-500 rounded-full cursor-pointer"
                    onClick={() => handleDeleteEvent(event?._id)}
                  >
                    <span className="  text-base">
                      Delete
                      <span className="sr-only">, {event._id}</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Transition.Root show={openCreateEventModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setOpenCreateEventModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <form
                    onSubmit={EventForm.handleSubmit}
                    encType="multipart/form-data"
                  >
                    <div className="flex  flex-col">
                      <h2 className="text-gray-900 text-center text-lg">
                        Create Event
                      </h2>
                      <span class="horizontal-line rounded-full bg-yellow-300"></span>

                      <div class="mb-6 w-full">
                        <label
                          for="event_title"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Event Title
                        </label>
                        <input
                          type="text"
                          id="event_title"
                          name="event_title"
                          value={EventForm.values.event_title}
                          onChange={EventForm.handleChange}
                          class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          required
                        />
                      </div>
                      <h2 className="mb-3 font-medium text-lg">
                        Event time & date
                      </h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-2 w-full">
                        <div>
                          <label
                            for="event_time"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Time
                          </label>
                          {/* <CustomDateTimePicker type="time" value={time} onChange={handleTimeChange} /> */}
                          <input
                            type="text"
                            id="event_time"
                            name="event_time"
                            value={EventForm.values.event_time}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="event_date"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Date
                          </label>
                          {/* <CustomDateTimePicker type="date" value={date} onChange={handleDateChange} /> */}
                          <input
                            type="text"
                            id="event_date"
                            name="event_date"
                            value={EventForm.values.event_date}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                      </div>
                      <h2 className="mb-3 font-medium text-lg">Location</h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-3 w-full">
                        <div>
                          <label
                            for="venue_name"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Venue Name
                          </label>
                          <input
                            type="text"
                            id="venue_name"
                            name="venue_name"
                            value={EventForm.values.venue_name}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="neighborhood"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Neighborhood
                          </label>
                          <input
                            type="text"
                            id="neighborhood"
                            name="neighborhood"
                            value={EventForm.values.neighborhood}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div id="pac-card" className="">
                          <label
                            for="address"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Address
                          </label>
                          <PlacesAutocomplete
                            value={address}
                            onChange={(value) => setAddress(value)}
                            onSelect={handleSelect}
                            id="address"
                            name="address"
                            required
                          >
                            {({
                              getInputProps,
                              suggestions,
                              getSuggestionItemProps,
                              loading,
                            }) => (
                              <div className="location-search-container">
                                <input
                                  required
                                  {...getInputProps({
                                    className: "location-search-input",
                                  })}
                                />
                                <div className="autocomplete-dropdown-container">
                                  {loading && <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                    Loading...
                                  </div>}
                                  {suggestions.map((suggestion) => (
                                    <div
                                      {...getSuggestionItemProps(suggestion, {
                                        className: "suggestion-item",
                                      })}
                                    >
                                      <span>{suggestion.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </PlacesAutocomplete>
                        </div>
                      </div>
                      <h2 className="mb-3 font-medium text-lg">
                        Event Tags (Enter at least one)
                      </h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-4 w-full">
                        <div>
                          <label
                            for="tag1"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 1
                          </label>
                          <input
                            type="text"
                            id="tag1"
                            name="tag1"
                            value={EventForm.values.tag1}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="tag2"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 2
                          </label>
                          <input
                            type="text"
                            id="tag2"
                            name="tag2"
                            value={EventForm.values.tag2}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                        <div>
                          <label
                            for="tag3"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 3
                          </label>
                          <input
                            type="text"
                            id="tag3"
                            name="tag3"
                            value={EventForm.values.tag3}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                        <div>
                          <label
                            for="tag4"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 4
                          </label>
                          <input
                            type="text"
                            id="tag4"
                            name="tag4"
                            value={EventForm.values.tag4}
                            onChange={EventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                      </div>

                      <div className="w-full mb-6">
                        <label
                          for="event_description"
                          class="block mb-2 text-lg font-medium text-gray-900 "
                        >
                          Event Description
                        </label>
                        <textarea
                          id="event_description"
                          name="event_description"
                          required
                          value={EventForm.values.event_description}
                          onChange={EventForm.handleChange}
                          rows="4"
                          class="block p-2.5 w-full text-sm text-gray-900 bg-[#D9D9D9] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                        ></textarea>
                      </div>

                      <div class="mb-6 w-full">
                        <label
                          for="ticket_link"
                          class="block mb-2 text-lg font-medium text-gray-900 "
                        >
                          Ticket Link
                        </label>
                        <input
                          type="text"
                          id="ticket_link"
                          name="ticket_link"
                          value={EventForm.values.ticket_link}
                          onChange={EventForm.handleChange}
                          class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>

                      <div class="flex items-center justify-center w-full">
                        <label
                          for="event_image"
                          class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white "
                        >
                          <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              class="w-8 h-8 mb-4 text-gray-500"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            {eventImg === "" ? (
                              <>
                                <p class="mb-2 text-sm text-gray-500 ">
                                  <span class="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p class="text-xs text-gray-500 ">
                                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                                </p>{" "}
                              </>
                            ) : (
                              <>
                                <p class="mb-2 text-sm text-gray-500 ">
                                  <span class="font-semibold">
                                    Image Selected
                                  </span>{" "}
                                  Click to update
                                </p>
                                <img src={eventImg} className="w-10 h-10" />
                              </>
                            )}
                          </div>
                          <input
                            id="event_image"
                            name="event_image"
                            type="file"
                            class="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex mt-5 mb-1 items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-y-3">
                        {/* {addLoader ? (
                          <button
                            className="bg-gray-900 text-white w-full sm:w-44 h-11 rounded-full text-sm items-center flex justify-center"
                          >
                            <ClipLoader color="#d2d2d2" size={25} />
                          </button>
                        ) : ( */}
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-full bg-black  px-24 py-5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          SAVE & PUBLISH
                        </button>
                        {/* )} */}
                        {/* <button
                          className="text-red-500 font-medium"
                          type="button"
                        >
                          DELETE EVENT
                        </button> */}
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={openEditEventModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={setOpenEditEventModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <form
                    onSubmit={EditEventForm.handleSubmit}
                    encType="multipart/form-data"
                  >
                    <div className="flex  flex-col">
                      <h2 className="text-gray-900 text-center text-lg">
                        Edit Event
                      </h2>
                      <span class="horizontal-line rounded-full bg-yellow-300"></span>

                      <div class="mb-6 w-full">
                        <label
                          for="event_title"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Event Title
                        </label>
                        <input
                          type="text"
                          id="event_title"
                          name="event_title"
                          value={EditEventForm.values.event_title}
                          onChange={EditEventForm.handleChange}
                          class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          required
                        />
                      </div>
                      <h2 className="mb-3 font-medium text-lg">
                        Event time & date
                      </h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-2 w-full">
                        <div>
                          <label
                            for="event_time"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Time
                          </label>
                          <input
                            type="text"
                            id="event_time"
                            name="event_time"
                            value={EditEventForm.values.event_time}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="event_date"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Date
                          </label>
                          <input
                            type="text"
                            id="event_date"
                            name="event_date"
                            value={EditEventForm.values.event_date}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                      </div>
                      <h2 className="mb-3 font-medium text-lg">Location</h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-3 w-full">
                        <div>
                          <label
                            for="venue_name"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Venue Name
                          </label>
                          <input
                            type="text"
                            id="venue_name"
                            name="venue_name"
                            value={EditEventForm.values.venue_name}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="neighborhood"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Neighborhood
                          </label>
                          <input
                            type="text"
                            id="neighborhood"
                            name="neighborhood"
                            value={EditEventForm.values.neighborhood}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div id="pac-card" className="">
                          <label
                            for="address"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Address
                          </label>
                          <PlacesAutocomplete
                            value={address}
                            onChange={(value) => setAddress(value)}
                            onSelect={handleSelect}
                            required
                          >
                            {({
                              getInputProps,
                              suggestions,
                              getSuggestionItemProps,
                              loading,
                            }) => (
                              <div className="location-search-container">
                                <input
                                  required
                                  {...getInputProps({
                                    className: "location-search-input",
                                  })}
                                />
                                <div className="autocomplete-dropdown-container">
                                  {loading && <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', paddingLeft: 5, paddingRight: 5, }}>
                                    Loading...
                                  </div>}
                                  {suggestions.map((suggestion) => (
                                    <div
                                      {...getSuggestionItemProps(suggestion, {
                                        className: "suggestion-item",
                                      })}
                                    >
                                      <span>{suggestion.description}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </PlacesAutocomplete>
                        </div>
                      </div>
                      <h2 className="mb-3 font-medium text-lg">
                        Event Tags (Enter at least one)
                      </h2>
                      <div class="grid gap-6 mb-7 md:grid-cols-4 w-full">
                        <div>
                          <label
                            for="tag1"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 1
                          </label>
                          <input
                            type="text"
                            id="tag1"
                            name="tag1"
                            value={EditEventForm.values.tag1}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            required
                          />
                        </div>
                        <div>
                          <label
                            for="tag2"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 2
                          </label>
                          <input
                            type="text"
                            id="tag2"
                            name="tag2"
                            value={EditEventForm.values.tag2}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                        <div>
                          <label
                            for="tag3"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 3
                          </label>
                          <input
                            type="text"
                            id="tag3"
                            name="tag3"
                            value={EditEventForm.values.tag3}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                        <div>
                          <label
                            for="tag4"
                            class="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Tag 4
                          </label>
                          <input
                            type="text"
                            id="tag4"
                            name="tag4"
                            value={EditEventForm.values.tag4}
                            onChange={EditEventForm.handleChange}
                            class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          />
                        </div>
                      </div>

                      <div className="w-full mb-6">
                        <label
                          for="event_description"
                          class="block mb-2 text-lg font-medium text-gray-900 "
                        >
                          Event Description
                        </label>
                        <textarea
                          id="event_description"
                          name="event_description"
                          required
                          value={EditEventForm.values.event_description}
                          onChange={EditEventForm.handleChange}
                          rows="4"
                          class="block p-2.5 w-full text-sm text-gray-900 bg-[#D9D9D9] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                        ></textarea>
                      </div>

                      <div class="mb-6 w-full">
                        <label
                          for="ticket_link"
                          class="block mb-2 text-lg font-medium text-gray-900 "
                        >
                          Ticket Link
                        </label>
                        <input
                          type="text"
                          id="ticket_link"
                          name="ticket_link"
                          value={EditEventForm.values.ticket_link}
                          onChange={EditEventForm.handleChange}
                          class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>

                      <div class="flex items-center justify-center w-full">
                        <label
                          for="event_image"
                          class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white "
                        >
                          <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              class="w-8 h-8 mb-4 text-gray-500"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            {eventImg === "" ? (
                              <>
                                <p class="mb-2 text-sm text-gray-500 ">
                                  <span class="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p class="text-xs text-gray-500 ">
                                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                                </p>{" "}
                              </>
                            ) : (
                              <>
                                <p class="mb-2 text-sm text-gray-500 ">
                                  <span class="font-semibold">
                                    Image Selected
                                  </span>{" "}
                                  Click to update
                                </p>
                                <img src={eventImg} className="w-10 h-10" />
                              </>
                            )}
                          </div>
                          <input
                            id="event_image"
                            name="event_image"
                            type="file"
                            class="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex mt-5 mb-1 items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-y-3">
                        {/* {editLoader ? (
                          <button

                            className="bg-gray-900 text-white w-full sm:w-44 h-11 rounded-full text-sm items-center flex justify-center"
                          >
                            <ClipLoader color="#d2d2d2" size={25} />
                          </button>
                        ) : ( */}
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-full bg-black  px-24 py-5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          SAVE & PUBLISH
                        </button>
                        {/* )} */}
                        <button
                          onClick={() => handleDeleteEvent(editEventID)}
                          className="text-red-500 font-medium"
                          type="button"
                        >
                          DELETE EVENT
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {loader && <Loader />}
    </>
  );
};

export default Events;
