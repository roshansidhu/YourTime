import {StyleSheet} from "react-native";

const lightStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F0F0F0",
      padding: 0,
      margin: 0,
    },
    safeAreaView: {
      flex: 1,
      margin: 0,
      padding: 0,
      backgroundColor: "#F0F0F0",
    },
    scrollViewContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    // Welcome page logo 
    yourTimeLogo: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
    },
    // YourTime logo image
    yourTimeImage: {
      maxWidth: 400,
      maxHeight: 400,
    },
    // Sign in button
    signInButton: {
      backgroundColor: "green",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginVertical: 10,
      alignItems: "center",
      width: "90%",
      alignSelf: "center",
    },
    // Sign up button
    signUpButton: {
      backgroundColor: "blue",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginVertical: 10,
      alignItems: "center",
      width: "90%",
      alignSelf: "center",
      marginBottom: "20%",
    },
    // Larger font on sign in/up button
    signInLargeText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
    // Medium font on sign in/up button
    signInText: {
      color: "white",
      fontSize: 16,
      textAlign: "center",
      marginTop: 5,
      fontWeight: "bold",
    },
    // Small font on sign in/up button
    signInSmallText: {
      color: "white",
      fontSize: 14,
      textAlign: "center",
      marginTop: 5,
    },
    // All Pages except My Day - Title on top left 
    mainTitleText: {
      color: "black",
      fontSize: 28,
      textAlign: "left",
      paddingTop: 20,
      paddingLeft: 17,
      width: "80%",
    },
    // My Day Page Title (White font)
    myDayMainTitleText: {
      textAlign: "left",
      paddingTop: 20,
      paddingLeft: 17,
      width: "80%",
      color: "white",
      fontSize: 28,
    },
    // Style for each task or project row. MarginBottom covers red from rightSwipe 
    dragTaskProjectRow: {
      height: 50,
      marginTop: 10,
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    // Font for each task or project row
    dragTaskProjectRowText: {
      fontSize: 20,
      textAlign: "left",
    },
    // Style for dynamic wallpaper on My Day page
    imgBackground: {
      flex: 1,
      resizeMode: "cover",
      height: "100%",
    },
    // Style for swipeable delete button. Margin bottom controls spacing between rows
    rightSwipe: {
      height: 50,
      marginTop: 0,
      marginBottom: 5,
      justifyContent: "center",
      backgroundColor: "red",
    },
    // Font for delete button
    swipeDeleteText: {
      color: "white",
      paddingHorizontal: 5,
    },
    // Style for location and weather info wrapper - Left side of the weather display
    weatherTextWrapper: {
      marginLeft: 20,
      marginTop: 10,
      width: "50%",
    },
    // Font style for location
    weatherText: {
      color: "#222",
      fontSize: 22,
      fontWeight: "bold",
    },
    // Font style for temperature
    weatherTempText: {
      color: "#777",
      fontSize: 14,
      fontWeight: "bold",
    },
    // Font style for weather description
    weatherDescriptionText: {
      color: "#666",
      fontSize: 16,
      fontWeight: "bold",
      textTransform: "capitalize",
    },
    // Email and password text input wrapper
    emailPasswordInputWrapper: {
      padding: 20,
      marginVertical: 10,
    },
    // Nav bar button wrapper
    navBarWrapper: {
      width: "100%",
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row", 
      bottom: 20, 
      backgroundColor: "#f0f0f0", 
      paddingTop: 10,
    },
    // Nav bar icons
    navBarIcon: {
      width: 30,
      height: 30,
      marginHorizontal: 5,
    },
    // Nav bar horizontal seperation for buttons
    navBarButton: {
      marginLeft: "3%",
      marginRight: "3%",
    },
    // Nav bar button text
    navBarText: {
      textAlign: "center",
      fontSize: 11,
    },
    // Add project/task button on top right of relevant pages
    topRightButton: {
      textAlign: "right",
      marginRight: 10,
    },
    // Sort button
    topLeftButton: {
      textAlign: "left",
      marginLeft: 10,
    },
    // Vertical margin above and below rows of tasks/projects
    taskRowMargin: {
      marginVertical: 5,
    },
    // Add a project button
    addTaskProjectModalWrapper: {
      textAlign: "right",
      marginTop: 5,
    },
    // Add task/ sort button wrapper
    sortProjectModalWrapper: {
      justifyContent: "space-between",
      marginTop: 5,
      flexDirection: "row", 
    },
    // Project page modal 
    projectModal: {
      backgroundColor: "white",
      width: "90%", 
      height: 280,
      alignItems: "center",
      alignSelf: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
    },
    // Project page cancel button
    cancelButton: {
      backgroundColor: "#708090",
      padding: 10,
      width: 100,
      textAlign: "center",
      margin: 5,
      borderRadius: 5,
      color: "white",
      fontWeight: "bold",
    },
    // Project page add button
    addButton: {
      backgroundColor: "#222021",
      padding: 10,
      width: 100,
      textAlign: "center",
      margin: 5,
      borderRadius: 5,
      color: "white",
      fontWeight: "bold",
    },
    // Project page modal Add a Project title text
    projectModalTitleText: {
      fontSize: 16,
      margin: 20,
      textAlign: "center",
    },
    // Project page modal text input
    projectModalTextInput: {
      width: "80%",
      textAlign: "center",
      fontSize: 14,
      height: 35,
      padding: 5,
      borderColor: "#ccc",
      borderWidth: 2,
      borderRadius: 5,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    // Projects modal - make buttons appear side by side
    projectModalButtonWrapper: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    // Add task button on all tasks page / Project - task page
    allTasksAddTaskButton: {
      backgroundColor: "#708090",
      width: "95%",
      padding: 15,
      borderRadius: 5,
      marginTop: 20,
      alignSelf: "center",
      alignContent: "center",
      marginBottom: 50,
    },
    // Add task button on all tasks page / Project - task page
    addTaskText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    // Position the project modal at the center
    projectModalWrapper: {
      flex: 1,
      justifyContent: "center",
    },
    // Position the tasks page modal at the bottom
    taskModalWrapper: {
      justifyContent: "flex-end",
      width: "100%",
      flex: 1,
      alignItems: "center",
    },
    // Tasks modal background colour
    taskModalBackground: {
      backgroundColor: "#fff",
      padding: 20,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      width: "100%", 
      minWidth: 400,
    },
    // Title on tasks page modal - Add task and notes
    taskListModalTitle: {
      fontSize: 18,
      textAlign: "center",
      margin: 10,
    },
    // Text input on tasks page modal
    taskInput: {
      height: 45,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ccc",
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    // Tasks modal button wrapper
    taskModalButtonWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      margin: 10,
      marginBottom: 25,
    },
    // My day forecast display on the right
    forecastSection: {
      width: "50%",
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 10,
    },
    // Three weather forecast icons
    iconRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "90%",
      marginBottom: 0,
    },
    // Weather forecast icon 
    forecastWeatherIcon: {
      width: 50,
      height: 50,
    },
    // Three weather description below the icon. Same as iconRow
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "90%",
    },
    // Weather description text
    forecastWeatherText: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#444",
    },
    // Make the current weather and weather forecast appear side by side 
    weatherWrapper: {
      flexDirection: "row",
      justifyContent: "space-around",
      margin: 5,
      marginTop: 10,
      marginBottom: 20,
      borderRadius: 5,
      backgroundColor: "#ccc",
      opacity: 0.8,
      paddingBottom: 10,
    },
    // Make the text input and + button appear side by side 
    myDayTaskInputWrapper: {
      position: "absolute",
      bottom: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 40,
      marginRight: 10,
      alignContent: "center",
    },
    // Add task text input
    myDayTaskInput: {
      backgroundColor: "#f8f8f8",
      width: "85%",
      borderRadius: 10,
      height: 45,
      textAlign: "center",
      margin: 5,
    },
    // Add task button
    myDayAddTaskButton: {
      backgroundColor: "#7F92A0",
      height: 45,
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      textAlign: "center",
      margin: 5,
      opacity: 0.8,
    },
    // Delete button
    swipeBox: {
      justifyContent: "center",
      alignItems: "center",
    },
    // Working, break time, break remaining wrapper
    pomodoroInputRowWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      marginHorizontal: 30,
    },
    // Text input description
    pomodoroInputLineText: {
      fontSize: 16,
      padding: 10,
      marginTop: 5,
    },
    // Pomodoro text inputs
    pomodoroTextInput: {
      fontSize: 18,
      borderColor: "#ccc",
      borderWidth: 1,
      paddingVertical: 5,
      width: 100,
      textAlign: "center",
      borderRadius: 5,
    },
    // Pomodoro button wrapper - start, stop, reset
    pomodoroCountdownButtonWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignSelf: "center",
      marginTop: 50,
    },
    // Pomodoro timer display wrapper - countdown and breaks remaining
    pomodoroTimerWrapper: {
      width: "75%",
      padding: 15,
      borderRadius: 15,
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginVertical: 30,
    },
    // Countdown timer text
    pomodoroCountdownText: {
      color: "white",
      fontSize: 50,
      fontWeight: "bold",
    },
    // Countdown status text - working or break time
    pomodoroStatusText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    },
    // Break remaining text
    pomodoroBreakText: {
      color: "white",
      fontSize: 15,
    },
    // Pomodoro start button
    startButton: {
      backgroundColor: "green",
      width: 80,
      height: 80,
      padding: 10,
      borderRadius: 50,
      alignItems: "center",
      marginHorizontal: 10,
    },
    // Pomodoro stop button
    stopButton: {
      backgroundColor: "red",
      width: 80,
      height: 80,
      padding: 10,
      borderRadius: 50,
      alignItems: "center",
    },
    // Pomodoro reset button
    resetButton: {
      backgroundColor: "orange",
      width: 80,
      height: 80,
      padding: 10,
      borderRadius: 50,
      alignItems: "center",
    },
    // Pomodoro button font
    pomodoroButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      marginVertical: "auto",
    },
    // Info button on welcome page
    infoButton: {
      alignItems: "flex-end",   
      marginRight: 10,
      marginBottom: 30,
    },
    // Info button font and background 
    infoButtonText: {
      fontSize: 15,
      backgroundColor: "#ccc",
      padding: 5,
      borderRadius: 30,
      textAlign: "center",
      aspectRatio: 1,
      color: "white", 
      fontWeight: "bold",
      fontStyle: "italic",
    },
    // Information modal on welcome page
     infoModal: {
      backgroundColor: "#f1f1f1",
      opacity: 0.93,
      justifyContent: "center", 
      alignItems: "center",
      alignSelf: "center",
      marginVertical: "auto",
      width: "100%",
      height: "80%",
      borderRadius: 20,
    },
    // Large font on info modal
    welcomeInfoTextLarge: {
      color: "black",
      fontSize: 18,
      margin: 2,
    },
    // Small font on info modal
    welcomeInfoTextSmall: {
      color: "#555",
      fontSize: 15,
      fontStyle: "italic",
    },
    // Individual slider 
    pomodoroSlider: {
      width: "80%",
      justifyContent: "center", 
      alignItems: "center",
      alignSelf: "center",
      marginTop: 10,
    },
    // Slider text description
    pomodoroSliderText: {
      textAlign:"center",
      marginTop: 5,
      fontSize: 14,
    },
    // Red deadline reminder
    deadlineReminder: {
      fontSize: 12,
      backgroundColor: "red",
      opacity: 0.7,
      paddingHorizontal: 8,
      borderRadius: 5,
      paddingVertical: 2,
      color: "white",
    },
    // Title for all project page
    projectsTitleContainer: {
      flexDirection: "row",
      justifyContent: "left",
    },
    // Calender button
    calendarView: {
      alignSelf: "center",
      marginTop: "15", 
    },
    // Calendar modal
    calendarModal: {
      backgroundColor: "white",
      width: "95%", 
      height: "75%",
      alignSelf: "center",
    },
    // Calendar project text for selected date
    calendarModalProjectText: {
      fontSize: 16,
      textAlign: "center",
    },
    // Style for each task or project row. MarginBottom covers red from rightSwipe 
    calendarProjectRow: {
      height: 45,
      marginVertical: 3,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F0F0F0"
    },
    // Individual project row
    listOfProjects: {
      marginTop: 5,
    },
    // Calendar modal button wrapper
    calendarModalButtonWrapper: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 20,
    },
    // Setting page horizontal button wrapper
    inputHorizontalButtonWrapper: {
      flexDirection: "row", 
      alignContent: "center",
      justifyContent: 'center',
      alignSelf: "center",
    },
    // Setting left button - Dark mode and off music
    settingLeftButton: {
      backgroundColor: "#191919",
      borderWidth: 2,
      borderColor: "#ccc",
      padding: 15,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      width: "40%",
      marginTop: 20,
    },
    // Setting right button - Light mode and on music
    settingRightButton: {
      backgroundColor: "#666666",
      borderWidth: 2,
      borderColor: "#ccc",
      padding: 15,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      width: "40%",
      marginTop: 20,
    },
    // Setting button wrapper
    settingInputWrapper: {
      marginVertical: 30,
    },
    // Setting page sign out button
    signOutButton: {
      padding: 15,
      width: "80%",
      backgroundColor: "blue",
      alignContent: "center",
      justifyContent: 'center',
      alignSelf: "center",
      borderColor: "#ccc",
      borderWidth: 2,
      borderRadius: 10,
    },
    // Text inputs on Sign In and Register page
    emailInput: {
      height: 45,
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#ccc",
      paddingHorizontal: 10,
      marginBottom: 20,
      marginHorizontal: 20,
      marginTop: 10,
    },
    // Error page
    errorMessage: {
      alignContent: "center",
      justifyContent: 'center',
      paddingTop: 20,
    },
    // Error page text
    errorMessageText: {
      textAlign:"center",
      marginTop: 5,
      fontSize: 14,
    },
    // Project deadline on add project modal
    dateTimePickerText: {
      fontSize: 15,
      fontWeight: "bold",
      color: "black",
    }
  });
  
  export default lightStyle;
