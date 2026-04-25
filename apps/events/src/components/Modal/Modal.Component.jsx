import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useAuth } from "../../context/DiscussionAuth.context";
import { GOOGLE_CLIENT_ID } from "../../config";

const CustomModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const handleGoogleLogin = () => {
    const scope = encodeURIComponent("profile email openid");
    const redirectUri = encodeURIComponent(window.location.origin + "/");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    // Perform full page redirect
    window.location.assign(authUrl);
  };

  return (
    <>
      <button
        onClick={user ? signOut : openModal}
        disabled={loading}
        className="bg-premier-700 text-white px-2 py-1 text-sm rounded flex items-center gap-2 min-w-[80px] justify-center disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : user ? (
          <>
            {user.picture && <img src={user.picture} alt="profile" className="w-5 h-5 rounded-full" />}
            <span className="hidden sm:inline">Hi, {user.name.split(" ")[0]}</span>
            <span className="text-[10px] opacity-70">(Sign Out)</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[9999] overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen flex items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="relative w-full max-w-md p-8 bg-darkBackground-800 border border-darkBackground-600 rounded-[2rem] shadow-2xl">
                <button
                  onClick={closeModal}
                  className="absolute top-8 right-6 text-gray-400 hover:text-white transition-colors"
                >
                  {/* Close button icon */}
                  <svg
                    width="15"
                    height="15"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="fill-current"
                  >
                    <path d="M13.125 0l-7.5 7.5 7.5 7.5 1.429-1.428L8.482 7.5l6.072-6.071z"></path>
                    <path d="M1.429 0l7.5 7.5-7.5 7.5-1.43-1.428L6.072 7.5 0 1.43z"></path>
                  </svg>
                </button>

                <h2 className="text-3xl font-black text-center mb-10 uppercase tracking-tighter text-white">
                  Park <span className="text-gradient">Events</span>
                </h2>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="border border-darkBackground-600 bg-darkBackground-900 hover:bg-darkBackground-700 hover:border-vibrantBlue text-white font-bold tracking-wide py-3 px-4 rounded-full w-full mb-4 flex items-center justify-center transition-all shadow-lg"
                >
                  <span className="mr-2">
                    {/* Google logo SVG */}
                    <img
                      src="https://in.bmscdn.com/webin/common/icons/googlelogo.svg"
                      alt="Google Logo"
                      className="w-6 h-6"
                    />
                  </span>
                  Continue with Google
                </button>

                {/* Terms & Conditions */}
                <div className="flex items-center justify-center mt-8">
                  <label
                    htmlFor="termsCheckbox"
                    className="text-center text-gray-400 text-xs font-medium"
                  >
                    By continuing, you agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      className="text-vibrantBlue hover:text-white transition-colors underline"
                    >
                      Terms
                    </a>{" "}
                    &amp;{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-vibrantBlue hover:text-white transition-colors underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CustomModal;
