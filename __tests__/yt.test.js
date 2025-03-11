import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { PomodoroTimer, BottomNavigation, WelcomePage, RegistrationPage, SignInPage, Setting, AllTasks, AllProjectsPage, MyDay } from "../AppTest.js";
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

// Mock gesture handler required for the draggable flatlist
// The following code was obtained from:
// https://github.com/software-mansion/react-native-gesture-handler/issues/344
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: require("react-native/Libraries/Components/View/View"),
}));

// Mock flatlist instead of a draggable flatlist used
// The following code was learnt from:
// https://github.com/facebook/react-native/issues/27724
jest.mock("react-native-draggable-flatlist", () => {
  const {FlatList} = require("react-native");
  function MockedFlatList(props) {
    return (mockedProps) => <FlatList {...mockedProps}></FlatList>;
  }
  return MockedFlatList;
});

// Mock async storage
// The following code was obtained from:
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo location for My Day Page - not fully implemented
// The following code was obtained from:
// https://stackoverflow.com/questions/56441730/jest-mocking-permissions-of-expo-typeerror-cannot-read-property-askasync-of-u
jest.mock('expo', ()=>({
  Permissions: {
     askAsync: jest.fn()
  }
}))

jest.useFakeTimers();

// Mock navigation
// The following code was obtained from:
// https://stackoverflow.com/questions/72237113/mock-addlistener-from-navigation-in-unit-test
const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn((event, callback) => callback())
};

// Test the Pomodoro timer page
describe("Pomodoro", () => {
  it("Pomodoro timer page load correctly.", () => {
    const {getByTestId, getByText} = render(<PomodoroTimer navigation={mockNavigation}/>);
    // Check that the page title is displayed    
    expect(getByText("Pomodoro Timer")).toBeTruthy();

    // Check that the text inputs is displayed  
    expect(getByTestId("workingSlider")).toBeTruthy();
    expect(getByTestId("breakSlider")).toBeTruthy();
    expect(getByTestId("breakRemainingSlider")).toBeTruthy();

    // Check that the start and stop button is displayed 
    expect(getByText("Start")).toBeTruthy();
    expect(getByText("Stop")).toBeTruthy();
    expect(getByText("Reset")).toBeTruthy();
  });

  // Checks the sliders
  // https://stackoverflow.com/questions/58856094/testing-a-material-ui-slider-with-testing-library-react
  it("Sliders on Pomodoro timer page works correctly.", () => {
    const {getByTestId} = render(<PomodoroTimer navigation={mockNavigation}/>);

    // Check the working time slider
    const workingSlider = getByTestId("workingSlider");
    fireEvent(workingSlider, "onSlidingComplete", 2); 
    expect(workingSlider.props.value).toBe(2);

    // Check the break time slider
    const breakSlider = getByTestId("breakSlider");
    fireEvent(breakSlider, "onSlidingComplete", 1); 
    expect(breakSlider.props.value).toBe(1);
    
    // Check the break remaining slider
    const breakRemainingSlider = getByTestId("breakRemainingSlider");
    fireEvent(breakRemainingSlider, "onSlidingComplete", 2); 
    expect(breakRemainingSlider.props.value).toBe(2);
  });

  it("Test Pomodoro timer operation - countdown, breaks remaining, work-break mode", async () => {
    const {getByText, getByTestId, findByText} = render(<PomodoroTimer navigation={mockNavigation}/>);

    const startButton = getByText("Start");
    const stopButton = getByText("Stop");
    const resetButton = getByText("Reset");

    const workingSlider = getByTestId("workingSlider");
    const breakSlider = getByTestId("breakSlider");
    const breakRemainingSlider = getByTestId("breakRemainingSlider");

    // Testing sliders: 2 minutes of work, 1 minute of break, 2 breaks
    fireEvent(workingSlider, "onSlidingComplete", 2); 
    fireEvent(breakSlider, "onSlidingComplete", 1); 
    fireEvent(breakRemainingSlider, "onSlidingComplete", 2); 

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
    await findByText("Time to Work"); 
    expect(getByText("Time to Work")).toBeTruthy();  

    // Check that display changes from working time to break time when countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Take a Break"); 
    expect(getByText("Take a Break")).toBeTruthy();  

    // Check the countdown till 0:01 remaining
    for (i=0; i< 59; i++) {
      await act(async () => {jest.advanceTimersByTime(1000)});
      // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
      const countdownRemaining2 = await findByText(/^(1?[0-9]|2[0-3]):[0-5][0-9]$/);
      console.log(countdownRemaining2.props.children);
    }
    // Check that break time is still being displayed
    await findByText("Take a Break"); 
    expect(getByText("Take a Break")).toBeTruthy();  

    // Check that display changes from break time to working time when countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Time to Work"); 
    expect(getByText("Time to Work")).toBeTruthy();  

    // Check the last 2 minutes of working time
    for (i=0; i< 119; i++) {
      await act(async () => {jest.advanceTimersByTime(1000)});
      // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
      const countdownRemaining2 = await findByText(/^(1?[0-9]|2[0-3]):[0-5][0-9]$/);
      console.log(countdownRemaining2.props.children);
    }

    // Check that working time is still being displayed
    await findByText("Time to Work"); 
    expect(getByText("Time to Work")).toBeTruthy();  

    // Check that display changes from working time to break time when the countdown is 0:00
    await act(async () => {jest.advanceTimersByTime(1000)});
    await findByText("Take a Break"); 
    expect(getByText("Take a Break")).toBeTruthy();   
  });

  it("Test Pomodoro timer buttons", async () => {
    const {getByText, getByTestId, findByText} = render(<PomodoroTimer navigation={mockNavigation}/>);
  
    const startButton = getByText("Start");
    const stopButton = getByText("Stop");
    const resetButton = getByText("Reset");
  
    const workingSlider = getByTestId("workingSlider");
    const breakSlider = getByTestId("breakSlider");
    const breakRemainingSlider = getByTestId("breakRemainingSlider");
  
    // Testing slider value: 2 minutes of work, 1 minute of break, 2 breaks
      fireEvent(workingSlider, "onSlidingComplete", 2); 
      fireEvent(breakSlider, "onSlidingComplete", 1); 
      fireEvent(breakRemainingSlider, "onSlidingComplete", 2); 
  
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
});

// Test the bottom nav bar for correct image and text
describe("BottomNavigation", () => {
  it("Bottom navigation bar load correctly.", () => {
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
    // Setting page
    const setting = require("../assets/icon/setting.png");
    expect(getByTestId("settingImage").props.source).toEqual(setting);
    expect(getByText("Setting")).toBeTruthy();
  });
});

// Test the Welcome page
// The test works only when changing const {data} = await supabase.auth.getUser() 
// if (data.aud) on Welcome Page
describe("WelcomePage", () => {
  it("WelcomePage page logo and button load correctly.", () => {
    const {getByTestId, getByText} = render(<WelcomePage navigation={mockNavigation}/>);
        
    // Check the YourTime logo
    const ytLogo = require("../assets/image/logo.png");
    expect(getByTestId("ytLogo").props.source).toEqual(ytLogo);

    // Check the Sign in and Register button
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByText("Register")).toBeTruthy();
    expect(getByText("Welcome back!")).toBeTruthy();
    expect(getByText("Click here if you're new!")).toBeTruthy();
  });

  it("WelcomePage page info modal load correctly.", () => {
    const {getByTestId, getByText} = render(<WelcomePage navigation={mockNavigation}/>);
    
    // Check the info modal button and display
    const infoButton = getByText("i");
    fireEvent.press(infoButton);
    // Check the info modal when info button is pressed
    expect(getByText("Welcome To YourTime!")).toBeTruthy();
    expect(getByText("All Projects")).toBeTruthy();
    expect(getByText("Create and manage projects.")).toBeTruthy();
    expect(getByText("Track project deadlines using the calendar.")).toBeTruthy();
    expect(getByText("My Day")).toBeTruthy();
    expect(getByText("Note tasks for today and see the weather forecast.")).toBeTruthy();
    expect(getByText("All Tasks")).toBeTruthy();
    expect(getByText("View all your tasks here.")).toBeTruthy();
    expect(getByText("YourTime can automatically sort tasks for you.")).toBeTruthy();
    expect(getByText("Pomodoro Timer")).toBeTruthy();
    expect(getByText("Manage your time better when performing tasks.")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("Select dark or light mode.")).toBeTruthy();
    expect(getByText("Turn on or off background music.")).toBeTruthy();
  });
});

// Test the Register page
describe("RegistrationPage", () => {
  it("Registration page load correctly.", () => {
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

// Test the Sign In page
describe("SignInPage", () => {
  it("Sign In page load correctly.", () => {
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
    // const signInButton = getByTestId("signInButton");
    // fireEvent.press(signInButton);

    // https://stackoverflow.com/questions/61781274/how-to-mock-usenavigation-hook-in-react-navigation-5-0-for-jest-test
    const signUpButton = getByTestId("signUpButton");
    fireEvent.press(signUpButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Register");
  });
});

// Test the Setting page
describe("SettingPage", () => {
  it("Setting page load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<Setting navigation={mockNavigation}/>);

    // Check the page title
    expect(getByText("User Setting")).toBeTruthy();

    // Check the dark mode button
    expect(getByText("Set Dark Mode")).toBeTruthy();
    const darkButton = getByTestId("darkModeButton");
    fireEvent.press(darkButton);
    
    // Check the light mode button
    expect(getByText("Set Light Mode")).toBeTruthy();
    const lightButton = getByTestId("darkModeButton");
    fireEvent.press(lightButton);

    // Check the off music button
    expect(getByText("Off Music")).toBeTruthy();
    const offButton = getByText("Off Music");
    fireEvent.press(offButton);

    // Check the on music button
    expect(getByText("On Music")).toBeTruthy();
    const onButton = getByText("On Music");
    fireEvent.press(onButton);

    // Check the sign out button
    expect(getByText("Sign Out")).toBeTruthy();
  });
});

// Test the All Projects page
describe("AllProjects", () => {
  it("App Projects page title load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<AllProjectsPage navigation={mockNavigation}/>);

    // Check the page title
    expect(getByText("Project Folders")).toBeTruthy();
  });

  it("App Projects page add a project modal load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<AllProjectsPage navigation={mockNavigation}/>);

    // Check the add project button
    const addProjectButton = getByText("Add a project +");
    fireEvent.press(addProjectButton);

    // Check the add project modal when add a project button pressed
    expect(getByText("Add a Project")).toBeTruthy();
    expect(getByText("Project Deadline")).toBeTruthy();

    // Check the add and cancel button on add project modal
    expect(getByText("Add")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();

    // Test new project text input on modal
    const newProjectName = getByTestId("newProjectTest");
    fireEvent.changeText(newProjectName, "new project test");
    expect(newProjectName).toHaveDisplayValue("new project test");

    // Add project button
    const addButton = getByText("Add");

    // Cancel button
    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);
  });
});

// Test the All Tasks page
describe("AllTasks", () => {
  it("All Tasks page project title load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<AllTasks navigation={mockNavigation}/>);

    // Check the page title
    expect(getByText("All Tasks")).toBeTruthy();
  });

  it("All Tasks page Add Task Modal load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<AllTasks navigation={mockNavigation}/>);
    // Check the sort button and press to display the sort modal
    const sortButton = getByText("Sort");
    fireEvent.press(sortButton);

    // Check the sort modal title
    expect(getByText("Sort Tasks")).toBeTruthy();

    // Check the sort modal check box title
    expect(getByText("Urgent Tasks")).toBeTruthy();
    expect(getByText("Important Tasks")).toBeTruthy();
    expect(getByText("Urgent And Important Tasks")).toBeTruthy();

    // Check the important checkbox
    // https://github.com/react-native-checkbox/react-native-checkbox/issues/78
    const filterImportant = getByTestId("filterImportant");
    fireEvent(filterImportant, 'onValueChange', true);
    fireEvent(filterImportant, 'onValueChange', false);

    // Check the urgent checkbox
    // https://github.com/react-native-checkbox/react-native-checkbox/issues/78
    const filterUrgent = getByTestId("filterUrgent");
    fireEvent(filterUrgent, 'onValueChange', true);
    fireEvent(filterUrgent, 'onValueChange', false);

    // Check the urgent and important checkbox
    // https://github.com/react-native-checkbox/react-native-checkbox/issues/78
    const filterUrgentImportant = getByTestId("filterUrgentImportant");
    fireEvent(filterUrgentImportant, 'onValueChange', true);
    fireEvent(filterUrgentImportant, 'onValueChange', false);

    // Press cancel button to close modal
    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);
  });

  it("All Tasks page sort modal load correctly.", () => {
    const {getByTestId, getByText, getAllByText} = render(<AllTasks navigation={mockNavigation}/>);
    // Check the add a task button. Displays the add task modal
    const addTaskButton = getByText("Add a Task +");
    fireEvent.press(addTaskButton);

    // Test the add task text input
    const addTaskInput = getByTestId("addTaskInput");
    fireEvent.changeText(addTaskInput, "Testing Input");
    expect(addTaskInput).toHaveDisplayValue("Testing Input");   

    // Test the add task notes text input
    const addNotesInput = getByTestId("addNotesInput");
    fireEvent.changeText(addNotesInput, "Testing Notes Input");
    expect(addNotesInput).toHaveDisplayValue("Testing Notes Input");   

    // Check the urgent checkbox
    // https://github.com/react-native-checkbox/react-native-checkbox/issues/78
    const isImportantCheckbox = getByTestId("isUrgent");
    fireEvent(isImportantCheckbox, 'onValueChange', true);
    fireEvent(isImportantCheckbox, 'onValueChange', false);

    // Check the important checkbox
    // https://github.com/react-native-checkbox/react-native-checkbox/issues/78
    const isUrgentCheckbox = getByTestId("isImportant");
    fireEvent(isUrgentCheckbox, 'onValueChange', true);
    fireEvent(isUrgentCheckbox, 'onValueChange', false);

    // Cancel button - press to close modal
    const cancelTaskButton = getByText("Cancel");
    fireEvent.press(cancelTaskButton);
  });
});