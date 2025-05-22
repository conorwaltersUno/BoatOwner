import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// Define mocks outside the factory so they're shared
const mockClearTokens = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockReplace = jest.fn();

jest.mock("@/utils/tokenStorage", () => ({
  clearTokens: mockClearTokens,
}));
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
jest.mock("@expo/vector-icons", () => ({
  FontAwesome: "FontAwesome",
}));

import Settings from "@/app/(tabs)/settings";

describe("Settings Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and footer", () => {
    const { getByText } = render(<Settings />);
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("BoatOwner App v1.0")).toBeTruthy();
  });

  it("renders logout button", () => {
    const { getByText } = render(<Settings />);
    expect(getByText("Log Out")).toBeTruthy();
  });
});
