import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PomodoroTimer, BottomNavigation, WelcomePage, RegistrationPage, SignInPage } from "../App.js";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase account 
// https://supabase.com/docs/guides/auth/quickstarts/react-native
const SUPABASE_URL = "https://qztbkshwncsreynkvwtp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dGJrc2h3bmNzcmV5bmt2d3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjYwNzgsImV4cCI6MjA0OTMwMjA3OH0.6dK3zFpK6O0CVTu8Uv4gkzmjc54QH-yPcvBcZLbkfU8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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


  test("Test Pomodoro timer operation - countdown, breaks remaining, work-break mode", async () => {
    const {getByText, getByTestId, findByText} = render(<PomodoroTimer navigation={mockNavigation}/>);

    const startButton = getByText("Start");
    const stopButton = getByText("Stop");
    const resetButton = getByText("Reset");

    const workingTextInput = getByTestId("selectedDurationTest");
    const breakTextInput = getByTestId("breakDurationTest");
    const breakRemainingTextInput = getByTestId("breakRemainingTest");

    // Testing inputs: 2 minutes of work, 1 minute of break, 2 breaks
    fireEvent.changeText(workingTextInput, "2");
    fireEvent.changeText(breakTextInput, "1");
    fireEvent.changeText(breakRemainingTextInput, "2");

    // Start button pressed
    fireEvent.press(startButton);

    // Countdown display the correct time keyed in the text input
    // https://stackoverflow.com/questions/58976251/checking-text-appears-inside-an-element-using-react-testing-library
    expect(getByText("2:00")).toBeTruthy();

    // Check the countdown after 1 second
    // https://jestjs.io/docs/timer-mocks
    // https://callstack.github.io/react-native-testing-library/docs/advanced/understanding-act
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("1:59"); 
    expect(getByText("1:59")).toBeTruthy();

    // Check the countdown after 1 second
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("1:58"); 
    expect(getByText("1:58")).toBeTruthy();

    // Check the countdown until 0:01 remaining
    for (i=0; i< 58 + 59; i++) {
      await act(async () => {jest.advanceTimersByTime(1000)});
      // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
      const countdownRemaining = await findByText(/^(1?[0-9]|2[0-3]):[0-5][0-9]$/);
      console.log(countdownRemaining.props.children);
    }
    expect(getByText("0:01")).toBeTruthy();

    // Check that working time is still being displayed
    await findByText("Working Time"); 
    expect(getByText("Working Time")).toBeTruthy();  

    // Check that display changes from working time to break time when countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Break Time"); 
    expect(getByText("Break Time")).toBeTruthy();  

    // Check the countdown till 0:01 remaining
    for (i=0; i< 59; i++) {
      await act(async () => {jest.advanceTimersByTime(1000)});
      // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
      const countdownRemaining2 = await findByText(/^(1?[0-9]|2[0-3]):[0-5][0-9]$/);
      console.log(countdownRemaining2.props.children);
    }
    // Check that break time is still being displayed
    await findByText("Break Time"); 
    expect(getByText("Break Time")).toBeTruthy();  

    // Check that display changes from break time to working time when countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Working Time"); 
    expect(getByText("Working Time")).toBeTruthy();  

    // Check the last 2 minutes of working time
    for (i=0; i< 119; i++) {
      await act(async () => {jest.advanceTimersByTime(1000)});
      // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
      const countdownRemaining2 = await findByText(/^(1?[0-9]|2[0-3]):[0-5][0-9]$/);
      console.log(countdownRemaining2.props.children);
    }

    // Check that working time is still being displayed
    await findByText("Working Time"); 
    expect(getByText("Working Time")).toBeTruthy();  

    // Check that display changes from working time to break time when the countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Break Time"); 
    expect(getByText("Break Time")).toBeTruthy();  
  });
});

test("Test Pomodoro timer buttons", async () => {
  const {getByText, getByTestId, findByText} = render(<PomodoroTimer navigation={mockNavigation}/>);

  const startButton = getByText("Start");
  const stopButton = getByText("Stop");
  const resetButton = getByText("Reset");

  const workingTextInput = getByTestId("selectedDurationTest");
  const breakTextInput = getByTestId("breakDurationTest");
  const breakRemainingTextInput = getByTestId("breakRemainingTest");

  // Testing inputs: 2 minutes of work, 1 minute of break, 2 breaks
  fireEvent.changeText(workingTextInput, "2");
  fireEvent.changeText(breakTextInput, "1");
  fireEvent.changeText(breakRemainingTextInput, "2");

  // Start button pressed
  fireEvent.press(startButton);

  // Countdown display the correct time keyed in the text input
  // https://stackoverflow.com/questions/58976251/checking-text-appears-inside-an-element-using-react-testing-library
  expect(getByText("2:00")).toBeTruthy();

  // Check the countdown after 1 second
  // https://jestjs.io/docs/timer-mocks
  // https://callstack.github.io/react-native-testing-library/docs/advanced/understanding-act
  await act(async () => {jest.advanceTimersByTime(1000)});
  await findByText("1:59"); 
  expect(getByText("1:59")).toBeTruthy();
  
  // Check the stop button
  fireEvent.press(stopButton);
  // Check the time after 1 second. Timer does not run
  await act(async () => {jest.advanceTimersByTime(1000)});
  await findByText("2:00"); 

  // Check the reset button
  fireEvent.press(resetButton);
  // Check the time after 1 second. Timer not running
  await act(async () => {jest.advanceTimersByTime(1000)});
  await findByText("2:00"); 
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

// Test the bottom nav bar for correct image and text
// The test works only when changing const {data} = await supabase.auth.getUser() 
// if (data.aud) on Welcome Page

// describe("WelcomePage", () => {
//   it("WelcomePage page logo loads correctly.", () => {
//     const {getByTestId, getByText} = render(<WelcomePage navigation={mockNavigation}/>);
        
//     // YourTime logo
//     const ytLogo = require("../assets/image/logo.png");
//     expect(getByTestId("ytLogo").props.source).toEqual(ytLogo);

//     // Sign in and Register button
//     expect(getByText("Sign In")).toBeTruthy();
//     expect(getByText("Register")).toBeTruthy();
//     expect(getByText("Welcome back!")).toBeTruthy();
//     expect(getByText("Click here if you're new!")).toBeTruthy();

//     // Check the info modal button and display
//     const infoButton = getByText("i");
//     fireEvent.press(infoButton);
//     // Check the info modal when info button is pressed
//     expect(getByText("Welcome To YourTime!")).toBeTruthy();
//     expect(getByText("Create and manage project folders.")).toBeTruthy();
//     expect(getByText("Note tasks for today and see the weather forecast.")).toBeTruthy();
//     expect(getByText("View all your tasks here.")).toBeTruthy();
//     expect(getByText("Manage your time better using this timer.")).toBeTruthy();
//   });
// });
 
describe("RegistrationPage", () => {
  it("Registration page loads correctly.", () => {
    const {getByTestId, getByText} = render(<RegistrationPage navigation={mockNavigation}/>);
    
    // Check the email text input
    // https://stackoverflow.com/questions/62473970/best-way-to-test-input-value-in-dom-testing-library-or-react-testing-library
    const emailInput = getByTestId("emailAddress");
    fireEvent.changeText(emailInput, "roshanpal.singh@gmail.com");
    expect(emailInput).toHaveDisplayValue("roshanpal.singh@gmail.com");

    // Check the password text input
    // https://stackoverflow.com/questions/62473970/best-way-to-test-input-value-in-dom-testing-library-or-react-testing-library
    const passwordInput = getByTestId("password");
    fireEvent.changeText(passwordInput, "UOL");
    expect(passwordInput).toHaveDisplayValue("UOL");   

    // Check the register button
    expect(getByText("Register Now")).toBeTruthy();
    expect(getByText("if you are new to YourTime")).toBeTruthy();
  });
});

describe("SignInPage", () => {
  it("Sign In page loads correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<SignInPage navigation={mockNavigation}/>);
    // Check the page title and sign in button - same text on both
    // https://testing-library.com/docs/queries/about/
    expect(getAllByText("Sign In")).toBeTruthy();
      
    // Check the email text input
    // https://stackoverflow.com/questions/62473970/best-way-to-test-input-value-in-dom-testing-library-or-react-testing-library
    const emailInput = getByTestId("emailAddress");
    fireEvent.changeText(emailInput, "roshanpal.singh@gmail.com");
    expect(emailInput).toHaveDisplayValue("roshanpal.singh@gmail.com");

    // Check the password text input
    // https://stackoverflow.com/questions/62473970/best-way-to-test-input-value-in-dom-testing-library-or-react-testing-library
    const passwordInput = getByTestId("password");
    fireEvent.changeText(passwordInput, "UOL");
    expect(passwordInput).toHaveDisplayValue("UOL");   

    // Check the sign up button text
    expect(getByText("Sign Up here if you haven't!")).toBeTruthy();

    // https://stackoverflow.com/questions/61781274/how-to-mock-usenavigation-hook-in-react-navigation-5-0-for-jest-test
    const signUpButton = getByTestId("signUpButton");
    fireEvent.press(signUpButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
  });
});