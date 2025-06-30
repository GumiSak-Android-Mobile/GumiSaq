// gumisak-android-mobile/gumisaq/GumiSaq-admin/app/(admin)/manage-articles/[id].tsx

import {
	config,
	getArticleById,
	getFilePreview,
	updateArticle,
	uploadFile,
} from "@/lib/appwrite";
import { CreateArticleData } from "@/types/article";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	SafeAreaView,
	ScrollView,
	Switch,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type ArticleCategory = CreateArticleData["category"];

// Definisikan tipe untuk form state yang lebih lengkap
type EditFormState = Partial<
	Omit<CreateArticleData, "tags" | "image" | "image2" | "image3">
> & { tags: string };

const EditArticleScreen = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();

	const [form, setForm] = useState<EditFormState>({
		title: "",
		description: "",
		description2: "",
		description3: "",
		content: "",
		category: "Hiburan",
		tags: "",
		isPublished: true,
	});

	const [imageAsset, setImageAsset] =
		useState<ImagePicker.ImagePickerAsset | null>(null);
	const [imageAsset2, setImageAsset2] =
		useState<ImagePicker.ImagePickerAsset | null>(null);
	const [imageAsset3, setImageAsset3] =
		useState<ImagePicker.ImagePickerAsset | null>(null);

	const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
	const [currentImageUrl2, setCurrentImageUrl2] = useState<string | null>(null);
	const [currentImageUrl3, setCurrentImageUrl3] = useState<string | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categories: ArticleCategory[] = ["Hiburan", "Benda", "Tradisi", "Adat"];

	useEffect(() => {
		const fetchArticle = async () => {
			if (!id) return;
			setIsLoading(true);
			try {
				const articleData = await getArticleById(id);
				if (articleData) {
					setForm({
						title: articleData.title,
						description: articleData.description,
						description2: articleData.description2 || "",
						description3: articleData.description3 || "",
						content: articleData.content,
						category: articleData.category,
						tags: articleData.tags.join(", "),
						isPublished: articleData.isPublished,
					});
					setCurrentImageUrl(articleData.image);
					setCurrentImageUrl2(articleData.image2 || null);
					setCurrentImageUrl3(articleData.image3 || null);
				}
			} catch (error) {
				Alert.alert("Error", "Gagal memuat data artikel.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchArticle();
	}, [id]);

	const pickImage = async (
		setter: React.Dispatch<
			React.SetStateAction<ImagePicker.ImagePickerAsset | null>
		>
	) => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [16, 9],
			quality: 0.7,
		});
		if (!result.canceled) {
			setter(result.assets[0]);
		}
	};

	const handleUpdate = async () => {
		if (!form.title || !form.content) {
			Alert.alert("Input Tidak Lengkap", "Judul dan Konten wajib diisi.");
			return;
		}
		setIsSubmitting(true);
		try {
			// Helper upload & get URL (mirip create.tsx)
			const uploadAndGetUrl = async (
				asset: ImagePicker.ImagePickerAsset | null,
				label: string
			): Promise<string | null> => {
				if (!asset) return null;
				const fileToUpload = {
					name: asset.fileName || `article_${Date.now()}.jpg`,
					type: asset.mimeType || "image/jpeg",
					uri: asset.uri,
					size: asset.fileSize || 0,
				};
				try {
					const uploadedFile = await uploadFile(
						fileToUpload,
						config.storageBucketId!
					);
					if (!uploadedFile || !uploadedFile.$id) {
						throw new Error("Respons dari proses unggah tidak valid.");
					}
					const previewUrl = getFilePreview(
						config.storageBucketId!,
						uploadedFile.$id
					);
					return previewUrl.href;
				} catch (e: any) {
					console.error(`[${label}] Upload error:`, e.message);
					return null;
				}
			};

			// Upload gambar baru jika ada, jika tidak pakai url lama
			const imageUrl = imageAsset
				? await uploadAndGetUrl(imageAsset, "Gambar Utama")
				: currentImageUrl;
			const imageUrl2 = imageAsset2
				? await uploadAndGetUrl(imageAsset2, "Gambar Kedua")
				: currentImageUrl2;
			const imageUrl3 = imageAsset3
				? await uploadAndGetUrl(imageAsset3, "Gambar Ketiga")
				: currentImageUrl3;

			// Siapkan payload update
			const updatePayload: Partial<CreateArticleData> = {
				...form,
				tags: form.tags
					.split(",")
					.map((tag: string) => tag.trim())
					.filter(Boolean),
				image: imageUrl || undefined,
				image2: imageUrl2 || undefined,
				image3: imageUrl3 || undefined,
			};

			await updateArticle(id!, updatePayload);
			Alert.alert("Sukses!", "Artikel berhasil diperbarui.", [
				{ text: "OK", onPress: () => router.back() },
			]);
		} catch (error: any) {
			Alert.alert("Error", `Gagal memperbarui: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const ImagePickerBox = ({
		asset,
		currentUri,
		onPick,
		title,
	}: {
		asset: ImagePicker.ImagePickerAsset | null;
		currentUri: string | null;
		onPick: () => void;
		title: string;
	}) => (
		<View>
			<Text className="text-base text-gray-600 mb-2">{title}</Text>
			<TouchableOpacity
				onPress={onPick}
				className="border border-dashed border-gray-400 p-2 rounded-xl items-center justify-center h-48 bg-gray-50"
			>
				<Image
					source={{ uri: asset ? asset.uri : currentUri || undefined }}
					className="w-full h-full rounded-xl"
					resizeMode="cover"
				/>
				<View className="absolute bg-black/40 p-2 rounded-full">
					<Ionicons name="camera-outline" size={24} color="white" />
				</View>
			</TouchableOpacity>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
				<TouchableOpacity onPress={() => router.back()} className="p-2">
					<Ionicons name="close" size={28} color="#333" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-gray-800">Edit Artikel</Text>
				<TouchableOpacity
					onPress={handleUpdate}
					disabled={isSubmitting}
					className="p-2"
				>
					{isSubmitting ? (
						<ActivityIndicator color="#0BBEBB" />
					) : (
						<Ionicons name="checkmark-done" size={28} color="#0BBEBB" />
					)}
				</TouchableOpacity>
			</View>

			{isLoading ? (
				<ActivityIndicator size="large" className="mt-16" />
			) : (
				<ScrollView contentContainerStyle={{ padding: 20 }}>
					<View className="space-y-6">
						<ImagePickerBox
							asset={imageAsset}
							currentUri={currentImageUrl}
							onPick={() => pickImage(setImageAsset)}
							title="Gambar Utama Artikel"
						/>
						<ImagePickerBox
							asset={imageAsset2}
							currentUri={currentImageUrl2}
							onPick={() => pickImage(setImageAsset2)}
							title="Gambar Kedua (Opsional)"
						/>
						<ImagePickerBox
							asset={imageAsset3}
							currentUri={currentImageUrl3}
							onPick={() => pickImage(setImageAsset3)}
							title="Gambar Ketiga (Opsional)"
						/>

						<View>
							<Text className="text-base text-gray-600 mb-2">
								Judul Artikel
							</Text>
							<TextInput
								value={form.title}
								onChangeText={(e) => setForm({ ...form, title: e })}
								className="border border-gray-300 p-4 rounded-xl text-base"
							/>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">Deskripsi 1</Text>
							<TextInput
								value={form.description}
								onChangeText={(e) => setForm({ ...form, description: e })}
								multiline
								className="border border-gray-300 p-4 rounded-xl text-base h-24"
								style={{ textAlignVertical: "top" }}
							/>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">
								Deskripsi 2 (Opsional)
							</Text>
							<TextInput
								value={form.description2}
								onChangeText={(e) => setForm({ ...form, description2: e })}
								multiline
								className="border border-gray-300 p-4 rounded-xl text-base h-24"
								style={{ textAlignVertical: "top" }}
							/>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">
								Deskripsi 3 (Opsional)
							</Text>
							<TextInput
								value={form.description3}
								onChangeText={(e) => setForm({ ...form, description3: e })}
								multiline
								className="border border-gray-300 p-4 rounded-xl text-base h-24"
								style={{ textAlignVertical: "top" }}
							/>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">Konten</Text>
							<TextInput
								value={form.content}
								onChangeText={(e) => setForm({ ...form, content: e })}
								multiline
								className="border border-gray-300 p-4 rounded-xl text-base h-48"
								style={{ textAlignVertical: "top" }}
							/>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">Kategori</Text>
							<View className="border border-gray-300 rounded-xl">
								<Picker
									selectedValue={form.category}
									onValueChange={(val: ArticleCategory) =>
										setForm({ ...form, category: val })
									}
									style={{ height: 56 }}
								>
									{categories.map((cat) => (
										<Picker.Item
											key={cat}
											label={cat.charAt(0).toUpperCase() + cat.slice(1)}
											value={cat}
										/>
									))}
								</Picker>
							</View>
						</View>

						<View>
							<Text className="text-base text-gray-600 mb-2">
								Tags (pisahkan dengan koma)
							</Text>
							<TextInput
								value={form.tags}
								onChangeText={(e) => setForm({ ...form, tags: e })}
								className="border border-gray-300 p-4 rounded-xl text-base"
							/>
						</View>

						<View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
							<Text className="text-base text-gray-600">
								Publikasikan Artikel
							</Text>
							<Switch
								trackColor={{ false: "#767577", true: "#81d4fa" }}
								thumbColor={form.isPublished ? "#0BBEBB" : "#f4f3f4"}
								onValueChange={(val) => setForm({ ...form, isPublished: val })}
								value={form.isPublished}
							/>
						</View>
					</View>
				</ScrollView>
			)}
		</SafeAreaView>
	);
};

export default EditArticleScreen;
