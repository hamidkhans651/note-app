'use client'

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import UrlForm from "@/components/UrlForm";
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex bg-[#202124] min-h-screen text-[#FFCC00]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#202124] h-16 flex items-center justify-between px-4 md:px-6 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#FFCC00] md:hidden"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          <div className="hidden md:block">
            <Logo />
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`
        fixed md:relative
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-[#202124] pr-3 pt-16 min-h-screen left-0 z-40
        transition-transform duration-300 ease-in-out
      `}>
        {/* Mobile backdrop */}
        <div
          className={`fixed inset-0 bg-[#202124]/50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
          onClick={toggleSidebar}
        />

        <div className="pl-2 pr-2 mt-4 relative z-10">
          <Button 
            className="w-full mb-4 bg-[#2f2f30]"
            onClick={() => router.push('/')}
          >
            Notes
          </Button>
          <Button 
            className="w-full mb-4 bg-[#FFCC00] text-black"
            onClick={() => router.push('/import')}
          >
            Import Links
          </Button>
          <Button 
            className="w-full mb-4 bg-[#2f2f30]"
            onClick={() => router.push('/labels')}
          >
            Edit Labels
          </Button>
          <Button 
            className="w-full mb-4 bg-[#2f2f30]"
            onClick={() => router.push('/archive')}
          >
            Archive
          </Button>
          <Button 
            className="w-full bg-[#2f2f30]"
            onClick={() => router.push('/trash')}
          >
            Trash
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-16">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Import Links</h1>
          <div className="mt-6">
            <UrlForm />
          </div>
        </div>
      </div>
    </div>
  );
} 