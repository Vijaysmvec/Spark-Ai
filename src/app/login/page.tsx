"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  GitBranch,
  Zap,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { sparkApi } from "@/lib/api";
import {
  getFirebaseAuth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

function GoogleLogoSvg({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z"
      />
    </svg>
  );
}

const PLATFORM_HIGHLIGHTS = [
  {
    icon: GitBranch,
    title: "Autonomous Multi-Agent Planning",
    description:
      "Decompose complex objectives into parallel Research, Analysis, and Execution workflows.",
    color: "text-violet-400",
    bg: "bg-violet-500/15 border-violet-500/30",
  },
  {
    icon: Zap,
    title: "Real-Time Execution Graph",
    description:
      "Observe every agent decision, tool invocation, and milestone in live streaming telemetry.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/30",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop Governance",
    description:
      "Review and approve critical actions with enterprise-grade access control and audit trails.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
];

function UnifiedAuthContent() {
  const router = useRouter();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);

  // Check if returning from a Firebase Google redirect sign-in
  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) return;

    getRedirectResult(firebaseAuth)
      .then(async (result) => {
        if (result && result.user) {
          setSubmitting(true);
          const fbUser = result.user;
          const idToken = await fbUser.getIdToken();
          const session = await sparkApi.authenticateWithFirebase({
            id_token: idToken,
            uid: fbUser.uid,
            email: fbUser.email || "",
            name: fbUser.displayName || undefined,
            picture: fbUser.photoURL || undefined,
            provider: "firebase_google",
          });
          window.localStorage.setItem("spark_api_token", session.token);
          window.localStorage.setItem(
            "spark_user",
            JSON.stringify(session.user)
          );
          toast({
            title: "Signed in with Google",
            description: `Authenticated as ${session.user.name}`,
            variant: "success",
          });
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        const code = (err as { code?: string })?.code || "";
        if (
          code === "auth/configuration-not-found" ||
          code === "auth/operation-not-allowed"
        ) {
          setProviderNotice(
            "Google Sign-In is not yet enabled in your Firebase project. Enable the Google provider in Firebase Console → Authentication → Sign-in method."
          );
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [router, toast]);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".gsap-auth-header",
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 }
      )
        .fromTo(
          ".gsap-showcase-item",
          { x: -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
          "-=0.3"
        )
        .fromTo(
          ".gsap-auth-card",
          { y: 32, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power4.out" },
          "-=0.5"
        );

      gsap.to(".gsap-orbital-ring-outer", {
        rotate: 360,
        duration: 32,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".gsap-orbital-ring-inner", {
        rotate: -360,
        duration: 22,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  const handleGoogleAuth = async () => {
    setProviderNotice(null);
    setSubmitting(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        throw new Error("Firebase Authentication is not initialized.");
      }

      // Always prompt the individual user to pick their Gmail account
      googleProvider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const fbUser = credential.user;
      if (!fbUser.email) {
        throw new Error("Google account did not return an email address.");
      }

      const idToken = await fbUser.getIdToken();
      const session = await sparkApi.authenticateWithFirebase({
        id_token: idToken,
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email.split("@")[0],
        picture: fbUser.photoURL || undefined,
        provider: "firebase_google",
      });

      window.localStorage.setItem("spark_api_token", session.token);
      window.localStorage.setItem("spark_user", JSON.stringify(session.user));

      toast({
        title: `Welcome, ${session.user.name}`,
        description: "Session verified and isolated.",
        variant: "success",
      });
      router.push("/dashboard");
    } catch (err) {
      const errObj = err as { code?: string; message?: string };
      const code = errObj?.code || "";
      const errMsg = errObj?.message || "";

      if (code === "auth/popup-blocked") {
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth) {
          await signInWithRedirect(firebaseAuth, googleProvider);
          return;
        }
      }

      if (code === "auth/popup-closed-by-user") {
        toast({
          title: "Google Sign-In Cancelled",
          description:
            "You closed the Google account selector before completing sign-in.",
          variant: "warning",
        });
        return;
      }

      if (
        code === "auth/configuration-not-found" ||
        code === "auth/operation-not-allowed" ||
        errMsg.includes("auth/configuration-not-found") ||
        errMsg.includes("auth/operation-not-allowed")
      ) {
        setProviderNotice(
          "To open the Google Gmail account chooser, enable the 'Google' provider in your Firebase Console (Authentication → Sign-in method)."
        );
        toast({
          title: "Enable Google Provider in Firebase Console",
          description:
            "Turn on the Google sign-in switch in Firebase Console → Authentication → Sign-in method.",
          variant: "warning",
        });
        return;
      }

      toast({
        title: "Google Sign-In Error",
        description: errMsg || "Could not complete Google authentication.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProviderNotice(null);

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Credentials Required",
        description: "Please enter your email address and password.",
        variant: "warning",
      });
      return;
    }

    if (isSignUp && !name.trim()) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name to create your account.",
        variant: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        try {
          if (isSignUp) {
            const cred = await createUserWithEmailAndPassword(
              firebaseAuth,
              email.trim(),
              password
            );
            if (name.trim()) {
              await updateProfile(cred.user, { displayName: name.trim() });
            }
            const idToken = await cred.user.getIdToken();
            const session = await sparkApi.authenticateWithFirebase({
              id_token: idToken,
              uid: cred.user.uid,
              email: cred.user.email || email.trim(),
              name: name.trim() || cred.user.displayName || undefined,
              provider: "firebase_email",
            });
            window.localStorage.setItem("spark_api_token", session.token);
            window.localStorage.setItem(
              "spark_user",
              JSON.stringify(session.user)
            );
          } else {
            const cred = await signInWithEmailAndPassword(
              firebaseAuth,
              email.trim(),
              password
            );
            const idToken = await cred.user.getIdToken();
            const session = await sparkApi.authenticateWithFirebase({
              id_token: idToken,
              uid: cred.user.uid,
              email: cred.user.email || email.trim(),
              name: cred.user.displayName || undefined,
              provider: "firebase_email",
            });
            window.localStorage.setItem("spark_api_token", session.token);
            window.localStorage.setItem(
              "spark_user",
              JSON.stringify(session.user)
            );
          }

          toast({
            title: isSignUp ? "Account Created" : "Welcome Back",
            description: "Your isolated workspace session is active.",
            variant: "success",
          });
          router.push("/dashboard");
          return;
        } catch (fbErr) {
          const fbMsg = (fbErr as Error).message || "";
          // If Firebase Email/Password provider isn't toggled on yet in Firebase Console,
          // use the individual SQLite user account system so each user still has an isolated account.
          if (
            !fbMsg.includes("auth/configuration-not-found") &&
            !fbMsg.includes("auth/operation-not-allowed")
          ) {
            throw fbErr;
          }
        }
      }

      if (isSignUp) {
        const res = await sparkApi.registerIndividualUser({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        window.localStorage.setItem("spark_api_token", res.token);
        window.localStorage.setItem("spark_user", JSON.stringify(res.user));
        toast({
          title: "Account Created",
          description: `Welcome to SPARK AI, ${res.user.name}`,
          variant: "success",
        });
      } else {
        const res = await sparkApi.loginWithCredentials({
          email: email.trim(),
          password,
        });
        window.localStorage.setItem("spark_api_token", res.token);
        window.localStorage.setItem("spark_user", JSON.stringify(res.user));
        toast({
          title: `Welcome back, ${res.user.name}`,
          description: "Your isolated workspace session is active.",
          variant: "success",
        });
      }
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: isSignUp ? "Sign-Up Failed" : "Sign-In Failed",
        description: (err as Error).message,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-space-950 text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-violet-500/40"
    >
      {/* Ambient Deep-Space Backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-44 left-1/4 h-[520px] w-[720px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-140px] right-1/4 h-[500px] w-[660px] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute inset-0 spark-grid-bg opacity-55" />
      </div>

      {/* Minimalist Brand Header */}
      <header className="gsap-auth-header relative z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-glow-violet">
            <Sparkles className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-wider text-white">
              SPARK <span className="text-cyan-400">AI</span>
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              AI COMMAND CENTER
            </span>
          </div>
        </Link>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </header>

      {/* Main Split Interface */}
      <main className="relative z-10 mx-auto my-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-12 gap-12 px-6 py-8 items-center">
        {/* Left Column: Authentic Product Showcase */}
        <div className="lg:col-span-6 space-y-8">
          <div className="gsap-showcase-item inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-200">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AUTONOMOUS MULTI-AGENT WORKSPACE</span>
          </div>

          <div className="gsap-showcase-item space-y-4">
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your AI Workforce.{" "}
              <span className="text-gradient-spark">One Command Away.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Command specialized AI agents that plan, research, analyze, and
              execute complex business workflows with live visual telemetry.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="gsap-showcase-item space-y-3.5 max-w-xl">
            {PLATFORM_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl spark-glass border border-slate-800/90 p-4"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Animated Orbital Security Badge */}
          <div className="gsap-showcase-item hidden sm:flex items-center gap-4 pt-2">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg
                className="gsap-orbital-ring-outer absolute inset-0 h-full w-full"
                viewBox="0 0 60 60"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.45)"
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                />
              </svg>
              <svg
                className="gsap-orbital-ring-inner absolute inset-1.5 h-11 w-11"
                viewBox="0 0 60 60"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="22"
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="10 7"
                />
              </svg>
              <Lock className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="text-xs text-slate-400">
              <p className="font-semibold text-slate-200">
                Individual User Identity & Session Isolation
              </p>
              <p>
                Every user authenticates with their personal Google account or
                individual credentials
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Single-Page Login & Sign-Up Card */}
        <div className="lg:col-span-6">
          <div className="gsap-auth-card mx-auto max-w-md rounded-3xl spark-glass border border-violet-500/40 p-7 sm:p-9 shadow-glow-violet relative overflow-hidden">
            {/* Single-Page Sign In / Create Account Toggle */}
            <div className="grid grid-cols-2 rounded-2xl bg-space-950/90 border border-slate-800 p-1 mb-7">
              {[
                { id: false, label: "Sign In" },
                { id: true, label: "Create Account" },
              ].map((tab) => {
                const active = isSignUp === tab.id;
                return (
                  <button
                    key={String(tab.id)}
                    type="button"
                    onClick={() => {
                      setIsSignUp(tab.id);
                      setProviderNotice(null);
                    }}
                    className={`relative rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                      active ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="unifiedAuthTab"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6 text-center">
              <h2 className="font-display text-2xl font-bold text-white">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isSignUp
                  ? "Sign up with your personal Google account or email"
                  : "Sign in with your Google account or individual credentials"}
              </p>
            </div>

            {/* Actionable Notice if Google Provider is not yet toggled ON */}
            <AnimatePresence>
              {providerNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 rounded-2xl bg-amber-500/15 border border-amber-400/40 p-3.5 text-xs text-amber-200 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{providerNotice}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-In Button (Opens Google Account Chooser Popup) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={submitting}
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white text-slate-950 font-semibold h-12 px-5 shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              <GoogleLogoSvg className="h-5 w-5" />
              <span>
                {isSignUp ? "Sign up with Google" : "Continue with Google"}
              </span>
            </motion.button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-space-900 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                or continue with email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Unified Email & Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {isSignUp && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        placeholder="Enter your full name"
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Password Reset",
                          description:
                            "Switch to 'Create Account' if you are a new user, or sign in with Google.",
                        })
                      }
                      className="text-[11px] text-cyan-300 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder={
                      isSignUp
                        ? "Create a password (min. 6 characters)"
                        : "Enter your password"
                    }
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <span className="text-xs text-slate-300">
                    Keep me signed in
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Bottom Toggle Link */}
            <p className="mt-6 text-center text-xs text-slate-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setProviderNotice(null);
                }}
                className="font-semibold text-cyan-300 hover:text-white transition-colors"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-white/5">
        <span>© 2026 SPARK AI. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-slate-300">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-slate-300">
            Command Center
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-space-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <UnifiedAuthContent />
    </Suspense>
  );
}
