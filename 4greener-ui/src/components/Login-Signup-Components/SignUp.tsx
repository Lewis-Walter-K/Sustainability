import { User } from "lucide-react"; // Icon
import { useState } from "react";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  // Initialize Firebase authentication and navigation
  const auth = getAuth();
  const navigate = useNavigate();

  // State variables for managing authentication state, email, password and error messages
  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Function to handle sign up with Google
  const signUpWithGoogle = async () => {
    setAuthing(true);

    // Use Firebase to sign up with Google
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

  // Function to handle Sign up with Email and Password
  const signUpWithEmail = async () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setAuthing(true);
    setError("");

    // Use Firebase to sign up with Email and Password
    createUserWithEmailAndPassword(auth, email, password)
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
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><User     className="h-5 w-5"><span>Sign Up</span></User>
        <p className="text-lg">Welcome! Please enter your information</p>
        </div>
        
        {/* Input fields for email, password and confirm password */}
        <div className="w-full flex flex-col mb-6 gap-2">
          <input
            type="email"
            placeholder="StudentID@student.vgu.edu.vn"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700"
            value={(email)}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700"
            value={(password)}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Re-enter Password"
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-700"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Display error message if there is one */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Button to sign up with email and password */}
        <div className='w-full flex flex-col justify-center items-center  mb-4'>
          <button
            onClick={signUpWithEmail}
            disabled={authing}
            className='w-1/2 bg-transparent border border-black text-black my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer'>
            Sign Up
          </button>

        </div>

        {/* Divider with 'OR' text */}
        <div className='w-full flex items-center justify-center relative py-4'>
          <div className='w-full h-[1px] bg-gray-500'></div>
          <p className='text-lg absolute text-gray-500 bg-white px-2'>OR</p>
        </div>
        {/* Button to sign UP with Google */}
        <div className="w-full flex items-center justify-center relative py-4">
          <button
            onClick={signUpWithGoogle}
            disabled={authing}
            className="w-1/2 border border-black text-black font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7">
            Sign Up with Google
          </button>
        </div>
        {/* Link to Login page */}
        <div className="w-full flex items-center justify-center mt-10">
          <p className="text-sm font-normal text-gray-400">Already have an account? <span className='font-semibold text-black cursor-pointer underline'><a href='/login'>Log In</a></span></p>
        </div>
      </div>
    </div>
  );
}

// export function Register({ T, onSuccess, onBack }: { T: any; onSuccess: ()=>void; onBack: ()=>void }) {
//   return (
//     <div className="flex min-h-[70vh] items-center justify-center px-4">
//       <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
//         <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><User className="h-5 w-5" /> <span>{T.register}</span></div>
//         <div className="space-y-3">
//           <div className="grid grid-cols-2 gap-2">
//             <input placeholder="Full name" className="rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
//             <input placeholder="Room" className="rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
//           </div>
//           <input type="email" placeholder="you@university.edu" className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
//           <input type="password" placeholder="Create password" className="w-full rounded-xl border px-3 py-2 dark:border-slate-700 dark:bg-slate-700" />
//           <div className="flex items-center gap-2 text-sm"><input type="checkbox"/> <span>Agree to terms</span></div>
//           <div className="flex gap-2">
//             <button onClick={onBack} className="w-1/2 rounded-2xl border bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">Back</button>
//             <button onClick={onSuccess} className="w-1/2 rounded-2xl bg-slate-900 px-3 py-2 text-white">{T.continue}</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default SignUp;