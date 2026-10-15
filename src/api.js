
import axios from "axios";

const RESTAURANT_API = "https://restaurant-api.dicoding.dev";
const LOCAL_API = "http://localhost:3001";

const localClient = axios.create({
  baseURL: LOCAL_API
});

// Attach the current demo token to protected API requests.
localClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function fetchRestaurants() {
  const response = await fetch(`${RESTAURANT_API}/list`);

  if (!response.ok) {
    throw new Error("Unable to load restaurants.");
  }

  const data = await response.json();
  return data.restaurants || [];
}

export async function fetchRestaurantDetails(id) {
  const response = await axios.get(
    `${RESTAURANT_API}/detail/${id}`
  );

  return response.data.restaurant;
}

// Demo registration. Real applications must hash passwords
// and validate accounts on a secure backend.
export async function registerUser(name, email, password) {
  const response = await axios.get(
    `${LOCAL_API}/users`,
    { params: { email } }
  );

  if (response.data.length > 0) {
    throw new Error("Email already registered. Please log in.");
  }

  const created = await axios.post(`${LOCAL_API}/users`, {
    name,
    email,
    password
  });

  return created.data;
}

// Demo login. The token is generated in the browser,
// not issued or verified by a secure authentication server.
export async function loginUser(email, password) {
  const response = await axios.get(`${LOCAL_API}/users`, {
    params: { email }
  });

  const user = response.data.find(
    (item) => item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token: `demo-${user.id}-${Date.now()}`
  };
}

export async function getReservations() {
  const response = await localClient.get("/reservations");
  return response.data;
}

export async function createReservation(reservation) {
  const response = await localClient.post(
    "/reservations",
    reservation
  );

  return response.data;
}

export async function updateReservation(id, reservation) {
  const response = await localClient.put(
    `/reservations/${id}`,
    reservation
  );

  return response.data;
}

export async function patchReservation(id, changes) {
  const response = await localClient.patch(
    `/reservations/${id}`,
    changes
  );

  return response.data;
}

export async function deleteReservationAPI(id) {
  const response = await localClient.delete(
    `/reservations/${id}`
  );

  return response.data;
}

// Demo tables and time slots: the public restaurant API
// does not provide actual booking availability.
export async function fetchTables(restaurantId) {
  return [
    { id: 1, name: "Table 1", capacity: 2, restaurantId },
    { id: 2, name: "Table 2", capacity: 4, restaurantId },
    { id: 3, name: "Table 3", capacity: 6, restaurantId }
  ];
}

export async function fetchTimeSlots() {
  return [
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
    "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
  ];
}
