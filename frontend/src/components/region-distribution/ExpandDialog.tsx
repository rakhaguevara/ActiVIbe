import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

interface ExpandDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function ExpandDialog({
  isOpen,
  onClose,
  title,
  children,
}: ExpandDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-0 rounded-xl shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-800">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-0 bg-[#f8fafc]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
