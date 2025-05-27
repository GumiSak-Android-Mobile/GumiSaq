import images from "@/constants/images";
import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text className="text-red-500 font-bold">Halo say Wafa</Text>
			<Link href="/sign-in">Sign-in</Link>
			<Image source={images.icon1} className="size-10 rounded-full " />
			<Link href="/explore">Explore</Link>
			<Link href="/profile">Profile</Link>
			<Link href="/logout">Log out</Link>
			<Link href="./properties/1">Property</Link>
			<Link href="./(DeskripsiBudaya)">Deskripsi Budaya</Link>
		</View>
	);
}
