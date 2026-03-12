import { StyleSheet } from 'react-native';

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
  noteRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  padding: 10,
  borderBottomWidth: 1,
  borderColor: "#ccc"
  },

  noteText: {
    width: 120,
    fontSize: 16
  },

  noteImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee"
  },

  rowButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8
  }
});

export default styles;
