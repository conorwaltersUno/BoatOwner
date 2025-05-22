import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { View, Text, TouchableOpacity } from "react-native";
import CalendarLogsView from "@/app/(tabs)/calendar";

// Mock hooks and components
jest.mock("@/hooks/index", () => ({
  useGetLogs: jest.fn(),
}));
jest.mock("@/components/LogDetailModal", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ modalVisibility }: { modalVisibility: boolean }) =>
    modalVisibility ? <View testID="LogDetailModal" /> : null;
});
jest.mock("react-native-calendars", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    Calendar: ({ onDayPress, ...props }: any) => (
      <View>
        <Text>Mock Calendar</Text>
        <TouchableOpacity
          testID="calendar-day"
          onPress={() => onDayPress && onDayPress({ dateString: "2024-05-21" })}
        >
          <Text>Press Day</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

const { useGetLogs } = require("@/hooks/index");

describe("CalendarLogsView", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    useGetLogs.mockReturnValue({ isLoading: true, data: [] });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("Loading logs...")).toBeTruthy();
  });

  it("shows error state", () => {
    useGetLogs.mockReturnValue({ isError: true, error: { message: "Network error" }, data: [] });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("Error loading logs: Network error")).toBeTruthy();
  });

  it("shows empty state", () => {
    useGetLogs.mockReturnValue({ isLoading: false, isError: false, data: [] });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("No Logs Yet")).toBeTruthy();
    expect(
      getByText("You haven't recorded any logs. Tap below to go to the home page and record your first log!")
    ).toBeTruthy();
    expect(getByText("Go to Home")).toBeTruthy();
  });

  it("shows calendar and stats when logs exist", () => {
    useGetLogs.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 1,
          log_started: "2024-05-21T10:00:00",
          log_ended: "2024-05-21T12:00:00",
          created_on: "2024-05-21T09:00:00",
          description: "Morning trip",
          crew_members: ["Alice", "Bob"],
          coordinates: [
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 },
          ],
        },
      ],
    });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("Your Log Calendar")).toBeTruthy();
    expect(getByText("Yearly Stats")).toBeTruthy();
    expect(getByText("Logs")).toBeTruthy();
    expect(getByText("Hours Travelling")).toBeTruthy();
    expect(getByText("Avg. Crew")).toBeTruthy();
    expect(getByText("Distance (nm)")).toBeTruthy();
    expect(getByText("Longest Trip")).toBeTruthy();
    expect(getByText("Shortest Trip")).toBeTruthy();
  });

  it("shows LogDetailModal when a date with a single log is pressed", async () => {
    useGetLogs.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 1,
          log_started: "2024-05-21T10:00:00",
          log_ended: "2024-05-21T12:00:00",
          created_on: "2024-05-21T09:00:00",
          description: "Morning trip",
          crew_members: ["Alice", "Bob"],
          coordinates: [
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 },
          ],
        },
      ],
    });
    const { getByTestId } = render(<CalendarLogsView />);
    fireEvent.press(getByTestId("calendar-day"));
    await waitFor(() => {
      expect(getByTestId("LogDetailModal")).toBeTruthy();
    });
  });

  it("does not crash if error object is missing", () => {
    useGetLogs.mockReturnValue({ isError: true, data: [] });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("Error loading logs:")).toBeTruthy();
  });

  it("does not crash if logs is undefined", () => {
    useGetLogs.mockReturnValue({ isLoading: false, isError: false, data: undefined });
    const { getByText } = render(<CalendarLogsView />);
    expect(getByText("No Logs Yet")).toBeTruthy();
  });
});
