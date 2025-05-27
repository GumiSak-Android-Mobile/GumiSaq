import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	FlatList,
	Image,
	SafeAreaView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type Artikel = {
	id: string;
	title: string;
	desc: string;
	image: any;
};

const DATA: Artikel[] = [
	{
		id: "1",
		title: "Perempuan sasak",
		desc: "Perempuan sasak",
		image: require("../../../assets/images/download.jpeg"),
	},
	{
		id: "2",
		title: "Gizi Seimbang",
		desc: "apa itu gizi",
		image: require("../../../assets/images/R.jpg"),
	},
	{
		id: "3",
		title: "Gizi??",
		desc: "Gizi",
		image: require("../../../assets/images/wafa.png"),
	},
	{
		id: "4",
		title: "Edukasi Gizi",
		desc: "Pentingnya gizi seimbang",
		image: require("../../../assets/images/download.jpeg"),
	},
	{
		id: "5",
		title: "Cegah Stunting",
		desc: "kok mau si stunting",
		image: require("../../../assets/images/adat.jpeg"),
	},
	{
		id: "6",
		title: "Pedoman Gizi Seimbang",
		desc: "yok sehat",
		image: require("../../../assets/images/adate.jpeg"),
	},
];

export default function DeskripsiBudaya() {
	const [search, setSearch] = useState("");
	const router = useRouter();

	const filteredData = DATA.filter((item) =>
		item.title.toLowerCase().includes(search.toLowerCase())
	);

	const renderItem = ({ item }: { item: Artikel }) => (
		<TouchableOpacity
			className="bg-white rounded-2xl m-2 flex-1 shadow max-w-[47%] overflow-hidden"
			onPress={() =>
				router.push({
					pathname: "/(root)/(DeskripsiBudaya)/detail",
					params: { id: item.id },
				})
			}
		>
			<Image source={item.image} className="w-full h-28" resizeMode="cover" />
			<View className="bg-[#5B6846] p-2 rounded-b-2xl">
				<Text className="text-white font-bold text-base">{item.title}</Text>
				<Text className="text-gray-200 text-xs">{item.desc}</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="bg-[#5B6846] flex-row items-center px-4 pt-4 pb-2">
				<Text className="text-white text-xl font-bold ml-2">
					GumisaQ Budaya
				</Text>
			</View>
			<View className="bg-[#5B6846] items-center pb-6">
				<Text className="text-white text-2xl mt-2 mb-3">Artikel</Text>
				<TextInput
					className="bg-white rounded-lg w-11/12 h-10 px-4 text-base"
					placeholder="Cari"
					placeholderTextColor="#888"
					value={search}
					onChangeText={setSearch}
				/>
			</View>
			<FlatList
				data={filteredData}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentContainerStyle={{
					paddingBottom: 24,
					paddingTop: 16,
					paddingHorizontal: 8,
				}}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}
