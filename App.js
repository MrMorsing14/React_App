import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, Button, FlatList, Pressable} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import {collection, addDoc, deleteDoc,} from 'firebase/firestore';
import {db, storage} from './firebase';
import {useCollection} from 'react-firebase-hooks/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
 

export default function App() {
  const Stack = createNativeStackNavigator();
  const [values, loading, error] = useCollection(collection(db, 'notes'));
  const data = values?.docs.map((doc)=>({...doc.data(), id:doc.id}));
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
          name="Home" 
          component={HomeScreen} />
          <Stack.Screen 
          name="Notebook"
          component={NotebookScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    );
  
}

function HomeScreen({ navigation, route }) {
  
  function btnpress(){
    navigation.navigate('Notebook');
  }

  const [showImage, setShowImage]=useState(false);
  const [name, setName] = useState('');
  return (
    <View style={styles.container}>
      <Image
        style={styles.imagestyle}
        source={require('./logo.png')}
      />
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.TextInput} 
          placeholder='Insert name'
          value={name}
          onChangeText={setName}
        />
        <Button style ={styles.button}
        title='Press me!'
        onPress={()=>setShowImage(!showImage)}
        ></Button>
      </View>
      {name !== '' && (
        <Text style={styles.greeting}>Hello {name}!</Text>
      )}
      {showImage && (
        <Image
          style={styles.imagePop}
          source={require('./hotdog.png')}
        />
      )}
      <Button style={styles.button} title="Go to Notebook" 
      onPress={btnpress} 
      />
      <StatusBar style="auto" />
    </View>
  );
}

function NotebookScreen() {
  const [deleteId, setDeleteId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [imagePath, setImagePath] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);


  async function saveNoteToFirestore(note) {
    try {
      await addDoc(collection(db, 'notes'), {
        text: note.name,
      });
      setNoteText('');
      console.log('Note saved to Firestore!');
    } catch (error) {
      console.error('Error saving note to Firestore: ', error);
    }
  }

  async function deleteNoteFromFirestore() {
    try {
      await deleteDoc(doc(db, 'notes', deleteId));
      console.log('Note deleted from Firestore!');
    } catch (error) {
      console.error('Error deleting note from Firestore: ', error);
    }
  }
  function renderItem({item}) {
    return (
      <Button title={item.name} 
      onPress={() => alert(item.name)} />
    );
  }

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    })
    if (!result.canceled) {
      setImagePath(result.assets[0].uri);
      console.log("billede ok!")
    }
  }

  async function uploadImage() {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    const storageRef = ref(storage, 'myImage.jpg');

    await uploadBytes(storageRef, blob);
    console.log('Image uploaded successfully!');

    const url = await getDownloadURL(storageRef);
    setDownloadUrl(url);

  } catch (error) {
    console.log(error);
  }
}
async function loadImageFromFirebase() {
  getDownloadURL(ref(storage, 'myImage.jpg')).then((url) => {
    setImagePath(url);
  });
}

 
  return (
    <View style={styles.intro}>
      <Text style={styles.introText}>Welcome to the notebook! </Text>
      <TextInput
      style={styles.TextInput}
      placeholder="Enter document id to delete..."
      value={deleteId}
      onChangeText={setDeleteId}
/>
      <Button style={styles.saveButton} title="Delete note" 
      onPress={() => deleteNoteFromFirestore({deleteId})} 
      />


      <TextInput style={styles.TextInput} 
      placeholder="Enter your note here..." 
      value={noteText}
      onChangeText={setNoteText}
      />
      <Button style={styles.saveButton} title="Save Note" 
      onPress={() => saveNoteToFirestore({name: noteText})} 
      />
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={item => item.key.toString()}
      />
    <Image source={{uri:imagePath}} style={styles.imagestyle}>
    </Image>
    <Pressable onPress={pickImage}>
      <Text>Pick Image</Text>
    </Pressable>
    <Pressable onPress={uploadImage}>
      <Text>Upload Image</Text>
    </Pressable>
    <Pressable onPress={loadImageFromFirebase}>
      <Text>Load Image From Firebase</Text>
    </Pressable>
    
    </View>
    
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#97a098",
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro:{
    fontSize: 33,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
  },
    introText:{
    fontSize: 34,
    color: '#261515',
    marginBottom: 20,
    fontWeight: 'bold',
  },

  imagestyle:{
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer:{
    flexDirection: 'row',
  },
  TextInput:{
    backgroundColor:"#fff",
    marginRight:5,
    padding:5,
    flexDirection: 'row',
  },
  button:{
    backgroundColor: "#fff",
    borderColor: "#0a1b9b5f"
  },
  imagePop:{
    height:50,
    width: 50,
    resizeMode: 'contain'
  },
  greeting:{
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
    fontWeight: 'bold'
  },
  saveButton:{
    backgroundColor: "#fff",
    borderColor: "#0a1b9b5f",
    marginTop: 10,
    flexDirection: 'row',
  },
});
