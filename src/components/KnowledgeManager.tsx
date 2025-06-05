'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, RefreshCw, Check, AlertCircle } from 'lucide-react'

type FileItem = {
  name: string
}

export function KnowledgeManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch the list of uploaded files
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/knowledge', {
        method: 'OPTIONS',
      })
      
      if (!response.ok) throw new Error('Failed to fetch files')
      
      const data = await response.json()
      if (data.success && data.files) {
        setFiles(data.files.map((name: string) => ({ name })))
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setMessage({
        text: 'Failed to load uploaded files',
        type: 'error'
      })
    }
  }

  // Load files on component mount
  useEffect(() => {
    fetchFiles()
  }, [])

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMessage({
          text: `File "${file.name}" uploaded successfully`,
          type: 'success'
        })
        fetchFiles() // Refresh the file list
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to upload file',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Initialize knowledge base
  const initializeKnowledgeBase = async () => {
    setIsInitializing(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/knowledge')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMessage({
          text: 'Knowledge base initialized successfully',
          type: 'success'
        })
        fetchFiles() // Refresh the file list
      } else {
        throw new Error(data.error || 'Initialization failed')
      }
    } catch (error) {
      console.error('Error initializing knowledge base:', error)
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to initialize knowledge base',
        type: 'error'
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5" />
        Knowledge Base Manager
      </h2>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload PDF Document
          </label>
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="sr-only"
              id="file-upload"
              disabled={isLoading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                isLoading
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              } w-full`}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Uploading...' : 'Select PDF File'}
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload PDF documents to enhance the chatbot's knowledge
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initialize Knowledge Base
          </label>
          <button
            onClick={initializeKnowledgeBase}
            disabled={isInitializing}
            className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              isInitializing
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } w-full`}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
            {isInitializing ? 'Initializing...' : 'Initialize'}
          </button>
          <p className="mt-1 text-xs text-gray-500">
            Load website content and existing PDFs
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
        {files.length > 0 ? (
          <ul className="border rounded-md divide-y">
            {files.map((file, index) => (
              <li key={index} className="px-4 py-2 flex items-center">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">{file.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
        )}
      </div>
    </div>
  )
} 