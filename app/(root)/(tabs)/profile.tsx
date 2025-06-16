import { settings } from '@/constants/data';
import icons from '@/constants/icons';
import { config, databases, logout, storage } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const ProfileDetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <View className="flex-row items-center py-2">
    <Text className="text-lg font-rubik-bold w-32">{label}:</Text>
    <Text className="text-lg font-rubik-regular">{value ?? 'Tidak ada'}</Text>
  </View>
);

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-3"
  >
    <View className="flex flex-row items-center gap-3">
      <Image source={icon} className="size-6" />
      <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
        {title}
      </Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} className="size-5" />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const initialLinesToShow = 5;

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
      router.push('/sign-in');
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const toggleText = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert("Permission Required", "You need to grant access to your photos to change profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        Alert.alert("Uploading...", "Please wait while we update your profile picture.");

        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const fileSize = blob.size;

        const file = {
          name: `avatar-${user?.$id}-${Date.now()}.jpg`,
          type: 'image/jpeg',
          uri: result.assets[0].uri,
          size: fileSize,
        };

        let uploadedFile;
        try {
          if (!config.storageBucketId) {
            throw new Error("Appwrite Storage Bucket ID is not configured.");
          }
          uploadedFile = await storage.createFile(
            config.storageBucketId,
            'unique()',
            file
          );
          console.log('File uploaded to Appwrite Storage:', uploadedFile);
        } catch (uploadError: any) {
          console.error('Error uploading file to Appwrite storage:', JSON.stringify(uploadError, null, 2));
          Alert.alert("Error", `Failed to upload profile picture: ${uploadError.message || "Unknown error"}. Please check Appwrite bucket configuration and permissions.`);
          return;
        }

        // --- PERBAIKAN DI SINI ---
        const baseUrl = storage.getFileView(config.storageBucketId, uploadedFile.$id).href;
        // Cek apakah URL sudah memiliki parameter query (ada tanda '?')
        const separator = baseUrl.includes('?') ? '&' : '?';
        const fileUrlWithTimestamp = `${baseUrl}${separator}t=${Date.now()}`; // Gunakan 't' sebagai nama parameter timestamp

        console.log('Generated avatar URL for update:', fileUrlWithTimestamp);

        try {
          console.log('Attempting to update user profile document with new avatar URL for user ID:', user?.$id);
          if (!config.databaseId || !config.usersProfileCollectionId) {
            throw new Error("Appwrite Database ID or Users Profile Collection ID is not configured.");
          }
          const updated = await databases.updateDocument(
            config.databaseId,
            config.usersProfileCollectionId,
            user!.$id,
            { avatar: fileUrlWithTimestamp }
          );
          console.log('User profile document updated successfully:', updated);

          console.log('Refreshing global user data...');
          await refetch();
          console.log('Global user data refreshed.');

          Alert.alert("Success", "Profile picture updated successfully!");
          setAvatarError(false);
        } catch (updateError: any) {
          console.error('Error updating user profile document:', JSON.stringify(updateError, null, 2));
          Alert.alert("Error", `Failed to update profile in database: ${updateError.message || "Unknown error"}. Please check Appwrite collection permissions and your user ID.`);
        }
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during image pick process:', JSON.stringify(error, null, 2));
      Alert.alert("Error", `An unexpected error occurred: ${error.message || "Unknown error"}. Please try again.`);
    }
  };

  const handleAvatarError = () => {
    setAvatarError(true);
    console.error('Failed to load user avatar. Displaying placeholder.');
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <Image source={icons.bell} className="size-5" />
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={{
                uri: avatarError || !user?.avatar
                  ? 'https://via.placeholder.com/150'
                  : `${user.avatar.split('?')[0]}?${user.avatar.split('?')[1] || ''}&t=${Date.now()}`, // Perbaiki cara timestamp ditambahkan pada tampilan juga
              }}
              onError={handleAvatarError}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity onPress={handleImagePick} className="absolute bottom-11 right-2">
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>

            <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
          </View>
        </View>

        <View className="flex flex-col mt-10">
          <SettingsItem icon={icons.home} title="My Bookings" />
          <SettingsItem icon={icons.home} title="Payments" />
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}
        </View>

        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;