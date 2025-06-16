import { Card, FeaturedCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import Search from "@/components/Search";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useGlobalContext(); // Get the current user from context

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={[1, 2, 3, 4]} // Sample data for your list
        renderItem={({ item }) => <Card />} // Render your Card component here
        numColumns={2}
        columnWrapperClassName="flex gap-5 px-5"
        contentContainerClassName="pb-32"
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <View className="flex flex-row items-center">
                {/* Display user avatar if available, otherwise use default logo */}
                <Image
                  source={{
                    uri: user?.avatar || images.logoawal, // If avatar exists, display it, else fallback to logo
                  }}
                  className="size-12 relative rounded-full bg-black"
                />
                <View className="flex flex-col items-start ml-2 justify-center">
                  {/* Display username */}
                  <Text className="text-xs font-rubik text-black-100">{user?.email}</Text>
                  <Text className="text-base font-rubik-medium text-black-300">{user?.name}</Text>
                </View>
              </View>
              <Image source={icons.bell} className="size-6" />
            </View>
            <Search />
            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300 ">Featured</Text>
                <TouchableOpacity>
                  <Text className=" text-base font-rubik-bold text-primary-300">See All</Text>
                </TouchableOpacity>
              </View>
              <FeaturedCard />
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-xl font-rubik-bold text-black-300 ">Our Recommendation</Text>
              <TouchableOpacity>
                <Text className=" text-base font-rubik-bold text-primary-300">See All</Text>
              </TouchableOpacity>
            </View>

            <Filters />
          </View>
        }
      />
    </SafeAreaView>
  );
}
