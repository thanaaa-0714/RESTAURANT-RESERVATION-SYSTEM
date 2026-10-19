import React from "react";

export function RestaurantCard({ restaurant, onSelect }) {
  return (
    <div>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.city}</p>
      <p>{restaurant.cuisine}</p>
      <button onClick={() => onSelect(restaurant)}>View Details</button>
    </div>);}
export function RestaurantDetail({ restaurant }) {
  if (!restaurant) return <p>No restaurant selected</p>;
  return (
    <section>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.cuisine}</p>
      <p>{restaurant.city}</p></section>);}
export function RestaurantSearch({ restaurants, onSelect }) {
  const [search, setSearch] = React.useState("");
  const [cuisine, setCuisine] = React.useState("All");
  const filtered = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
      restaurant.city.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine =
      cuisine === "All" || restaurant.cuisine === cuisine;
    return matchesSearch && matchesCuisine;});
  return (
    <section>
      <input aria-label="Search restaurants"
        value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or city"/>
      <select aria-label="Cuisine" value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}>
        <option value="All">All</option>
        <option value="Indian">Indian</option>
        <option value="Italian">Italian</option>
        <option value="Seafood">Seafood</option></select>
      {filtered.length === 0 ? (
        <p>No restaurants found</p>
      ) : (
        filtered.map((restaurant) => (
          <RestaurantCard key={restaurant.id}
            restaurant={restaurant} onSelect={onSelect}/>)))}
    </section>);}
export function TableTimeSelection({
  tables,
  times,
  onTableSelect,
  onTimeSelect
}) {
  return (
    <section>
      <h3>Select Table</h3>
      {tables.map((table) => (
        <button key={table.id} onClick={() => onTableSelect(table)}>
          {table.name} (Capacity: {table.capacity})</button>))}
      <h3>Select Time</h3>
      {times.map((time) => (
        <button key={time} onClick={() => onTimeSelect(time)}>{time}</button>
      ))}</section>);}
export function ReservationActions({
  onCreate,
  onCancel
}) {
  return (
    <div>
      <button onClick={onCreate}>Confirm Booking</button>
      <button onClick={onCancel}>Cancel Reservation</button>
    </div>
  );}
export function StatusMessage({ loading, error }) {
  if (loading) return <p>Loading restaurants...</p>;
  if (error) return <p role="alert">{error}</p>;
  return <p>Restaurants loaded successfully</p>;}