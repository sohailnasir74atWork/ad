import React, { useEffect, useState } from 'react';
import './App.css';
import { auth, database, provider } from './Code/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';

function App() {
  const [user, setUser] = useState(null);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if the user has submitted the form

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserDetails(currentUser.uid);
      }
    });
  }, [user]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).catch((error) => console.error(error));
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setTwitterHandle('');
      setTelegramHandle('');
      setHasSubmitted(false);
    });
  };

  const fetchUserDetails = (uid) => {
    const userRef = ref(database, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTwitterHandle(data.twitterHandle || '');
        setTelegramHandle(data.telegramHandle || '');
        setHasSubmitted(data.hasSubmitted || false); // Set based on user data
      } else {
        // New user setup
        update(userRef, { twitterHandle: '', telegramHandle: '', hasSubmitted: false });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, {
      twitterHandle: twitterHandle,
      telegramHandle: telegramHandle,
      hasSubmitted: true, // Update submission status
    }).then(() => {
      setHasSubmitted(true);
    });
  };

  

  return (
    <div className="App">
      <header className="App-header">
        <div className='App-header-content'>
        {user ? (
          <>
            <p>Welcome, {user.displayName}!</p>
            <form onSubmit={handleSubmit} className='form'>
              <span className='label'>@twitterID</span>
              <input
                type="text"
                placeholder="Twitter Handle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
            <span className='label'>@telegramID</span>
              <input
                type="text"
                placeholder="Telegram Handle"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
              />
              {!hasSubmitted ? ( // Show submit for new users or if editing
                <button type="submit" className={hasSubmitted ? 'button button-update' : 'button button-submit'}>{hasSubmitted ? "Update" : "Submit"}</button>
              ) : (
                <button type="button" className='button button-submit'>Update</button>
              )}
            </form>
            <br/>
            <button onClick={handleSignOut} className='button'>Sign Out</button>
            <p>Share your referral link: <code>{`${window.location.origin}?referral=${user.uid}`}</code></p>
          </>
        ) : (
          <>
          <h1>Welcome to $GQR Official Airdrop Page</h1>
          <button onClick={signInWithGoogle} className='button'>JOIN AIRDROP NOW</button>
          </>
        )}
        </div>
      </header>
    </div>
  );
}

export default App;
