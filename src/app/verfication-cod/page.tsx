"use client";

import Link from "next/link";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const carouselImages = [
  { src: "/Rectangle 46 (1).svg", alt: "Image auth 1" },
  { src: "/Rectangle 46 (2).svg", alt: "Image auth 2" },
  { src: "/Rectangle 46 (3).svg", alt: "Image auth 3" },
];

export default function VerificationCode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [values, setValues] = useState(["", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 10500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
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

  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const val = input.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    if (val && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && values[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="w-full h-screen flex flex-row">
      <div className="flex-1 max-w-1/2 flex flex-col justify-between h-full relative">
        <div className="flex flex-row justify-between mt-14 mx-10 text-white z-10">
          <div className="flex flex-row gap-1 items-center">
            <Image src="/logo.png" alt="Logo of Anime Astral" priority width={40} height={40} />
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
          <CircleArrowLeft
            onClick={goToPrev}
            color="white"
            className="hover:scale-105 hover:cursor-pointer"
            size={30}
          />
          <CircleArrowRight
            onClick={goToNext}
            color="white"
            className="hover:scale-105 hover:cursor-pointer"
            size={30}
          />
        </div>
      </div>
      <div className="text-white flex-1 max-w-1/2 flex flex-col gap-2 justify-center items-center h-full p-5">
        <h2 className="text-white text-7xl --Strike">Verification</h2>
        <p className="text-sm text-center">Please enter the 5-digit code sent to your email</p>
        
        <form className="flex flex-col gap-4 w-1/2">
          <div className="flex flex-row gap-3 justify-center">
            {values.map((val, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="number"
                min="0"
                max="9"
                value={val}
                onInput={(e) => handleInput(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-15 h-15 rounded text-center appearance-none border-2 outline-none text-white text-xl font-bold
                  ${val !== "" ? "bg-[#BC281C30] border-[#BC281C]" : "bg-transparent border-gray-200/30"}
                  focus:bg-[#BC281C30] focus:border-[#BC281C] transition-all duration-200`}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={1}
              />
            ))}
          </div>
          
          <button
            type="button"
            className="bg-[#BC281C] px-5 py-3 rounded-full hover:scale-105 hover:cursor-pointer duration-200"
          >
            Verify
          </button>
          
          <button
            type="button"
            className="bg-transparent border border-[#2A2A2A]/30 px-5 py-3 rounded-full hover:scale-105 hover:cursor-pointer duration-200 text-sm"
          >
            Resend Code
          </button>
        </form>
      </div>
    </div>
  );
}