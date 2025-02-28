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
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  SafeAreaView,
  Alert,
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
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Calendar} from 'react-native-calendars';
import lightStyle from "./style/lightStyle";
import darkStyle from "./style/darkStyle";
import * as Updates from 'expo-updates';
import { Audio } from 'expo-av';

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
      {/* Setting page */}
      <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate("Setting")}>
        <Image testID={"settingImage"} source={require("./assets/icon/setting.png")} style={styles.navBarIcon}/>
        <Text style={styles.navBarText}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
}


// Setting Page 
// The following code was learnt from:
// https://supabase.com/docs/guides/auth/quickstarts/react-native
// https://supabase.com/blog/react-native-authentication
// https://supabase.com/docs/reference/javascript/update
function Setting({ navigation }) {
  // Store dark or light style
  const [style, setStyle] = useState();

  // Fetch user setting from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select
  const getSettingSupabase = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch user style from users table based on user id and unique uuid from Supabase table
      const {data, error: settingError} = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
      
      if (settingError) {
        alert(settingError.message);
      } else {
        // Store userStyle from Supabase
        setStyle(data[0].userStyle);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Set styling to darkStyle
  const setDarkStyle = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch user style from users table based on user id and unique uuid from Supabase
      const {data, error: settingError} = await supabase
        .from("users")
        .update({userStyle: "darkStyle"})
        .eq("id", user.id);

      if (settingError) {
        alert(settingError.message);
      } else {
        // Store userStyle from Supabase, reload YourTime and navigate to settings page
        setStyle("darkStyle");
        // https://stackoverflow.com/questions/37489946/programmatically-restart-a-react-native-app
        await Updates.reloadAsync();
        navigation.navigate("Setting");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Set styling to lightStyle
  // https://supabase.com/docs/reference/javascript/select
  const setLightStyle = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch user style from users table based on user id and unique uuid from Supabase
      const {data, error: settingError} = await supabase
        .from("users")
        .update({userStyle: "lightStyle"})
        .eq("id", user.id);

      if (settingError) {
        alert(settingError.message);
      } else {
        // Store userStyle from Supabase, reload YourTime and navigate to settings page
        setStyle("lightStyle");
        // https://stackoverflow.com/questions/37489946/programmatically-restart-a-react-native-app
        await Updates.reloadAsync();
        navigation.navigate("Setting");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Turn off background music
  const offBgMusic = async () => {
    try {
      // Get the user details
      const {data:{user}} = await supabase.auth.getUser();

      // Update audio enum on Supabase to Off to stop music
      const {data, error: settingError} = await supabase
        .from("users")
        .update({audio: "Off"})
        .eq("id", user.id);

      if (settingError) {
        alert(settingError.message);
      } else {
        // https://stackoverflow.com/questions/37489946/programmatically-restart-a-react-native-app
        await Updates.reloadAsync();
        navigation.navigate("Setting");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Turn off background music
  const onBgMusic = async () => {
    try {
      // Get the user details
      const {data:{user}} = await supabase.auth.getUser();

      // Update audio enum on Supabase to On to start music
      const {data, error: settingError} = await supabase
        .from("users")
        .update({audio: "On"})
        .eq("id", user.id);

      if (settingError) {
        alert(settingError.message);
      } else {
        // https://stackoverflow.com/questions/37489946/programmatically-restart-a-react-native-app
        await Updates.reloadAsync();
        navigation.navigate("Setting");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Sign out from YourTime and navigate to Welcome page
  const signOutSupabase = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert(error.message);
      } else {
        alert("Good Bye! See you again soon!");
      }
      navigation.navigate("Welcome");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.mainTitleText}>User Setting</Text>
      <View style={styles.settingInputWrapper}>
        {/* Email text input */}
        <View style={styles.inputHorizontalButtonWrapper}>
          {/* Dark style button */}
          <TouchableOpacity style={styles.settingLeftButton} onPress={setDarkStyle}>
            <Text style={styles.signInText}>Set Dark Mode</Text>
          </TouchableOpacity>
          {/* Light style button */}
          <TouchableOpacity style={styles.settingRightButton} onPress={setLightStyle}>
            <Text style={styles.signInText}>Set Light Mode</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputHorizontalButtonWrapper}>
          {/* Off Bg Music */}
          <TouchableOpacity style={styles.settingLeftButton} onPress={offBgMusic}>
            <Text style={styles.signInText}>Off Music</Text>
          </TouchableOpacity>
          {/* On Bg Music */}
          <TouchableOpacity style={styles.settingRightButton} onPress={onBgMusic}>
            <Text style={styles.signInText}>On Music</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Sign Out button */}
      <TouchableOpacity style={styles.signOutButton} onPress={signOutSupabase}>
        <Text style={styles.signInText}>Sign Out</Text>
      </TouchableOpacity>
      {/* Show bottom navigation bar */}
      <BottomNavigation navigation={navigation}/>
    </SafeAreaView>
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
        // https://reactnative.dev/docs/alert
        Alert.alert("Congratulations!", "You've reached your target.", [
          {
            text: "OK",
          },
          { 
            text: "Start Over",
            onPress: () => resetTimer()
          }
        ]);
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
          <Text style={styles.pomodoroStatusText}>{onBreak ? "Take a Break" : "Time to Work"}</Text>
          <Text style={styles.pomodoroBreakText}>Breaks Remaining: {breakRemaining}</Text>
        </View>

        {/* Working time slider */}
        <View style={styles.pomodoroSlider}>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={1}
            maximumValue={30}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#777777"
            value={selectedDuration}
            step={1}
            onSlidingStart={(value) => setSelectedDuration(value)}
            onSlidingComplete={(value) => setSelectedDuration(value)}
            testID="workingSlider"
          />
        </View> 
        <Text style={styles.pomodoroSliderText}>Working Time</Text>
        {/* Break time slider */}
        <View style={styles.pomodoroSlider}>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={1}
            maximumValue={5}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#777777"
            value={breakDuration}
            step={1}
            onSlidingStart={(value) => setBreakDuration(value)}
            onSlidingComplete={(value) => setBreakDuration(value)}
            testID="breakSlider"
          />
        </View> 
        <Text style={styles.pomodoroSliderText}>Break Time</Text>
        {/* Break remaining slider */}
        <View style={styles.pomodoroSlider}>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={1}
            maximumValue={5}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#777777"
            value={breakRemaining}
            step={1}
            onSlidingStart={(value) => setBreakRemaining(value)}
            onSlidingComplete={(value) => setBreakRemaining(value)}
            testID="breakRemainingSlider"
          />
        </View> 
        <Text style={styles.pomodoroSliderText}>Breaks Remaining</Text>

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
      <View style={styles.inputWrapper}>
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
      <View style={styles.inputWrapper}>
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
  // Store project deadline
  const [deadline, setDeadline] = useState(new Date());
  // Show or hide the calendar modal
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  // Selected calendar date on the calendar
  const [selected, setSelected] = useState([]);
  // Store projects for selected date
  const [selectedProjects, setSelectedProjects] = useState([]);
  // Store project deadline
  const [calenderDeadline, setCalenderDeadline] = useState({});

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
        // Store project data from Supabase or show a placeholder text when no projects exist
        if(data.length > 0) {
          setProject(data);
          const calenderDates = {};
          for (let i = 0; i < data.length; i++) {
            const project = data[i]; 
            // Get the deadline for projects with a deadline using project title to create multidot marking
            // https://wix.github.io/react-native-calendars/docs/Components/Calendar
            if (project.projectDeadline) {
              const key = project.projectDeadline; 
              calenderDates[key] = {dots: [{key: project.projectTitle, color: "red"}]};
            }          
          }
          setCalenderDeadline(calenderDates);
        } else if (data.length === 0) {
          setProject([{"projectTitle": "Enter your first project"}]);
        }
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

      // Add the new project name and deadline into the projects table on Supabase for current user
      // https://supabase.com/docs/reference/javascript/using-filters
      const {data, error: addProjectError} = await supabase
        .from("projects")
        .insert({projectTitle: newProjectName, user_id: user.id, projectDeadline: deadline}) 
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
        for (let i = 0; i < data.length; i++) {
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
    // Get the current date
    const currentDate = new Date();
    // Get the project deadline date
    const deadline = new Date(item.projectDeadline);
    // Calculate the number of days remaining
    // http://stackoverflow.com/questions/1296358/how-to-subtract-days-from-a-plain-date
    const timeRemaining = Math.ceil(Math.abs(deadline-currentDate)/(24*60*60*1000));
    // Display a reminder text when a project is due in 3 days or less
    const reminder = timeRemaining <= 3;
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
          {reminder && <Text style={styles.deadlineReminder}>{timeRemaining} Days Left</Text>}
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  // Set the date from the date picker
  // The following code was obtained from
  // https://github.com/react-native-datetimepicker/datetimepicker
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDeadline(currentDate);
    console.log(currentDate);
  };

  // Redirect to the project page and display the selected project
  const projectSelectedOnCalender = (projectTitle) => {
    setCalendarModalVisible(false);
    navigation.navigate("Tasks", {projectID: projectTitle});
  };

  // Change modal from calendar to add project
  const changeToProjectModal = () => {
    setCalendarModalVisible(false);
    setModalVisible(true);
  };

  // Show projects of selected date on the calendar with dots
  const getProjectsForSelectedDate = () => {
    // If projects exist for the selected date
    if(selectedProjects.length > 0) {
      let projectForSelectedDay = [];
      // Store projects for the selected date in projectForSelectedDay
      for (let i = 0; i < selectedProjects.length; i++) {
        projectForSelectedDay.push(
          <TouchableOpacity
            style={styles.calendarProjectRow}
            // https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js
            key={selectedProjects[i].projectTitle}
            onPress={() => projectSelectedOnCalender(selectedProjects[i].projectTitle)}
          >
            <Text style={styles.calendarModalProjectText}>{selectedProjects[i].projectTitle}</Text>
          </TouchableOpacity>
        );
      }
      return projectForSelectedDay;
    } else {
      // Display placeholder text when no projects exist for selected date
      return (
        <View style={styles.calendarProjectRow}>
          <Text style={styles.calendarModalProjectText}>No projects found. Select a date with a red dot.</Text>
        </View>
      )     
    }
  };

  {/* GestureHandlerRootView needed for draggable flatlist */}
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={styles.mainTitleContainer}>
          <View style={styles.projectsTitleContainer}>
            {/* Page title */}
            <Text style={styles.mainTitleText}>Project Folders</Text>
            {/* Show the calendar modal button */}
            <TouchableOpacity
              onPress={() => setCalendarModalVisible(true)}
              style={styles.calendarView}
            >
              <Image source={require("./assets/icon/calendar.png")} style={styles.navBarIcon}/>
           </TouchableOpacity>
          </View>
          {/* Add project name text input */}
          {/* Show the add project modal when add project is pressed */}
          <View style={styles.addTaskProjectModalWrapper}>
            <TouchableOpacity
              // Show the add project modal
              onPress={() => setModalVisible(true)}
              style={styles.taskRowMargin}
            >
              <Text style={styles.topRightButton}>Add a project +</Text>
            </TouchableOpacity>
          </View>
          {/* Add projects modal */}
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
                {/* Project name text input */}
                <Text style={styles.projectModalTitleText}>Add a Project</Text>
                <TextInput 
                  style={styles.projectModalTextInput}
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  placeholder="New project name"
                />
                {/* Project deadline date picker */}
                <Text style={styles.projectModalTitleText}>Project Deadline</Text>
                <View style={styles.projectModalWrapper}>
                  <DateTimePicker
                    mode="date"
                    value={deadline}
                    onChange={onChange}
                  />
                </View>
                {/* Wrapper for add and cancel buttons */}
                <View style={styles.projectModalButtonWrapper}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addProject}>
                    <Text style={styles.addButton}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Calendar Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={calendarModalVisible}
            onRequestClose={() => setCalendarModalVisible(false)}
          >
            <View style={styles.projectModalWrapper}>
              <View style={styles.calendarModal}>
                <Text style={styles.projectModalTitleText}>Calendar View</Text>
                {/* All projects calendar view */}
                {/* https://github.com/wix/react-native-calendars */}
                <Calendar
                  // Filter projects by dates and create dots for dates with projects
                  onDayPress={day => {
                    setSelected(day.dateString);
                    const projectsOnCalendar = project.filter(project => {
                      const projectsDate = new Date(project.projectDeadline);
                      // Convert the date to match the format used
                      // https://stackoverflow.com/questions/76181025/convert-date-to-format-thu-jan-01-1970-010000-gmt010-to-date-yyyy-mm-dd
                      converted = new Date(projectsDate).toLocaleDateString('sv-SE')
                      console.log("projects dated:" + converted);
                      if (converted == day.dateString) {
                        return converted
                      }
                    });
                    setSelectedProjects(projectsOnCalendar);
                  }}                 
                  markingType={"multi-dot"}
                  markedDates={calenderDeadline}
                />          
                {/* Display projects for selected date */}
                <View style={styles.listOfProjects}>
                  {getProjectsForSelectedDate()}
                </View>
                {/* Wrapper for new and cancel buttons */}
                <View style={styles.calendarModalButtonWrapper}>
                  <TouchableOpacity onPress={() => setCalendarModalVisible(false)}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {changeToProjectModal()}}>
                    <Text style={styles.addButton}>New</Text>
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
        // Store task data from Supabase or insert placeholder if no project data exist
        if(data.length > 0) {
          setTasks(data);
        } else if (data.length === 0) {
          setTasks([{"taskTitle": "Enter your first task"}]);
        }
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
        for (let i = 0; i < data.length; i++) {
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
      <BottomNavigation navigation={navigation}/>
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
                      <Text style={styles.signInText}>Sort</Text>
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
          .eq("user_id", user.id)
          .order("myDaySequence");

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

  // Save the MyDay task data after a task has been dragged and dropped. Use the updated data to 
  // update the sequence on Supabase myDaySequence column
  const DragAndDrop = async ({data}) => {
    setMyDayTaskTitle(data);
    try {
      const {error} = await supabase
      if (error) {
        alert(error.message);
      } else {
        // Update the mydaySequence column with current sequence when a task is dragged and dropped
        for (let i = 0; i < data.length; i++) {
          await supabase
            .from("myDayTasks")
            .update({myDaySequence:i}) 
            .eq("myDayTaskId", data[i].myDayTaskId);
        }
      }
    } catch (error) {
      alert(error.message);
    }
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
    {/* Ensure text input not blocked */} 
    {/* https://reactnative.dev/docs/keyboardavoidingview */} 
      <KeyboardAvoidingView
        keyboardVerticalOffset = {60}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.projectModalWrapper}
      > 
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            onDragEnd={DragAndDrop}
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
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  // Store user style from Supabase (lightStyle or darkStyle)
  const [style, setStyle] = useState("lightStyle");
  // Store audio playback state
  const [audio, setAudio] = useState("");
  // Sound from playSound - https://docs.expo.dev/versions/latest/sdk/audio-av/
  const [sound, setSound] = useState();
  // Store playback state to avoid multiple playback at once
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch user setting from Supabase for current user
  // https://supabase.com/docs/reference/javascript/select
  const getSettingSupabase = async () => {
    try {
      // Get the user details in order to obtain the user id
      const {data:{user}} = await supabase.auth.getUser();

      // Fetch user style from users table based on user id and unique uuid from Supabase
      const {data, error: settingError} = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
      
      if (settingError) {
        alert(settingError.message);
      } else {
        // Store userStyle and audio state from Supabase
        setStyle(data[0].userStyle);
        setAudio(data[0].audio);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    getSettingSupabase();
  }, []);

  // Set the style to light or dark mode
  if (style == ("lightStyle")) {
    styles = lightStyle;
  } else if (style == ("darkStyle")) {
    styles = darkStyle;
  };

  // The following playSound and useEffect code was obtained from:
  // https://docs.expo.dev/versions/latest/sdk/audio-av/
  async function playSound() {
    const {sound} = await Audio.Sound.createAsync(require('./assets/audio/work.mp3'));
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  // End of code obtained from expo doc

  // Start the audio playback if music is not running
  if (audio == ("On")) {
    if (!isPlaying) {
      playSound();
      setIsPlaying(true); 
    }
  };
  
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
        <Stack.Screen name="Setting" component={Setting} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Export for unit testing
export {PomodoroTimer, BottomNavigation, WelcomePage, RegistrationPage, SignInPage};

// Image reference
// https://wallpaperdelight.com/wallpapers/aesthetic-flower-wallpaper/
// https://commons.wikimedia.org/wiki/File:Sun_rays_over_the_rain_clouds_at_dusk_dawn_with_sharp_gold_sky_view.jpg
// https://pxhere.com/en/photo/1553359
// https://www.goodfon.com/nature/wallpaper-dozhd-trava-luzhi-solnce.html
// https://www.pexels.com/photo/blue-sky-96622/
// https://commons.wikimedia.org/wiki/File:Thunderstorm_003.jpg
// https://www.flickr.com/photos/coconinonationalforest/7699564540
// https://commons.wikimedia.org/wiki/File:Settings_%2889646%29_-_The_Noun_Project.svg

// Music reference
// https://pixabay.com/music/beats-satisfying-lofi-for-focus-study-amp-working-242103/
// https://pixabay.com/music/modern-classical-end-of-day-196616/
// https://pixabay.com/music/rock-action-rock-energetic-sport-finish-line-short-version-210311/