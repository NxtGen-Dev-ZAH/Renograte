"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import react-pdf components with ssr: false
const PDFDocument = dynamic(() => import("react-pdf").then(mod => mod.Document), {
  ssr: false,
});

const PDFPage = dynamic(() => import("react-pdf").then(mod => mod.Page), {
  ssr: false,
});

// Import pdfjs for configuration
import { pdfjs } from "react-pdf";

// Configure PDF.js worker - moved to useEffect to ensure it runs only in browser
// This fixes the "WorkerMessageHandler" error

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

export function PDFViewer({ url, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workerInitialized, setWorkerInitialized] = useState<boolean>(false);

  // Memoize the options object to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/',
  }), []);

  // Initialize PDF.js worker in useEffect to ensure it runs only in browser context
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined' && !workerInitialized) {
      try {
        const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        
        // Set the worker source
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        
        // Create a script tag to preload the worker
        const script = document.createElement('script');
        script.src = workerUrl;
        script.async = true;
        script.onload = () => {
          console.log('PDF.js worker script loaded successfully');
          setWorkerInitialized(true);
        };
        script.onerror = (e) => {
          console.error('Error loading PDF.js worker script:', e);
          setError('Failed to initialize PDF viewer. Falling back to download option.');
        };
        
        document.head.appendChild(script);
        
        return () => {
          // Clean up the script tag if component unmounts before loading completes
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        console.error('Error initializing PDF worker:', err);
        setError('Failed to initialize PDF viewer');
      }
    }
  }, [workerInitialized]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return newPage >= 1 && newPage <= numPages ? newPage : prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // If there's an error, show fallback UI with download and open in new tab options
  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-md border border-red-200 text-red-600">
        <p>{error}</p>
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant="outline" 
            className="mt-4"
            asChild
          >
            <a href={url} download={fileName || true}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
          <Button 
            variant="outline" 
            className="mt-4"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // If we're still initializing the worker, show loading state
  if (!workerInitialized && typeof window !== 'undefined') {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  return (
    <div className="flex flex-col items-center">
      {loading && (
        <div className="w-full">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </div>
      )}

      {workerInitialized && (
        <div className="w-full">
          <PDFDocument
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="w-full h-[400px] flex items-center justify-center">Loading PDF...</div>}
            options={pdfOptions}
          >
            {!loading && (
              <PDFPage 
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="mx-auto"
                width={typeof window !== 'undefined' ? (window.innerWidth > 768 ? 600 : window.innerWidth - 40) : 600}
              />
            )}
          </PDFDocument>
        </div>
      )}

      {numPages > 0 && (
        <div className="flex items-center justify-between w-full mt-4">
          <Button
            variant="outline"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
          
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {!loading && (
        <Button
          variant="outline"
          className="mt-4"
          asChild
        >
          <a href={url} download={fileName || true}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </Button>
      )}
    </div>
  );
} 