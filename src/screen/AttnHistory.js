import React, { useState,useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import WorkingHour from '../component/WorkingHour';
import AttSummary from '../component/AttnSummary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Icon  from 'react-native-vector-icons/FontAwesome';
// import AttSummary from '../component/AttnSummary';

function AttnHistory() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [In,setIn]=useState('')
  const [out,setOut]=useState('')
  const [status,setStatus]=useState('')
  const [employeeId,setEmployeeId]=useState('')
  const [punchData, setPunchData] = useState({
    '2023-06-01': { punchIn: '09:30 AM', punchOut: '05:00 PM' },
    '2023-06-02': { punchIn: '08:45 AM', punchOut: '05:15 PM' },
    // Add more punch data for other dates
  });


  useEffect(() => {
    const getEmployeeIdAndCallAPI = async () => {
      try {
        // Retrieve EmployeeId from AsyncStorage
        const id = await AsyncStorage.getItem('EmployeeMobileNo');
        if (id !== null) {
          setEmployeeId(id);
          console.log('Employee ID:', id);

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
setStatus(result)
          // Handle the punch status based on the API result
          if (result === 'IN') {
           
            setIn(true)
            setOut(true)
          } else if (result === 'OUT') {
          setIn(true)
            setOut(false)
            
          } else {
            console.error('Unexpected API response:', result);
          }
        } else {
          console.error('EmployeeId not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving EmployeeId or calling the API:', error);
      }
    };

    // Call the function when the component mounts
    getEmployeeIdAndCallAPI();
  }, []);




  const getPunchInTime = (date) => {
    if (punchData[date]) {
      return punchData[date].punchIn;
    }
    return '';
  };




  const renderDot = color => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <View style={{
        backgroundColor: 'white',
        marginTop: 20,
        marginHorizontal: 10,
        padding: 10,
        borderRadius: 10,
        shadowColor: 'black',
        shadowOffset: {
          width: 1,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // width: 120,
              marginLeft: 20,
            }}>
            {renderDot('green')}
            <Text style={{ color: 'gray' }}>Perfect Time: 47%</Text>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            {renderDot('orange')}
            <Text style={{ color: 'gray' }}>Half Day: 16%</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // width: 120,
              marginLeft: 20,
            }}>
            {renderDot('red')}

            <Text style={{ color: 'gray' }}>lateComing: 23%</Text>

          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            {renderDot('#3BE9DE')}
            <Text style={{ color: 'gray' }}>Leave: 40%</Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <ScrollView >
     
      <View style={styles.summaryContainer}>
        <View style={styles.daillySummary}>
          <Text style={{
            fontWeight: 'bold',
            textAlign: 'center',
            paddingVertical: 8,
            fontSize: 16,
            color: 'white',
            backgroundColor: '#3e0961',
          }}>Dailly Report</Text>
          {selectedDate ?
            <View style={styles.timeContainer}>
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>Punch In Time</Text>
              <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center', fontWeight: '700', marginTop: 6 }}>{getPunchInTime(selectedDate)}</Text>
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', fontWeight: '600', marginTop: 6 }}>Punch Out Time</Text>
              <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center', fontWeight: '700', marginTop: 6 }}>{getPunchInTime(selectedDate)}</Text>
            </View>
            :
            <View style={styles.timeContainer}>
              <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', fontWeight: '600' }}>Punch In</Text>
              {In?(
 <Text style={{color:'green',borderRadius:5,width:30,height:26,fontSize:18,fontWeight:'bold',
  alignSelf:'center',textAlign:'center'
 }}>In</Text>
              ):(
                <Icon name='question' color='orange' size={30}/> 
              )}
          <Text style={{ color: 'black', fontSize: 14, textAlign: 'center', fontWeight: '600', marginTop: 6 }}>Punch Out</Text>
              {
                out?(
<Text style={{color:'orange',borderRadius:5,width:30,height:26,fontSize:18,fontWeight:'bold',
  alignSelf:'center',textAlign:'center'
 }}>Out</Text>
                ):(
                  <Icon name='question' color='orange' size={30}/>
                )
              }
              
            
            </View>
          }
        {/*<Text style={{
          textAlign:'center',
          padding:8,
          fontSize:11,
          color:'gray'
        }}>Press the Date to show the Punch time</Text>*/}
        </View>
        <View style={styles.weeklySummary}>
          <AttSummary />
        </View>
      </View>
      {renderLegendComponent()}
      <View style={{ marginTop: 10 }}>
        <WorkingHour />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    backgroundColor: '#e9e6eb',
  },
  timeContainer: {
    marginTop: 8,
    alignItems:'center',justifyContent:'center'
  },
  calendarContainer: {
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    margin: 10,
    borderRadius: 7
  },
  summaryContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  daillySummary: {
    width: '38%',
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden'
  },
  weeklySummary: {
    width: '58%',
    height: 200,
    // backgroundColor : 'green'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default AttnHistory;
