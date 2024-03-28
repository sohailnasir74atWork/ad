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
  const [score, setScore] = useState(0);
  const calculateScore = () => {
    let totalScore = 0;
    // Define fixed score per field
    const scorePerField = 1000; // Adjust this value as needed
    // Count filled fields and calculate total score
    if (twitterHandle) totalScore += scorePerField;
    if (retweetUrl) totalScore += scorePerField;
    if (telegramHandle) totalScore += scorePerField;
    if (facebook) totalScore += scorePerField;
    if (facebookPost) totalScore += scorePerField;
    if (reddit) totalScore += scorePerField;
    if (tgAnounc) totalScore += scorePerField;

    return totalScore;
  };

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserDetails(currentUser.uid);
      }
    });
  }, [user]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const queryParams = new URLSearchParams(window.location.search);
        const referralCode = queryParams.get("referral");

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
        setScore(data.score || "");
        setTGaANOUC(data.tgAnounc || "");

        setHasSubmitted(data.hasSubmitted || false); // Set based on user data
        if (data.referralCount) {
          setReferel(data.referralCount);
        }
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
                  1. Follow Twitter:{" "}
                  <a href="https://twitter.com/gqrapp">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="Twitter Handle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">2. Submit twitter tetweet link:</span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="Retweet URL"
                value={retweetUrl}
                onChange={(e) => setRetweetUrl(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  3. Join Official Telegram Announcement Channel:
                  <a href="https://t.me/genqr_app">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@telegramHandler"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  4. Join Official Community Group:
                  <a href="https://t.me/genqr_app">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@telegramHandler"
                value={tgAnounc}
                onChange={(e) => setTGaANOUC(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">
                  5. Folow facebook page: <a href="ttps://www.facebook.com/genqrapp">Click here</a>
                </span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@facebookUserID"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />{" "}
              <div className="label-container">
                <span className="label-1">6. Share facebook Pin Post</span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="Share link URL"
                value={facebookPost}
                onChange={(e) => setfacebookPost(e.target.value)}
              />
              <div className="label-container">
                <span className="label-1">7. Join Reddit: <a href="https://www.reddit.com/user/genqrapp/"></a>Click here</span>
                <span className="label-2">Score: 1000</span>
              </div>
              <input
                type="text"
                placeholder="@redditUserName"
                value={reddit}
                onChange={(e) => setReddit(e.target.value)}
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
      </header>
    </div>
  );
}

export default App;
