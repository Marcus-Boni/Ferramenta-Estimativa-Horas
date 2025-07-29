import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  // Substitua pelas suas configurações do Firebase
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize anonymous authentication
export const initializeAuth = async () => {
  try {
    // Verifica se já está autenticado
    if (auth.currentUser) {
      console.log('Usuário já autenticado:', auth.currentUser.uid);
      return;
    }

    const userCredential = await signInAnonymously(auth);
    console.log('Usuário autenticado anonimamente:', userCredential.user.uid);
  } catch (error) {
    console.error('Erro na autenticação anônima:', error);
    throw error;
  }
};
