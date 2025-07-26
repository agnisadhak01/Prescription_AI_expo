import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../components/AuthContext';
import DisclaimerComponent from '../../components/ui/DisclaimerComponent';
import { cameraToApi } from '../../components/utils/scanUtils';
import { showErrorAlert } from '../../components/utils/errorHandler';

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
        
        // Verify that the result is valid and complete
        // Check for required properties to make sure result is valid
        if (!ocrResult || typeof ocrResult !== 'object') {
          throw new Error('Server returned an invalid response format');
        }
        
        // Create a safe serialized version of the result
        let serializedResult;
        try {
          serializedResult = JSON.stringify(ocrResult);
          // Validate the serialized result can be parsed back
          JSON.parse(serializedResult);
        } catch {
          throw new Error('Failed to serialize API response');
        }
        
        // Updates scan quota using global context
        refreshScansRemaining();
        
        router.replace({
          pathname: '/screens/ProcessingResultScreen',
          params: { 
            result: serializedResult,
            imageUri: photo.uri 
          }
        });
      } catch (err) {
        // Use improved error handling
        showErrorAlert(err, {
          navigateToHome: true,
          navigateHome: () => router.replace('/(tabs)'),
          retryAction: takePicture,
          onDismiss: () => {
            // Always refresh scan quota after any attempt (success or failure)
            refreshScansRemaining();
          }
        });
        
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