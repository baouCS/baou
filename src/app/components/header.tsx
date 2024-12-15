"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { logoutUser } from "../api/auth/data";
import { FaHome, FaUser } from "react-icons/fa";

const Header: React.FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false); // State for dropdown
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <header className="flex justify-between w-full items-center p-4 bg-blue-500 text-white">
      <div className="font-bold text-gray-100">
        <h1 className=" ">
          {" "}
          <span>BOU |</span> BAYUYAN ONLINE UPDATE
        </h1>
      </div>

      <div className="relative">
        <div className="flex gap-4 flex-row">
          <button
            onClick={toggleDropdown} // Toggle dropdown on click
          >
            <FaUser size={24} />
          </button>
          <FaHome size={30} />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute w-fit right-0 mt-2 bg-white text-black rounded-md shadow-lg z-10 hover:scale-105">
            <button
              onClick={handleLogout}
              className="block w-fit text-gray-600 text-left px-4 py-2 hover:text-red-500 "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
