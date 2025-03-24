'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface TrashItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  description?: string;
  createdAt: string;
  deletedAt: string;
  groupId?: string;
  groupName?: string;
  isUrl: boolean;
}

export default function TrashPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    try {
      const response = await fetch('/api/trash');
      if (response.ok) {
        const data = await response.json();
        setTrashItems(data);
      } else {
        toast.error('Failed to fetch trash items');
      }
    } catch (error) {
      toast.error('Error fetching trash items');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch('/api/trash/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setTrashItems(prev => prev.filter(item => item.id !== id));
        toast.success('Item restored successfully');
      } else {
        toast.error('Failed to restore item');
      }
    } catch (error) {
      toast.error('Error restoring item');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await fetch('/api/trash', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setTrashItems(prev => prev.filter(item => item.id !== id));
        toast.success('Item permanently deleted');
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      toast.error('Error deleting item');
    }
  };

  // Filter trash items based on search term
  const filteredItems = trashItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.url && item.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="flex bg-[#202124] min-h-screen text-[#FFCC00]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#202124] h-16 flex items-center justify-between px-4 md:px-6 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#FFCC00] md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
          onClick={() => setIsSidebarOpen(false)}
        />

        <div className="pl-2 pr-2 mt-4 relative z-10">
          <Button 
            className="w-full mb-4 bg-[#2f2f30]"
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
            className="w-full bg-[#FFCC00] text-black"
            onClick={() => router.push('/trash')}
          >
            Trash
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-16">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Trash</h1>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search in trash..."
            className="w-full p-2 mb-4 bg-[#303134] text-white rounded border border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Trash Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item) => (
              <Card key={item.id} className="p-4 bg-[#303134] border-gray-700">
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                {item.groupName && (
                  <div className="text-sm text-gray-400 mb-2">Group: {item.groupName}</div>
                )}
                <p className="mb-2">{item.content}</p>
                {item.url && (
                  <div className="mb-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {item.url}
                    </a>
                  </div>
                )}
                {item.description && (
                  <p className="text-sm text-gray-300 mb-4">{item.description}</p>
                )}
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={() => handleRestore(item.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Restore
                  </Button>
                  <Button
                    onClick={() => handlePermanentDelete(item.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Forever
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {currentItems.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400">No items in trash</p>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-[#FFCC00] text-black" : "bg-[#2f2f30]"}
                  >
                    {page}
                  </Button>
                ))}

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
      </div>
    </div>
  );
} 