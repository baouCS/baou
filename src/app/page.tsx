"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 900,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Signed in successfully",
        }).then(() => {
          router.push("/home");
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: data.message || "Invalid email or password.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-4 border-blue-200 animate-border-rgb">
        <h2 className="text-lg text-gray-700 font-semibold text-center mb-8">
          Login Now
        </h2>

        <form onSubmit={handleLogin}>
          <fieldset className="mb-4">
            <legend className="sr-only">Login Credentials</legend>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full text-gray-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </fieldset>

          <fieldset className="mb-6">
            <legend className="sr-only">Password</legend>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full text-gray-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </fieldset>

          <div className="mb-4 text-center">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </div>
        </form>

        <div className="text-center">
          <span className="text-gray-700">No Account? Register </span>
          <Link href="/signup">
            <button className="text-blue-500 hover:underline">Here</button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
