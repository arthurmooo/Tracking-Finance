"use client"

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
}

export function FileUploadZone({ onFileSelect, className }: FileUploadZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
            'text/plain': ['.csv', '.txt']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors backdrop-blur-sm",
                isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/50",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className={cn(
                    "p-4 rounded-full bg-secondary transition-transform duration-200",
                    isDragActive ? "scale-110" : ""
                )}>
                    {isDragActive ? <UploadCloud className="w-8 h-8 text-primary animate-bounce" /> : <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        CSV files mainly (Max 5MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
