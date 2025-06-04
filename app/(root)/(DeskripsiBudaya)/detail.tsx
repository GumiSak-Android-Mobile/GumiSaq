// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useRef, useState } from "react";
// import {
// 	Animated,
// 	Dimensions,
// 	Image,
// 	Platform,
// 	SafeAreaView,
// 	StatusBar,
// 	StyleSheet,
// 	Text,
// 	TouchableOpacity,
// 	View,
// } from "react-native";

// const DATA = [
// 	{
// 		id: "1",
// 		title: "Perempuan sasak",
// 		date: "May 13, 2020",
// 		desc: [
// 			"Perempuan Sasak, yang berasal dari suku sasak di pulau Lombok, dikenal memiliki karakter kuat, mandiri, dan berpegang teguh pada adat istiadat.",
// 			"Mereka memainkan peran penting dalam kehidupan sosial dan budaya, terutama dalam menjaga tradisi, seperti menenun kain khas Sasak yang di sebut songket.",
// 		],
// 		image: require("../../../assets/images/download.jpeg"),
// 		image2: require("../../../assets/images/adat.jpeg"),
// 	},
// ];

// const { width } = Dimensions.get("window");
// const HEADER_HEIGHT = 320;

// export default function DetailDeskripsiBudaya() {
// 	const { id } = useLocalSearchParams<{ id: string }>();
// 	const router = useRouter();
// 	const item = DATA.find((d) => d.id === id) ?? DATA[0];

// 	const scrollY = useRef(new Animated.Value(0)).current;
// 	const [liked, setLiked] = useState(false);
// 	const scaleAnim = useRef(new Animated.Value(1)).current;

// 	const overlayOpacity = scrollY.interpolate({
// 		inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT - 40],
// 		outputRange: [0, 0.3, 0.7],
// 		extrapolate: "clamp",
// 	});

// 	// Tombol menghilang saat konten utama menutupi gambar
// 	const buttonOpacity = scrollY.interpolate({
// 		inputRange: [0, HEADER_HEIGHT - 80],
// 		outputRange: [1, 0],
// 		extrapolate: "clamp",
// 	});

// 	const handleLike = () => {
// 		setLiked((prev) => !prev);
// 		Animated.sequence([
// 			Animated.timing(scaleAnim, {
// 				toValue: 1.3,
// 				duration: 120,
// 				useNativeDriver: true,
// 			}),
// 			Animated.timing(scaleAnim, {
// 				toValue: 1,
// 				duration: 120,
// 				useNativeDriver: true,
// 			}),
// 		]).start();
// 	};

// 	return (
// 		<View style={{ flex: 1, backgroundColor: "#5B6846" }}>
// 			<StatusBar barStyle="light-content" />

// 			{/* zIndex 1: Background cover */}
// 			<View
// 				style={{
// 					position: "absolute",
// 					top: 0,
// 					left: 0,
// 					right: 0,
// 					zIndex: 1,
// 				}}
// 				pointerEvents="none"
// 			>
// 				<Image
// 					source={item.image}
// 					style={{
// 						width: width,
// 						height: HEADER_HEIGHT,
// 						borderBottomLeftRadius: 32,
// 						borderBottomRightRadius: 32,
// 					}}
// 					resizeMode="cover"
// 				/>
// 				<Animated.View
// 					style={[
// 						StyleSheet.absoluteFill,
// 						{
// 							backgroundColor: "#222",
// 							opacity: overlayOpacity,
// 							borderBottomLeftRadius: 32,
// 							borderBottomRightRadius: 32,
// 						},
// 					]}
// 				/>
// 			</View>

// 			{/* zIndex 2: Konten utama */}
// 			<Animated.ScrollView
// 				style={{
// 					flex: 1,
// 					zIndex: 2,
// 				}}
// 				contentContainerStyle={{
// 					paddingTop: HEADER_HEIGHT - 30,
// 					paddingBottom: 32,
// 				}}
// 				scrollEventThrottle={16}
// 				showsVerticalScrollIndicator={false}
// 				onScroll={Animated.event(
// 					[{ nativeEvent: { contentOffset: { y: scrollY } } }],
// 					{ useNativeDriver: false }
// 				)}
// 			>
// 				<View
// 					className="bg-[#5B6846] px-5 pt-6 pb-6 rounded-t-3xl"
// 					style={{
// 						marginTop: -30,
// 						backgroundColor: "#5B6846",
// 						zIndex: 2,
// 					}}
// 				>
// 					<View className="items-center py-2">
// 						<View className="w-16 h-1.5 bg-gray-300 rounded-full mb-2" />
// 					</View>
// 					<Text className="text-white text-2xl font-bold mb-1">
// 						{item.title}
// 					</Text>
// 					<Text className="text-gray-200 mb-4">Published {item.date}</Text>
// 					{item.desc.map((d, i) => (
// 						<Text className="text-white mb-3" key={i}>
// 							{d}
// 						</Text>
// 					))}
// 					<Image
// 						source={item.image2}
// 						className="w-full h-36 rounded-2xl mb-3"
// 						resizeMode="cover"
// 					/>
// 					<Text className="text-white mb-3">{item.desc[0]}</Text>
// 					<Text className="text-white mb-3">{item.desc[1]}</Text>
// 					<Text className="text-white mb-3">{item.desc[0]}</Text>
// 					<Text className="text-white mb-3">{item.desc[1]}</Text>
// 				</View>
// 			</Animated.ScrollView>

// 			{/* zIndex 3: Button arrow dan heart */}
// 			<Animated.View
// 				style={{
// 					position: "absolute",
// 					top: Platform.OS === "android" ? 40 : 60,
// 					left: 0,
// 					right: 0,
// 					zIndex: 3,
// 					flexDirection: "row",
// 					justifyContent: "space-between",
// 					alignItems: "center",
// 					paddingHorizontal: 16,
// 					opacity: buttonOpacity,
// 				}}
// 				pointerEvents="box-none"
// 			>
// 				<TouchableOpacity onPress={() => router.back()}>
// 					<Ionicons name="arrow-back" size={28} color="#fff" />
// 				</TouchableOpacity>
// 				<TouchableOpacity onPress={handleLike} activeOpacity={0.7}>
// 					<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
// 						<Ionicons
// 							name={liked ? "heart" : "heart-outline"}
// 							size={28}
// 							color={liked ? "#e53935" : "#fff"}
// 						/>
// 					</Animated.View>
// 				</TouchableOpacity>
// 			</Animated.View>

// 			<SafeAreaView />
// 		</View>
// 	);
// }
