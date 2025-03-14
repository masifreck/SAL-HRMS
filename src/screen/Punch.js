import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  PermissionsAndroid,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { styles } from './PunchStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import RNFetchBlob from 'rn-fetch-blob';
import { primaryColor } from '../constants/color';
import Icon from 'react-native-vector-icons/FontAwesome5'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import Sound from 'react-native-sound';  
import successsound from '../assets/mixkit.wav'
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
const Punch = ({ navigation }) => {
  const camera = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [imageSource, setImageSource] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [EmployeeId, setEmployeeId] = useState('');
  const [punchloading, setPuchLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapViewRef = React.useRef(null);
  const device = useCameraDevice('front');
  const {hasPermission} = useCameraPermission();
  const [In,setIn]=useState('')
  const [out,setOut]=useState('')
  const compressImage = async (imagePath) => {
    const compressedPath = `${RNFS.CachesDirectoryPath}/compressed.jpg`;
  
    await RNFS.copyFile(imagePath, compressedPath); // Convert to JPEG
    console.log('Compressed Image Path:', compressedPath);
  
    return compressedPath;
  };
  useEffect(() => {
    const getEmployeeIdAndCallAPI = async () => {
      try {
        // Retrieve EmployeeId from AsyncStorage
        const id = await AsyncStorage.getItem('EmployeeMobileNo');
        if (id !== null) {
          setEmployeeId(id);
         // console.log('Employee ID:', id);

          // Once EmployeeId is retrieved, call the API
          const formData = new FormData();
          formData.append('m', id); // Use the retrieved EmployeeId in the form data

          // Call the API
          const response = await fetch('https://sal.tranzol.com/apiv2/GetAttendance', {
            method: 'POST',
            body: formData,
          });

          // Try to parse the response as text since it may not be JSON
          const result = await response.text();
          console.log('API Response:', result);
          // Handle the punch status based on the API result
          if (result === 'IN') {
            
            setIn(false)
            setOut(true)
          } else if (result === 'OUT') {
            
            setOut(false)
            setIn(true)
          } else {
            //console.error('Unexpected API response:', result);
          }
        } else {
          //console.error('EmployeeId not found in AsyncStorage');
        }
      } catch (error) {
        //console.error('Error retrieving EmployeeId or calling the API:', error);
      }
    };

    // Call the function when the component mounts
    getEmployeeIdAndCallAPI();
  }, []);

 
  Sound.setCategory('Playback'); // Ensures the sound plays even in silent mode

  const successSound = new Sound(successsound, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      //console.log('Failed to load the sound', error);
      return;
    }
    // console.log('Sound loaded successfully');
    // console.log('Sound duration: ', successSound.getDuration());
  });
  
  const playSuccessSound = () => {
    successSound.play((success) => {
      if (success) {
        //console.log('Sound played successfully');
      } else {
        //console.log('Playback failed due to audio decoding errors');
        successSound.reset()  // Reset to avoid playback issues on next attempt
      }
    });
  };
  
  
 
  


 


  const showAlert = () => {
    Alert.alert(
      'Info',
      'Restart App after Permissions',
      [
        {
          text: 'OK',
          onPress: () => checkAndRequestCameraPermission(),
        },
      ],
      {cancelable: false},
    );
  };
  async function checkAndRequestCameraPermission() {
    console.log('restart kindly===========================================');
    console.log(
      PermissionsAndroid.RESULTS.GRANTED,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    try {
      // Check if the permission is already granted
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (granted) {
        //console.log('Camera permission already granted');
        return PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // If permission is not granted, request it
        const requestResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Note : After Accepting, It restarts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
          RNRestart.restart();
          //console.log('Camera permission granted');
          //console.log(
            //'restart kindly===========================================',
          //);
          console.log(
            PermissionsAndroid.RESULTS.GRANTED,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
        } else {
          //console.log('Camera permission denied');
          // Optionally, you can show an alert to inform the user
          Alert.alert(
            'Permission Denied',
            'You denied camera access. This app requires camera access to function properly.',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        }

        return requestResult;
      }
    } catch (error) {
      console.error(`Error checking/requesting camera permission: ${error}`);
      return PermissionsAndroid.RESULTS.DENIED;
    }
  }
  const NoCameraErrorView = () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text
        style={{
          color: '#276A76',
          textAlign: 'center',
          //fontSize: isFine ? 13 : 15,

          textTransform: 'uppercase',
          fontFamily: 'PoppinsBold',
          marginTop: 5,
          letterSpacing: 1,
        }}>
        Allow Camera Permission
      </Text>
      <TouchableOpacity style={styles.button2} onPress={showAlert}>
        <Text style={styles.text}>Allow</Text>
      </TouchableOpacity>
    </View>
  );

  // console.log('Device:', device);

  // useEffect(() => {
  //   if (!hasPermission) {
  //     setCameraActive(false); // Disable camera if permission denied
  //   }
  // }, [hasPermission]);

  if (!hasPermission) {
    // Handle permission denied case
    //console.log('Permission denied');
    return <NoCameraErrorView />;
  }

  if (device === null) {
    // Handle no camera device found case
    console.log('No camera device found');
    return <NoCameraErrorView />;
  }
  const getLocation = async () => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Geolocation Permission',
            message: 'Can we access your location?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    };

    const checkPermission = async () => {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted;
      } catch (err) {
        return false;
      }
    };

    let hasPermission = await checkPermission();

    if (!hasPermission) {
      hasPermission = await requestLocationPermission();
    }

    if (hasPermission) {
      setLoadingLocation(true);
      Geolocation.getCurrentPosition(
        position => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLoadingLocation(false);
        },
        error => {
          Alert.alert('Geolocation Error', error.message);
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert('Geolocation Permission', 'Please allow access to location for Punch.', [{ text: 'OK' }]);
      navigation.goBack();
    }
  };
 // 🔹 Resize Image Without Compression
 

 const resizeImage = async (imagePath) => {
   try {
     if (!imagePath) {
       throw new Error("Image path is undefined!");
     }
 
     console.log("📂 Processing Image Path:", imagePath);
 
     const resizedImage = await ImageResizer.createResizedImage(
       imagePath,
       1080, // New width
       1080, // New height
       "JPEG", // Format
       10, // Quality (0-100)
       0, // Rotation
       undefined, // Output path (optional)
       false, // Keep metadata
     );
 
     if (!resizedImage.uri) {
       throw new Error("Failed to get resized image path!");
     }
 
     console.log("✅ Resized Image Path:", resizedImage.uri);
     return resizedImage.uri;
   } catch (error) {
     console.error("🚨 Image Processing Error:", error);
     return imagePath; // Return original image if resizing fails
   }
 };
 

const capturePhoto = async () => {
  if (camera.current !== null) {
    try {
      console.log("📸 Capturing photo...");

      const photo = await camera.current.takePhoto({
        qualityPrioritization: "balanced",
        skipMetadata: true,
      });

      console.log("✅ Photo captured:", photo);

      if (!photo?.path) {
        console.error("❌ No photo path received!");
        return;
      }

      setImageSource(photo.path);
      //console.log("🖼 Original Image Path:", photo.path);

      // Resize Image
      const resizedPath = await resizeImage(photo.path);

      if (!resizedPath) {
        console.error("❌ Resized image path is undefined!");
        return;
      }

      // Get Final Image Size
      const fileInfo = await RNFS.stat(resizedPath);
      const fileSizeInKB = (fileInfo.size / 1024).toFixed(2);

      console.log(`📂 Final Image Path: ${resizedPath}`);
      console.log(`📏 Final Image Size: ${fileSizeInKB} KB`);

    setShowCamera(false)
      setImageSource(resizedPath);
      
    } catch (error) {
      console.error("🚨 Capture Error:", error);
    }
  } else {
    console.error("🚨 Camera ref is null!");
  }
};
  
  

 


  



  

  //import RNFetchBlob from 'rn-fetch-blob';

  const postPunchData = async () => {
    console.log('Punch button pressed.');
  
    // Check for required fields
    if (!latitude || !longitude || !imageSource || !EmployeeId) {
      Alert.alert('Missing Information', 'Please ensure all fields (latitude, longitude, image, employee name) are filled.');
      return;
    }
  
    console.log('All required data is available.');
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    console.log('Image Source:', imageSource);
    console.log('Employee ID:', EmployeeId);
  
    // Create FormData
    const formData = [
      { name: 'lat', data: latitude.toString() },
      { name: 'lng', data: longitude.toString() },
      { name: 'm', data: EmployeeId },
      {name :'d',data:'0'},
      { name: 'file', filename: 'selfie.jpg', type: 'image/jpeg', data: RNFetchBlob.wrap(imageSource) },
      // Add any other necessary fields here
    ];
    console.log('sending Data',formData) 
    setPuchLoading(true);
  
    try {
      const response = await RNFetchBlob.fetch('POST', 'https://sal.tranzol.com/apiv2/PunchAttendance', {
        'Content-Type': 'multipart/form-data',
      }, formData);
  
      // Log the raw response
      const rawResponse = response.data; // This contains the response data as a string
      console.log('Raw response:', rawResponse);
  
      // Handle the raw response
      if (rawResponse === 'SUCCESS') {
       
        await AsyncStorage.setItem("punchIn", JSON.stringify(true));
        const currentDateTime = `Punch In: ${new Date().toISOString()}`;
        await AsyncStorage.setItem('lastPunchIn', currentDateTime);
  
        playSuccessSound();  
        Alert.alert('Punch Success', 'Your punch is successful.');
        navigation.replace('DrawerNavigation');
      } else if (rawResponse === 'FAIL') {
        Alert.alert('Punch Failed', 'Failed to post punch data. Please try again.');
      } else {
        Alert.alert('Unexpected Response', `Received unexpected response: ${rawResponse}`);
      }
    } catch (error) {
      console.error('Network request failed:', error);
      Alert.alert('Error', 'An error occurred while posting punch data.');
    } finally {
      setPuchLoading(false);
    }
  };

  const postPunchOutData = async () => {
    console.log('Punch button pressed.');
  
    // Check for required fields
    if (!latitude || !longitude || !imageSource || !EmployeeId) {
      Alert.alert('Missing Information', 'Please ensure all fields (latitude, longitude, image, employee name) are filled.');
      return;
    }
  
    console.log('All required data is available.');
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    console.log('Image Source:', imageSource);
    console.log('Employee ID:', EmployeeId); 
  
    // Create FormData
    const formData = [
      { name: 'lat', data: latitude.toString() },
      { name: 'lng', data: longitude.toString() },
      {name :'d',data:'1'},
      { name: 'm', data: EmployeeId },
      { name: 'file', filename: 'selfie.jpg', type: 'image/jpeg', data: RNFetchBlob.wrap(imageSource) },
      // Add any other necessary fields here
    ];
  console.log('sending Data',formData)
    setPuchLoading(true);
  
    try {
      const response = await RNFetchBlob.fetch('POST', 'https://sal.tranzol.com/apiv2/PunchAttendance', {
        'Content-Type': 'multipart/form-data',
      }, formData);
  
      // Log the raw response
      const rawResponse = response.data; // This contains the response data as a string
      console.log('Raw response:', rawResponse);
  
      // Handle the raw response
      if (rawResponse === 'SUCCESS') {
        playSuccessSound(); 
        await AsyncStorage.setItem("punchOut", JSON.stringify(true));
        const currentDateTime = `Punch Out: ${new Date().toISOString()}`;
        await AsyncStorage.setItem('lastPunchIn', currentDateTime);
        Alert.alert('Punch Success', 'Your punch is successful.');
        navigation.replace('DrawerNavigation');
      } else if (rawResponse === 'FAIL') {
        Alert.alert('Punch Failed', 'Failed to post punch data. Please try again.');
      } else {
        Alert.alert('Unexpected Response', `Received unexpected response: ${rawResponse}`);
      }
    } catch (error) {
      console.error('Network request failed:', error);
      Alert.alert('Error', 'An error occurred while posting punch data.');
    } finally {
      setPuchLoading(false);
    }
  };


  
  useEffect(() => {
    // Check if developer mode is enabled
   

    const getEmployeeId = async () => {
      try {
        const id = await AsyncStorage.getItem('EmployeeMobileNo');
        if (id !== null) {
          setEmployeeId(id);
        }
      } catch (error) {
        console.error('Error retrieving EmployeeId:', error);
      }
    };

    getEmployeeId();

    getLocation();
  }, []);
  
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.mapcontainer}>
        <MapView
          ref={mapViewRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={true}
          region={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>
        <View>
          <View style={[styles.ImgContainer, { backgroundColor: '#f4d9ff' }]}>
            {imageSource !== '' ? (
              <Image
                style={styles.Image}
                source={{ uri: `file://${imageSource}` }}
              />
            ) : (
              <Image source={require('../../src/assets/selfie(1).png')} style={{ width: 200, height: 200,}} />
            )}
          </View>
        </View>
      </View>
   
      <View style={{ marginTop: 45 ,flexDirection:'row',gap:10,justifyContent:'center',alignItems:'center'}}>
        <View>
     
       </View>
       <View>
        <Text style={styles.text}>
          Longitude  :  {loadingLocation ? <ActivityIndicator size="small" color="#0000ff" />  : longitude}
        </Text>
        <Text style={styles.text}>
          Latitude     :  {loadingLocation ? <ActivityIndicator size="small" color="#0000ff" />   : latitude}
        </Text>
        <Text style={styles.text}>Mobile No  :  {EmployeeId}</Text>
        </View>
      </View>
      <View style={styles.btnView}>
      <TouchableOpacity style={[{justifyContent:'center',alignItems:'center',marginRight:10,backgroundColor:primaryColor,borderWidth:1,
        borderColor:primaryColor,borderRadius:10,padding:5,elevation:4,width:120,height:50
      }]} onPress={() => setShowCamera(true)}>
         <Icon style={{elevation:4}} name='camera'size={22}color='white'/>
         <Text style={[styles.txt,{color:'white',fontSize:13,marginTop:0}]}>Take Selfie</Text>
       </TouchableOpacity>
        <View style={{flexDirection:'column',justifyContent:'space-evenly',gap:10}}>
{ In ? (
  <TouchableOpacity style={[styles.btn,{backgroundColor:'#fd5c63'}]} onPress={postPunchOutData} disabled={punchloading}>
          {punchloading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={{alignItems:'center',justifyContent:'center'}}>
            <Icon2  name='map-marker-account' size={28} color='white'/>
            <Text style={styles.txt}>Punch Out</Text>
            </View>
          )}
        </TouchableOpacity>
):(

        <TouchableOpacity style={styles.btn} onPress={postPunchData} disabled={punchloading}>
          {punchloading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={{alignItems:'center',justifyContent:'center'}}>
            <Icon2  name='map-marker-account' size={28} color='white'/>
            <Text style={styles.txt}>Punch In</Text>
            </View>
          )}
        </TouchableOpacity>)}
        
        </View>
      </View>
      {showCamera && (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            photo={true}
            mirrorImage={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.camButton} onPress={capturePhoto} />
          </View>
        </>
      )}
    </View>
  );

};

export default Punch;
