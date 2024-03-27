import React, { useEffect, useState } from "react";
import "./App.css";
import { auth, database, provider } from "./Code/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get, update, runTransaction } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [retweetUrl, setRetweetUrl] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false); 
  const [referel, setReferel] = useState(0); 


  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserDetails(currentUser.uid);
      }
    });
    const queryParams = new URLSearchParams(window.location.search);
  const referralCode = queryParams.get('referral');

  if (referralCode) {
    // If there's a referral code, increment the referrer's count
    incrementReferralCount(referralCode);
  }
  }, [user]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;
  
      // Check if the user signed in with a referral and if it's their first time
      const queryParams = new URLSearchParams(window.location.search);
      const referralCode = queryParams.get('referral');
  
      // Reference to the user in your database
      const userRef = ref(database, `users/${user.uid}`);
  
      get(userRef).then((snapshot) => {
        if (!snapshot.exists()) {
          console.log("It's a new user!");
  
          // New user setup here (e.g., setting initial values in the database)
          // Also, this is where you'd increment the referrer's count, if a referralCode is present
          if (referralCode) {
            incrementReferralCount(referralCode);
          }
        } else {
          console.log("Welcome back!");
        }
      });
    }).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  };
  

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setTwitterHandle("");
      setTelegramHandle("");
      setRetweetUrl("");
      setHasSubmitted(false);
    });
  };
  const incrementReferralCount = (referralCode) => {
    const referrerRef = ref(database, `users/${referralCode}/referralCount`);
    runTransaction(referrerRef, (currentCount) => {
      // If null, initialize to 0 before incrementing
      return (currentCount || 0) + 1;
    }).then(() => console.log("Referral count incremented"))
      .catch((error) => console.error("Failed to increment referral count:", error));
  };

  const fetchUserDetails = (uid) => {
    const userRef = ref(database, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTwitterHandle(data.twitterHandle || "");
        setTelegramHandle(data.telegramHandle || "");
        setRetweetUrl(data.retweetUrl || "");
        setHasSubmitted(data.hasSubmitted || false); // Set based on user data
        if (data.referralCount !== undefined) {
              setReferel(data.referralCount)       }
      } else {
        // New user setup
        update(userRef, {
          twitterHandle: "",
          telegramHandle: "",
          hasSubmitted: false,
          retweetUrl,
        });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, {
      twitterHandle: twitterHandle,
      telegramHandle: telegramHandle,
      retweetUrl: retweetUrl,
      hasSubmitted: true, // Update submission status
    })
      .then(() => {
        setHasSubmitted(true);
        // Display a success toast message
        toast.success("Information updated successfully!");
      })
      .catch((error) => {
        // Log the error or handle it as needed
        console.error("Failed to update information:", error);
        // Display an error toast message
        toast.error("Failed to update information. Please try again.");
      });
  };

  const handleCopy = () => {
    const referralLink = `${window.location.origin}?referral=${user.uid}`;
    navigator.clipboard.writeText(referralLink).then(
      () => {
        // Optional: Display a message to the user indicating the link was copied
        toast.success("Referral link copied to clipboard!");
      },
      (err) => {
        toast.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="App">
      <ToastContainer />
      <header className="App-header">
        <div className="App-header-content">
          {user ? (
            <>
              <h2>Welcome, {user.displayName}!</h2>
              <p>Referel Score : {referel}</p>
              <form className="form" onSubmit={handleSubmit}>
                <span className="label">@twitterID</span>
                <input
                  type="text"
                  placeholder="Twitter Handle"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
                <span className="label">@telegramID</span>
                <input
                  type="text"
                  placeholder="Telegram Handle"
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                />
                <span className="label">Retweet Url</span>
                <input
                  type="text"
                  placeholder="Retweet Url"
                  value={retweetUrl}
                  onChange={(e) => setRetweetUrl(e.target.value)}
                />
                <br />
                {!hasSubmitted ? ( // Show submit for new users or if editing
                  <button
                    type="submit"
                    className={
                      hasSubmitted
                        ? "button button-update"
                        : "button button-submit"
                    }
                  >
                    {hasSubmitted ? "Update" : "Submit"}
                  </button>
                ) : (
                  <button type="submit" className="button button-submit">
                    Update
                  </button>
                )}
              </form>
              <br />
              <button onClick={handleSignOut} className="button">
                Sign Out
              </button>
              <p>
                Share your referral link:
                <br />{" "}
                <code>{`${window.location.origin}?referral=${user.uid}`}</code>
              </p>
              <button onClick={handleCopy} className="button copy">
                Copy Link
              </button>
            </>
          ) : (
            <>
              <h1>Welcome to $GQR Official Airdrop Page</h1>
              <button onClick={signInWithGoogle} className="button">
                JOIN AIRDROP NOW
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
