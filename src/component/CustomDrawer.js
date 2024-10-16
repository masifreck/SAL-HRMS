import React from 'react';
import {
    View,
    Text,
    ImageBackground,
    Image,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { primaryColor } from '../constants/color';

const CustomDrawer = (props) => {
    const navigation = useNavigation();  

    const HandleSignOut = async () => {
        try {
            console.log('sign out btn pressed');
            await AsyncStorage.removeItem('EmployeeName');
            await AsyncStorage.setItem("punchOut", JSON.stringify(false));
          await AsyncStorage.setItem("punchIn", JSON.stringify(false));
            navigation.navigate('newlogin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ backgroundColor: 'white' }}>
                <View
                    //source={require('../assets/menu-bg.jpe')}
                    style={{ padding: 20, alignItems: 'center' }}>
                    <Image
                        source={require('../assets/mypic.jpeg')}
                        style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 10 }}
                    />
                    <Text
                        style={{
                            color: primaryColor,
                            fontSize: 18,
                            fontFamily: 'Roboto-Medium',
                            marginBottom: 5,
                        }}>
                        Tranzol
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            style={{
                                color: primaryColor,
                                fontFamily: 'Roboto-Regular',
                                marginRight: 5,
                            }}>
                            @tranzol.com
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' }}>
                <TouchableOpacity onPress={HandleSignOut} style={{ paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="exit-outline" size={22} color={'black'} />
                        <Text
                            style={{
                                fontSize: 15,
                                fontFamily: 'Roboto-Medium',
                                marginLeft: 5,
                                color: 'black',
                            }}>
                            Sign Out
                        </Text>
                    </View>
                </TouchableOpacity>
                <Text style={{
                    fontSize: 14,
                    fontStyle: 'italic',
                    color: 'black',
                    textAlign: 'center', marginTop: 50
                }}>Powered by TRANZOL</Text>
                <Text style={{
                    fontSize: 12,
                    color: 'black',
                    textAlign: 'center'
                }}>Version: 0.0.1</Text>
            </View>
        </View>
    );
};

export default CustomDrawer;
