import React from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const SignIn = () => {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
      // Handle the successful authentication here
      // You can save the user to the Realtime Database in this step if needed
    }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
};

export default SignIn;
