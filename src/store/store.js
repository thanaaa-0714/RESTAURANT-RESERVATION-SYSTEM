
import { configureStore } from "@reduxjs/toolkit";
import reservationReducer from "./reservationSlice";

const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  localStorage.setItem(
    "reservations",
    JSON.stringify(store.getState().reservation.reservations)
  );

  return result;
};

const store = configureStore({
  reducer: {
    reservation: reservationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware)
});

export default store;
