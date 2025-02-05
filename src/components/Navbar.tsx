"use client"

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-[#FF6B2B]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              Hotel Jagdamba
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Contacts */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={16} />
              <span>+91 9172810750</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={16} />
              <span>midnightsolutions750@gmail.com</span>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col items-center gap-4 py-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={16} />
              <span>+91 9172810750</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={16} />
              <span>midnightsolutions750@gmail.com</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
