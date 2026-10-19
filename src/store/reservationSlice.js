import { createSlice } from "@reduxjs/toolkit";
const reservationSlice = createSlice({
  name: "reservation",
  initialState: {
    reservations: JSON.parse(
      localStorage.getItem("reservations") || "[]"),
    selectedRestaurant: null,
    selectedTable: null,
    selectedTime: ""},
  reducers: {
    setReservations: (state, action) => {
      state.reservations = action.payload;},
    addReservation: (state, action) => {
      state.reservations.push(action.payload);},
    updateReservation: (state, action) => {
      const index = state.reservations.findIndex(
        (item) => String(item.id) === String(action.payload.id));
      if (index !== -1) {
        state.reservations[index] = action.payload;}},
    removeReservation: (state, action) => {
      state.reservations = state.reservations.filter(
        (item) => String(item.id) !== String(action.payload));},
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
      state.selectedTable = null;
      state.selectedTime = "";},
    setSelectedTable: (state, action) => {
      state.selectedTable = action.payload;},
    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;},
    clearSelection: (state) => {
      state.selectedRestaurant = null;
      state.selectedTable = null;
      state.selectedTime = "";
    }}
});
export const {
  setReservations,
  addReservation,
  updateReservation,
  removeReservation,
  setSelectedRestaurant,
  setSelectedTable,
  setSelectedTime,
  clearSelection
} = reservationSlice.actions;
export default reservationSlice.reducer;
