import React, { useRef, useState } from 'react';
import './App.css';
import './animations.css'

import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth'; 

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


firebase.initializeApp({
  apiKey: "AIzaSyCPiIEhQW7TXD4qkkjtYarGZ4iuV5BdDUI",
  authDomain: "superchat-91e15.firebaseapp.com",
  projectId: "superchat-91e15",
  storageBucket: "superchat-91e15.appspot.com",
  messagingSenderId: "414173455193",
  appId: "1:414173455193:web:e8f395f378198e25cbe248",
  measurementId: "G-D5H62T7EEV"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
    <button onClick={signInWithGoogle} >Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  //equivalent de createRef, sert a donner un acces
  // a un node du DOM ou un element React 
  const dummy = useRef()
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  // initialisation du state -> formValue est le State
  // setFormValue la methode de mise à jour du State
  const [formValue, setFormValue] = useState('')
  const sendMessage = async(e) => {
    e.preventDefault()
    const {uid, photoURL} = auth.currentUser
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    //sert a declencher le scroll, current = element actuel dans le DOM 
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map((msg, index) => 
          <CSSTransition
            timeout={2000}
            className='fade'
            key={index}>
            <ChatMessage message={msg}/>
          </CSSTransition>
        )}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit">Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="" referrerPolicy="no-referrer" />
      <p>{text}</p>
    </div>
  )
}

export default App;
