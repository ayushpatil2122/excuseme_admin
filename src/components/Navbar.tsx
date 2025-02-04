import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-center h-16">
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
            <div className="text-xl font-bold">
              Hotel Jagadamb
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}
