import React from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface SignatureBoxProps {
  label: string;
  signatureData: string;
  dateValue: string;
  onSignatureChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

const SignatureBox: React.FC<SignatureBoxProps> = ({
  label,
  signatureData,
  dateValue,
  onSignatureChange,
  onDateChange,
}) => {
  const signatureRef = React.useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onSignatureChange('');
    }
  };

  const handleSave = () => {
    if (signatureRef.current) {
      const dataURL = signatureRef.current.toDataURL();
      onSignatureChange(dataURL);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Card className="border-2 border-dashed">
        <CardContent className="p-4">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-[150px] border rounded-md',
            }}
            onEnd={handleSave}
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-2">
        <Label>Date</Label>
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SignatureBox; 