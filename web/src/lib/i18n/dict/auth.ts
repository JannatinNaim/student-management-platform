/** Auth surface strings (login, register, password reset, email verification). */
export const en = {
  // Login
  "auth.login.title": "Welcome back",
  "auth.login.subtitle": "Sign in to continue learning",
  "auth.login.footerPrompt": "New to Smart Notes?",
  "auth.login.createAccount": "Create an account",
  "auth.login.identifierLabel": "Email or username",
  "auth.login.identifierPlaceholder": "you@example.com or yourusername",
  "auth.login.passwordLabel": "Password",
  "auth.login.forgotPassword": "Forgot password?",
  "auth.login.submit": "Sign In",
  "auth.login.welcomeBack": "Welcome back!",

  // Register
  "auth.register.title": "Create your account",
  "auth.register.subtitle": "Join thousands of students sharing knowledge",
  "auth.register.footerPrompt": "Already have an account?",
  "auth.register.nameLabel": "Full name",
  "auth.register.namePlaceholder": "Ayesha Rahman",
  "auth.register.usernameLabel": "Username",
  "auth.register.usernamePlaceholder": "ayesha",
  "auth.register.usernameTitle": "Letters, numbers and underscores only",
  "auth.register.emailLabel": "Email",
  "auth.register.passwordLabel": "Password",
  "auth.register.submit": "Create Account",
  "auth.register.accountCreated": "Account created! Check your email to verify your account.",
  "auth.register.meetRequirements": "Please meet all password requirements",
  "auth.register.rule.minLength": "At least 8 characters",
  "auth.register.rule.uppercase": "One uppercase letter",
  "auth.register.rule.lowercase": "One lowercase letter",
  "auth.register.rule.number": "One number",

  // Forgot password
  "auth.forgot.title": "Reset your password",
  "auth.forgot.subtitle": "We'll email you a secure reset link",
  "auth.forgot.backToSignIn": "Back to sign in",
  "auth.forgot.emailLabel": "Email",
  "auth.forgot.emailPlaceholder": "you@example.com",
  "auth.forgot.submit": "Send Reset Link",
  "auth.forgot.sentMessage": "If an account exists for {email}, a reset link is on its way. Check your inbox (and spam folder).",

  // Reset password
  "auth.reset.title": "Choose a new password",
  "auth.reset.subtitle": "Minimum 8 characters with upper, lower and a number",
  "auth.reset.newPasswordLabel": "New password",
  "auth.reset.confirmLabel": "Confirm password",
  "auth.reset.submit": "Update Password",
  "auth.reset.passwordsMismatch": "Passwords do not match",
  "auth.reset.updated": "Password updated! Sign in with your new password.",
  "auth.reset.invalidTitle": "Invalid link",
  "auth.reset.invalidSubtitle": "This reset link is missing or malformed",
  "auth.reset.requestNewPrefix": "Request a new link from the",
  "auth.reset.forgotPasswordPage": "forgot password page",

  // Verify email
  "auth.verify.title": "Email verification",
  "auth.verify.subtitle": "Confirming your email address",
  "auth.verify.missingToken": "Verification link is missing its token.",
  "auth.verify.success": "Your email is verified! You can now upload notes and earn points.",
  "auth.verify.uploadFirstNote": "Upload Your First Note",
  "auth.verify.goToDashboard": "Go to Dashboard",

  // Shared
  "auth.shell.homeAriaLabel": "Smart Notes home",

  // Error fallbacks
  "auth.err.signInFailed": "Sign in failed",
  "auth.err.registrationFailed": "Registration failed",
  "auth.err.resetFailed": "Reset failed - the link may have expired",
  "auth.err.verificationFailed": "Verification failed",
  "auth.err.googleSignInFailed": "Google sign-in failed",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // Login
  "auth.login.title": "আবার স্বাগতম",
  "auth.login.subtitle": "শেখা চালিয়ে যেতে সাইন ইন করুন",
  "auth.login.footerPrompt": "স্মার্ট নোটসে নতুন?",
  "auth.login.createAccount": "একটি অ্যাকাউন্ট তৈরি করুন",
  "auth.login.identifierLabel": "ইমেইল বা ব্যবহারকারীর নাম",
  "auth.login.identifierPlaceholder": "you@example.com বা আপনার ব্যবহারকারীর নাম",
  "auth.login.passwordLabel": "পাসওয়ার্ড",
  "auth.login.forgotPassword": "পাসওয়ার্ড ভুলে গেছেন?",
  "auth.login.submit": "সাইন ইন করুন",
  "auth.login.welcomeBack": "আবার স্বাগতম!",

  // Register
  "auth.register.title": "আপনার অ্যাকাউন্ট তৈরি করুন",
  "auth.register.subtitle": "জ্ঞান ভাগ করে নেওয়া হাজারো শিক্ষার্থীর সাথে যোগ দিন",
  "auth.register.footerPrompt": "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
  "auth.register.nameLabel": "পুরো নাম",
  "auth.register.namePlaceholder": "আয়েশা রহমান",
  "auth.register.usernameLabel": "ব্যবহারকারীর নাম",
  "auth.register.usernamePlaceholder": "ayesha",
  "auth.register.usernameTitle": "শুধুমাত্র অক্ষর, সংখ্যা এবং আন্ডারস্কোর",
  "auth.register.emailLabel": "ইমেইল",
  "auth.register.passwordLabel": "পাসওয়ার্ড",
  "auth.register.submit": "অ্যাকাউন্ট তৈরি করুন",
  "auth.register.accountCreated": "অ্যাকাউন্ট তৈরি হয়েছে! আপনার অ্যাকাউন্ট যাচাই করতে আপনার ইমেইল দেখুন।",
  "auth.register.meetRequirements": "অনুগ্রহ করে সব পাসওয়ার্ডের শর্ত পূরণ করুন",
  "auth.register.rule.minLength": "কমপক্ষে ৮টি অক্ষর",
  "auth.register.rule.uppercase": "একটি বড় হাতের অক্ষর",
  "auth.register.rule.lowercase": "একটি ছোট হাতের অক্ষর",
  "auth.register.rule.number": "একটি সংখ্যা",

  // Forgot password
  "auth.forgot.title": "আপনার পাসওয়ার্ড রিসেট করুন",
  "auth.forgot.subtitle": "আমরা আপনাকে একটি নিরাপদ রিসেট লিঙ্ক ইমেইল করব",
  "auth.forgot.backToSignIn": "সাইন ইনে ফিরে যান",
  "auth.forgot.emailLabel": "ইমেইল",
  "auth.forgot.emailPlaceholder": "you@example.com",
  "auth.forgot.submit": "রিসেট লিঙ্ক পাঠান",
  "auth.forgot.sentMessage": "{email}-এর জন্য কোনো অ্যাকাউন্ট থাকলে, একটি রিসেট লিঙ্ক পথে আছে। আপনার ইনবক্স (এবং স্প্যাম ফোল্ডার) দেখুন।",

  // Reset password
  "auth.reset.title": "একটি নতুন পাসওয়ার্ড বেছে নিন",
  "auth.reset.subtitle": "কমপক্ষে ৮টি অক্ষর, একটি বড় হাতের, একটি ছোট হাতের ও একটি সংখ্যা সহ",
  "auth.reset.newPasswordLabel": "নতুন পাসওয়ার্ড",
  "auth.reset.confirmLabel": "পাসওয়ার্ড নিশ্চিত করুন",
  "auth.reset.submit": "পাসওয়ার্ড আপডেট করুন",
  "auth.reset.passwordsMismatch": "পাসওয়ার্ড মিলছে না",
  "auth.reset.updated": "পাসওয়ার্ড আপডেট হয়েছে! আপনার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
  "auth.reset.invalidTitle": "অবৈধ লিঙ্ক",
  "auth.reset.invalidSubtitle": "এই রিসেট লিঙ্কটি অনুপস্থিত বা ত্রুটিপূর্ণ",
  "auth.reset.requestNewPrefix": "একটি নতুন লিঙ্কের অনুরোধ করুন",
  "auth.reset.forgotPasswordPage": "পাসওয়ার্ড ভুলে যাওয়ার পৃষ্ঠা থেকে",

  // Verify email
  "auth.verify.title": "ইমেইল যাচাইকরণ",
  "auth.verify.subtitle": "আপনার ইমেইল ঠিকানা নিশ্চিত করা হচ্ছে",
  "auth.verify.missingToken": "যাচাইকরণ লিঙ্কে এর টোকেন অনুপস্থিত।",
  "auth.verify.success": "আপনার ইমেইল যাচাই হয়েছে! আপনি এখন নোট আপলোড করতে এবং পয়েন্ট অর্জন করতে পারবেন।",
  "auth.verify.uploadFirstNote": "আপনার প্রথম নোট আপলোড করুন",
  "auth.verify.goToDashboard": "ড্যাশবোর্ডে যান",

  // Shared
  "auth.shell.homeAriaLabel": "স্মার্ট নোটস হোম",

  // Error fallbacks
  "auth.err.signInFailed": "সাইন ইন ব্যর্থ হয়েছে",
  "auth.err.registrationFailed": "নিবন্ধন ব্যর্থ হয়েছে",
  "auth.err.resetFailed": "রিসেট ব্যর্থ হয়েছে - লিঙ্কটির মেয়াদ উত্তীর্ণ হতে পারে",
  "auth.err.verificationFailed": "যাচাইকরণ ব্যর্থ হয়েছে",
  "auth.err.googleSignInFailed": "গুগল সাইন-ইন ব্যর্থ হয়েছে",
};
