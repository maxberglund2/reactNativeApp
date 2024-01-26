import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function HomeScreen({ navigation }) {
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const date = new Date();

  useEffect(() => {
    // Update the current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      let formattedDate = new Intl.DateTimeFormat("en-GB", options).format(date);
      setCurrentDate(formattedDate);
    }, 1000);

    Date.prototype.getWeek = function () {
      var onejan = new Date(this.getFullYear(), 0, 1);
      var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
      var dayOfYear = ((today - onejan + 86400000) / 86400000);
      return Math.ceil(dayOfYear / 7);
    };

    setCurrentWeek(date.getWeek());

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Week {currentWeek}</Text>
      <Text>{currentTime.toLocaleTimeString()}</Text>
      <Text>{currentDate}</Text>
      <Button title="Weather" onPress={() => navigation.navigate('Weather')} />
      <Button title="News" onPress={() => navigation.navigate('News')} />
    </View>
  );
}

function Weather() {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=huddinge&units=metric&appid=dbf87de7264865416362ce390de95c52'
        );
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeather();
  }, []); // Added empty dependency array to ensure useEffect runs only once

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {weatherData && (
        <>
          <Text style={styles.location}>{weatherData.name}, {weatherData.sys.country}</Text>
          <Text style={styles.mainTemp}>{weatherData.main.temp} °C</Text>
          <Image 
            style={styles.logo}
            source={{
              uri: `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`,
            }}
          />
          <Text style={styles.description}>{weatherData.weather[0].description}</Text>
          <Text>Feels like: {weatherData.main.feels_like} °C</Text>
          <Text>Humidity: {weatherData.main.humidity} %</Text>
          <Text>Wind: {weatherData.wind.speed} m/s</Text>
          <Text>Clouds: {weatherData.clouds.all} %</Text>
          <Text>Pressure: {weatherData.main.pressure} hPa</Text>
        </>
      )}
    </View>
  );
}

function News({ navigation }) {
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://api.nytimes.com/svc/topstories/v2/world.json?api-key=9JEDhDvTqlwiNGv51snz6Lo0BbGz2iiU'
        );
        const data = await response.json();
        setNewsData(data.results);
      } catch (error) {
        console.error('Error fetching news data:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {newsData && newsData.map((item, index) => (
          <View key={index} style={styles.btn}>
            <Button
            color="#000000"
            title={item.title}
            onPress={() => navigation.navigate('SelectedNews', {
              title: item.title,
              abstract: item.abstract,
              multimedia: item.multimedia,
            })}
          />
          </View>

        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SelectedNews({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.articleHeading}>{route.params.title}</Text>
      <Text style={styles.articleText}>{route.params.abstract}</Text>
      <Image
        style={styles.image}
        source={{
          uri: route.params.multimedia[0].url,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    marginHorizontal: 10,
  },
  btn: {
    marginBottom: 5,
  },
  logo: {
    width: 120,
    height: 90,
  },
  image: {
    width: 440,
    height: 380,
  },
  mainTemp: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    textTransform: 'capitalize',
    textDecorationLine: 'underline',
    fontSize: 18,
    marginBottom: 30,
  },
  articleHeading: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  articleText: {
    padding: 10,
    fontSize: 15,
    marginBottom: 20,
  },
});

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="News" component={News} />
        <Stack.Screen name="Weather" component={Weather} />
        <Stack.Screen name="SelectedNews" component={SelectedNews} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
