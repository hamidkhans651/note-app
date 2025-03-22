'use client'


import { Input } from "@/components/ui/input"
import { useState, ChangeEvent, FC } from 'react';
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"
import { Card, } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



interface Note {
  title: string;
  content: string;
}

const HomePage: FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<Note>({ title: '', content: '' });

  const addNote = () => {
    if (newNote.title && newNote.content) {
      setNotes([...notes, newNote]);
      setNewNote({ title: '', content: '' });
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNote({ ...newNote, title: e.target.value });
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote({ ...newNote, content: e.target.value });
  };

  return (
    <div className="flex bg-[#202124] min-h-screen text-[#FFCC00]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#202124] h-16 flex items-center justify-between px-6 z-10">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center space-x-4">
          <Input placeholder="Search" className="w-64" />
        </div>
      </nav>

      {/* Sidebar */}
      <div className="w-64 bg-[#202124] pr-3 pt-16 min-h-screen fixed left-0">
        <div className="pl-2 pr-2 mt-4">
          <Button className="w-full mb-4 bg-[#2f2f30]">Reminders</Button>
          <Button className="w-full mb-4 bg-[#2f2f30]">Edit Labels</Button>
          <Button className="w-full mb-4 bg-[#2f2f30]">Archive</Button>
          <Button className="w-full bg-[#2f2f30]">Trash</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-16 ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome to Your Notes</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">Add Note</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#303134] text-white">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Input
                  className="mb-4"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={handleTitleChange}
                />
                <Textarea
                  className="mb-4"
                  placeholder="Take a note..."
                  value={newNote.content}
                  onChange={handleContentChange}
                />
                <Button onClick={addNote}>Save Note</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, index) => (
            <Card key={index} className="p-4 bg-[#303134] border-gray-700">
              <h2 className="text-lg font-semibold mb-2">{note.title}</h2>
              <p>{note.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
