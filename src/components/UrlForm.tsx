"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Menu, X, Archive, Trash, Copy, Share2, LayoutList, LayoutGrid, Plus } from "lucide-react"

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<{
    id: string;
    url: string;
    title: string;
    description: string;
    pinned: string | null;
    groupId: string | null;
    groupName: string | null;
  }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [searchGroup, setSearchGroup] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const itemsPerPage = 50;
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isSingleColumn, setIsSingleColumn] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      const res = await fetch("/api/get-urls");
      const data = await res.json();
      setUrls(data);
    };

    const fetchGroups = async () => {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
      setFilteredGroups(data);
    };

    fetchUrls();
    fetchGroups();
  }, []);

  // Filter groups based on search
  useEffect(() => {
    if (searchGroup) {
      setFilteredGroups(groups.filter(group =>
        group.name.toLowerCase().includes(searchGroup.toLowerCase())
      ));
    } else {
      setFilteredGroups(groups);
    }
  }, [searchGroup, groups]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage("");

    if (!title || !url) {
      toast.error("Title and URL are required!");
      return;
    }

    // Client-side duplicate check
    const existingUrl = urls.some((note) => note.url === url);
    if (existingUrl) {
      toast.error("URL already exists in the database!");
      return;
    }

    try {
      const response = await fetch("/api/save-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title, description, groupName }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("URL saved successfully!");

        // Add the new URL to the state
        setUrls((prev) => [...prev, {
          id: result.id,
          url,
          title,
          description,
          pinned: null,
          groupId: result.groupId,
          groupName: groupName || null
        }]);

        // If a new group was created, add it to the groups state
        if (groupName && !groups.some(g => g.name === groupName)) {
          setGroups(prev => [...prev, { id: result.groupId, name: groupName }]);
        }

        // Clear form fields after successful submission
        setUrl("");
        setTitle("");
        setDescription("");
        setGroupName("");
        setDialogOpen(false);
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to save URL");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/notes/move-to-trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: 'url' }),
      });

      if (response.ok) {
        setUrls((prev) => prev.filter((note) => note.id !== id));
        toast.success("URL moved to trash successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error moving URL to trash");
      }
    } catch (error) {
      toast.error("Failed to move URL to trash");
    }
  };

  const handlePin = async (id: string) => {
    try {
      const response = await fetch("/api/notes/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUrls = urls.map((note) =>
          note.id === id ? { ...note, pinned: result.pinned ? new Date().toISOString() : null } : note
        );
        setUrls(updatedUrls);
        toast.success(result.message);
      } else {
        toast.error("Error pinning note");
      }
    } catch (error) {
      toast.error("Failed to pin note");
    }
  };

  const handleAssignGroup = async (id: string, newGroupName: string) => {
    try {
      const response = await fetch("/api/assign-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlId: id, groupName: newGroupName }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update the URL in state with the new group
        const updatedUrls = urls.map((note) =>
          note.id === id ? { ...note, groupId: result.groupId, groupName: newGroupName } : note
        );
        setUrls(updatedUrls);
        toast.success("Group assigned successfully");
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to assign group");
    }
  };

  // Filter URLs based on search and selected group
  const filteredUrls = urls.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.url.toLowerCase().includes(search.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(search.toLowerCase()));

    const matchesGroup = selectedGroup ? note.groupId === selectedGroup : true;

    return matchesSearch && matchesGroup;
  });

  // Sort URLs: pinned first, then by creation date
  const sortedUrls = [...filteredUrls].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUrls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUrls.length / itemsPerPage);

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/notes/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'url' }),
      });

      if (response.ok) {
        setUrls(prev => prev.filter(note => note.id !== id));
        toast.success("URL archived successfully");
      } else {
        toast.error("Failed to archive URL");
      }
    } catch (error) {
      toast.error("Failed to archive URL");
    }
  };

  const handleCopy = async (note: any) => {
    const textToCopy = `${note.title}\n\n${note.description}\n${note.url}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async (note: any) => {
    const textToShare = `${note.title}\n\n${note.description}\n${note.url}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        toast.success("URL copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share URL");
    }
  };

  const handleCardClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNotes(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const handleBulkArchive = async () => {
    try {
      const selectedIds = Array.from(selectedNotes);
      const response = await fetch('/api/notes/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: selectedIds,
          type: 'url',
          isBulk: true 
        }),
      });

      if (response.ok) {
        // Remove archived URLs from the state
        setUrls(prev => prev.filter(note => !selectedNotes.has(note.id)));
        // Clear the selection
        setSelectedNotes(new Set());
        toast.success(`Successfully archived ${selectedIds.length} URLs`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to archive selected URLs");
      }
    } catch (error) {
      toast.error("Failed to archive selected URLs");
    }
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <Input
          type="text"
          placeholder="Search Notes (by title or URL)"
          className="border p-2 mb-4 md:mb-0 md:w-1/3 bg-[#303134] text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex space-x-2">
          <select
            className="border p-2 rounded bg-[#303134] text-white"
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setSelectedGroup(null)}
            variant="outline"
            className="bg-[#FFCC00] text-black hover:bg-[#E6B800]"
          >
            Reset
          </Button>

          <Button
            onClick={() => setIsSingleColumn(!isSingleColumn)}
            variant="outline"
            className="bg-[#2f2f30] text-[#FFCC00] hover:bg-[#404144]"
            size="icon"
          >
            {isSingleColumn ? <LayoutGrid size={20} /> : <LayoutList size={20} />}
          </Button>
        </div>
      </div>

      {/* Dialog for adding new URL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-[#FFCC00] text-black hover:bg-[#E6B800] md:w-auto w-12 h-12 p-0 fixed bottom-6 right-6 z-50 md:static">
            <span className="md:inline hidden">Add New URL</span>
            <Plus className="md:hidden inline" size={24} />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#303134] text-white md:max-w-2xl md:h-auto h-[100dvh] w-[100dvw] max-w-none rounded-none md:rounded-lg p-0 md:p-6">
          <DialogHeader className="flex flex-row justify-between items-center p-4 border-b border-gray-700">
            <DialogTitle>Add New URL</DialogTitle>
            <div className="flex items-center">
              <Input
                className="w-48 mr-2 bg-[#202124]"
                placeholder="Search groups..."
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
              />
            </div>
          </DialogHeader>
          <div className="p-4 h-full overflow-y-auto">
            <Input
              className="mb-4 bg-[#202124]"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              className="mb-4 bg-[#202124]"
              type="url"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Textarea
              className="mb-4 bg-[#202124]"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mb-4">
              <Input
                className="mb-2 bg-[#202124]"
                placeholder="Group (e.g., Tampa FL)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                list="groups-list"
              />
              <datalist id="groups-list">
                {filteredGroups.map((group) => (
                  <option key={group.id} value={group.name} />
                ))}
              </datalist>
            </div>
            <Button
              onClick={() => handleSubmit()}
              className="bg-[#FFCC00] text-black hover:bg-[#E6B800] w-full"
            >
              Save URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Saved URLs:</h2>
        {selectedNotes.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-400 hover:bg-[#404144]"
              onClick={handleBulkArchive}
            >
              <Archive size={16} className="mr-1" />
              Archive Selected ({selectedNotes.size})
            </Button>
          </div>
        )}
      </div>

      <div className={`grid gap-4 ${
        isSingleColumn 
          ? 'grid-cols-1' 
          : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
      }`}>
        {currentItems.map((note) => (
          <Card 
            key={note.id} 
            className={`p-4 bg-[#303134] border-gray-700 shadow-md cursor-pointer transition-all ${
              selectedNotes.has(note.id) ? 'ring-2 ring-[#FFCC00]' : ''
            }`}
            onClick={(e) => handleCardClick(note.id, e)}
          >
            <h3 className="font-semibold text-lg text-[#FFCC00] truncate">{note.title}</h3>
            {note.groupName && (
              <div className="text-sm text-gray-400 mb-2 truncate">Group: {note.groupName}</div>
            )}
            <p className="text-gray-300 mb-2 line-clamp-2">{note.description}</p>
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline block mb-2 truncate"
            >
              {note.url}
            </a>
            
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex flex-wrap justify-end gap-2 mt-4">
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
        {selectedNotes.size > 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#FFCC00] bg-[#303134]"
              onClick={() => {
                const selectedNote = currentItems.find(n => selectedNotes.has(n.id));
                if (selectedNote) handleCopy(selectedNote);
              }}
            >
              <Copy size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#FFCC00] bg-[#303134]"
              onClick={() => {
                const selectedNote = currentItems.find(n => selectedNotes.has(n.id));
                if (selectedNote) handleShare(selectedNote);
              }}
            >
              <Share2 size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#FFCC00] bg-[#303134]"
              onClick={handleBulkArchive}
            >
              <Archive size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#FFCC00] bg-[#303134]"
              onClick={() => {
                Array.from(selectedNotes).forEach(id => handleDelete(id));
              }}
            >
              <Trash size={20} />
            </Button>
          </>
        )}
      </div>

      {/* Empty state */}
      {currentItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">No URLs found. Add your first URL!</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#FFCC00] text-black hover:bg-[#E6B800]"
          >
            Add URL
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-[#2f2f30]"
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-[#FFCC00] text-black" : "bg-[#2f2f30]"}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-[#2f2f30]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



