"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { login } from "./api/auth/data";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await login(formData.email, formData.password);

    if (!response.error) {
      Swal.fire({
        title: "Login Success!",
        text: "You have successfully logged in.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/home");
      });
    } else {
      Swal.fire({
        title: "Login Failed",
        text: response.message || "Invalid email or password.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const response = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();

  //     if (response.ok && !data.error) {
  //       const Toast = Swal.mixin({
  //         toast: true,
  //         position: "top-end",
  //         showConfirmButton: false,
  //         timer: 900,
  //         timerProgressBar: true,
  //         didOpen: (toast) => {
  //           toast.onmouseenter = Swal.stopTimer;
  //           toast.onmouseleave = Swal.resumeTimer;
  //         },
  //       });
  //       Toast.fire({
  //         icon: "success",
  //         title: "Signed in successfully",
  //       }).then(() => {
  //         router.push("/home");
  //       });
  //     } else {
  //       Swal.fire({
  //         title: "Login Failed",
  //         text: data.message || "Invalid email or password.",
  //         icon: "error",
  //         confirmButtonText: "Try Again",
  //       });
  //     }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Login Failed",
  //       text: "An unexpected error occurred.",
  //       icon: "error",
  //       confirmButtonText: "Try Again",
  //     });
  //   }
  // };

  const inputFields = [
    { name: "email", type: "email", label: "Email" },
    { name: "password", type: "password", label: "Password" },
  ];

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-4 border-blue-200 animate-border-rgb">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 text-center">
          Login
        </h1>

        <form onSubmit={handleLogin}>
          {inputFields.map((field) => (
            <fieldset key={field.name} className="mb-4">
              <legend className="sr-only">{field.label}</legend>
              <label
                htmlFor={field.name}
                className="block text-gray-700 font-semibold mb-2"
              >
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                className="w-full text-gray-500 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData[field.name as keyof typeof formData]}
                onChange={handleInputChange}
                required
              />
            </fieldset>
          ))}

          <div className="mb-4 text-center">
            <button
              type="submit"
              className="w-full bg-[#92B5F4] text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-300"
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
