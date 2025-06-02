"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dynamically import react-pdf components with ssr: false
const PDFDocument = dynamic(() => import("react-pdf").then(mod => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-10">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p>Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

const PDFPage = dynamic(() => import("react-pdf").then(mod => mod.Page), {
  ssr: false,
});

// Import pdfjs for configuration
import { pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Reset state when URL changes
  useEffect(() => {
    if (url) {
      setLoadError(null);
      setIsLoading(true);
      setRetryCount(0);
    }
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setLoadError(error);
    setIsLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
        return newPageNumber;
      }
      return prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  function handleRetry() {
    setIsLoading(true);
    setLoadError(null);
    setRetryCount(count => count + 1);
    // Force re-render of Document component by using a cache-busting parameter
    const cacheBuster = `?retry=${Date.now()}`;
    const urlWithCacheBuster = url.includes('?') 
      ? `${url}&cb=${Date.now()}` 
      : `${url}?cb=${Date.now()}`;
      
    // Reload the page if we've tried more than 3 times
    if (retryCount >= 2) {
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[70vh] w-full">
        {loadError ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load document. The document may be unavailable or you may not have permission to view it.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Loading Document
            </Button>
          </div>
        ) : (
          <PDFDocument
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p>Loading document...</p>
                </div>
              </div>
            }
            error={null} // We handle errors manually above
            key={`pdf-${retryCount}`} // Force re-render on retry
          >
            {numPages && (
              <PDFPage
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </PDFDocument>
        )}
      </div>
      
      {!loadError && numPages && (
        <div className="flex items-center justify-between w-full mt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pageNumber} of {numPages || "-"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!numPages || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 