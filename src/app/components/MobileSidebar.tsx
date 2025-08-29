"use client";

import React from 'react';
import Sidebar from './Sidebar';

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-fit max-w-[80%] bg-transparent border-r border-[#595959]/30 p-2">
        <Sidebar />
      </div>
    </div>
  );
}


