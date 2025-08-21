"use client";

import Link from "next/link";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const carouselImages = [
  { src: "/Rectangle 46 (1).svg", alt: "Image auth 1" },
  { src: "/Rectangle 46 (2).svg", alt: "Image auth 2" },
  { src: "/Rectangle 46 (3).svg", alt: "Image auth 3" },
];

export default function SignUp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 10500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
    resetInterval();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    resetInterval();
  };

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 2500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Adresa de email nu este validă");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Parolele nu se potrivesc");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      let data: unknown;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        setError("Răspuns invalid de la server. Te rugăm să încerci din nou.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMsg = typeof data === "object" && data !== null && "error" in data
          ? (data as { error?: string }).error
          : undefined;
        setError(errorMsg || "Eroare la înregistrare");
        return;
      }

      const successMsg = typeof data === "object" && data !== null && "message" in data
        ? (data as { message?: string }).message
        : undefined;
      setSuccess(successMsg || "Cont creat cu succes!");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Eroare de conexiune. Te rugăm să verifici internetul și să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Se încarcă...</div>
      </div>
    );
  }

  

  return (
    <div className="w-full h-screen flex flex-row">
      <div className="flex-1 max-w-1/2 hidden xl:flex flex-col justify-between h-full relative">
        <div className="flex flex-row justify-between mt-14 mx-10 text-white z-10">
          <div className="flex flex-row gap-1 items-center">
            <Image src="/logo.png" alt="Logo of Anime Astral" width={40} height={40} />
            <div className="flex flex-col">
              <h1 className="text-xl --Strike">Anime Astral</h1>
              <p className="text-sm">Watch free anime</p>
            </div>
          </div>
          <div className="flex flex-row gap-10 text-xs items-center">
            <Link href="/">
              <button className="hover:scale-105 hover:cursor-pointer text-white transition-all duration-200">
                Sign in
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-transparent border border-white text-white px-7 rounded-full hover:scale-105 hover:cursor-pointer transition-all duration-200 h-8">
                Log in
              </button>
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div className="w-full h-full absolute top-0 left-0 p-2 pointer-events-auto flex items-center justify-center">
          <Image
            key={carouselImages[currentIndex].src}
            src={carouselImages[currentIndex].src}
            alt={carouselImages[currentIndex].alt}
            height={409}
            width={462}
            priority
            className="w-full h-full slide-in-left"
          />
        </div>

        <div className="flex flex-row gap-4 mb-14 z-10 items-center justify-end pr-36 w-full">
          <CircleArrowLeft onClick={goToPrev} color="white" className="hover:scale-105 hover:cursor-pointer" size={30} />
          <CircleArrowRight onClick={goToNext} color="white" className="hover:scale-105 hover:cursor-pointer" size={30} />
        </div>
      </div>

      <div className="text-white flex-1 xl:max-w-1/2 flex flex-col gap-2 justify-center items-center h-full p-5">
      <div className="xl:hidden flex flex-row gap-10 text-xs items-center">
            <Link href="/">
              <button className="hover:scale-105 hover:cursor-pointer text-white transition-all duration-200">
                Sign in
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-transparent border border-white text-white px-7 rounded-full hover:scale-105 hover:cursor-pointer transition-all duration-200 h-8">
                Log in
              </button>
            </Link>
          </div>
        
        <h2 className="text-white text-7xl --Strike">Hi, join us</h2>
        <p className="text-sm">Welcome to Anime Astral!</p>

        {/* Mesaje de eroare și succes */}
        {error && (
          <div className="w-1/2 bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="w-1/2 bg-green-500/20 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-[80%] mx-auto xl:w-1/2">
          <input
            type="email"
            name="email"
            aria-label="Email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-transparent border border-[#2A2A2A]/30 p-4 rounded-full text-white"
            required
          />
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="bg-transparent border border-[#2A2A2A]/30 p-4 rounded-full text-white"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            aria-label="Confirm Password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="bg-transparent border border-[#2A2A2A]/30 p-4 rounded-full text-white"
            required
          />

          <p className="text-right text-sm --Special hover:underline duration-200 hover:cursor-pointer">
            Forgot password?
          </p>

          <div className="w-full flex items-center">
            <div className="flex-1 h-[2px] bg-[#595959]/30"></div>
            <p className="px-2">or</p>
            <div className="flex-1 h-[2px] bg-[#595959]/30"></div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            type="button"
            className="bg-transparent border border-[#2A2A2A]/30 p-4 rounded-full flex flex-row gap-2 items-center justify-center text-sm hover:scale-105 hover:cursor-pointer duration-200"
          >
            Login with Google
            <Image src="/Google.png" alt="Google logo" width={20} height={20} />
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#BC281C] px-5 py-3 rounded-full hover:scale-105 hover:cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Se înregistrează..." : "Join us!"}
          </button>
        </form>
      </div>
    </div>
  );
}
