"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SignatureCanvas from "./SignaturePad";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  title?: string;
  description?: string;
}

export default function SignatureDialog({
  isOpen,
  onClose,
  onSave,
  title = "Sign Document",
  description = "Please sign below to complete the document",
}: SignatureDialogProps) {
  const handleSaveSignature = (signatureData: string) => {
    onSave(signatureData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <SignatureCanvas onSave={handleSaveSignature} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 