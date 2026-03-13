import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, Button, FlatList, Pressable} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect} from 'react';
import { 
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "firebase/firestore";
import {db, storage} from './firebase';
import {useCollection} from 'react-firebase-hooks/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import MapView, {Marker} from 'react-native-maps';
import styles from './style'; 

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
          name="Home" 
          component={HomeScreen} />
          <Stack.Screen 
          name="Notebook"
          component={NotebookScreen} />
          <Stack.Screen 
          name="Maps"
          component={MapsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    );
  
}

function MapsScreen() {
  const [markers, setMarkers] = useState([]);
  const region = {
    latitude: 55,
    longitude: 12,
    latitudeDelta: 2,
    longitudeDelta: 2
  };

  function handleLongPress(event) {
    const { coordinate } = event.nativeEvent; //hent kun coordiante objektet fra event.nativeEvent
    setMarkers(prev => [...prev, coordinate]); //opdater marker state ved at tilføje det nye coordinate objekt
  }


  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{width: '100%', height: '100%'}}
        region={region}
        onLongPress={handleLongPress}
        >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title="go there"
            description="good view"
          />
        ))}
      </MapView>
    </View>
  );
}

function HomeScreen({ navigation, route }) {
  function btnpressNotebook() {
    navigation.navigate("Notebook");
  }
  function btnpressMaps() {
    navigation.navigate("Maps");
  }

  const [showImage, setShowImage] = useState(false);
  const [name, setName] = useState("");
  return (
    <View style={styles.container}>
      <Image style={styles.imagestyle} source={require("./logo.png")} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.TextInput}
          placeholder="Insert name"
          value={name}
          onChangeText={setName}
        />
        <Button
          style={styles.button}
          title="Press me!"
          onPress={() => setShowImage(!showImage)}
        ></Button>
      </View>
      {name !== "" && <Text style={styles.greeting}>Hello {name}!</Text>}
      {showImage && (
        <Image style={styles.imagePop} source={require("./hotdog.png")} />
      )}
      <Button style={styles.button} title="Go to Notebook" onPress={btnpressNotebook} />
      <StatusBar style="auto" />
      <Button style={styles.button} title="Go to Maps" onPress={btnpressMaps} />
    </View>
  );
}

function NotebookScreen() {
  const [deleteId, setDeleteId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [imagePath, setImagePath] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [values, loading, error] = useCollection(collection(db, "notes"));
  const notes =
    values?.docs.map((doc) => ({ ...doc.data(), id: doc.id })) ?? [];
  const [imagePaths, setImagePaths] = useState({});

  async function saveNoteToFirestore() {
    await addDoc(collection(db, "notes"), {
      text: noteText,
    });
    setNoteText("");
  }

  async function deleteNoteFromFirestore() {
    try {
      await deleteDoc(doc(db, "notes", deleteId));
      console.log("Note deleted from Firestore!");
    } catch (error) {
      console.error("Error deleting note from Firestore: ", error);
    }
  }
  function renderItem({ item }) {
    return (
      <View style={styles.noteRow}>
        <Text style={styles.noteText}>{item.text}</Text>

        {(imagePaths[item.id] ?? []).map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.noteImage} />
        ))}

        <Pressable
          onPress={async () => {
            const uri = await pickImage();
            if (uri) {
              await uploadImageWithUri(uri, item.id);
            }
          }}
        >
          <Text>Upload Image</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            const uri = await launchCamera();
            if (uri) {
              await uploadImageWithUri(uri, item.id);
            }
          }}
        >
          <Text>Take Photo</Text>
        </Pressable>

        <Pressable
          style={styles.rowButton}
          onPress={() => deleteDoc(doc(db, "notes", item.id))}
        >
          <Text>Delete</Text>
        </Pressable>
      </View>
    );
  }
  async function launchCamera() {
    const result = await ImagePicker.requestCameraPermissionsAsync();

    if (!result.granted) {
      alert("No permission for camera");
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!response.canceled) {
      return response.assets[0].uri;
    }
  }
  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  }

  async function uploadImageWithUri(uri, noteId) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = noteId + "_" + Date.now() + ".jpg";
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);

      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        images: arrayUnion(filename),
      });

      await downloadImages(noteId);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadImageFromFirebase() {
    getDownloadURL(ref(storage, "myImage.jpg")).then((url) => {
      setImagePath(url);
    });
  }

  async function downloadImages(noteId) {
    try {
      const noteDoc = await getDoc(doc(db, "notes", noteId));
      const filenames = noteDoc.data()?.images ?? [];

      const urls = await Promise.all(
        filenames.map((filename) => getDownloadURL(ref(storage, filename))),
      );

      setImagePaths((paths) => ({ ...paths, [noteId]: urls }));
    } catch (error) {
      console.log("Error loading images:", error);
    }
  }
  useEffect(() => {
    notes.forEach((note) => {
      if (!imagePaths[note.id]) {
        downloadImages(note.id);
      }
    });
  }, [notes]);

  return (
    <View style={styles.intro}>
      <Text style={styles.introText}>Welcome to the notebook! </Text>
      <TextInput
        style={styles.TextInput}
        placeholder="Enter document id to delete..."
        value={deleteId}
        onChangeText={setDeleteId}
      />
      <Button
        style={styles.saveButton}
        title="Delete note"
        onPress={() => deleteNoteFromFirestore()}      />

      <TextInput
        style={styles.TextInput}
        placeholder="Enter your note here..."
        onChangeText={setNoteText}
      />
      <Button
        style={styles.saveButton}
        title="Save Note"
        onPress= {saveNoteToFirestore}
      />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <Pressable onPress={loadImageFromFirebase}>
        <Text>Load Image From Firebase</Text>
      </Pressable>
    </View>
  );
}
