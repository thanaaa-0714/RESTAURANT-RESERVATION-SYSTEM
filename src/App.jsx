import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store/store";
import "./App.css";
import {
  fetchRestaurants,
  fetchTables,
  fetchTimeSlots,
  loginUser,
  registerUser,
  getReservations,
  createReservation,
  updateReservation,
  patchReservation,
  deleteReservationAPI,
} from "./api";
import {
  setReservations,
  addReservation,
  updateReservation as updateReduxReservation,
  removeReservation,
  setSelectedRestaurant,
  setSelectedTable,
  setSelectedTime,
  clearSelection,
} from "./store/reservationSlice";
function MainApp() {
  const dispatch = useDispatch();
  const { reservations, selectedRestaurant, selectedTable, selectedTime } =
    useSelector((state) => state.reservation);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("authUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }});
  const [page, setPage] = useState(() =>
    localStorage.getItem("authToken") ? "home" : "login", );
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [slots, setSlots] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [guests, setGuests] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!user || !localStorage.getItem("authToken")) return;
    const expiresAt = Number(localStorage.getItem("authExpiry"));
    if (!expiresAt || Date.now() >= expiresAt) {
      logout();}}, []);
  useEffect(() => {
    if (!user || !localStorage.getItem("authToken")) return;
    loadRestaurants();
    loadReservations();
  }, [user]);
  async function loadRestaurants() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
    } catch {
      setError("Unable to load restaurants. Check your internet connection.");
    } finally {
      setLoading(false);}}
  async function loadReservations() {
    try {
      const data = await getReservations();
      dispatch(setReservations(data));
    } catch {
      setError(
        "Cannot load reservations. Check whether JSON Server is running.",);}}
  async function handleAuth(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (authMode === "register") {
        if (!name.trim()) {
          throw new Error("Please enter your name.");}
        await registerUser(name.trim(), email.trim(), password);
        setMessage("Account created. Please log in.");
        setAuthMode("login");
        setPassword("");
      } else {
        const result = await loginUser(email.trim(), password);
        localStorage.setItem("authUser", JSON.stringify(result.user));
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("authExpiry", String(Date.now() + 30 * 60 * 1000));
        setUser(result.user);
        setPage("home");
        setPassword("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Authentication failed.",);
    } finally {
      setLoading(false);
    }}
  function logout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authExpiry");
    setUser(null);
    setPage("login");
    setError("");
    setMessage("");
    dispatch(clearSelection());}
  async function openRestaurant(restaurant) {
    dispatch(setSelectedRestaurant(restaurant));
    setError("");
    setPage("details");
    setLoading(true);
    try {
      const [availableTables, availableSlots] = await Promise.all([
        fetchTables(restaurant.id),
        fetchTimeSlots(),]);
      setTables(availableTables);
      setSlots(availableSlots);
    } catch {
      setError("Unable to load tables or time slots.");
    } finally {
      setLoading(false);
    }}
  async function confirmBooking(event) {
    event.preventDefault();
    setError("");
    if (!selectedRestaurant || !selectedTable || !selectedTime) {
      setError("Please select a restaurant, table and time slot.");
      return;}
    if (!customerName.trim() || !phone.trim() || !date) {
      setError("Reservation details are incomplete.");
      return;}
    if (Number(guests) > selectedTable.capacity) {
      setError("This table cannot accommodate the selected guests.");
      return;}
    if (Number(guests) < 1) {
      setError("Please select at least one guest.");
      return;}
    setLoading(true);
    try {
      const reservation = await createReservation({
        customerName: customerName.trim(),
        phone: phone.trim(),
        guests: Number(guests),
        date,
        requests: request,
        restaurant: selectedRestaurant.name,
        restaurantId: selectedRestaurant.id,
        table: selectedTable.name,
        tableCapacity: selectedTable.capacity,
        time: selectedTime,
        userId: user.id,});
      dispatch(addReservation(reservation));
      setPage("confirmation");
      setMessage("Reservation created successfully!");
    } catch {
      setError("Booking failed. Check JSON Server and try again.");
    } finally {
      setLoading(false);
    }}
  async function editReservation(item) {
    const newTime = window.prompt(
      "Enter new time (for example, 7:00 PM):",
      item.time,);
    if (!newTime?.trim()) return;
    setLoading(true);
    setError("");
    try {
      const updated = await patchReservation(item.id, {
        time: newTime.trim(),});
      dispatch(updateReduxReservation(updated));
      setMessage("Reservation time updated.");
    } catch {
      setError("Unable to update reservation.");
    } finally {
      setLoading(false);
    }}
  async function deleteBooking(item) {
    if (!window.confirm("Delete this reservation?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteReservationAPI(item.id);
      dispatch(removeReservation(item.id));
      setMessage("Reservation deleted.");
    } catch {
      setError("Unable to delete reservation.");
    } finally {
      setLoading(false);
    }}
  async function replaceReservation(item) {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):", item.date);
    if (!newDate?.trim()) return;
    setLoading(true);
    setError("");
    try {
      const updated = await updateReservation(item.id, {
        ...item,
        date: newDate.trim(),});
      dispatch(updateReduxReservation(updated));
      setMessage("Reservation updated.");
    } catch {
      setError("Unable to update reservation.");
    } finally {
      setLoading(false);
    }}
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchText =
      `${restaurant.name || ""} ${restaurant.city || ""}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCuisine =
      cuisine === "All" ||
      (restaurant.cuisine || "").toLowerCase() === cuisine.toLowerCase();
    return matchesSearch && matchesCuisine;});
  const visibleReservations = reservations.filter(
    (item) => !item.userId || item.userId === user?.id,);
  if (!user || !localStorage.getItem("authToken")) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <h2>Restaurant Reservation</h2>
          <p>{authMode === "login" ? "Login to continue" : "Create your account"}</p>
          {authMode === "register" && (
            <input placeholder="Full name" value={name}
              onChange={(e) => setName(e.target.value)}required/>)}
          <input type="email" placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)} required/>
          <input type="password"
            placeholder="Password (minimum 4 characters)" value={password}
            onChange={(e) => setPassword(e.target.value)} minLength={4} required/>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <button disabled={loading}>{loading? "Please wait..."
              : authMode === "login"? "Login": "Create Account"}</button>
          <p>{authMode === "login"
              ? "Don't have an account?": "Already have an account?"}</p>
          <button type="button"className="secondary" onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setError("");
              setMessage(""); }} > {authMode === "login" ? "Register" : "Back to Login"}</button>
        </form>
      </div>);}
  return (
    <div className="app">
      <header>
        <h2>Restaurant Reservation System</h2>
        <span>Welcome, {user.name}</span>
        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("restaurants")}>Restaurants</button>
          <button onClick={() => setPage("history")}>My Reservations</button>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        {page === "home" && (
          <section className="panel">
            <h1>Find your favourite restaurant</h1>
            <p>Search restaurants, choose a table and make a reservation.</p>
            <button onClick={() => setPage("restaurants")}>Browse Restaurants</button>
          </section>)}
        {page === "restaurants" && (
          <section>
            <h1>Restaurants</h1>
            <input placeholder="Search by restaurant or city"
              value={search} onChange={(e) => setSearch(e.target.value)}/>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              <option>All</option>
              <option>Indian</option>
              <option>Italian</option>
              <option>Seafood</option>
              <option>Vegetarian</option></select>
            {loading && <p>Loading restaurants...</p>}
            {!loading && filteredRestaurants.length === 0 && (
              <p>No restaurants found.</p>)}
            <div className="grid">
              {filteredRestaurants.map((restaurant) => (
                <article className="card" key={restaurant.id}>
                  <img src={`https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId}`}
                    alt={restaurant.name}/>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.city}</p>
                  <p>{restaurant.description?.slice(0, 100)}...</p>
                  <button onClick={() => openRestaurant(restaurant)}>View Tables</button>
                </article>
              ))}
            </div></section>)}
        {page === "details" && selectedRestaurant && (
          <section className="panel">
            <h1>{selectedRestaurant.name}</h1>
            <p>{selectedRestaurant.city}</p>
            <p>{selectedRestaurant.description}</p>
            <label>Number of guests</label>
            <input type="number" min="1" value={guests} onChange={(e) => {
                setGuests(Number(e.target.value));
                dispatch(clearSelection());
                dispatch(setSelectedRestaurant(selectedRestaurant));}}/>
            <h3>Available Tables</h3>
            {loading && <p>Loading tables...</p>}
            {!loading &&
              tables.filter((table) => table.capacity >= guests).length ===
                0 && <p>No tables available for {guests} guests.</p>}
            <div className="choices">
              {tables
                .filter((table) => table.capacity >= guests)
                .map((table) => (
                  <button key={table.id}
                    className={selectedTable?.id === table.id ? "chosen" : ""}
                    onClick={() => dispatch(setSelectedTable(table))}>
                    {table.name} — {table.capacity} seats </button>))}</div>
            <h3>Available Time Slots</h3>
            {slots.length === 0 && <p>No time slots available.</p>}
            <div className="choices">
              {slots.map((slot) => (
                <button key={slot} className={selectedTime === slot ? "chosen" : ""}
                  onClick={() => dispatch(setSelectedTime(slot))}>{slot}</button>))}</div>
            {!selectedTable && <p>Please select a table.</p>}
            <button onClick={() => setPage("booking")}
              disabled={!selectedTable || !selectedTime}> Continue to Booking</button>
          </section>)}
        {page === "booking" && (
          <form className="panel" onSubmit={confirmBooking}>
            <h1>Enter Customer Details</h1>
            <p>Restaurant: {selectedRestaurant?.name}<br />Table: {selectedTable?.name}<br />
              Time: {selectedTime}</p>
            <label>Customer Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}required/>
            <label>Phone</label>
            <input type="tel"value={phone}onChange={(e) => setPhone(e.target.value)} required/>
            <label>Date</label>
            <input type="date" value={date}
              min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} required/>
            <label>Special Request</label>
            <textarea value={request} onChange={(e) => setRequest(e.target.value)}/>
            <button disabled={loading}>{loading ? "Saving..." : "Confirm Reservation"} </button>
          </form>)}
        {page === "confirmation" && (
          <section className="panel">
            <h1>Reservation Confirmed!</h1>
            <p>Your reservation has been saved.</p>
            <button onClick={() => {
                dispatch(clearSelection());
                setPage("history");
                setMessage("");}}>View My Reservations </button>
          </section>)}
        {page === "history" && (
          <section>
            <h1>My Reservations</h1>
            {loading && <p>Loading reservations...</p>}
            {!loading && visibleReservations.length === 0 && (
              <p>No reservations found.</p>)}
            {visibleReservations.map((item) => (
              <article className="card history" key={item.id}>
                <h3>{item.restaurant}</h3>
                <p>Customer: {item.customerName}</p>
                <p>Table: {item.table} | Guests: {item.guests} </p>
                <p> Date: {item.date} | Time: {item.time}</p>
                <button onClick={() => editReservation(item)}> Change Time</button>
                <button onClick={() => replaceReservation(item)}> Change Date</button>
                <button className="danger" onClick={() => deleteBooking(item)}> Delete</button>
              </article>))} </section>)}
      </main>
      <footer>© 2026 Restaurant Reservation System</footer>
    </div>);}
export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
