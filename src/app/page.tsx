"use client";

import React, { useState } from "react";
import Link from "next/link";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login Data:", formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          LOGIN
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full p-3 border rounded bg-gray-50"
          />
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 border rounded bg-gray-50"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup">
            <button className="text-blue-500 hover:underline">
              Register Now
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
