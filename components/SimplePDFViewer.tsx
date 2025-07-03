"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

interface SimplePDFViewerProps {
  url: string;
  fileName?: string;
  title?: string;
}

export function SimplePDFViewer({ url, fileName, title }: SimplePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Add PDF type parameter to URL if it doesn't already have one
  // This helps browsers recognize the content as PDF
  const enhancedUrl = url.includes('?') 
    ? `${url}&type=application/pdf` 
    : `${url}?type=application/pdf`;

  return (
    <div className="flex flex-col w-full">
      {isLoading && (
        <div className="w-full">
          <Skeleton className="w-full h-[500px] rounded-lg" />
        </div>
      )}

      {hasError ? (
        <div className="text-center p-6 bg-red-50 rounded-md border border-red-200 text-red-600">
          <p className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6" />
            <span>Unable to display the PDF document</span>
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" asChild>
              <a href={url} download={fileName || true}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={enhancedUrl}
            className={`w-full h-[600px] rounded-lg border ${isLoading ? 'hidden' : 'block'}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title || "PDF Document"}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" asChild>
              <a href={url} download={fileName || true}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 