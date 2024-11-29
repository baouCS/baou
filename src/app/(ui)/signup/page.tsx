"use client";

import React, { useState } from "react";
import Link from "next/link";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Signup Data:", formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
        <Link href="/">
          <button className="text-gray-600 pb-2 font-semibold">Back</button>
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">
          REGISTER
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["username", "email", "password", "confirmPassword"].map((field) => (
            <input
              key={field}
              type={
                field === "password" || field === "confirmPassword"
                  ? "password"
                  : "text"
              }
              name={field}
              value={formData[field as keyof typeof formData]}
              onChange={handleChange}
              placeholder={
                field === "confirmPassword"
                  ? "Confirm password"
                  : field[0].toUpperCase() + field.slice(1)
              }
              className="w-full p-3 border rounded bg-gray-50"
            />
          ))}
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
