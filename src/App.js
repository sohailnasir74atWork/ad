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
  const [reddit, setReddit] = useState("");
  const [facebook, setFacebook] = useState("");
  const [facebookPost, setfacebookPost] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [retweetUrl, setRetweetUrl] = useState("");
  const [tgAnounc, setTGaANOUC] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [referel, setReferel] = useState(0);
  const [wallet, setWallet] = useState(0);

  const [score, setScore] = useState(0);

  
  const calculateScore = () => {
    let totalScore = 0;
    // Define fixed score per field
    const scorePerField = 1000; // Adjust this value as needed
    const scorePerRef = 2000*referel;
    // Count filled fields and calculate total score
    if (twitterHandle) totalScore += scorePerField;
    if (retweetUrl) totalScore += scorePerField;
    if (telegramHandle) totalScore += scorePerField;
    if (facebook) totalScore += scorePerField;
    if (facebookPost) totalScore += scorePerField;
    if (reddit) totalScore += scorePerField;
    if (tgAnounc) totalScore += scorePerField;
    if(referel > 0 ) totalScore += scorePerRef

    return totalScore;
  };
console.log('dcfdc', score)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      fetchUserDetails(currentUser.uid);
    }
  });
  return () => unsubscribe();
}, []);

useEffect(() => {
  // Assuming calculateScore now directly uses state variables and doesn't need arguments
  const newScore = calculateScore();
  if (user && newScore !== score) { // Check if there's a user logged in and if the score has changed
    updateScore(user.uid, newScore);
  }
}, [referel, twitterHandle, retweetUrl, telegramHandle, facebook, facebookPost, reddit, tgAnounc]); // Add all dependencies related to score calculation

const updateScore = async (uid, newScore) => {
  const userRef = ref(database, `users/${uid}`);
  try {
    await update(userRef, { score: newScore });
    setScore(newScore); // Update local state to reflect the new score
    console.log("Score updated successfully");
  } catch (error) {
    console.error("Failed to update score:", error);
  }
};


  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const queryParams = new URLSearchParams(window.location.search);
        const referralCode = queryParams.get("referral");
  
        // Reference to the user's data in the database
        const userRef = ref(database, `users/${user.uid}`);
        get(userRef).then((snapshot) => {
          if (!snapshot.exists()) {
            console.log("New user detected, initializing data...");
  
            // Initialize data for new users here
            const initialUserData = {
              twitterHandle: "",
              telegramHandle: "",
              retweetUrl: "",
              facebook: "",
              reddit: "",
              facebookPost: "",
              wallet: "",
              score: 0, // Initial score, adjust as needed
              tgAnounc: "",
              hasSubmitted: false,
              referralCount: 0, // Initialize referral count, adjust as needed
            };
  
            // Update the database with initial user data
            update(userRef, initialUserData).then(() => {
              console.log("User data initialized for new user.");
            }).catch((error) => {
              console.error("Failed to initialize user data:", error);
            });
  
            // If there's a referral code, handle referral logic
            if (referralCode) {
              incrementReferralCount(referralCode);
            }
          } else {
            console.log("Existing user, fetching details...");
            // fetchUserDetails(user.uid);
          }
        });
      })
      .catch((error) => {
        console.error("Error with Google sign-in:", error);
      });
  };
  
  const incrementReferralCount = (referralCode) => {
    const referrerRef = ref(database, `users/${referralCode}/referralCount`);
    runTransaction(referrerRef, (currentCount) => {
      // If null, initialize to 0 before incrementing
      return currentCount + 1;
    })
      .then(() => console.log("Referral count incremented"))
      .catch((error) =>
        console.error("Failed to increment referral count:", error)
      );
  };

  const fetchUserDetails = (uid) => {
    const userRef = ref(database, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTwitterHandle(data.twitterHandle || "");
        setTelegramHandle(data.telegramHandle || "");
        setRetweetUrl(data.retweetUrl || "");
        setFacebook(data.facebook || "");
        setReddit(data.reddit || "");
        setfacebookPost(data.facebookPost || "");
        setWallet(data.wallet || "");
        setScore(data.score || "");
        setTGaANOUC(data.tgAnounc || "");
        setHasSubmitted(data.hasSubmitted || false); // Set based on user data
        if (data.referralCount) {
          setReferel(data.referralCount);
        }
      } 
    });
  };
 
  const handleSubmit = (event) => {
    event.preventDefault();
    const newScore = calculateScore();
    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, {
      twitterHandle: twitterHandle,
      telegramHandle: telegramHandle,
      retweetUrl: retweetUrl,
      facebook: facebook,
      telegramHandle: telegramHandle,
      reddit: reddit,
      facebookPost: facebookPost,
      tgAnounc: tgAnounc,
      hasSubmitted: true, // Update submission status
      score: newScore,
      wallet: wallet
    })
      .then(() => {
        setHasSubmitted(true);
        // Display a success toast message
        setScore(newScore)
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
  const capitalizeName = (name) => {
    const words = name.split(" ");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));    return capitalizedWords.join(" ");
  };
  return (
    <div className="App">
      <ToastContainer />
      <header className="App-header">
        {user ? (
          <>
          <h2>Welcome, {capitalizeName(user.displayName)}!</h2>
            <p>Referel : {referel}</p>
            <p>Account Score : {score}</p>
            <form className="form" onSubmit={handleSubmit}>
              <div className="label-container">
                <span className="label-1">
                  1. Follow us on our official Twitter channel, X. :{" "}
                  <a href="https://twitter.com/gqrapp" target="_blank">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@twitterhandle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">2. Submit a repost link (retweet) for X. :{" "}</span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="Retweet url"
                value={retweetUrl}
                onChange={(e) => setRetweetUrl(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  3. Join our Official Telegram Announcement Channel:
                  {" "}<a href="https://t.me/genqr_app" target="_blank">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@telegramhandle"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  4. Join Official Telegram Community Group:
                  {" "}<a href="https://t.me/genqr_app" target="_blank">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@telegramhandle"
                value={tgAnounc}
                onChange={(e) => setTGaANOUC(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  5. Follow facebook page:{" "} <a href="https://www.facebook.com/genqrapp" target="_blank">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@userid"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />{" "}
              <div className="label-container">
                <span className="label-1">6. Share pinned post of our facebook page and submit link</span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="Post share link"
                value={facebookPost}
                onChange={(e) => setfacebookPost(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">7. Join Reddit:{" "} <a href="https://www.reddit.com/user/genqrapp/" target="_blank">Click here</a></span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@username"
                value={reddit}
                onChange={(e) => setReddit(e.target.value)}
              />
               <div className="label-container">
                <span className="label-1">8. Submit BSC wallet to receive airdrop:{" "} <a href=""></a></span>
              </div>
              <input
                type="text"
                placeholder="0x1234aBcdEF5678GhIJ90KlMNOpqRsTUVwXYZabcD
                "
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
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
                <p>Each Referral Score = 2000</p>
            <p>
              Share your referral link:
              <br />{" "}
              <code>{`${window.location.origin}?referral=${user.uid}`}</code>
            </p>
            <button onClick={handleCopy} className="button submit">
              Copy Link
            </button>
            <br />
          </>
        ) : (
          <div className="welcome">
            <h1>Welcome to $GQR Official Airdrop Page</h1>
            <button onClick={signInWithGoogle} className="button">
              JOIN AIRDROP NOW
            </button>
          </div>
        )}
        <br/><p><span>Note: </span>We will verify all participants in the airdrop. Any duplicates or fraudulent entries will be removed from the list.</p>
      </header>
    </div>
  );
}

export default App;
