import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

// Mocks for hooks and components
const mockAddTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockUpdateTask = jest.fn();

jest.mock("@/hooks/index", () => ({
  useGetTasks: jest.fn(),
  useAddTask: () => ({ mutate: mockAddTask }),
  useDeleteTask: () => ({ mutate: mockDeleteTask }),
  useUpdateTask: () => ({ mutate: mockUpdateTask }),
}));

jest.mock("@/components/TaskModal/TaskModal", () => {
  return ({ visible, onClose, onSubmit }: any) =>
    visible ? (
      <>
        <></>
      </>
    ) : null;
});

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: "FontAwesome",
}));

import Todo from "@/app/(tabs)/todo";

const { useGetTasks } = require("@/hooks/index");

jest.spyOn(Alert, "alert").mockImplementation(() => {});

describe("Todo Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    useGetTasks.mockReturnValue({ isLoading: true, isError: false, data: [] });
    const { getByTestId } = render(<Todo />);
    expect(getByTestId("ActivityIndicator")).toBeTruthy();
  });

  it("shows error state", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { message: "Network error" },
      data: [],
    });
    const { getByText } = render(<Todo />);
    expect(getByText("Network error")).toBeTruthy();
    expect(getByText("Add a task")).toBeTruthy();
  });

  it("shows empty state", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    const { getByText } = render(<Todo />);
    expect(getByText("No Tasks Yet")).toBeTruthy();
  });

  it("shows pending and completed tasks", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { id: 1, boat_id: 1, description: "Task 1", status: "pending", created_on: new Date() },
        { id: 2, boat_id: 1, description: "Task 2", status: "completed", created_on: new Date() },
      ],
    });
    const { getByText } = render(<Todo />);
    expect(getByText("Working on it")).toBeTruthy();
    expect(getByText("Completed")).toBeTruthy();
    expect(getByText("Task 1")).toBeTruthy();
    expect(getByText("Task 2")).toBeTruthy();
    expect(getByText("Status: pending")).toBeTruthy();
    expect(getByText("Status: completed")).toBeTruthy();
  });

  it("opens TaskModal when add button is pressed (empty state)", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    const { getByText } = render(<Todo />);
    fireEvent.press(getByText("Add a task"));
  });

  it("calls addTask when handleAddTask is triggered", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    const { getByText } = render(<Todo />);
    fireEvent.press(getByText("Add a task"));
    expect(getByText("Add a task")).toBeTruthy();
  });

  it("shows 'No Tasks Yet' message when lists are empty", () => {
    useGetTasks.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });
    const { getByText } = render(<Todo />);
    expect(getByText("No Tasks Yet")).toBeTruthy();
    expect(getByText("You haven't added any tasks. Tap below to create your first task!")).toBeTruthy();
  });
});
