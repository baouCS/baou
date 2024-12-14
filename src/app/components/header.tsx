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
      <FaHome size={24} />
      <div className="relative">
        <button
          onClick={toggleDropdown} // Toggle dropdown on click
        >
          <FaUser size={24} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute w-fit right-0 mt-2 bg-white text-black rounded-md shadow-lg z-10">
            <button
              onClick={handleLogout}
              className="block w-fit text-gray-600 text-left px-4 py-2 hover:bg-gray-200"
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
