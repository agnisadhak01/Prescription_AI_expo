import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../components/AuthContext';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';

// You can import this from a shared utility if you want
async function cameraToApi(imageUri: string) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);
  // Basic Auth credentials
  const username = 'user';
  const password = 'user@123';
  const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
  const response = await fetch('https://home.ausomemgr.com/webhook/prescription-ocr', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': basicAuth,
    },
  });
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
}

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { scansRemaining, refreshScansRemaining } = useAuth();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function takePicture() {
    // Check if user has scans remaining
    if (!scansRemaining || scansRemaining <= 0) {
      Alert.alert(
        "No Scans Remaining", 
        "You've used all your available scans. Please purchase more to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Purchase", onPress: () => router.push("/screens/SubscriptionScreen") }
        ]
      );
      return;
    }
    
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const ocrResult = await cameraToApi(photo.uri);
        
        // Updates scan quota using global context
        refreshScansRemaining();
        
        router.replace({
          pathname: '/screens/ProcessingResultScreen',
          params: { result: JSON.stringify(ocrResult) }
        });
      } catch (err) {
        const errorMsg = (err as any)?.message || 'Failed to upload image';
        Alert.alert('Error', errorMsg);
        
        // Always refresh scan quota after any attempt (success or failure)
        refreshScansRemaining();
      }
      setLoading(false);
    }
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.disclaimerContainer}>
        <DisclaimerComponent type="ai" compact={true} />
      </View>
      
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.disclaimerBanner}>
            <Text style={styles.disclaimerText}>
              Not intended for medical use. For organization purposes only.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.captureButton]} 
              onPress={takePicture}
            >
              <Text style={styles.text}>Capture</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.text}>Uploading...</Text>
            </View>
          )}
        </CameraView>
      </View>
      
      <View style={styles.footerDisclaimerContainer}>
        <DisclaimerComponent type="medical" compact={true} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 8,
  },
  captureButton: {
    backgroundColor: 'rgba(255,69,58,0.7)',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  footerDisclaimerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  disclaimerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    alignItems: 'center',
  },
  disclaimerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  }
}); 