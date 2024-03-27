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
  
  }, [user]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        const queryParams = new URLSearchParams(window.location.search);
        const referralCode = queryParams.get('referral');

        if (referralCode) {
            // Check if it's the user's first time logging in by checking their existence in the database
            const newUserRef = ref(database, `users/${user.uid}`);
            get(newUserRef).then((snapshot) => {
                if (!snapshot.exists()) {
                    // It's a new user, so increment the referrer's count
                    incrementReferralCount(referralCode);
                    
                    // Set up new user's data here, including marking them as having signed up (if you track that)
                }
                // Additional logic for setting up or updating the user's own data can go here
            });
        }
    }).catch((error) => {
        console.error("Error with Google sign-in:", error);
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
      return currentCount + 1;
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
        if (data.referralCount) {
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
            <div className="welcome">
              <h1>Welcome to $GQR Official Airdrop Page</h1>
              <button onClick={signInWithGoogle} className="button">
                JOIN AIRDROP NOW
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
