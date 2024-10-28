# React Native android SAF test demo

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. prebuild and run android

   ```bash
    npx expo prebuild -p android
    npx expo run:android --device
   ```

This demo explores how to implement image selection and saving functionality in Android using React Native without requesting any file permissions.
The demo has only been tested on Android. While iOS-related code exists, it hasn't been tested.

This demo is implemented using `expo-file-system` and `expo-image-picker`, which provide encapsulated SAF (Storage Access Framework) operations.
