// context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from "../Firebase/config";
import { collection, doc, setDoc } from "firebase/firestore";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, getAdditionalUserInfo } from "firebase/auth";
import { auth } from '../Firebase/config';
import { useRouter } from 'next/navigation';

const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const LogIn = async () => {
    const provider = new GoogleAuthProvider
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result)
      if (additionalUserInfo.isNewUser) {
        console.log("itsNewUser")
        const configForNewUser = async () => {
          const dataToSend = {
            Note: {
              CountManager: {
                Count: 0 // If 'Total' is meant to be a number, avoid using quotes
              }
            },
            Username: additionalUserInfo.profile.name // Assuming this holds the username as a string
          };
          setDoc(doc(collection(database, "CollectionOfUser"), result.user.uid), dataToSend);
          console.log("DataCreatedForNewUser:" + additionalUserInfo.profile.name);
        }
        configForNewUser();
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  }
  const LogOut = () => {
    signOut(auth)
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      }
      console.log(JSON.stringify(currentUser));
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [user])

  return (
    <FirebaseAuthContext.Provider value={{ user, setUser, LogIn, LogOut }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const UseFirebase = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  return context;
};



