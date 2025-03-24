'use client'

import { Input } from "@/components/ui/input"
import { useState, ChangeEvent, FC, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"
import { Card, } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Menu, X, Archive, Trash, Copy, Share2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UrlForm from "@/components/UrlForm";
import { useRouter } from 'next/navigation';
import { toast } from "sonner"

interface Note {
  id: string;
  title: string;
  content: string;
  group?: string;
  url?: string;
  description?: string;
  isUrl?: boolean;
}

const HomePage: FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<Note>({ title: '', content: '', group: '', url: '', description: '', id: '', isUrl: false });
  const [groups, setGroups] = useState<string[]>([]);
  const [searchGroup, setSearchGroup] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const notesPerPage = 50;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
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

      setNewNote({ title: '', content: '', group: '', url: '', description: '', id: '', isUrl: false });
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

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/notes/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== id));
        toast.success("Note archived successfully");
      } else {
        toast.error("Failed to archive note");
      }
    } catch (error) {
      toast.error("Failed to archive note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/notes/move-to-trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'note' }),
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== id));
        toast.success("Note moved to trash");
      } else {
        toast.error("Failed to move note to trash");
      }
    } catch (error) {
      toast.error("Failed to move note to trash");
    }
  };

  const handleCopy = async (note: Note) => {
    const textToCopy = `${note.title}\n\n${note.content}\n${note.url ? `\n${note.url}` : ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Note copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy note");
    }
  };

  const handleShare = async (note: Note) => {
    const textToShare = `${note.title}\n\n${note.content}\n${note.url ? `\n${note.url}` : ''}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        toast.success("Note copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share note");
    }
  };

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
      <div className="flex-1 p-4 md:p-6 mt-16">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome to Your Notes</h1>

          <div className="mt-6">
            <UrlForm />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentNotes.map((note) => (
            <Card 
              key={note.id} 
              className={`p-4 bg-[#303134] border-gray-700 cursor-pointer transition-all ${
                selectedNote === note.id ? 'ring-2 ring-[#FFCC00]' : ''
              }`}
              onClick={() => setSelectedNote(note.id === selectedNote ? null : note.id)}
            >
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
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:bg-[#404144]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(note);
                  }}
                >
                  <Copy size={16} className="mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:bg-[#404144]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(note);
                  }}
                >
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:bg-[#404144]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(note.id);
                  }}
                >
                  <Archive size={16} className="mr-1" />
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-[#404144]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                >
                  <Trash size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Action Buttons */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
          {selectedNote && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FFCC00] bg-[#303134]"
                onClick={() => handleCopy(currentNotes.find(n => n.id === selectedNote)!)}
              >
                <Copy size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FFCC00] bg-[#303134]"
                onClick={() => handleShare(currentNotes.find(n => n.id === selectedNote)!)}
              >
                <Share2 size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FFCC00] bg-[#303134]"
                onClick={() => handleArchive(selectedNote)}
              >
                <Archive size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FFCC00] bg-[#303134]"
                onClick={() => handleDelete(selectedNote)}
              >
                <Trash size={20} />
              </Button>
            </>
          )}
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
