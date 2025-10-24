import { LogIn } from "lucide-react"; // Icon
import { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // Initialize Firebase authentication and navigation 
  const auth = getAuth();
  const navigate = useNavigate();

  // State variables for managing authentication state, email, password and error messages
  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Function to handle sign in with Google
  const signInWithGoogle = async () => {
    setAuthing(true);

    // Use Firebase to sign in with Google 
    signInWithPopup(auth, new GoogleAuthProvider())
      .then(response => {
        console.log(response.user.uid);
        navigate('/'); // Navigate to home or dashboard in other word
      })
      .catch(error => {
        console.log(error);
        setAuthing(false);
      })
  };

  // Function to handle Sign in with Email and Password
  const signInWithEmail = async () => {
    setAuthing(true);
    setError("");

    // Use Firebase to sign in with Email and Password
    signInWithEmailAndPassword(auth, email, password)
      .then(response => {
        console.log(response.user.uid);
        navigate('/'); // Navigate to home or dashboard in other word
      })
      .catch(error => {
        console.log(error);
        setError(error.message);
        setAuthing(false);
      })
  };
  
  return(
    <div className="flex min-h-[100vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-8 flex items-center gap-2 text-2xl font-semibold"><LogIn className="h-6 w-6"/><span>Sign In</span></div>
        {/* Input fields for email and password */}
        <div className="w-full flex flex-col py-4 mb-6 gap-4">
          <input
            type="email"
            placeholder="StudentID@student.vgu.edu.vn"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}/>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}/>
        </div>
        
        {/* Button to login with Email and Password*/}
        <div className='w-full flex flex-col justify-center items-center  mb-4'>
          <button
            className="w-1/3 bg-transparent border border-black text-black my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer"
            onClick={signInWithEmail}
            disabled={authing}>
            Log In
          </button>
        </div>
        {/* Display Error if there's any */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Divider with "OR" text */}
        <div className="w-ful flex items-center justify-center relative py-4">
          <div className="w-full h-[1px] bg-gray-500"></div>
          <p className="text-lg absolute text-gray-500 bg-white px-2">OR</p>
        </div>
        {/* Button to login with Google */}
        <div className="w-full flex items-center justify-center relative py-4">
          <button
            className="w-1/2 border border-black text-black font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7"
            onClick={(signInWithGoogle)}
            disabled={authing}>
            Log In with Google
          </button>
        </div>
        {/* Link to sign up Page */}
        <div className="w-full flex items-center justify-center mt-10">
          <p className="text-sm font-normal text-gray-400">Don't have an account? <span className='font-semibold text-black cursor-pointer underline'><a href='/signup'>Sign Up</a></span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;