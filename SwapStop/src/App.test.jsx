import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// basic fetch mock
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        text: () => Promise.resolve("[]"),
      })
    )
  );
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchWithJson(json) {
  fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve(JSON.stringify(json)),
    })
  );
}

describe("App layout and navigation", () => {
  it("shows Home tab by default and renders sample items", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /home/i })).toBeInTheDocument();

    const cards = screen.getAllByText(/cash/i);
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Account tab when Account is clicked", () => {
    render(<App />);
    const accountTab = screen.getByRole("button", { name: /account/i });
    fireEvent.click(accountTab);

    expect(screen.getByRole("heading", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("switches between login and register modes in Account", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();

    const registerTab = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });
});

describe("Account validation behavior", () => {
  it("shows error when trying to log in with empty fields", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));

    const loginButton = screen.getByRole("button", { name: /^log in$/i });
    fireEvent.click(loginButton);

    expect(
      await screen.findByText(/email\/username and password are required/i)
    ).toBeInTheDocument();
  });

  it("shows error when registering with weak password", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /account/i }));
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/^username$/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "weak" },
    });

    const createBtn = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(createBtn);

    expect(
      await screen.findByText(/password must be at least 8 chars/i)
    ).toBeInTheDocument();
  });
});

describe("Items tab basic behavior", () => {
  it("loads browse view and shows 'No items found' when API returns empty list", async () => {
    mockFetchWithJson([]); // items []

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /items/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /items/i })
      ).toBeInTheDocument()
    );

    expect(await screen.findByText(/no items found/i)).toBeInTheDocument();
  });

  it("renders items from API in the grid", async () => {
    const fakeItems = [
      { id: 1, name: "Test Item 1", description: "desc1", price_estimate: 10, owner_id: 1 },
      { id: 2, name: "Test Item 2", description: "desc2", price_estimate: 20, owner_id: 2 },
    ];
    mockFetchWithJson(fakeItems);

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /items/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /items/i })
      ).toBeInTheDocument()
    );

    expect(await screen.findByText(/test item 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/test item 2/i)).toBeInTheDocument();
  });

  it("shows validation message if create item is submitted with missing name", async () => {
    mockFetchWithJson([]); // for initial items load

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /items/i }));

    await screen.findByText(/no items found/i);

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    const createButton = screen.getByRole("button", { name: /create item/i });
    fireEvent.click(createButton);

    expect(
      await screen.findByText(/name is required/i)
    ).toBeInTheDocument();
  });
});
