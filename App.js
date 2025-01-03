import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  ImageBackground,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://qztbkshwncsreynkvwtp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dGJrc2h3bmNzcmV5bmt2d3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjYwNzgsImV4cCI6MjA0OTMwMjA3OH0.6dK3zFpK6O0CVTu8Uv4gkzmjc54QH-yPcvBcZLbkfU8");

// Task List Page - Home
function TaskListPage({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");

  // Get all tasks - Fetch data
  // https://supabase.com/docs/reference/javascript/select
  useEffect(() => {
    const getTasksSupabase = async () => {
      const { data } = await supabase.from("tasks").select();      
      setTasks(data);      
    };
    getTasksSupabase();
  }, []);

  const addTask = async () => {
    // Add a new task - Insert data
    // https://supabase.com/docs/reference/javascript/insert
    const { data } = await supabase
      .from("tasks")
      .insert({ taskTitle: newTaskName })
      .select();
  
    // Add new task into tasks, clear text input and reload the home page
    if (data) {
      setTasks((prevTasks) => [...prevTasks, data[0]]);
      setNewTaskName("");
      navigation.navigate("Home");
    }
  };

  // Remove a task - Delete data
  // https://supabase.com/docs/reference/javascript/delete
  const deleteTask = async (taskID) => {
    const response = await supabase
      .from("tasks")
      .delete()
      .eq("taskID", taskID);  

      // Update tasks by removing the task with selected taskID
      setTasks((prevTasks) => prevTasks.filter((task) => task.taskID !== taskID));
  };
  
  // Swipe right to delete a task
  // https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34
  const RightAction = (taskID) => {
    return (
      <View style={styles.rightAction}>
        <Text style={styles.rightSwipeText} onPress={() => deleteTask(taskID)}>
          Delete
        </Text>
      </View>
    );
  };

  // Render each task item
  const renderItem = ({ item, drag, isActive }) => {
    {/* Swipe right to delete */}
    {/* https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/release_tests/swipeableReanimation/index.tsx#L34 */}
    return (
      <ReanimatedSwipeable
        containerStyle={styles.rightSwipe}
        friction={2}
        rightThreshold={40}
        enableTrackpadTwoFingerGesture
        renderRightActions={() => RightAction(item.taskID)}>
        {/* Drag and drop tasks */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.taskRow,
            { backgroundColor: isActive ? "#fff" : "#ccc" },
          ]}
        >
          <Text style={styles.taskRowText}>{item.taskTitle}</Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  {/* GestureHandlerRootView - required for draggable flatlist */}
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Drag and Drop Tasks</Text>
        {/* Display the draggable & swipable tasks */}
        {/* https://github.com/computerjazz/react-native-draggable-flatlist */}
        <DraggableFlatList
          data={tasks}
          onDragEnd={({ data }) => setTasks(data)}
          keyExtractor={(item) => item.taskID}
          renderItem={renderItem}
        />
        {/* Task input textbox */}
        <View style={styles.taskInputWrapper}>
          <TextInput
            style={styles.taskInput}
            placeholder="Add a task"
            value={newTaskName}
            onChangeText={setNewTaskName}
          />
          <View style={styles.addTaskButton}>
            <Button title="Add Task" onPress={addTask} />
          </View>
        </View>
        <View style={styles.myDayButton}>
          <Button title="My Day" onPress={() => navigation.navigate("myDay")} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// MyDay Page
function MyDay() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  const API_KEY = "3bf82023a0ac4138f111892ef82e7214";

  useEffect(() => {
    (async () => {
      // Get device permission for location
      // https://docs.expo.dev/versions/latest/sdk/location/
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Couldn't get permission for location");
        return;
      }

      // Get the location for the weather and dynamic wallpaper
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Get the weather based on the device location
      if (location) {
        const { latitude, longitude } = location.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          setWeather(data);
        } catch (error) {
          console.log("Couldn't get weather");
        }
      }
    })();
  }, []);

  const wallpaperSelector = () => {
    // Use default wallpaper if weather cannot be obtained
    if (!weather) {
      console.log("Couldn't get weather info");
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

  // Store the wallpaper
  const wallpaper = wallpaperSelector();

  // Dummy task titles
  const [tasks, setTasks] = useState([
    { 
      taskID: "1", 
      taskTitle: "Task 1" 
    },
    {
      taskID: "2", 
      taskTitle: "Task 2" 
    },
    { 
      taskID: "3", 
      taskTitle: "Task 3" 
    },
  ]);

  // https://github.com/computerjazz/react-native-draggable-flatlist
  // Render each task - No swipe to delete implemented on MyDay page
  const renderItem = ({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.taskRow,
          { backgroundColor: isActive ? "#fff" : "#ccc" },
        ]}
      >
        <Text style={styles.taskRowText}>{item.taskTitle}</Text>
      </TouchableOpacity>
    );
  };

  return (
    // Set the wallpaper based on weather
    <ImageBackground source={wallpaper} style={styles.background}>
      <Text style={styles.mainTitle}>My Day</Text>
      {/* Show location - For testing only */}
      {location && (
        <Text>
          Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
        </Text>
      )}
      {/* Show weather - For testing only */}
      {weather && (
        <View style={ styles.weatherTextWrapper }>
          <Text style = { styles.weatherText }>Country: {weather.sys.country}</Text>
          <Text style = { styles.weatherText }>City: {weather.name}</Text>
          <Text style = { styles.weatherDescriptionText }>Weather: {weather.weather[0].description}</Text>
          <Text style = { styles.weatherText }>Temperature: {weather.main.temp}°C</Text>
          <Text style = { styles.weatherText }>ID: {weather.weather[0].id}</Text>
        </View>
      )}
      {/* Display dummy draggable task list */}
      <GestureHandlerRootView>
        <DraggableFlatList
          data={tasks}
          onDragEnd={({ data }) => setTasks(data)}
          keyExtractor={(item) => item.taskID}
          renderItem={renderItem}
        />
      </GestureHandlerRootView>
    </ImageBackground>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={TaskListPage} />
        <Stack.Screen name="myDay" component={MyDay} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  // Page title
  mainTitle: {
    textAlign: "center",
    fontSize: 17,
    backgroundColor: "#999",
    color: "white",
    fontSize: 22,
    paddingTop: 20,
    paddingBottom: 17,
    marginBottom: 17,
  },
  // Style for each task
  taskRow: {
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
  },
  // Font style for each task
  taskRowText: {
    fontSize: 20,
    textAlign: "left",
  },
  // Style for task input and add task wrapper
  taskInputWrapper: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  // Style for task text input
  taskInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  // Style for dynamic wallpaper
  background: {
    flex: 1,
  },
  // Style for delete button when swiped
  rightSwipe: {
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: "center",
    backgroundColor: "red",
  },
  // Font style for delete button
  rightSwipeText: {
    marginVertical: "auto",
    color: "white",
  },
  // Style for location and weather info wrapper
    weatherTextWrapper: {
    margin: 10,
  },
  // Font style for location and weather
  weatherText: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
  },
  // Additional font style weather
    weatherDescriptionText: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    textTransform: "capitalize", 
  },
  // Add button 
  addTaskButton: {
    backgroundColor:"#eee", 
    padding: 5, 
    borderRadius: 5, 
    marginRight: 5.
  },
  // My day button
  myDayButton: {
    backgroundColor:"#ccc", 
    padding: 5, 
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
