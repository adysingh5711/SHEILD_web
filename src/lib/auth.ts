export interface User {
  uid: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

// Mock user database
const users: User[] = [
  {
    uid: '1',
    name: 'John Doe',
    email: 'user@example.com',
    profilePictureUrl: 'https://placehold.co/100x100.png',
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

export async function mockSignup(name: string, email: string, pass: string, picture?: File) {
  await mockApiCall();
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'User with this email already exists' };
  }
  
  const newUser: User = {
    uid: String(users.length + 1),
    name,
    email,
    profilePictureUrl: picture ? URL.createObjectURL(picture) : 'https://placehold.co/100x100.png',
  };
  
  users.push(newUser);
  return { success: true, user: newUser };
}

export function mockLogout() {
  // In a real app, this would invalidate a token/session
  return;
}
