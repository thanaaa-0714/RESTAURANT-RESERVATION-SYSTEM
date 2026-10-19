import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RestaurantCard,
  RestaurantDetail,
  RestaurantSearch,
  TableTimeSelection,
  ReservationActions,
  StatusMessage
} from "./ReservationComponents";
const restaurants = [
  {
    id: "1",
    name: "Spice Garden",
    city: "Coimbatore",
    cuisine: "Indian"
  },{
    id: "2",
    name: "Urban Bites",
    city: "Chennai",
    cuisine: "Italian"
  },{
    id: "3",
    name: "Ocean Pearl",
    city: "Madurai",
    cuisine: "Seafood"
  }];
describe("Experiment 1: Restaurant Reservation Testing", () => {
  test("a) Restaurant card displays restaurant details", () => {
    render(
      <RestaurantCard restaurant={restaurants[0]} onSelect={jest.fn()}/>);
    expect(screen.getByText("Spice Garden")).toBeInTheDocument();
    expect(screen.getByText("Coimbatore")).toBeInTheDocument();
    expect(screen.getByText("Indian")).toBeInTheDocument();});
  test("a) Restaurant details component displays selected restaurant", () => {
    render(<RestaurantDetail restaurant={restaurants[0]} />);
    expect(
      screen.getByRole("heading", { name: "Spice Garden" })
    ).toBeInTheDocument();
    expect(screen.getByText("Indian")).toBeInTheDocument();
  });
  test("b) Search restaurants by name", async () => {
    const user = userEvent.setup();
    render(
      <RestaurantSearch restaurants={restaurants} onSelect={jest.fn()}/>);
    await user.type(
      screen.getByRole("textbox", { name: "Search restaurants" }),
      "Spice");
    expect(screen.getByText("Spice Garden")).toBeInTheDocument();
    expect(screen.queryByText("Urban Bites")).not.toBeInTheDocument();});
  test("b) Filter restaurants by cuisine", async () => {
    const user = userEvent.setup();
    render(
      <RestaurantSearch restaurants={restaurants} onSelect={jest.fn()}/>);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Cuisine" }),
      "Italian");
    expect(screen.getByText("Urban Bites")).toBeInTheDocument();
    expect(screen.queryByText("Spice Garden")).not.toBeInTheDocument();});
  test("b) Show message when no restaurants match", async () => {
    const user = userEvent.setup();
    render(
      <RestaurantSearch restaurants={restaurants} onSelect={jest.fn()}/>);
    await user.type(
      screen.getByRole("textbox", { name: "Search restaurants" }),
      "Unknown Place");
    expect(screen.getByText("No restaurants found")).toBeInTheDocument();});
  test("c) Select a table and time slot", async () => {
    const user = userEvent.setup();
    const onTableSelect = jest.fn();
    const onTimeSelect = jest.fn();
    const tables = [
      { id: 1, name: "Table 1", capacity: 2 },
      { id: 2, name: "Table 2", capacity: 4 }];
    const times = ["11:00 AM", "1:00 PM"];
    render(
      <TableTimeSelection tables={tables} times={times}
        onTableSelect={onTableSelect} onTimeSelect={onTimeSelect}/>);
    await user.click(
      screen.getByRole("button", {
        name: "Table 2 (Capacity: 4)"}));
    await user.click(
      screen.getByRole("button", { name: "1:00 PM" }));
    expect(onTableSelect).toHaveBeenCalledWith(tables[1]);
    expect(onTimeSelect).toHaveBeenCalledWith("1:00 PM");});
  test("d) Create a reservation", async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();
    render(
      <ReservationActions onCreate={onCreate} onCancel={jest.fn()}/>);
    await user.click(
      screen.getByRole("button", { name: "Confirm Booking" }));
    expect(onCreate).toHaveBeenCalledTimes(1);});
  test("d) Cancel a reservation", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ReservationActions onCreate={jest.fn()} onCancel={onCancel}/>);
    await user.click(
      screen.getByRole("button", { name: "Cancel Reservation" }));
    expect(onCancel).toHaveBeenCalledTimes(1);});
  test("e) Display loading message", () => {
    render(<StatusMessage loading={true} error={null} />);
    expect(
      screen.getByText("Loading restaurants...")
    ).toBeInTheDocument();});
  test("e) Display error message", () => {
    render(
      <StatusMessage loading={false} error="Unable to load restaurants"/>);
    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Unable to load restaurants");});
  test("e) Display success message after loading", () => {
    render(<StatusMessage loading={false} error={null} />);
    expect(
      screen.getByText("Restaurants loaded successfully")
    ).toBeInTheDocument();
  });
});