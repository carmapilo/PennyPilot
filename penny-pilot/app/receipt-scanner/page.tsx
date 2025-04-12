"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReceiptScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false)
      // In a real app, this would process the receipt and extract data
      alert("Receipt scanned successfully! In a real app, this would extract and save the receipt data.")
    }, 2000)
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Receipt Scanner</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Receipt</CardTitle>
            <CardDescription>
              Take a photo or upload an image of your receipt to automatically extract purchase information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                {preview ? (
                  <div className="relative w-full">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Receipt preview"
                      className="max-h-[300px] mx-auto object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Drag and drop a receipt image or click to upload
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="receipt-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="receipt-upload">
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" onClick={handleScan} disabled={!file || isScanning}>
                  {isScanning ? "Scanning..." : "Scan Receipt"}
                </Button>
                <Button variant="outline" className="flex gap-2">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scanning Tips</CardTitle>
            <CardDescription>Follow these tips for the best scanning results</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Make sure the receipt is on a flat surface with good lighting</li>
              <li>Ensure all text is clearly visible and not crumpled</li>
              <li>Avoid shadows and glare on the receipt</li>
              <li>Include the entire receipt in the frame</li>
              <li>For best results, use the app in good lighting conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
