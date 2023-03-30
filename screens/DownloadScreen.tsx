import React, { useState } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import RNFetchBlob from 'rn-fetch-blob';

const DownloadScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to download the video.',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const downloadVideo = async () => {
    setError('');

    try {
      const response = await fetch('https://yourtube-dl-server.herokuapp.com/download/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const { downloadUrl } = await response.json();
        const granted = await requestStoragePermission();

        if (granted) {
          const { config, fs } = RNFetchBlob;
          const downloadsDir = fs.dirs.DownloadDir;
          const videoId = url.split('v=')[1];
          const path = `${downloadsDir}/video_hello.mp4`;

          config({
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              path,
              description: 'Downloading video...',
            },
          })
            .fetch('GET', downloadUrl)
            .then(() => console.log('Video downloaded successfully'))
            .catch((err) => {
              console.warn(err);
              setError('An error occurred while downloading the video.');
            });
        } else {
          setError('Storage permission denied.');
        }
      } else {
        setError('An error occurred while fetching the video.');
      }
    } catch (err) {
      console.warn(err);
      setError('An error occurred while fetching the video.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="YouTube Video URL"
        value={url}
        onChangeText={setUrl}
        style={styles.input}
        left={<TextInput.Icon name={() => <Icon name="youtube" size={20} color="dodgerblue"/>} />}
      />
      <Button mode="contained" onPress={downloadVideo} style={styles.downloadButton}>
        Download Video
      </Button>
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 16,
  },
  downloadButton: {
    alignSelf: 'center',
  },
});

export default DownloadScreen;
