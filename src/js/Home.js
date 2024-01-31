import React, { useCallback, useEffect, useState } from 'react';
import { Image, ImageBackground, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { deviceHeight, deviceWidth } from './Dimensions';
import { BlurView } from "@react-native-community/blur";
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from './Weather';
import { weatherImages } from './API';
import * as Progress from 'react-native-progress';
import { getData, storeData } from './AsyncStorage';

const Home = () => {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLocation = (loc) => {
        setLocations([]);
        toggleSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
            storeData('city', loc.name);
        })
    }

    const handleSearch = value => {
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocations(data);
            })
        }
    }

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Tangerang';

        if (myCity) {
            cityName = myCity;
        }


        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
        })
    }


    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
    const { current, location } = weather;

    return (
        <View style={{ flex: 1 }}>
            <StatusBar translucent barStyle='light-content' backgroundColor='transparent' />

            <View style={{ position: 'absolute' }}>
                <ImageBackground
                    source={require('../assets/background.png')}
                    style={{
                        width: deviceWidth,
                        height: deviceHeight,
                    }}
                />

                <BlurView
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                    blurType="dark"
                    blurAmount={32}
                />
            </View>

            {
                loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Progress.CircleSnail thickness={10} size={140} color={'#0bb3b2'} />
                    </View>
                ) : (
                    <View>
                        <View style={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                            backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            marginTop: 30,
                            marginHorizontal: 15,
                            borderRadius: 40,
                            height: 60,
                            borderColor: 'transparent'
                        }}>
                            {
                                showSearch ? (
                                    <TextInput
                                        onChangeText={handleTextDebounce}
                                        placeholder='Search City'
                                        placeholderTextColor='lightgray'
                                        style={{
                                            color: 'white',
                                            fontSize: 15,
                                            paddingLeft: 20,
                                            fontWeight: '400',
                                            flex: 4,
                                        }}
                                    />
                                ) : null
                            }

                            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 2 }}>
                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showSearch)}
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 35 }}>
                                    <Image source={require('../assets/search.png')} style={{ width: 20, height: 20, margin: 15 }} />
                                </TouchableOpacity>
                            </View>

                        </View>

                        <View style={{ marginHorizontal: 18, marginTop: 3, position: 'relative', zIndex: 1 }}>
                            {
                                locations.length > 0 && showSearch ? (
                                    <View style={{ backgroundColor: 'white', borderRadius: 20 }}>
                                        {
                                            locations.map((loc, index) => {
                                                const showBorder = index + 1 != locations.length;
                                                const borderStyle = showBorder ? { borderBottomWidth: 2, borderBottomColor: 'black' } : {};
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={{
                                                            flexDirection: 'row',
                                                            height: 50,
                                                            alignItems: 'center',
                                                            ...borderStyle,
                                                        }}
                                                        onPress={() => handleLocation(loc)}
                                                    >

                                                        <View style={{ flexDirection: 'row', marginLeft: 15 }}>
                                                            <Image source={require('../assets/maps.png')} style={{ width: 20, height: 20 }} />
                                                            <Text style={{ color: 'black', marginLeft: 10, fontSize: 15 }}>{loc?.name}, {loc?.country}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>

                        <View style={{ position: 'absolute', top: 100 }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 35 }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 25 }}>{location?.name},
                                    <Text style={{ color: 'grey', fontWeight: '800' }}> {location?.country}</Text>
                                </Text>

                                <Image
                                    source={weatherImages[current?.condition?.text] || weatherImages['other']}
                                    style={{ width: 250, height: 250, marginVertical: 10 }} />

                                <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 40 }}>{current?.temp_c} &#176;C</Text>
                                <Text style={{ fontWeight: '300', color: 'white', fontSize: 20 }}>{current?.condition?.text}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={require('../assets/wind.png')} style={{ height: 20, width: 20 }} />
                                    <Text style={{ marginLeft: 5, color: 'white', fontSize: 15 }}>{current?.wind_kph} km</Text>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={require('../assets/drop.png')} style={{ height: 20, width: 20 }} />
                                    <Text style={{ marginLeft: 5, color: 'white', fontSize: 15 }}>{current?.humidity} %</Text>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={require('../assets/sunwhite.png')} style={{ height: 20, width: 20 }} />
                                    <Text style={{ marginLeft: 5, color: 'white', fontSize: 14 }}>{location?.localtime.slice(11, 16)}</Text>
                                </View>

                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15, marginTop: 30 }}>
                                <Image source={require('../assets/calendar.png')} style={{ width: 18, height: 18 }} />
                                <Text style={{ color: 'white', fontSize: 15, marginLeft: 5 }}>Daily forecast</Text>
                            </View>

                            <FlatList
                                horizontal
                                contentContainerStyle={{ paddingHorizontal: 10 }}
                                data={weather?.forecast?.forecastday}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    let date = new Date(item.date);
                                    let options = { weekday: 'long' };
                                    let dayName = date.toLocaleDateString('en-US', options);

                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                width: 100,
                                                height: 135,
                                                borderRadius: 30,
                                                marginTop: 20,
                                                marginRight: 10,
                                            }}>
                                            <Image
                                                source={weatherImages[item?.day?.condition.text] || weatherImages['other']}

                                                style={{ height: 60, width: 60 }}
                                            />
                                            <Text style={{ color: 'white', fontWeight: '300', fontSize: 14 }}>
                                                {dayName}
                                            </Text>
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, marginTop: 5 }}>
                                                {item?.day?.avgtemp_c} &#176;C
                                            </Text>
                                        </View>
                                    );
                                }}
                            />

                        </View>
                    </View>
                )
            }

        </View>
    );
};

export default Home;
