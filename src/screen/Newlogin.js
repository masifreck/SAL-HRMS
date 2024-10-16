import { View, Text, TextInput ,StyleSheet,TouchableOpacity, ImageBackground, Image, Alert,
    ToastAndroid,BackHandler
} from 'react-native'
import React, { useState,useEffect } from 'react'
import { primaryColor } from '../constants/color'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../component/Loading'



const Newlogin = ({navigation}) => {
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false)
    const [EmployeeId,setEmployeeId]=useState('')
    useEffect(() => {
      const backAction = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => BackHandler.exitApp(), // Exits the app
          },
        ]);
        return true; // Prevent default back action
      };
  
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
      return () => backHandler.remove(); // Clean up the event listener on component unmount
    }, []);
  

    const apiUrl = 'https://sal.tranzol.com/apiv2/Authenticate';

    const myFetchPostRequest = async () => {
      if (!username) {
          Alert.alert('Failed', 'Please Enter Username');
          return;
      }
      if (!password) {
          Alert.alert('Failed', 'Please Enter Password');
          return;
      }
  
      try {
          setLoading(true); // Start loading
  
          const url = `${apiUrl}`; // Endpoint
  
          // Create FormData instance
          const formData = new FormData();
          formData.append('u', username);  // MobileNo as username
          formData.append('p', password);  // SecureCode as password
  
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
              body: formData, // Send the form data
          });
  
          console.log('Response Status:', response.status); // Log status code
  
          if (response.status === 401) {
              ToastAndroid.show('Login failed: Unauthorized', ToastAndroid.SHORT);
              return;
          }
  
          // Get the raw response text
          const responseText = await response.text();
          console.log('Raw Response Text:', responseText); // Log raw response for debugging
  
          if (responseText) {
              try {
                  // First parse the outer string, which is a JSON string containing escaped characters
                  const cleanResponseText = JSON.parse(responseText);
  
                  // Parse the resulting string again to convert it into a valid JSON object/array
                  const responseData = JSON.parse(cleanResponseText);
  
                  // Check if the response is an array and has valid data
                  if (Array.isArray(responseData) && responseData.length > 0) {
                      const { Status, EMPName } = responseData[0]; // Extract 'Status' and 'EMPName'
  
                      if (Status === 'SUCCESS') {
                          console.log('Login successful, Employee Name:', EMPName);
                          await AsyncStorage.setItem("EmployeeName", EMPName);
                          await AsyncStorage.setItem("EmployeeMobileNo",username)
                          navigation.replace('DrawerNavigation');
                      } else {
                          Alert.alert('Login failed', 'Invalid credentials or status failed');
                      }
                  } else {
                      Alert.alert('Unexpected response format');
                  }
              } catch (parseError) {
                  console.error('Response parsing error:', parseError);
                  Alert.alert('Unexpected response format');
              }
          } else {
              Alert.alert('Login failed', 'Empty response');
          }
      } catch (error) {
          console.error('Login error:', error);
          Alert.alert('Login error occurred');
      } finally {
          setLoading(false); // Stop loading
      }
  };
  
  
    
return (
  <ImageBackground 
    style={{ resizeMode: 'cover', flex: 1 }} 
    source={require('../assets/salmonbg.jpg')}
  >
    {loading ? (
      <Loading />
    ) : (
      <>
        <View style={styles.container}>
          <Image style={styles.logo} source={require('../assets/mypic.jpeg')} />
          <TextInput 
            style={styles.input}
            placeholder='Enter Username'
            value={username}
            onChangeText={(t) => setUsername(t)}
          />
          <TextInput 
            style={styles.input}
            placeholder='Enter Password'
            value={password}
            onChangeText={(t) => setPassword(t)}
            secureTextEntry
          />
          <TouchableOpacity 
            style={styles.loginbtn}
            onPress={myFetchPostRequest}
          >
            <Text style={styles.btntext}>LOG IN</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: 'transparent', height: 50, paddingTop: 10 }}>
          <Text style={styles.tranzol}>POWERED BY TRANZOL</Text>
        </View>
      </>
    )}
  </ImageBackground>
);


}

const styles=StyleSheet.create({
    container:{
flex:1,
justifyContent:'center',
alignItems:'center',paddingHorizontal:20
    },
    input:{
        width:'85%',
        backgroundColor:'white',
        elevation :4,
        height:45,
        borderRadius:10,
        //borderWidth:0.1,
        borderColor:primaryColor,
        marginTop:30,paddingHorizontal:20,
        color:'black'
    },
    logo:{
        width:120,
        height:150,
    },
    loginbtn:{
        backgroundColor:primaryColor,
        width:'85%',
        height:50,
        borderRadius:15,
        elevation:4,
        alignItems:'center',
        justifyContent:'center',
        marginTop:30
    },
    btntext:{
        color:'white',
        fontSize:17,
        fontWeight:'bold'
    },
    tranzol:{
      fontFamily: 'Roboto', // Replace with the stylish font family of your choice
      fontSize: 20,         // Adjust font size as needed
      fontWeight: 'bold',   // Optionally, add weight to make it bolder
      textShadowColor: 'rgba(0, 0, 0, 0.8)', // Shadow color with opacity
      textShadowOffset: { width: -1, height: 1 }, // Shadow offset for position
      textShadowRadius: 10, 
        fontSize:14,
        fontWeight:'bold',
        alignSelf:'center',
        color:'white',
        elevation:4,
        paddingBottom:10
    }
})

export default Newlogin