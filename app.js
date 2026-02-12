import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIWtVqp0nDe3dMTJmfXTo-2FAtb0RvDHE",
  authDomain: "projetfirebaseg.firebaseapp.com",
  projectId: "projetfirebaseg",
  storageBucket: "projetfirebaseg.firebasestorage.app",
  messagingSenderId: "407356904402",
  appId: "1:407356904402:web:9b5a29517a4afd6cda6e0b",
  measurementId: "G-7EZ3N2KHWL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const signupButton = document.getElementById('signupButton');
const signupErrorDiv = document.getElementById('signupError');

signupButton.addEventListener('click', () => {
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    signupErrorDiv.textContent = '';

    if (email && password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Utilisateur inscrit avec succès:", user.email);
                signupEmailInput.value = '';
                signupPasswordInput.value = '';
            })
            .catch((error) => {
                signupErrorDiv.textContent = `Erreur: ${error.message}`;
            });
    } else {
        signupErrorDiv.textContent = "Veuillez entrer un email et un mot de passe.";
    }
});

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const loginErrorDiv = document.getElementById('loginError');

loginButton.addEventListener('click', () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginErrorDiv.textContent = '';

    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Utilisateur connecté avec succès:", user.email);
                loginEmailInput.value = '';
                loginPasswordInput.value = '';
            })
            .catch((error) => {
                loginErrorDiv.textContent = `Erreur: ${error.message}`;
            });
    } else {
        loginErrorDiv.textContent = "Veuillez entrer un email et un mot de passe.";
    }
});

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log("Utilisateur déconnecté avec succès.");
        })
        .catch((error) => {
            console.error("Erreur de déconnexion:", error);
        });
});

const authFormsDiv = document.getElementById('authForms');
const loggedInContentDiv = document.getElementById('loggedInContent');
const userEmailDisplay = document.getElementById('userEmailDisplay');

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("État d'authentification changé: Utilisateur connecté.", user.email);
        userEmailDisplay.textContent = user.email;
        authFormsDiv.style.display = 'none';
        loggedInContentDiv.style.display = 'block';

        currentUser = user
        console.log('Utilisateur connecté:', currentUser.uid);
        listenForMessages();
    } else {
        console.log("État d'authentification changé: Utilisateur déconnecté.");
        userEmailDisplay.textContent = '';
        authFormsDiv.style.display = 'block';
        loggedInContentDiv.style.display = 'none';
    }
});

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let currentUser = null;

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // real time event

    if (currentUser) {
        const messageText = messageInput.value.trim();

        if (messageText) {
            try {
                await addDoc(collection(db, 'messages'), {
                    text: messageText,
                    uid: currentUser.uid,
                    email: currentUser.email,
                    timestamp: serverTimestamp(),
                });
                console.log('Message envoyé avec succès!');
                messageInput.value = '';
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message:', error);
            }
        } else {
            alert('Veuillez écrire un message.');
        }
    } else {
        alert('Veuillez vous connecter pour envoyer un message.');
    }
});

const messagesContainer = document.getElementById('messages-container');

function listenForMessages() {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';

        snapshot.forEach((doc) => {
            const message = doc.data();
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');


            let displayTime = '';
            if (message.timestamp) {
                if (typeof message.timestamp.toDate === 'function') {
                    displayTime = message.timestamp.toDate().toLocaleString();
                } else {
                    displayTime = new Date(message.timestamp).toLocaleString();
                }
            }

            messageElement.innerHTML = `
        <p><strong>${message.email}</strong> <span class="timestamp">(${displayTime})</span></p>
        <p>${message.text}</p>
      `;
            messagesContainer.appendChild(messageElement);
        });
    }, (error) => {
        console.error("Erreur lors de l'écoute des messages:", error);
    });
}




