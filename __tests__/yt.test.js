import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PomodoroTimer, BottomNavigation } from "../App.js";

jest.useFakeTimers();
// https://stackoverflow.com/questions/72237113/mock-addlistener-from-navigation-in-unit-test
const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn((event, callback) => callback()),
};

// Test the Pomodoro timer page
describe("Pomodoro", () => {
  it("Pomodoro timer page loads correctly.", () => {
    const {getByTestId, getByText} = render(<PomodoroTimer navigation={mockNavigation}/>);
    // Check that the page title is displayed    
    expect(getByText("Pomodoro Timer")).toBeTruthy();

    // Check that the text inputs is displayed  
    expect(getByTestId("selectedDurationTest")).toBeTruthy();
    expect(getByTestId("breakDurationTest")).toBeTruthy();
    expect(getByTestId("breakRemainingTest")).toBeTruthy();

    // Check that the start and stop button is displayed 
    expect(getByText("Start")).toBeTruthy();
    expect(getByText("Stop")).toBeTruthy();
    expect(getByText("Reset")).toBeTruthy();
  });

  // Checks the text input function
  it("Text inputs on Pomodoro timer page works correctly.", () => {
    const {getByTestId} = render(<PomodoroTimer navigation={mockNavigation}/>);

    // Check the working time text input
    const workingTextInput = getByTestId("selectedDurationTest");
    fireEvent.changeText(workingTextInput, "3");
    expect(workingTextInput.props.value).toBe("3");

    // Check the break time text input
    const breakTextInput = getByTestId("breakDurationTest");
    fireEvent.changeText(breakTextInput, "2");
    expect(breakTextInput.props.value).toBe("2");

    // Check the number of breaks remaining text input
    const breakRemainingTextInput = getByTestId("breakRemainingTest");
    fireEvent.changeText(breakRemainingTextInput, "2");
    expect(breakRemainingTextInput.props.value).toBe("2");
  });


  test("Timer countdown on Pomodoro timer page works correctly.", async () => {
    const {getByText, getByTestId, findByText} = render(<PomodoroTimer navigation={mockNavigation}/>);

    const startButton = getByText("Start");
    const stopButton = getByText("Stop");
    const resetButton = getByText("Reset");

    const workingTextInput = getByTestId("selectedDurationTest");

    // 2 minutes keyed into the text input
    fireEvent.changeText(workingTextInput, "2");

    // Start button pressed
    fireEvent.press(startButton);

    // The minute and second text should display 2:00. Currently showing 2:0. To be fixed 
    // https://stackoverflow.com/questions/58976251/checking-text-appears-inside-an-element-using-react-testing-library
    expect(getByText("2:0")).toBeTruthy();

    // Check the time after 1 second
    // https://jestjs.io/docs/timer-mocks
    jest.advanceTimersByTime(1000);
    await findByText("1:59"); 

    // Check the time after 1 second
    jest.advanceTimersByTime(1000);
    await findByText("1:58"); 

    // Stop button pressed
    fireEvent.press(stopButton);

    // Check the time after 5 second. Timer does not run
    // TO FIX THE STOP BUTTON BUG
    jest.advanceTimersByTime(5000);
    await findByText("2:0"); 

    // Reset button pressed
    fireEvent.press(resetButton);

    // Check the time after 5 second. Timer is reset 
    jest.advanceTimersByTime(5000);
    await findByText("2:0"); 
  });
});

// Test the bottom nav bar for correct image and text
describe("BottomNavigation", () => {
  it("Bottom nav bar loads correctly.", () => {
    const {getByTestId, getByText} = render(<BottomNavigation navigation={mockNavigation}/>);
    
    // All projects
    const allProjects = require("../assets/icon/home.png");
    expect(getByTestId("allProjectsImage").props.source).toEqual(allProjects);
    expect(getByText("Projects")).toBeTruthy();
    // My day page
    const myDay = require("../assets/icon/myDay.png");
    expect(getByTestId("myDayImage").props.source).toEqual(myDay);
    expect(getByText("My Day")).toBeTruthy();
    // All tasks page
    const allTasks = require("../assets/icon/calendar.png");
    expect(getByTestId("allTasksImage").props.source).toEqual(allTasks);
    expect(getByText("Tasks")).toBeTruthy();
    // Pomodoro timer page
    const pomodoroTimer = require("../assets/icon/pomodoro.png");
    expect(getByTestId("pomodoroImage").props.source).toEqual(pomodoroTimer);
    expect(getByText("Pomo")).toBeTruthy();
  });
});
