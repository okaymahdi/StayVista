import axios from 'axios';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { Auth } from '../firebase/firebase.config';
const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(Auth, email, password);
  };

  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(Auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(Auth, googleProvider);
  };

  const resetPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(Auth, email);
  };

  const logOut = async () => {
    setLoading(true);
    await axios.get(`${import.meta.env.VITE_API_URL}/logout`, {
      withCredentials: true,
    });
    return signOut(Auth);
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(Auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };
  // Get token from server
  const getToken = async (email) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/jwt`,
      { email },
      { withCredentials: true },
    );
    return data;
  };

  /** Save User to DB */
  const saveUser = async (user) => {
    const currentUser = {
      email: user.email,
      role: 'guest',
      status: 'Verified',
    };
    const data = await axios.put(
      `${import.meta.env.VITE_API_URL}/user`,
      currentUser,
    );
    return data;
  };

  // onAuthStateChange
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getToken(currentUser.email);
        saveUser(currentUser);
      }
      setLoading(false);
    });
    return () => {
      return unsubscribe();
    };
  }, []);

  const AuthInfo = {
    user,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    resetPassword,
    logOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  // Array of children.
  children: PropTypes.array,
};

export { AuthContext };
export default AuthProvider;
