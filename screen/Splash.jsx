import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { primaryColor } from '../src/constants/color';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
        try {
            // Get the EmployeeName from AsyncStorage (Make sure the key matches with what was saved)
            const employeeId = await AsyncStorage.getItem('EmployeeName');
            console.log('Employee Name found in splash:', employeeId);

            // Navigate based on the presence of EmployeeId
            if (employeeId !== null) {
                // If EmployeeId exists, navigate to the DrawerNavigation screen
                navigation.replace('DrawerNavigation');
            } else {
                // If no EmployeeId, navigate to the login screen
                navigation.replace('newlogin');
            }
        } catch (error) {
            console.error('Error reading EmployeeName from AsyncStorage:', error);
        }
    };

    // Add a delay to simulate the splash screen (3 seconds)
    const splashTimeout = setTimeout(checkLoginStatus, 3000);

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(splashTimeout);
}, [navigation]);


  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.upper}>
        <Image style={{ width: 100, height: 100 }} source={require('../src/assets/mypic.jpeg')} />
        <View>
          <Text style={styles.company_name}>HR MS</Text>
        </View>
      </View>
      <View style={styles.lower}>
        <Text style={styles.tranzol}>Powered By Tranzol</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingTop: StatusBar.currentHeight || 0,
  },
  upper: {
    flex: 25,
    marginTop: '10%',
    marginHorizontal: '5%',
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  lower: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  company_name: {
    fontFamily: 'PoppinsExtraBold',
    color: '#eeeeee',
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 5,
  },
  tranzol: {
    fontSize: 10,
    position: 'absolute',
    bottom: 30,
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: 'PoppinsExtraBold',
    color: '#eeeeee',
  },
});

export default Splash;
