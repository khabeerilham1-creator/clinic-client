import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./pages/Login";
import api from "./api";

jest.mock("./api", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(),
}));

jest.mock("./utils/activityLog", () => ({
  addActivityLog: jest.fn(() => Promise.resolve()),
}));

jest.mock("./utils/sound", () => ({
  playSectionSound: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: {} });
  api.post.mockImplementation((url) => {
    if (url === "/login") {
      return Promise.resolve({
        data: {
          token: "test-token",
          username: "admin",
          name: "HDC Admin",
          role: "admin",
        },
      });
    }

    if (url === "/shift-access") {
      return Promise.resolve({
        data: {
          shiftId: "morning",
          shiftName: "Morning Shift",
          doctorName: "Dr Tufyl",
        },
      });
    }

    return Promise.resolve({ data: {} });
  });
});

test("renders the image-backed welcome screen", () => {
  render(<Login />);

  expect(screen.getByRole("button", { name: "Continue to login" })).toBeInTheDocument();
  expect(document.querySelector(".auth-screen-welcome")).toHaveStyle({
    "--auth-bg": "url(/auth-assets/welcome.png)",
  });
});

test("shows account image cards after admin and shift access", async () => {
  render(<Login />);

  await userEvent.click(screen.getByRole("button", { name: "Continue to login" }));
  await userEvent.type(screen.getByLabelText("username"), "admin");
  await userEvent.type(screen.getByLabelText("password"), "adminpass");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));

  await userEvent.click(await screen.findByRole("button", { name: "Morning Shift" }));
  await userEvent.type(screen.getByLabelText("Morning Shift Password"), "morningpass");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
  });

  expect(screen.getByRole("button", { name: "Admin" })).toHaveStyle({
    "--auth-choice-bg": "url(/auth-assets/account-admin-card.png)",
  });
  expect(screen.getByRole("button", { name: "Receptionist" })).toHaveStyle({
    "--auth-choice-bg": "url(/auth-assets/account-receptionist-card.png)",
  });
  expect(screen.getByRole("button", { name: "Dentist" })).toHaveStyle({
    "--auth-choice-bg": "url(/auth-assets/account-dentist-card.png)",
  });
});
