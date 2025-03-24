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
      const response = await fetch("/api/notes/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setUrls((prev) => prev.filter((note) => note.id !== id));
        toast.success("Note deleted successfully");
      } else {
        toast.error("Error deleting note");
      }
    } catch (error) {
      toast.error("Failed to delete note");
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
        </div>
      </div>

      {/* Dialog for adding new URL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-[#FFCC00] text-black hover:bg-[#E6B800]">Add New URL</Button>
        </DialogTrigger>
        <DialogContent className="bg-[#303134] text-white">
          <DialogHeader className="flex flex-row justify-between items-center">
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
          <div className="p-4">
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
              className="bg-[#FFCC00] text-black hover:bg-[#E6B800]"
            >
              Save URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <h2 className="mt-6 text-xl font-semibold">Saved URLs:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {currentItems.map((note) => (
          <Card key={note.id} className="p-4 bg-[#303134] border-gray-700 shadow-md">
            <h3 className="font-semibold text-lg text-[#FFCC00]">{note.title}</h3>
            {note.groupName && (
              <div className="text-sm text-gray-400 mb-2">Group: {note.groupName}</div>
            )}
            <p className="text-gray-300 mb-2">{note.description}</p>
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline block mb-2 truncate"
            >
              {note.url}
            </a>
            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePin(note.id)}
                  variant="ghost"
                  className="text-sm text-blue-400 hover:bg-[#404144]"
                >
                  {note.pinned ? "Pinned ★" : "Pin"}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-sm text-green-400 hover:bg-[#404144]"
                    >
                      Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#303134] text-white">
                    <DialogHeader>
                      <DialogTitle>Assign to Group</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <div className="mb-4">
                        <Input
                          className="mb-2 bg-[#202124]"
                          placeholder="Group Name"
                          value={searchGroup}
                          onChange={(e) => setSearchGroup(e.target.value)}
                          list="assign-groups-list"
                        />
                        <datalist id="assign-groups-list">
                          {filteredGroups.map((group) => (
                            <option key={group.id} value={group.name} />
                          ))}
                        </datalist>
                      </div>
                      <Button
                        onClick={() => {
                          if (searchGroup) {
                            handleAssignGroup(note.id, searchGroup);
                            setSearchGroup('');
                          }
                        }}
                        className="bg-[#FFCC00] text-black hover:bg-[#E6B800]"
                      >
                        Assign Group
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                onClick={() => handleDelete(note.id)}
                variant="ghost"
                className="text-sm text-red-400 hover:bg-[#404144]"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
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



