import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const [name, setName] = useState("Saufi Azuddin");
  const [email, setEmail] = useState("sauficapekpkl99@gmail.com");
  const [alamat, setAlamat] = useState("Jl. Abdul");
  const [noHp, setNoHp] = useState("081234567890");
  const [password, setPassword] = useState("*******");

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row items-center border-b border-black pb-2 mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold ml-4">Profile</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-auto">
            <Text className="text-3xl text-black mr-4">×</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center mt-6">
          <Ionicons name="person-circle-outline" size={80} color="#4B5563" />
          <Text className="text-lg text-black font-bold mt-2">Name</Text>
          <Text className="text-sm text-gray-900">youremail@mail.com</Text>
        </View>

        {/* Form */}
        <View className="mt-8 space-y-4">
          <View>
            <Text className="text-black mb-1">Nama</Text>
            <TextInput
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-black mb-1 mt-4">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-black mb-1 mt-4">Alamat</Text>
            <TextInput
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={alamat}
              onChangeText={setAlamat}
            />
          </View>

          <View>
            <Text className="text-black mb-1 mt-4">No HP</Text>
            <TextInput
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={noHp}
              onChangeText={setNoHp}
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text className="text-black mb-1 mt-4">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity className="bg-green-500 mt-8 py-3 rounded-md items-center">
          <Text className="text-black font-semibold">Save Change</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
