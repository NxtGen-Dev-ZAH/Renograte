"use client";

import { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export default function SignatureCanvas({
  onSave,
  width = 400,
  height = 200,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set canvas width and height
      canvas.width = width;
      canvas.height = height;
      
      // Create signature pad
      const pad = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });
      
      setSignaturePad(pad);
      
      // Check if signature is empty
      pad.addEventListener("endStroke", () => {
        setIsEmpty(pad.isEmpty());
      });
      
      // Cleanup
      return () => {
        pad.off();
      };
    }
  }, [width, height]);

  const handleClear = () => {
    if (signaturePad) {
      signaturePad.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const signatureData = signaturePad.toDataURL("image/png");
      onSave(signatureData);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border border-gray-300 rounded-md">
        <canvas
          ref={canvasRef}
          className="touch-none"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
      <p className="text-sm text-gray-500">Sign above using mouse or touch</p>
      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isEmpty}
          onClick={handleSave}
        >
          <Check className="mr-2 h-4 w-4" />
          Save Signature
        </Button>
      </div>
    </div>
  );
} 