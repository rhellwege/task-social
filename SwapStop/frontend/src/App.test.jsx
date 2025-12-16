import React from "react";
import { render, screen, within } from "@testing-library/react";
import App from "./App";

test("renders the main tabs", () => {
  render(<App />);

  // Scope to the header (landmark role 'banner')
  const header = screen.getByRole("banner");
  // Brand text appears exactly as 'SwapStop' inside the header
  expect(within(header).getByText(/^SwapStop$/)).toBeInTheDocument();

  // Tabs are buttons — assert they are present by accessible name
  expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Users/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Items/i })).toBeInTheDocument();
});
