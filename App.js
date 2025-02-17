import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
  Animated,
  useAnimatedValue,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { createClient } from "@supabase/supabase-js";
import Checkbox from "expo-checkbox";
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

// Bottom Navigation Bar
function BottomNavigation({ navigation }) {
  return (
    <View style={styles.navBarWrapper}>
      {/* Project Directory page - All projects */}
      <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate("All Projects")}>
        <Image testID={"allProjectsImage"} source={require("./assets/icon/home.png")} style={styles.navBarIcon}/>
        <Text style={styles.navBarText}>Projects</Text>
      </TouchableOpacity>
      {/* My Day page - Tasks for the current day */}
      <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate("My Day")}>
        <Image testID={"myDayImage"} source={require("./assets/icon/myDay.png")} style={styles.navBarIcon}/>
        <Text style={styles.navBarText}>My Day</Text>
      </TouchableOpacity>
      {/* Tasks page - All tasks */}
      <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate("AllTasks")}>
        <Image testID={"allTasksImage"} source={require("./assets/icon/calendar.png")} style={styles.navBarIcon}/>
        <Text style={styles.navBarText}>Tasks</Text>
      </TouchableOpacity>
      {/* Pomodoro Timer page */}
      <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate("Pomodoro")}>
        <Image testID={"pomodoroImage"} source={require("./assets/icon/pomodoro.png")} style={styles.navBarIcon}/>
        <Text style={styles.navBarText}>Pomo</Text>
      </TouchableOpacity>
    </View>
  );
}

function PomodoroTimer({ navigation }) {
  // Obtain duration from text input
  const [selectedDuration, setSelectedDuration] = useState(5);
  // Set the minute and second based on selected duration
  const [minute, setMinute] = useState(2);
  const [second, setSecond] = useState(0);
  // Timer running or stopped
  const [timerRunning, setTimerRunning] = useState(false);
  // Number of breaks remaining and break duration
  const [breakRemaining, setBreakRemaining] = useState(2);
  const [breakDuration, setBreakDuration] = useState(1);
  const [onBreak, setOnBreak] = useState(false);

  // CHANGE COUNTDOWN SPEEDS BEFORE FINAL SUBMISSION.
  // The following code was learnt from the link below:
  // https://www.freecodecamp.org/news/how-to-use-settimeout-in-react-using-hooks/
  // https://stackoverflow.com/questions/63409136/set-countdown-timer-react-js/63409863
  useEffect(() => {
    let timer;
    // Set the working time when text input value changed and timer not running
    if (!timerRunning && !onBreak && breakRemaining > 0) {
      setMinute(selectedDuration);
      setSecond(0);
    }

    // Set the break time when text input value changed and timer not running
    if (!timerRunning && onBreak && breakRemaining > 0) {
      setMinute(breakDuration);
      setSecond(0);
    }

    // Start the timer countdown
    if (timerRunning && (minute > 0 || second > 0)) {
      timer = setTimeout(() => {
        // Reduce second by 1 each second. Reduce a minute when second equal 0
        if (second === 0) {
          setMinute(prevMinute => prevMinute - 1);
          setSecond(59);
        } else {
          setSecond(prevSecond => prevSecond - 1);
        }
      }, 1000);
    } else if (timerRunning && minute === 0 && second === 0) {
      // Timer has run out with remaining breaks
      if (breakRemaining > 0) {
        // Else is carried out initially as onBreak state is false
        if (onBreak) {
          // Continue the next cycle of working timer
          setMinute(selectedDuration);
          setSecond(0);
          setOnBreak(false);
        } else {
          // Start the break cycle when timer reaches 0 minute and 0 second
          // Selected break duration is set
          setMinute(breakDuration);
          setSecond(0);
          setOnBreak(true);
          setBreakRemaining(prevBreakRemaining => prevBreakRemaining - 1);
        }
      } else {
        // No more breaks remaining
        setTimerRunning(false);
      }
    }
    // From freecodecamp: Clear the timeout when not used
    return () => clearTimeout(timer);
  }, [minute, second, timerRunning, selectedDuration, breakDuration ]);

  // Reset timer 
  const resetTimer = () => {
    setTimerRunning(false);
    setOnBreak(false);
    setSelectedDuration(2);
    setMinute(2); 
    setSecond(0);
    setBreakRemaining(1); 
    setBreakDuration(1); 
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        {/* Title on top left of page */}
        <View style={styles.mainTitleContainer}>
          <Text style={styles.mainTitleText}>Pomodoro Timer</Text>
        </View>
        {/* Wrapper for timer display */}
        <View style={[styles.pomodoroTimerWrapper, {backgroundColor: onBreak ? "red" : "#536878"}]}>
           {/* https://stackoverflow.com/questions/69909811/show-timer-in-2-digits-instead-of-one-react-timer-hook */} 
          <Text style={styles.pomodoroCountdownText}>{minute}:{second.toString().padStart(2, "0")}</Text>
          <Text style={styles.pomodoroStatusText}>{onBreak ? "Break Time" : "Working Time"}</Text>
          <Text style={styles.pomodoroBreakText}>Breaks Remaining: {breakRemaining}</Text>
        </View>

        {/* Text inputs */}

        {/* Horizontal wrapper for working time */}
        <View style={styles.pomodoroInputRowWrapper}>
          <Text style={styles.pomodoroInputLineText}>Working Time:</Text>
          <TextInput
            style={styles.pomodoroTextInput}
            value={selectedDuration}
            onChangeText={(value) => setSelectedDuration(value)}
            placeholder="Minutes"
            testID="selectedDurationTest"
          />
        </View>

        {/* Horizontal wrapper for break time */}
        <View style={styles.pomodoroInputRowWrapper}>
          <Text style={styles.pomodoroInputLineText}>Break Time:</Text>
          <TextInput
            style={styles.pomodoroTextInput}
            value={breakDuration}
            onChangeText={(value) => setBreakDuration(value)}
            placeholder="Minutes"
            testID="breakDurationTest"
          />
        </View>

        {/* Horizontal wrapper for number of breaks */}
        <View style={styles.pomodoroInputRowWrapper}>
          <Text style={styles.pomodoroInputLineText}>Breaks Remaining:</Text>
          <TextInput
            style={styles.pomodoroTextInput}
            placeholder="Breaks"
            value={breakRemaining}
            onChangeText={(value) => setBreakRemaining(value)}
            testID="breakRemainingTest"
          />
        </View>

        {/* Wrapper for breaks remaining and countdown timer */}
        <View style={styles.pomodoroCountdownButtonWrapper}>
          <TouchableOpacity style={styles.stopButton} onPress={() => setTimerRunning(false)}>
            <Text style={styles.pomodoroButtonText}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={() => setTimerRunning(true)}>
            <Text style={styles.pomodoroButtonText}>Start</Text>
          </TouchableOpacity>
           <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.pomodoroButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Bar */}
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}


// Welcome Page - Sign in or register
function WelcomePage({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  // Check if user exist and authenticated
  // https://supabase.com/docs/reference/javascript/auth-getuser
  // aud is response for authenticated users on supabase docs
  useEffect(() => {
    const getSession = async () => {
      const {data:{user:{aud}}} = await supabase.auth.getUser()
      if (aud) {
        navigation.navigate("All Projects");
      }
    };
    getSession();
  }, []);

  // https://reactnative.dev/docs/animations
  const fadeAnim = useAnimatedValue(0);
  // https://mariajz.medium.com/mastering-react-native-animations-83acb98ac18d
  const animation = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    Animated.spring(animation, {
      toValue: 10,
      duration: 10000,
      friction: 0.1,
      tension: 20,
      useNativeDriver: true
    }).start();
  }, [animation]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Animated.View style={{transform:[{translateY:animation}]}}>
        <TouchableOpacity style={styles.infoButton} onPress={showModal}>
          <Text style={styles.infoButtonText}>i</Text>
        </TouchableOpacity>
      </Animated.View>


      <View style={styles.yourTimeLogo}>
        {/* YourTime logo fade in */}
        <Animated.View style={{opacity: fadeAnim}}>
          <Image testID={"ytLogo"}  source={require("./assets/image/logo.png")} style={styles.yourTimeImage}/>
        </Animated.View>
      </View>
      {/* Sign in and register buttons */}
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("SignIn")}>
        <Text style={styles.signInLargeText}>Sign In</Text>
        <Text style={styles.signInSmallText}>Welcome back!</Text>
      </TouchableOpacity> 
      <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.signInLargeText}>Register</Text>
        <Text style={styles.signInSmallText}>Click here if you're new!</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {hideModal}}
      >
        <View style={styles.infoModal}>           
          <Text style={styles.welcomeInfoTextLarge}>Welcome To YourTime!</Text>
          <Text style={styles.welcomeInfoTextSmall}>---------------</Text>
          <Text style={styles.welcomeInfoTextLarge}> </Text>

          <Text style={styles.welcomeInfoTextLarge}>All Projects</Text>
          <Text style={styles.welcomeInfoTextSmall}>Create and manage project folders.</Text>
          <Text style={styles.welcomeInfoTextLarge}> </Text>

          <Text style={styles.welcomeInfoTextLarge}>My Day</Text>
          <Text style={styles.welcomeInfoTextSmall}>Note tasks for today and see the weather forecast.</Text>
          <Text style={styles.welcomeInfoTextLarge}> </Text>

          <Text style={styles.welcomeInfoTextLarge}>All Tasks</Text>
          <Text style={styles.welcomeInfoTextSmall}>View all your tasks here.</Text>
          <Text style={styles.welcomeInfoTextLarge}> </Text>

          <Text style={styles.welcomeInfoTextLarge}>Pomodoro Timer</Text>
          <Text style={styles.welcomeInfoTextSmall}>Manage your time better using this timer.</Text>
          <Text style={styles.welcomeInfoTextLarge}> </Text>

          <TouchableOpacity style={styles.signUpButton} onPress={hideModal}>
            <Text style={styles.signInLargeText}>Close</Text>
          </TouchableOpacity>
        </View>  
      </Modal>
    </SafeAreaView>
  );
}

// Registration Page - Allow users to register an account
// TO IMPROVE: ERROR HANDLING AND SECURITY, REGISTRATION EMAIL
// The following code was learnt from:
// https://supabase.com/docs/guides/auth/quickstarts/react-native
// https://supabase.com/blog/react-native-authentication
// https://supabase.com/docs/reference/javascript/update
function RegistrationPage({ navigation }) {
  // Store username and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // https://stackoverflow.com/questions/43676695/email-validation-react-native-returning-the-result-as-invalid-for-all-the-e
  const checkValidEmail = (email) => {
    if(!( /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
      alert("Incorrect email format. Please try again");
    }
  };

  const signUpSupabase = async () => {
    checkValidEmail(email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      }

      // Add the new user's id and email to the users table 
      const {user} = data; 
      const {userTableError} = await supabase
        .from("users")
        .insert({id: user.id, email});
        if (userTableError) {
          alert(userTableError.message);
        } else {
          alert("Sucessfully registered! Sign in to begin using YourTime");
        }
        navigation.navigate("SignIn");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.mainTitleText}>Register</Text>
      <View style={styles.emailPasswordInputWrapper}>
        <TextInput
          testID="emailAddress"
          style={styles.taskInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize={'none'}
        />
        <TextInput
          testID="password"
          style={styles.taskInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize={'none'}
        />
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={signUpSupabase}>
          <Text style={styles.signInLargeText}>Register Now</Text>
          <Text style={styles.signInSmallText}>if you are new to YourTime</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Sign In Page 
// The following code was learnt from:
// https://supabase.com/docs/guides/auth/quickstarts/react-native
// https://supabase.com/blog/react-native-authentication
// https://supabase.com/docs/reference/javascript/update
function SignInPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // https://stackoverflow.com/questions/43676695/email-validation-react-native-returning-the-result-as-invalid-for-all-the-e
  const checkValidEmail = (email) => {
    if(!( /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
      alert("Incorrect email address");
    }
  };

  const signInSupabase = async () => {
    checkValidEmail(email);
    // Sign in and redirect to All Projects page
    try {
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        alert("Welcome to YourTime!");
      }
      navigation.navigate("All Projects");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.mainTitleText}>Sign In</Text>
      <View style={styles.emailPasswordInputWrapper}>
        {/* Email text input */}
        <TextInput
          testID="emailAddress"
          style={styles.taskInput}     
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        {/* Password text input */}
        <TextInput
          testID="password"
          style={styles.taskInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        {/* Sign In button */}
        <TouchableOpacity style={styles.signInButton} onPress={signInSupabase}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        {/* Registration Page button */}
        <TouchableOpacity testID="signUpButton" style={styles.signUpButton} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.signInText}>Sign Up here if you haven't!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// All Projects page - List all projects. Add and remove project folders.
function AllProjectsPage({ navigation }) {
  // Store projects in the project array
  const [project, setProject] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  // Show or hide the modal
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch all project data from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select
  const getProjectsSupabase = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch all projects from projects table on Supabase based on the unique userId
      const {data, error: projectError} = await supabase
        .from("projects")
        .select()
        .eq("user_id", user.id)
        .order("projectSequence");

      if (projectError) {
        alert(projectError.message);
      } else {
        // Store project data from Supabase
        setProject(data); 
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getProjectsSupabase();
  }, []);

  // Add a project to Supabase projects table for current user
  const addProject = async () => {
    try {
      const {data:{user}} = await supabase.auth.getUser();

      setModalVisible(false); // Hide the modal

      // Error handling for empty project name
      // https://stackoverflow.com/questions/68196981/how-to-check-a-textinput-on-emptiness
      if (!newProjectName.trim()) {
        alert("Please key in a project name");
        return;
      }

      // Add the new project name into the projects table on Supabase for current user
      // https://supabase.com/docs/reference/javascript/using-filters
      const {data, error: addProjectError} = await supabase
        .from("projects")
        .insert({projectTitle: newProjectName, user_id: user.id}) 
        .select();

      if (addProjectError) {
        alert(addProjectError.message);
      } else {
        // Update the project hook with the newly added project
        setProject(prevProjects => [...prevProjects, data[0]]);
        // Clear the text input
        setNewProjectName(""); 
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete a project from Supabase projects table for current user
  // https://supabase.com/docs/reference/javascript/delete
  const deleteProject = async (projectID) => {
    try {
      // Delete selected project from projects table using the unique projectID
      const {error} = await supabase
        .from("projects")
        .delete()
        .eq("projectID", projectID);

      if (error) {
        alert(error.message);
      } else {
        setProject((prevProjects) =>
          // Update the project hook by filtering out the project with selected projectID
          // https://stackoverflow.com/questions/54280241/how-to-delete-an-item-using-filter-reactjs
          prevProjects.filter(project => project.projectID !== projectID)
        );
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Swipe from right to delete a project. Shows red box with delete text when swiped from right
  // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
  const SwipeFromRight = (projectID) => {
    return (
      <View style={styles.swipeBox}>
        <Text style={styles.swipeDeleteText} onPress={() => deleteProject(projectID)}>Delete</Text>
      </View>
    );
  };

  // Save the project data after a project has been dragged and dropped. Use the updated data to 
  // update the sequence on Supabase projectSequence column
  const DragAndDrop = async ({data}) => {
    setProject(data);
    try {
      const {error} = await supabase
      if (error) {
        alert(error.message);
      } else {
        // Update the projectSequence column with current sequence when a project is dragged and dropped
        for (i = 0; i < data.length; i++) {
          await supabase
            .from("projects")
            .update({projectSequence:i}) 
            .eq("projectID", data[i].projectID);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };  

  // Show all projects
  const renderItem = ({item, drag, isActive}) => {
    {/* Swipe from right to delete a project using ReanimatedSwipable */}
    {/* The following code was learnt and implemented based on the github link below: */}
    {/* https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34 */}
    return (
      <ReanimatedSwipeable
        containerStyle={styles.rightSwipe}
        friction={5} // Gives elastic feel when swiping 
        rightThreshold={10} 
        enableTrackpadTwoFingerGesture
        renderRightActions={() => SwipeFromRight(item.projectID)}
      >
        {/* Allow drag and drop tasks using react native draggable flatlist */}
        {/* The following code was learnt and implemented based on the github link below: */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <TouchableOpacity
          onLongPress={drag} // Allow projects to be dragged when tapped
          disabled={isActive}
          // Change row colour when dragged
          style={[styles.dragTaskProjectRow,{backgroundColor: isActive ? "#fff" : "#e8e8e8"}]}
          // Redirect to relevant tasks page when tapped based on projectTitle
          onPress={() => navigation.navigate("Tasks", {projectID: item.projectTitle})}
        >
          <Text style={styles.dragTaskProjectRowText}>{item.projectTitle}</Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  {/* GestureHandlerRootView needed for draggable flatlist */}
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.mainTitleContainer}>
          {/* Page title*/}
          <Text style={styles.mainTitleText}>Project Folders</Text>
          {/* Add project name text input */}
          {/* Show the add project modal when add project is pressed */}
          <View style={styles.addTaskProjectModalWrapper}>
            <TouchableOpacity
              // Show the modal
              onPress={() => setModalVisible(true)}
              style={styles.taskRowMargin}
            >
              <Text style={styles.topRightButton}>Add a project +</Text>
            </TouchableOpacity>
          </View>
          {/* Create a modal to add projects */}
          {/* The following code was learnt and implemented from: */}
          {/* https://reactnative.dev/docs/modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.projectModalWrapper}>
              <View style={styles.projectModal}>
                <Text style={styles.projectModalTitleText}>Add a Project</Text>
                <TextInput 
                  style={styles.projectModalTextInput}
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  placeholder="New project name"
                />
                {/* Wrapper for add and cancel buttons */}
                <View style={styles.projectModalButtonWrapper}>
                  <TouchableOpacity onPress={addProject}>
                    <Text style={styles.addButton}>Add</Text>
                  </TouchableOpacity>
                  {/* Close the modal when cancel is pressed */}
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* Display the draggable & swipable projects */}
        {/* The following code was learnt and implemented using: */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <View style={styles.draggableRow}>
          <DraggableFlatList
            // Display relevant list of projects using projectID
            data={project}
            onDragEnd={DragAndDrop}
            keyExtractor={(item) => item.projectID}
            renderItem={renderItem}
            // Remove spacing between rows
            ItemSeparatorComponent={() => (<View style={{height: 0, margin: 0}} />)}
            contentContainerStyle={{margin: 0, padding: 0}}
          />
        </View>
      </View>
      {/* Display the navigation bar */}
      <BottomNavigation navigation={navigation} />
    </GestureHandlerRootView>
  );
}

// Task List page - List tasks for selected project
function TaskListPage({ route, navigation }) {
  // Get projectID from AllProjectsPage to show relevant tasks
  const {projectID} = route.params;
  // Store tasks in the tasks array
  const [tasks, setTasks] = useState([]);
  // Strore new task name
  const [newTaskName, setNewTaskName] = useState("");
  // Show or hide the modal
  const [modalVisible, setModalVisible] = useState(false);
  // Store urgency and importance state
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  // Store notes for a task
  const [taskTitleNotes, setTaskTitleNotes] = useState("");
  // State of task being edited
  const [editTask, setEditTask] = useState(false);

  // Fetch all tasks for a given projectID from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select

  const getTasksSupabase = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch tasks from tasks table based on projectID and unique userId from Supabase
      const {data, error: tasksError} = await supabase
        .from("tasks")
        .select()
        .eq("user_id", user.id)
        .eq("projectID", projectID)
        .order("taskSequence");
      
      if (tasksError) {
        alert(tasksError.message);
      } else {
        // Store task data from Supabase
        setTasks(data);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getTasksSupabase();
  }, [projectID]);

  // The coding style for modal was learnt from:
  // https://medium.com/@amolakapadi/custom-modal-in-react-native-8577b11f8e4f
  // https://reactnative.dev/docs/modal
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Open the task modal when a task is pressed and display data for editing
  const openTaskModal = (selectedTask) => {
    if (selectedTask) {
      // Show saved data on relevant text input when a task is being edited
      setEditTask(selectedTask);
      setNewTaskName(selectedTask.taskTitle);
      setTaskTitleNotes(selectedTask.taskTitleNotes);
      setIsUrgent(selectedTask.isUrgent);
      setIsImportant(selectedTask.isImportant);
    } else {
      // Clears the text inputs when adding a new task
      setEditTask(false);
      setNewTaskName("");
      setTaskTitleNotes("");
      setIsUrgent(false);
      setIsImportant(false);
    }
    setModalVisible(true);
  };

  // Add a task to Supabase tasks table for current user based on projectID
  const addTask = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      setModalVisible(!modalVisible);

      // Error handling for empty task name
      // https://stackoverflow.com/questions/68196981/how-to-check-a-textinput-on-emptiness
      if (!newTaskName.trim()) {
        alert("Please key in a task");
        return;
      }

      // Change userId with user.id at insert
      // and add the task with user_id
      // Add the new task and other task data into the tasks table on Supabase for current user
      const {data, error: addTaskError} = await supabase
        .from("tasks")
        .insert({taskTitle: newTaskName, user_id: user.id, projectID, isUrgent, isImportant, taskTitleNotes}) 
        .select();

      if (addTaskError) {
        alert(addTaskError.message);
      } else {
        // Update the tasks hook with the newly added task
        setTasks(prevTasks => [...prevTasks, data[0]]);
        // Clear the text inputs and deselect important and urgent
        setNewTaskName(""); 
        setIsUrgent(false);
        setIsImportant(false);
        setTaskTitleNotes("");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete a task from Supabase tasks table based on taskID
  // https://supabase.com/docs/reference/javascript/delete
  const deleteTask = async (taskID) => {
    try {
      // Delete selected task from tasks table using the unique taskID
      const {error}  = await supabase
        .from("tasks")
        .delete()
        .eq("taskID", taskID);

      if (error) {
        alert(error.message);
      } else {
        // Update the tasks hook by filtering out the task with selected taskID
        // https://stackoverflow.com/questions/54280241/how-to-delete-an-item-using-filter-reactjs
        setTasks((prevTasks) => prevTasks.filter(task => task.taskID !== taskID)
        );
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Swipe from right to delete a task based on taskID. Shows a red box with delete text when swiped from right
  // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
  const SwipeFromRight = (taskID) => {
    return (
      <View style={styles.swipeBox}>
        <Text style={styles.swipeDeleteText} onPress={() => deleteTask(taskID)}>Delete</Text>
      </View>
    );
  };

  // Saves the task data after a task has been dragged and dropped. Use the updated data to 
  // update the sequence on Supabase taskSequence column
  const DragAndDrop = async ({data}) => {
    setTasks(data);
    try {
      const {error} = await supabase
      if (error) {
        alert(error.message);
      } else {
        // Update the taskSequence column with current sequence when a task is dragged and dropped
        for (i = 0; i < data.length; i++) {
          await supabase
            .from("tasks")
            .update({taskSequence:i}) 
            .eq("taskID", data[i].taskID);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };  

  // Show all tasks
  const renderItem = ({item, drag, isActive}) => {
    {/* Swipe from right to delete a project using ReanimatedSwipable */}
    {/* The following code was learnt and implemented based on the github link below: */}
    {/* https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34 */}
    return (
      <ReanimatedSwipeable
        containerStyle={styles.rightSwipe}
        friction={5}
        rightThreshold={10}
        enableTrackpadTwoFingerGesture
        renderRightActions={() => SwipeFromRight(item.taskID)}
      >
        {/* Drag and drop tasks using react native draggable flatlist */}
        {/* The following code was learnt and implemented based on the github link below: */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <TouchableOpacity
          onLongPress={drag}
          // Open the task modal when a task is pressed
          onPress={() => openTaskModal(item)} 
          disabled={isActive}
          style={[styles.dragTaskProjectRow, {backgroundColor: isActive ? "#fff" : "#ccc"}]}
        >
          {/* Display tasks */}
          <Text style={styles.dragTaskProjectRowText}>{item.taskTitle}</Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  {/* GestureHandlerRootView needed for draggable flatlist */}
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <GestureHandlerRootView>
        <View style={styles.container}>
          <Text style={styles.mainTitleText}>{projectID}</Text>
          <View style={styles.addTaskProjectModalWrapper}>
            <TouchableOpacity style={styles.taskRowMargin}>
              {/* Display the project name as the title of the page */}
              <Text style={styles.topRightButton}>Tasks for {projectID}</Text>
            </TouchableOpacity>
          </View>
          {/* Display the draggable and swipable projects */}
          {/* The following code was learnt and implemented using: */}
          {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
          <DraggableFlatList
            // Display relevant list of tasks using taskID
            data={tasks}
            onDragEnd={DragAndDrop}
            keyExtractor={(item) => item.taskID}
            renderItem={renderItem}
          />
          {/* Create a modal to add projects */}
          {/* The following code was learnt and implemented from: */}
          {/* https://reactnative.dev/docs/modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
          >
            <View style={styles.taskModalWrapper}>
              {/* Prevent the keyboard from blocking the view */}
              {/* https://reactnative.dev/docs/keyboardavoidingview */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >

                <View style={styles.taskModalBackground}>
                  {/* Task title */}
                  <Text style={styles.taskListModalTitle}>Add a Task</Text>
                  <TextInput
                    style={styles.taskInput}
                    value={newTaskName}
                    onChangeText={setNewTaskName}
                    placeholder="Task Name"
                  />
                  {/* Task notes */}
                  <Text style={styles.taskListModalTitle}>Notes</Text>
                  <TextInput
                    style={styles.taskInput}
                    value={taskTitleNotes}
                    onChangeText={setTaskTitleNotes}
                    placeholder="Notes"
                  />
                  {/* Urgent check box */}
                  {/* https://docs.expo.dev/versions/latest/sdk/checkbox/ */}                  
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={isUrgent}
                      onValueChange={setIsUrgent}
                      color={isUrgent ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Mark as Urgent</Text>
                  </View>
                  {/* Important check box */}
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={isImportant}
                      onValueChange={setIsImportant}
                      color={isImportant ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Mark as Important</Text>
                  </View>
                  {/* Add and cancel buttons */}
                  <View style={styles.taskModalButtonWrapper}>
                    <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
                      <Text style={styles.signInText}>Cancel</Text>
                    </TouchableOpacity>
                    {/* Registration Page button */}
                    <TouchableOpacity style={styles.addButton} onPress={addTask}>
                      <Text style={styles.signInText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          style={styles.allTasksAddTaskButton}
          onPress={() => openTaskModal()}
        >
          <Text style={styles.addTaskText}>Add Task</Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
      {/* Show bottom navigation bar */}
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}

// All Tasks page - Show all tasks
function AllTasks({ navigation }) {
  // Store tasks in the tasks array
  const [tasks, setTasks] = useState([]);
  // Store new task name
  const [newTaskName, setNewTaskName] = useState("");
  // Show or hide the modal
  const [modalVisible, setModalVisible] = useState(false);
  // Store urgency and importance state
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  // Store notes for a task
  const [taskTitleNotes, setTaskTitleNotes] = useState("");
  // State of task being edited
  const [editTask, setEditTask] = useState(null);
  // Show or hide the sort modal
  const [sortModalVisible, setSortModalVisible] = useState(false);
  // Sort tasks - urgent 
  const [viewUrgent, setViewUrgent] = useState(false);
  // Sort tasks - important
  const [viewImportant, setViewImportant] = useState(false);
  // Sort tasks - urgent and important
  const [viewUrgentImportant, setViewUrgentImportant] = useState(false);
  
  // Fetch all tasks from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select
  const getAllTasks = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();
      // Sort urgent and important tasks
      if (viewUrgentImportant) {
        const {data, error: allTasksError} = await supabase
          .from("tasks")
          .select()
          .eq("user_id", user.id)
          .order("isUrgent", {ascending: false})
          .order("isImportant", {ascending: false});        
        if (allTasksError) {
          alert(allTasksError.message);
        } else {
        // Store task data from Supabase
        setTasks(data);
        }
      // Sort urgent tasks
      } else if (viewUrgent) {
        const {data, error: allTasksError} = await supabase
          .from("tasks")
          .select()
          .eq("user_id", user.id)
          .order("isUrgent", {ascending: false});
        if (allTasksError) {
          alert(allTasksError.message);
        } else {
        // Store task data from Supabase
        setTasks(data);
        }
      // Sort important tasks
      } else if (viewImportant) {
        const {data, error: allTasksError} = await supabase
          .from("tasks")
          .select()
          .eq("user_id", user.id)
          .order("isImportant", {ascending: false});
        if (allTasksError) {
          alert(allTasksError.message);
        } else {
          // Store task data from Supabase
          setTasks(data);
        }
      // No sorting
      } else {
        const {data, error: allTasksError} = await supabase
          .from("tasks")
          .select()
          .eq("user_id", user.id)
      if (allTasksError) {
        alert(allTasksError.message);
      } else {
        // Store task data from Supabase
        setTasks(data);
      }}
      } catch (error) {
      alert(error.message);
      }
    };
  
  useEffect(() => {
    getAllTasks();
  }, []);

  // The coding style for modal was learnt from:
  // https://medium.com/@amolakapadi/custom-modal-in-react-native-8577b11f8e4f
  // https://reactnative.dev/docs/modal
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleSortModal = () => {
    setSortModalVisible(!sortModalVisible);
  };

  // Open the task modal when a task is pressed and display data for editing
  const openTaskModal = (selectedTask) => {
    if (selectedTask) {
      // Show saved data on relevant text input when a task is being edited
      setEditTask(selectedTask);
      setNewTaskName(selectedTask.taskTitle);
      setTaskTitleNotes(selectedTask.taskTitleNotes);
      setIsUrgent(selectedTask.isUrgent);
      setIsImportant(selectedTask.isImportant);
    } else {
      // Clears the text inputs when adding a new task
      setEditTask(false);
      setNewTaskName("");
      setTaskTitleNotes("");
      setIsUrgent(false);
      setIsImportant(false);
    }
    setModalVisible(true);
  };

  // Add task or save an edited task to Supabase tasks table for current user
  const saveTask = async () => {
    // Add the folliwng line when done
    // const {data: {user}, error: userError} = await supabase.auth.getUser();

    // Remove the following hardcoded userId when done
    const {data: {user}, error: userError} = await supabase.auth.getUser();

    if (!newTaskName.trim()) {
      alert("Please key in a task");
      return;
    }

    try {
      if (editTask) {
        // Edit mode to edit a task based on the taskID
        const {data, error} = await supabase
          .from("tasks")
          .update({
            taskTitle: newTaskName,
            taskTitleNotes,
            isUrgent,
            isImportant,
          })
          .eq("taskID", editTask.taskID);

        if (error) {
          alert(error.message);
        } else {
          // Update a task data with edited task data when both task ID and edit task ID are equal
          // https://stackoverflow.com/questions/68610001/what-may-cause-a-function-to-not-be-recognized-as-a-function-in-react
          // https://stackoverflow.com/questions/72402394/i-cant-see-the-date-when-i-add-a-new-task-in-react-js
          setTasks(prevTasks => prevTasks.map(task => task.taskID === editTask.taskID ? {...task, ...data[0]}:task));
        }
      } else {
        // Add a new task into the tasks table on Supabase
        const {data, error} = await supabase
          .from("tasks")
          .insert({
            taskTitle: newTaskName,
            user_id: user.id,
            taskTitleNotes,
            isUrgent,
            isImportant,
          })
          .select();

        if (error) {
          alert(error.message);
        } else {
          // Update the tasks hook with the newly added task
          setTasks(prevTasks => [...prevTasks, data[0]]);
        }
      }
      // Clear the text inputs and deselect important and urgent
      setModalVisible(false);
      setNewTaskName("");
      setTaskTitleNotes("");
      setIsUrgent(false);
      setIsImportant(false);
      setEditTask(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete a task from Supabase tasks table based on taskID
  // https://supabase.com/docs/reference/javascript/delete
  const deleteTask = async (taskID) => {
    try {
      // Delete selected task from tasks table using the unique taskID
      const {error} = await supabase
        .from("tasks")
        .delete()
        .eq("taskID", taskID);

        if (error) {
          alert(error.message);
        } else {
        // Update the tasks hook by filtering out the task with selected taskID
        // https://stackoverflow.com/questions/54280241/how-to-delete-an-item-using-filter-reactjs
        setTasks((prevTasks) => prevTasks.filter(task => task.taskID !== taskID));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Swipe from right to delete a task based on taskID. Shows a red box with delete text when swiped from right 
  // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
  const SwipeFromRight = (taskID) => (
    <View style={styles.swipeBox}>
      <Text style={styles.swipeDeleteText} onPress={() => deleteTask(taskID)}>Delete</Text>
    </View>
  );

  const renderItem = ({item, drag, isActive}) => (
    // Swipe from right to delete a project using ReanimatedSwipable 
    // The following code was learnt and implemented based on the github link below:
    // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
    <ReanimatedSwipeable
      containerStyle={styles.rightSwipe}
      friction={5}
      rightThreshold={10}
      enableTrackpadTwoFingerGesture
      renderRightActions={() => SwipeFromRight(item.taskID)}
    >
      {/* Drag and drop tasks using react native draggable flatlist */}
      {/* The following code was learnt and implemented based on the github link below: */}
      {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
      <TouchableOpacity
        onLongPress={drag}
        onPress={() => openTaskModal(item)}
        disabled={isActive}
        style={[
          styles.dragTaskProjectRow,
          {backgroundColor: isActive ? "#f9f9f9" : "#fff"},
        ]}
      >
        {/* Display all tasks */}
        <Text style={styles.dragTaskProjectRowText}>{item.taskTitle}</Text>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <GestureHandlerRootView>
        <View style={styles.container}>
          <Text style={styles.mainTitleText}>All Tasks</Text>
          <View style={styles.sortProjectModalWrapper}>
            {/* Sort modal button */}
            <TouchableOpacity
              onPress={() => setSortModalVisible(true)}
              style={styles.taskRowMargin}
            >
              <Text style={styles.topLeftButton}>Sort</Text>
            </TouchableOpacity>
            {/* Add task modal button */}
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.taskRowMargin}
            >
              <Text style={styles.topRightButton}>Add a Task +</Text>
            </TouchableOpacity>
          </View>
          {/* Display the draggable and swipable projects */}
          {/* The following code was learnt and implemented using: */}
          {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
          <DraggableFlatList
            data={tasks}
            onDragEnd={({data}) => setTasks(data)}
            keyExtractor={(item) => item.taskID}
            renderItem={renderItem}
          />
          {/* Add tasks modal */}
          {/* The following code was learnt and implemented from: */}
          {/* https://reactnative.dev/docs/modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
          >
            <View style={styles.taskModalWrapper}>
              {/* Prevent the keyboard from blocking the view */}
              {/* https://reactnative.dev/docs/keyboardavoidingview */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >

                <View style={styles.taskModalBackground}>
                  {/* Display Edit or Add task mode */}
                  <Text style={styles.taskListModalTitle}>
                    {editTask ? "Edit task" : "Add task"}
                  </Text>
                  {/* Task title */}
                  <TextInput
                    style={styles.taskInput}
                    value={newTaskName}
                    onChangeText={setNewTaskName}
                    placeholder="Task Name"
                  />
                  <Text style={styles.taskListModalTitle}>Notes</Text>
                  {/* Task notes */}
                  <TextInput
                    style={styles.taskInput}
                    value={taskTitleNotes}
                    onChangeText={setTaskTitleNotes}
                    placeholder="Notes"
                  />
                  {/* Urgent check box */}
                  {/* https://docs.expo.dev/versions/latest/sdk/checkbox/ */}  
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={isUrgent}
                      onValueChange={setIsUrgent}
                      color={isUrgent ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Urgent Task</Text>
                  </View>
                  {/* Important check box */}
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={isImportant}
                      onValueChange={setIsImportant}
                      color={isImportant ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Important Task</Text>
                  </View>
                  {/* Add and cancel buttons */}
                  <View style={styles.taskModalButtonWrapper}>
                    <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
                      <Text style={styles.signInText}>Cancel</Text>
                    </TouchableOpacity>
                    {/* Registration Page button */}
                    <TouchableOpacity style={styles.addButton} onPress={saveTask}>
                      <Text style={styles.signInText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
          {/* Sort modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={sortModalVisible}
            onRequestClose={toggleSortModal}
          >
            <View style={styles.taskModalWrapper}>
              {/* Prevent the keyboard from blocking the view */}
              {/* https://reactnative.dev/docs/keyboardavoidingview */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View style={styles.taskModalBackground}>
                  <Text style={styles.taskListModalTitle}>Sort Tasks</Text>
                  {/* Urgent check box */}
                  {/* https://docs.expo.dev/versions/latest/sdk/checkbox/ */}  
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={viewUrgent}
                      onValueChange={setViewUrgent}
                      color={viewUrgent ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Urgent Tasks</Text>
                  </View>
                  {/* Important check box */}
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={viewImportant}
                      onValueChange={setViewImportant}
                      color={viewImportant ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Important Tasks</Text>
                  </View>
                  {/* Urgent And Important check box */}
                  <View style={styles.checkBoxModal}>
                    <Checkbox
                      value={viewUrgentImportant}
                      onValueChange={setViewUrgentImportant}
                      color={viewUrgentImportant ? "blue" : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Urgent And Important Tasks</Text>
                  </View>
                  {/* Add and cancel buttons */}
                  <View style={styles.taskModalButtonWrapper}>
                    <TouchableOpacity style={styles.cancelButton} onPress={toggleSortModal}>
                      <Text style={styles.signInText}>Cancel</Text>
                    </TouchableOpacity>
                    {/* Registration Page button */}
                    <TouchableOpacity style={styles.addButton} onPress={getAllTasks}>
                      <Text style={styles.signInText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </Modal>
        </View>
      </GestureHandlerRootView>
      <TouchableOpacity
        style={styles.allTasksAddTaskButton}
        onPress={() => openTaskModal()}
      >
        <Text style={styles.addTaskText}>Add Task</Text>
      </TouchableOpacity>
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}

// My Day Page - Display current city, weather icon, weather description and temperature. Weather forecase for + 6, 9 and 12 hours included
function MyDay({ navigation }) {
  // Store current location
  const [location, setLocation] = useState(null);
  // Store current weather
  const [weather, setWeather] = useState(null);
  // Store weather forecast
  const [forecast, setForecast] = useState(null);
  // Store task †itles
  const [myDayTaskTitle, setMyDayTaskTitle] = useState([]);
  // New task title
  const [newDayTaskTitle, setNewMyDayTaskTitle] = useState("");

  // API key for openWeatherMaps
  const API_KEY = "3bf82023a0ac4138f111892ef82e7214";

  // The following code was learnt from:
  // https://medium.com/@harshanabatagalla/building-a-weather-forecast-app-with-react-and-openweathermap-api-acb57627118b
  useEffect(() => {
    (async () => {
      // Get device permission for location
      // https://docs.expo.dev/versions/latest/sdk/location/
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Could not get permission for location");
        return;
      }

      // Get the location for the weather and dynamic wallpaper
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Get the weather based on location
      if (location) {
        const {latitude, longitude} = location.coords;
        try {
          // Get the current weather
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          // Store current weather
          setWeather(data);
          // Get the forecase weather
          const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          // Store the forecase weather
          // threeForecastData initially used to splice the long weather received. Remove prior to submission if not used
          const forecastData = await forecastResponse.json();
          const threeForecastData = forecastData.list;
          setForecast(threeForecastData);

           console.log(forecastData.list[1]);
           console.log(forecastData.list[3]);
           console.log(forecastData.list[5]);

          // console.log(threeForecastData.list[0].weather[0].id);
          // console.log(threeForecastData.list[1].weather[0].id);
        } catch (error) {
          alert("Could not fetch the weather");
        }
      }
    })();
  }, []);

  // Fetch my day tasks from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select
  useEffect(() => {
    const getProjectsSupabase = async () => {
      try {
        // Get the user details in order to obtain the user id
        const {data:{user}} = await supabase.auth.getUser();

        // Fetch all my day tasks from myDayTasks table on Supabase based on the userId
        const {data, error: myDayError} = await supabase
          .from("myDayTasks")
          .select()
          .eq("user_id", user.id);

        if (myDayError) {
          alert(myDayError.message);
        } else {
          // Store my day task data from Supabase
          setMyDayTaskTitle(data); 
        }
      } catch (error) {
        alert(error.message);
      }
    };
    getProjectsSupabase();
  }, []);

  // Add a my day task to Supabase myDayTasks table for current user
  const addMyDayTask = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Error handling for empty project name
      // https://stackoverflow.com/questions/68196981/how-to-check-a-textinput-on-emptiness
      if (!newDayTaskTitle.trim()) {
        alert("Project name cannot be empty.");
        return;
      }

      // Add a new task into the myDayTasks table on Supabase for current user
      // https://supabase.com/docs/reference/javascript/using-filters
      const {data, error: addMyDayTaskError} = await supabase
        .from("myDayTasks")
        .insert({myDayTaskTitle: newDayTaskTitle, user_id: user.id}) 
        .select();

      if (addMyDayTaskError) {
        alert(addMyDayTaskError.message);
      } else {
        // Update the project hook with the newly added project
        setMyDayTaskTitle(prevTasks => [...prevTasks, data[0]]);
        // Clear the text input
        setNewMyDayTaskTitle(""); 
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete a task from Supabase myDayTasks table for current user
  // https://supabase.com/docs/reference/javascript/delete
  const deleteMyDayTask = async (myDayTaskId) => {
    try {
      // Delete selected task from myDayTasks table using myDayTaskId
      const {error} = await supabase
        .from("myDayTasks")
        .delete()
        .eq("myDayTaskId", myDayTaskId); 

      if (error) {
        alert( error.message);
      } else {
        // Update the project hook by filtering out the task with selected myDayTaskId
        // https://stackoverflow.com/questions/54280241/how-to-delete-an-item-using-filter-reactjs
        setMyDayTaskTitle((prevTasks) => prevTasks.filter(task => task.myDayTaskId !== myDayTaskId));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Swipe from right to delete a task
  // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
  const SwipeFromRight = (myDayTaskId) => {
    return (
      <View style={styles.swipeBox}>
        <Text style={styles.swipeDeleteText} onPress={() => deleteMyDayTask(myDayTaskId)}>Delete</Text>
      </View>
    );
  };

  // Returns the wallpaper based on the current weather
  const wallpaperSelector = () => {
    // Use default wallpaper if weather cannot be obtained
    if (!weather) {
      console.log("Could not get weather info for wallpaper");
      return require("./assets/myDayWallpaper/main.jpg");
    }

    const weatherID = weather.weather[0].id;
    // Select the appropriate wallpaper based on the weather ID
    // https://openweathermap.org/weather-conditions#Icon-list
    // Thunderstorm
    if (weatherID >= 200 && weatherID <= 232) {
      return require("./assets/myDayWallpaper/ts.jpg");
    }
    // Drizzle
    else if (weatherID >= 300 && weatherID <= 321) {
      return require("./assets/myDayWallpaper/dz.jpeg");
    }
    // Rain
    else if (weatherID >= 500 && weatherID <= 531) {
      return require("./assets/myDayWallpaper/ra.jpg");
    }
    // Snow
    else if (weatherID >= 600 && weatherID <= 622) {
      return require("./assets/myDayWallpaper/sn.jpg");
    }
    // Mist, Fog, Dust
    else if (weatherID >= 700 && weatherID <= 781) {
      return require("./assets/myDayWallpaper/br.jpg");
    }
    // Clear
    else if (weatherID === 800) {
      return require("./assets/myDayWallpaper/skc.jpeg");
    }
    // Clouds
    else if ((weatherID) => 801 && weatherID <= 804) {
      return require("./assets/myDayWallpaper/cloud.jpg");
    }
  };

  // Returns the icon based on the current weather
  const iconSelector = () => {
    // Use default icon if weather cannot be obtained
    if (!weather) {
      console.log("Could not get weather info for icon");
      return require("./assets/weatherIcon/01d.png");
    }

    const weatherID = weather.weather[0].id;
    // Select the appropriate wallpaper based on the weather ID
    // https://openweathermap.org/weather-conditions#Icon-list
    // Thunderstorm
    if (weatherID >= 200 && weatherID <= 232) {
      return require("./assets/weatherIcon/11d.png");
    }
    // Drizzle
    else if (weatherID >= 300 && weatherID <= 321) {
      return require("./assets/weatherIcon/09d.png");
    }
    // Rain
    else if (weatherID >= 500 && weatherID <= 504) {
      return require("./assets/weatherIcon/10d.png");
    }
    // Rain
    else if (weatherID == 511) {
      return require("./assets/weatherIcon/13d.png");
    }
    // Rain
    else if (weatherID >= 520 && weatherID <= 531) {
      return require("./assets/weatherIcon/09d.png");
    }
    // Snow
    else if (weatherID >= 600 && weatherID <= 622) {
      return require("./assets/weatherIcon/13d.png");
    }
    // Mist, Fog, Dust
    else if (weatherID >= 700 && weatherID <= 781) {
      return require("./assets/weatherIcon/50d.png");
    }
    // Clear
    else if (weatherID === 800) {
      return require("./assets/weatherIcon/01d.png");
    }
    // Clouds
    else if (weatherID == 801) {
      return require("./assets/weatherIcon/02d.png");
    }
    // Clouds
    else if (weatherID == 802) {
      return require("./assets/weatherIcon/03d.png");
    }
    // Clouds
    else if (weatherID == 803) {
      return require("./assets/weatherIcon/04d.png");
    }
    // Clouds
    else if (weatherID == 804) {
      return require("./assets/weatherIcon/04d.png");
    }
  };

  // Returns the icon for the forecast weather
  const forecastIconSelector = (weatherID) => {
    // Use default wallpaper if weather cannot be obtained
    if (!weatherID) {
      console.log("Could not get the forecast weather for icon");
      return require("./assets/weatherIcon/01d.png");
    }

    // Select the appropriate wallpaper based on the weather ID
    // https://openweathermap.org/weather-conditions#Icon-list
    // Thunderstorm
    if (weatherID >= 200 && weatherID <= 232) {
      return require("./assets/weatherIcon/11d.png");
    }
    // Drizzle
    else if (weatherID >= 300 && weatherID <= 321) {
      return require("./assets/weatherIcon/09d.png");
    }
    // Rain
    else if (weatherID >= 500 && weatherID <= 504) {
      return require("./assets/weatherIcon/10d.png");
    }
    // Rain
    else if (weatherID == 511) {
      return require("./assets/weatherIcon/13d.png");
    }
    // Rain
    else if (weatherID >= 520 && weatherID <= 531) {
      return require("./assets/weatherIcon/09d.png");
    }
    // Snow
    else if (weatherID >= 600 && weatherID <= 622) {
      return require("./assets/weatherIcon/13d.png");
    }
    // Mist, Fog, Dust
    else if (weatherID >= 700 && weatherID <= 781) {
      return require("./assets/weatherIcon/50d.png");
    }
    // Clear
    else if (weatherID === 800) {
      return require("./assets/weatherIcon/01d.png");
    }
    // Clouds
    else if (weatherID == 801) {
      return require("./assets/weatherIcon/02d.png");
    }
    // Clouds
    else if (weatherID == 802) {
      return require("./assets/weatherIcon/03d.png");
    }
    // Clouds
    else if (weatherID == 803) {
      return require("./assets/weatherIcon/04d.png");
    }
    // Clouds
    else if (weatherID == 804) {
      return require("./assets/weatherIcon/04d.png");
    }
  };

  // Store the wallpaper and weather icon
  const wallpaper = wallpaperSelector();
  const weatherIcon = iconSelector();

  // Show my day tasks
  // https://github.com/computerjazz/react-native-draggable-flatlist
  const renderItem = ({item, drag, isActive}) => {
    {/* Swipe from right to delete a project using ReanimatedSwipable */}
    {/* The following code was learnt and implemented based on the github link below: */}
    {/* https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34 */}
    return (
      <ReanimatedSwipeable
        containerStyle={styles.rightSwipe}
        friction={5}
        rightThreshold={10}
        enableTrackpadTwoFingerGesture
        renderRightActions={() => SwipeFromRight(item.myDayTaskId)}
      >
        {/* Drag and drop tasks using react native draggable flatlist */}
        {/* The following code was learnt and implemented based on the github link below: */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          // Change row colour when dragged
          style={[styles.dragTaskProjectRow, {backgroundColor: isActive ? "#fff" : "#ccc"}]}
        >
          {/* Display tasks for my day */}
          <Text style={styles.dragTaskProjectRowText}>{item.myDayTaskTitle}</Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {/* Set the wallpaper based on weather using ImageBackground */}
      <ImageBackground source={wallpaper} style={styles.imgBackground}>
        <Text style={styles.myDayMainTitleText}>My Day</Text>
        {/* Show location - For testing only */}
        {/* {location && (<Text>Lat: {location.coords.latitude},Long: {location.coords.longitude}</Text>)} */}
        {/* Show weather - For testing only */}
        {/* {weather && (
        <View style={styles.weatherTextWrapper}>
          <Text style = {styles.weatherText}>Country: {weather.sys.country}</Text>
          <Text style = {styles.weatherText}>City: {weather.name}</Text>
          <Text style = {styles.weatherDescriptionText}>Weather: {weather.weather[0].description}</Text>
          <Text style = {styles.weatherText}>Temperature: {weather.main.temp}°C</Text>
          <Text style = {styles.weatherText}>ID: {weather.weather[0].id}</Text>
        </View>
        )} */}

        {/* Wrapper for the weather display */}
        <View style={styles.weatherWrapper}>
          {weather && (
            <View style={styles.weatherTextWrapper}>
              {/* Current weather icon */}
              <Image source={weatherIcon} style={styles.navBarIcon} />
              {/* Current location */}
              <Text style={styles.weatherText}>{weather.name}</Text>
              {/* Current weather description */}
              <Text style={styles.weatherDescriptionText}>{weather.weather[0].description}</Text>
              {/* Current temperature */}
              <Text style={styles.weatherTempText}>{weather.main.temp}°C</Text>
            </View>
          )}

          {forecast && (
            <View style={styles.forecastSection}>
              <View style={styles.iconRow}>
                {/* Forecast weather icons */}
                <Image source={forecastIconSelector(forecast[1].weather[0].id)} style={styles.forecastWeatherIcon}/>
                <Image source={forecastIconSelector(forecast[2].weather[0].id)} style={styles.forecastWeatherIcon}/>
                <Image source={forecastIconSelector(forecast[3].weather[0].id)} style={styles.forecastWeatherIcon}/>
              </View>
              <View style={styles.labelRow}>
                {/* Forecast weather text */}
                <Text style={styles.forecastWeatherText}>+6</Text>
                <Text style={styles.forecastWeatherText}>+9</Text>
                <Text style={styles.forecastWeatherText}>+12</Text>
              </View>
            </View>
          )}
        </View>

        {/* Display my day task list */}
        <GestureHandlerRootView>
          <DraggableFlatList
            data={myDayTaskTitle}
            onDragEnd={({data}) => setMyDayTaskTitle(data)}
            keyExtractor={(item) => item.myDayTaskId}
            renderItem={renderItem}
          />
        </GestureHandlerRootView>

        {/* My day task text input */}
        <View style={styles.myDayTaskInputWrapper}>
          <TextInput
            style={styles.myDayTaskInput}
            value={newDayTaskTitle}
            onChangeText={setNewMyDayTaskTitle}
            placeholder="Add a task for today"
          />
          <TouchableOpacity
            style={styles.myDayAddTaskButton}
            onPress={addMyDayTask}
          >
            <Text style={styles.pomodoroButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="All Projects" component={AllProjectsPage} />
        <Stack.Screen name="Tasks" component={TaskListPage} />
        <Stack.Screen name="AllTasks" component={AllTasks} />
        <Stack.Screen name="My Day" component={MyDay} />
        <Stack.Screen name="SignIn" component={SignInPage} />
        <Stack.Screen name="Register" component={RegistrationPage} />
        <Stack.Screen name="Pomodoro" component={PomodoroTimer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Export for unit testing
export {PomodoroTimer, BottomNavigation, WelcomePage, RegistrationPage, SignInPage};

const styles = StyleSheet.create({
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
    height: 190,
    alignItems: "center",
    alignSelf: "center",
  },
  // Project page cancel button
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    width: 100,
    textAlign: "center",
    margin: 5,
    borderRadius: 5,
  },
  // Project page add button
  addButton: {
    backgroundColor: "lightblue",
    padding: 10,
    width: 100,
    textAlign: "center",
    margin: 5,
    borderRadius: 5,
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
    backgroundColor: "blue",
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
    flex: 1,
    justifyContent: "flex-end",
  },
  // Tasks modal background colour
  taskModalBackground: {
    backgroundColor: "#fff",
    padding: 20,
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
    backgroundColor: "blue",
    height: 45,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    textAlign: "center",
    margin: 5,
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
    width: "80%",
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
    opacity: 0.9,
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
});


// Image reference
// https://wallpaperdelight.com/wallpapers/aesthetic-flower-wallpaper/
// https://commons.wikimedia.org/wiki/File:Sun_rays_over_the_rain_clouds_at_dusk_dawn_with_sharp_gold_sky_view.jpg
// https://pxhere.com/en/photo/1553359
// https://www.goodfon.com/nature/wallpaper-dozhd-trava-luzhi-solnce.html
// https://www.pexels.com/photo/blue-sky-96622/
// https://commons.wikimedia.org/wiki/File:Thunderstorm_003.jpg
// https://www.flickr.com/photos/coconinonationalforest/7699564540
