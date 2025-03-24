'use client'

import { Input } from "@/components/ui/input"
import { useState, ChangeEvent, FC, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"
import { Card, } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Menu, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UrlForm from "@/components/UrlForm";
import { useRouter } from 'next/navigation';

interface Note {
  title: string;
  content: string;
  group?: string;
  url?: string;
  description?: string;
}

const HomePage: FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<Note>({ title: '', content: '', group: '', url: '', description: '' });
  const [groups, setGroups] = useState<string[]>([]);
  const [searchGroup, setSearchGroup] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const notesPerPage = 50;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Load saved groups
  useEffect(() => {
    // Extract unique groups from notes
    const uniqueGroups = Array.from(new Set(notes.map(note => note.group).filter(Boolean) as string[]));
    setGroups(uniqueGroups);
    setFilteredGroups(uniqueGroups);
  }, [notes]);

  // Filter groups based on search
  useEffect(() => {
    if (searchGroup) {
      setFilteredGroups(groups.filter(group =>
        group.toLowerCase().includes(searchGroup.toLowerCase())
      ));
    } else {
      setFilteredGroups(groups);
    }
  }, [searchGroup, groups]);

  const addNote = () => {
    if (newNote.title && newNote.content) {
      setNotes([...notes, newNote]);

      // Add new group if it doesn't exist
      if (newNote.group && !groups.includes(newNote.group)) {
        setGroups([...groups, newNote.group]);
      }

      setNewNote({ title: '', content: '', group: '', url: '', description: '' });
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote({ ...newNote, title: e.target.value });
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote({ ...newNote, content: e.target.value });
  };

  const handleGroupChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote({ ...newNote, group: e.target.value });
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote({ ...newNote, url: e.target.value });
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote({ ...newNote, description: e.target.value });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.group && note.group.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.url && note.url.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
        <div className="flex items-center space-x-4">

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
            className="w-full mb-4 bg-[#FFCC00] text-black"
            onClick={() => router.push('/')}
          >
            Notes
          </Button>
          <Button 
            className="w-full mb-4 bg-[#2f2f30]"
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
      <div className="flex-1 p-4 md:p-6 mt-16 ">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome to Your Notes</h1>

          <div className="mt-6">
            <UrlForm />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentNotes.map((note, index) => (
            <Card key={index} className="p-4 bg-[#303134] border-gray-700">
              <h2 className="text-lg font-semibold mb-2">{note.title}</h2>
              {note.group && (
                <div className="text-sm text-gray-400 mb-2">Group: {note.group}</div>
              )}
              <p className="mb-2">{note.content}</p>
              {note.url && (
                <div className="mb-2">
                  <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {note.url}
                  </a>
                </div>
              )}
              {note.description && (
                <p className="text-sm text-gray-300">{note.description}</p>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-[#2f2f30]"
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <Button
                  key={number}
                  onClick={() => paginate(number)}
                  className={currentPage === number ? "bg-[#FFCC00] text-black" : "bg-[#2f2f30]"}
                >
                  {number}
                </Button>
              ))}

              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-[#2f2f30]"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
