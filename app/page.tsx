"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import { SuppliersTestDialog } from "@/components/SuppliersTestDialog";
import { CircularLogo } from "@/components/CircularLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent | null, type?: "user" | "admin") => {
    if (e) e.preventDefault();

    if (type) {
      const quickLoginCredentials = {
        user: { email: "user@mail.com", password: "0912jipsdf" },
        admin: { email: "admin@mail.com", password: "34123jasdm" },
      };
      const { email, password } = quickLoginCredentials[type];
      localStorage.setItem(
        "user",
        JSON.stringify({ email, isAdmin: type === "admin" })
      );
      router.push("/dashboard");
      return;
    }

    if (
      (email === "user@mail.com" && password === "0912jipsdf") ||
      (email === "admin@mail.com" && password === "34123jasdm")
    ) {
      localStorage.setItem(
        "user",
        JSON.stringify({ email, isAdmin: email === "admin@mail.com" })
      );
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with login form - increased width */}
      <div className="w-full md:w-3/5 flex items-center justify-center bg-white p-6 relative">
        {/* Quick Login buttons moved to left side with reduced visibility */}
        <div className="absolute top-4 left-4 space-x-2">
          <Button
            variant="ghost"
            className="opacity-15 hover:opacity-60 transition-opacity text-gray-500 text-xs"
            onClick={() => handleLogin(null, "user")}
          >
            User Quick Login
          </Button>
          <Button
            variant="ghost"
            className="opacity-15 hover:opacity-60 transition-opacity text-gray-500 text-xs"
            onClick={() => handleLogin(null, "admin")}
          >
            Admin Quick Login
          </Button>
        </div>

        {/* Database Test Component moved to left bottom */}
        <div className="absolute bottom-4 left-4">
          <SuppliersTestDialog className="opacity-15 hover:opacity-60 transition-opacity" />
        </div>

        <Card className="w-[400px] shadow-xl relative z-10">
          <CardHeader className="space-y-3 pt-12">
            <div className="flex items-center justify-center mb-2 mt-4">
              <CircularLogo />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              CBAM Estimator
            </CardTitle>
            <CardDescription className="text-center text-black text-lg">
              <span className="font-sans font-light tracking-wide">
                The All-In-One
                <br />
                CBAM Software Solution
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={(e) => handleLogin(e)}>
              <div className="grid w-full items-center gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                  <div className="text-right">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-gray-500"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-row justify-between pb-8">
            <Button variant="outline" className="w-[48%] h-11 text-base">
              Sign Up
            </Button>
            <Button
              className="w-[48%] h-11 text-base"
              type="submit"
              onClick={(e) => handleLogin(e)}
            >
              Sign In
            </Button>
            {error && (
              <Alert
                variant="destructive"
                className="mt-4 absolute -bottom-20 left-0 right-0"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right side with image - with panning animation */}
      <div className="hidden md:block md:w-2/5 bg-white p-4">
        <div className="w-full h-full rounded-2xl bg-white relative overflow-hidden">
          {/* Image with panning and zoom animation */}
          <div
            className="absolute inset-0 w-[120%] h-full bg-cover bg-center animate-pan-zoom"
            style={{
              backgroundImage:
                "url('https://www.cbam-estimator.com/wp-content/uploads/2025/04/ian-taylor-jOqJbvo1P9g-unsplash-scaled.jpg')",
            }}
          >
            {/* Darkening overlay removed */}
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
      {/* Add this to the head section */}
      <style jsx global>{`
        @keyframes pan-zoom {
          0% {
            transform: translateX(0) scale(1);
          }
          25% {
            transform: translateX(-5%) scale(1.05);
          }
          50% {
            transform: translateX(-10%) scale(1.1);
          }
          75% {
            transform: translateX(-5%) scale(1.05);
          }
          100% {
            transform: translateX(0) scale(1);
          }
        }

        .animate-pan-zoom {
          animation: pan-zoom 45s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
