import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';

export interface User {
  uid: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export async function login(email: string, pass: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const { user } = userCredential;
    const appUser: User = {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      profilePictureUrl: user.photoURL || undefined,
    };
    return { success: true, user: appUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function uploadProfilePicture(user: FirebaseUser, file: File): Promise<string> {
    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}


export async function signup(name: string, email: string, pass: string, picture?: File) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    let photoURL: string | undefined = undefined;
    if (picture) {
      photoURL = await uploadProfilePicture(user, picture);
    }
    
    await updateFirebaseProfile(user, { displayName: name, photoURL });
    
    const appUser: User = {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      profilePictureUrl: user.photoURL || undefined,
    };

    return { success: true, user: appUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(uid: string, data: Partial<User> & { pictureFile?: File }) {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
        return { success: false, error: "Authentication error." };
    }

    try {
        const user = auth.currentUser;
        const profileUpdate: { displayName?: string, photoURL?: string } = {};

        if (data.name) {
            profileUpdate.displayName = data.name;
        }

        if (data.pictureFile) {
            profileUpdate.photoURL = await uploadProfilePicture(user, data.pictureFile);
        }

        await updateFirebaseProfile(user, profileUpdate);
        
        const updatedUser: User = {
            uid: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            profilePictureUrl: user.photoURL || undefined
        };
        return { success: true, user: updatedUser };

    } catch (error: any) {
         return { success: false, error: error.message };
    }
}

export async function changeUserPassword(oldPass: string, newPass: string) {
    if (!auth.currentUser || !auth.currentUser.email) {
        return { success: false, error: "Authentication error." };
    }
    
    try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPass);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Incorrect current password or another error occurred." };
    }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
