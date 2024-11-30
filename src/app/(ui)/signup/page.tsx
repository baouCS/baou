"use client";

import React, { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { signupFormData } from "@/app/lib/definitions";

interface FormErrors {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<signupFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error as user types
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let isValid = true;
    const newErrors: FormErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Check for empty fields
    Object.keys(formData).forEach((key) => {
      const field = key as keyof signupFormData;
      if (formData[field].trim() === "") {
        isValid = false;
        newErrors[field] = `${field.charAt(0).toUpperCase()}${field.slice(
          1
        )} is required.`;
      }
    });

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      isValid = false;
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        setIsLoading(true);
        setServerError("");

        // Call the signup API
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Signup failed.");
        }

        const data = await response.json();
        console.log("Signup successful:", data);

        // Swal success notification
        await Swal.fire({
          title: "Signup Successful!",
          text: "You are now registered. Redirecting to your dashboard...",
          icon: "success",
          confirmButtonText: "Go to Dashboard",
          timer: 3000,
          timerProgressBar: true,
        });

        // Redirect to the dashboard
        window.location.href = "/dashboard"; // Replace with your app's dashboard route
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Swal error notification
        await Swal.fire({
          title: "Signup Failed",
          text: error.message || "An error occurred during signup.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
        setServerError(error.message || "An error occurred during signup.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-4 border-blue-200 animate-border-rgb">
        <Link href="/">
          <button className="text-gray-600 pb-2 font-semibold">Back</button>
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">
          REGISTER
        </h1>
        {serverError && (
          <p className="text-sm text-red-500 text-center mb-4">{serverError}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {(["username", "email", "password", "confirmPassword"] as const).map(
            (field) => (
              <div key={field} className="relative">
                <label
                  htmlFor={field}
                  className="block text-gray-700 font-semibold mb-1"
                >
                  {field === "confirmPassword"
                    ? "Confirm Password"
                    : field[0].toUpperCase() + field.slice(1)}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  id={field}
                  type={
                    field === "password" || field === "confirmPassword"
                      ? "password"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={
                    field === "confirmPassword"
                      ? "Confirm password"
                      : field[0].toUpperCase() + field.slice(1)
                  }
                  className={`w-full text-gray-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors[field]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors[field] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            )
          )}
          <button
            type="submit"
            className={`w-full p-3 text-white rounded ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Signup;
