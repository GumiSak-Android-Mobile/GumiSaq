import { Article } from '@/constants/article';
import { getArticleById } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ArticleDetail = () => {
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await getArticleById(id as string);
        setArticle(response as Article);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(article.$createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-primary-500">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-4">ARTIKEL GIZI</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Article Image */}
        <Image 
          source={{ uri: article.image }}
          className="w-full h-64"
          resizeMode="cover"
        />

        {/* Category & Tags */}
        <View className="flex-row flex-wrap gap-2 p-4">
          <View className="bg-primary-100 px-3 py-1 rounded-full">
            <Text className="text-primary-500 font-rubik">
              {article.category}
            </Text>
          </View>
          {article.tags.map((tag, index) => (
            <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-gray-600 font-rubik">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Article Content */}
        <View className="p-4">
          <Text className="text-2xl font-rubik-bold text-black-300 mb-2">
            {article.title}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text className="text-sm font-rubik text-gray-500">
                By {article.author}
              </Text>
              <Text className="text-sm font-rubik text-gray-500 ml-4">
                {formattedDate}
              </Text>
            </View>
            <Text className="text-sm font-rubik text-gray-500">
              {article.viewCount} views
            </Text>
          </View>
          
          <Text className="text-base font-rubik text-black-200 leading-6 mb-4">
            {article.description}
          </Text>

          <Text className="text-base font-rubik text-black-200 leading-6">
            {article.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleDetail;
