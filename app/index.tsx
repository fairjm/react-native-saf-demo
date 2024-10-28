import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      // see https://docs.expo.dev/versions/latest/sdk/imagepicker/
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("failed to select image:", error);
      alert("failed to select image");
    }
  };

  const saveImageAndroid = async () => {
    if (selectedImage === null) {
      Alert.alert("no image selected");
      return;
    }
    try {
      // use SAF no file permission needed but need to select a folder to save
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        alert("failed to grant permission");
        return;
      }

      const filename = selectedImage.uri.split("/").pop() || "image.jpg";

      // use permission directory uri
      const destinationUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        "image/jpeg"
      );

      console.log("save destiationUri:", destinationUri);
      const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(destinationUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      alert("saved!");
    } catch (error) {
      console.error("save failed:", error);
      throw error;
    }
  };

  const saveImageIOS = async () => {
    if (selectedImage === null) {
      Alert.alert("no image selected");
      return;
    }
    try {
      const asset = await MediaLibrary.createAssetAsync(selectedImage.uri);
      const album = await MediaLibrary.getAlbumAsync("MyApp");
      if (album === null) {
        await MediaLibrary.createAlbumAsync("MyApp", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      alert("Save to MyApp!");
    } catch (error) {
      console.error("save failed", error);
      throw error;
    }
  };

  const saveImage = async () => {
    if (!selectedImage) {
      alert("select one image first");
      return;
    }

    setLoading(true);

    try {
      if (Platform.OS === "android") {
        await saveImageAndroid();
      } else {
        await saveImageIOS();
      }
    } catch (error) {
      alert("save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="select image" onPress={pickImage} disabled={loading} />

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.image}
            resizeMode="contain"
          />
          <Button
            title={
              Platform.OS === "ios" ? "save to album" : "save to specified dir"
            }
            onPress={saveImage}
            disabled={loading}
          />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});
