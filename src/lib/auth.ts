export interface User {
  uid: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  phone?: string;
}

// Mock user database
const users: User[] = [
  {
    uid: '1',
    name: 'John Doe',
    email: 'user@example.com',
    profilePictureUrl: 'https://placehold.co/100x100.png',
    phone: '111-222-3333',
  },
];

const mockApiCall = (delay = 1000) => new Promise(res => setTimeout(res, delay));

export async function mockLogin(email: string, pass: string) {
  await mockApiCall();
  const user = users.find(u => u.email === email);
  if (user && pass === 'password') { // In a real app, check hashed password
    return { success: true, user };
  }
  return { success: false, error: 'Invalid email or password' };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function mockSignup(name: string, email: string, pass: string, picture?: File) {
  await mockApiCall();
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'User with this email already exists.' };
  }
  
  const newUser: User = {
    uid: new Date().getTime().toString(),
    name,
    email,
    profilePictureUrl: picture ? await fileToDataUrl(picture) : 'https://placehold.co/100x100.png',
    phone: '',
  };
  
  users.push(newUser);
  return { success: true, user: newUser };
}

export async function mockUpdateProfile(uid: string, data: Partial<User> & { pictureFile?: File }) {
    await mockApiCall();
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex === -1) {
        return { success: false, error: "User not found" };
    }

    const user = users[userIndex];
    
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.pictureFile) {
        user.profilePictureUrl = await fileToDataUrl(data.pictureFile);
    }

    users[userIndex] = user;

    return { success: true, user };
}

export async function mockChangePassword(uid: string, oldPass: string, newPass: string) {
    await mockApiCall();
    // This is a mock. In a real app, you'd check the hashed password.
    if (oldPass !== 'password') {
        return { success: false, error: "Incorrect current password." };
    }
    console.log(`User ${uid} password changed successfully.`);
    // Here you would hash and save the new password.
    return { success: true };
}

export function mockLogout() {
  // In a real app, this would invalidate a token/session
  return;
}
