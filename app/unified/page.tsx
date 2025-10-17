// Unified presentation component for all lessons
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, ArrowLeft, BookOpen } from "lucide-react"
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import MermaidDiagram from '@/components/MermaidDiagram'
import Image from 'next/image'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import { useRouter } from 'next/navigation'
import DownloadTracker from '@/lib/downloadTracker'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  slides: any[]
}

interface LessonsData {
  lessons: Lesson[]
}

interface UnifiedSlide {
  lessonId: string
  lessonTitle: string
  slideIndex: number
  slide: any
}

export default function UnifiedPresentation() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load lessons data
  const lessonsData: LessonsData = require('@/slides.json')
  
  // Create unified slides array
  const unifiedSlides: UnifiedSlide[] = []
  lessonsData.lessons.forEach(lesson => {
    lesson.slides.forEach((slide, slideIndex) => {
      unifiedSlides.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        slideIndex,
        slide
      })
    })
  })

  const currentUnifiedSlide = unifiedSlides[currentSlideIndex]
  const currentLesson = lessonsData.lessons.find(l => l.id === currentUnifiedSlide?.lessonId)

  // Check if any lesson has been downloaded
  useEffect(() => {
    const downloadRecords = DownloadTracker.getDownloadedLessons()
    const downloadedIds = new Set(downloadRecords.map(record => record.lessonId))
    setIsDownloaded(downloadedIds.size > 0)
  }, [])

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % unifiedSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + unifiedSlides.length) % unifiedSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index)
  }

  const generatePDF = async () => {
    if (!slideRef.current) return
    
    setIsGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 675]
      })
      
      const originalSlide = currentSlideIndex
      
      // Iterate through all unified slides
      for (let i = 0; i < unifiedSlides.length; i++) {
        // Set the current slide
        setCurrentSlideIndex(i)
        
        // Wait for rendering using requestAnimationFrame
        await new Promise(resolve => requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        }))
        
        // Small wait for heavy content
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Capture the slide as JPEG with maximum quality using html-to-image
        const dataUrl = await toJpeg(slideRef.current, {
          cacheBust: true,
          pixelRatio: 2.0, // Maximum pixel ratio for best quality
          quality: 1.0, // JPEG quality 100%
          width: slideRef.current.offsetWidth,
          height: slideRef.current.offsetHeight,
        })
        
        // Add a new page if not the first slide
        if (i > 0) {
          pdf.addPage([1200, 675], 'landscape')
        }
        
        // Add the image to the PDF
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1200, 675)
      }
      
      // Generate filename and save the PDF
      const fileName = `unified-programming-lessons.pdf`
      
      // Get PDF as base64 data
      const pdfData = pdf.output('datauristring')
      
      // Save to user's downloads (existing functionality)
      pdf.save(fileName)
      
      // Also save to server's downloads directory
      try {
        const response = await fetch('/api/save-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdfData,
            fileName,
            lessonId: 'unified',
            lessonTitle: 'Unified Programming Lessons'
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          console.log('File saved to server:', result.filePath)
          // Track the download with file size
          DownloadTracker.addDownload('unified', 'Unified Programming Lessons', fileName, result.fileSize)
        } else {
          console.error('Failed to save to server:', result.error)
          // Still track the download even if server save fails
          DownloadTracker.addDownload('unified', 'Unified Programming Lessons', fileName)
        }
      } catch (serverError) {
        console.error('Error saving to server:', serverError)
        // Still track the download even if server save fails
        DownloadTracker.addDownload('unified', 'Unified Programming Lessons', fileName)
      }
      
      // Update download status
      setIsDownloaded(true)
      
      // Restore the original slide
      setCurrentSlideIndex(originalSlide)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!currentUnifiedSlide || !currentLesson) {
    return (
      <div className="h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">No Lessons Found</h1>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  const slide = currentUnifiedSlide.slide

  return (
    <div ref={slideRef} className="h-screen bg-white text-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-8 pt-4 pb-2 flex justify-between items-center">
        <div className="flex items-center">
          <Image 
            src="/logos/ecampus_logo.png" 
            alt="eCampus Università" 
            width={200} 
            height={80}
            className="h-16 w-auto"
          />
        </div>
        <div className="flex items-center">
          <Image 
            src="/logos/generated_by_teachforge.png" 
            alt="Generated by TeachForge.Net" 
            width={240} 
            height={70}
            className="h-14 w-auto"
          />
        </div>
      </header>

      {/* Navigation */}
      {!isGeneratingPDF && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            className={`shadow-sm ${
              isDownloaded 
                ? 'border-green-300 text-green-700 hover:bg-green-50 bg-green-50' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
            }`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Lesson indicator */}
      {!isGeneratingPDF && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">{currentUnifiedSlide.lessonTitle}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {currentUnifiedSlide.slideIndex + 1} of {currentLesson?.slides.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-auto min-h-0">
        <div className="flex-1 px-16 py-6 flex items-center">
          <div className="w-full">
          {slide.type === "title" && (
            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">{slide.title}</h1>
              {typeof slide.content === 'string' && (
                <p className="text-2xl leading-relaxed text-gray-700 max-w-5xl">{slide.content}</p>
              )}
              {Array.isArray(slide.content) && (
                <ul className="space-y-4 text-xl">
                  {slide.content.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="text-gray-700">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {slide.type === "feature" && (
            <div className="space-y-6 max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">{slide.title}</h1>
              {(slide as any).description && (
                <p className="text-xl leading-relaxed text-gray-700">{(slide as any).description}</p>
              )}
              {typeof slide.content === 'string' && (
                <p className="text-xl leading-relaxed text-gray-700">{slide.content}</p>
              )}
              {Array.isArray(slide.content) && (
                <ul className="space-y-3 text-lg">
                  {slide.content.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="text-gray-700">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {slide.type === "code" && (
            <div className="space-y-5">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              <div className="w-full">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-hidden">
                  <code className="text-sm leading-relaxed font-mono">
                    {(slide as any).code}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {slide.type === "math" && (
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              {typeof slide.content === 'string' && (
                <p className="text-base text-gray-700">{slide.content}</p>
              )}
              <div className="space-y-3">
                {(slide as any).math && Array.isArray((slide as any).math) &&
                  (slide as any).math.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 border-l-4 border-[#1e3a5f]">
                      <div className="text-sm font-semibold text-gray-600 mb-1">
                        {item.label}
                      </div>
                      <div className="flex justify-start text-sm">
                        <BlockMath math={item.formula} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {slide.type === "mermaid" && (
            <div className="space-y-5 max-h-full overflow-hidden">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              <div className="w-full flex items-center justify-center max-h-[calc(100%-6rem)] overflow-hidden">
                <MermaidDiagram chart={(slide as any).diagram} />
              </div>
            </div>
          )}

          {slide.type === "closing" && (
            <div className="space-y-8">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">{slide.title}</h1>
              {typeof slide.content === 'string' && (
                <p className="text-2xl leading-relaxed text-gray-700 max-w-5xl">{slide.content}</p>
              )}
              {Array.isArray(slide.content) && (
                <ul className="space-y-4 text-xl">
                  {slide.content.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="text-gray-700">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          </div>
        </div>
        
        {/* Right side image/placeholder box - show on all slides */}
        <div className="w-[320px] flex-shrink-0 flex items-end">
          <div className="w-full h-[50%] bg-black"></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 relative bg-[#cbd5e1] px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image 
            src="/logos/ecampus_footer_logo.png" 
            alt="eCampus" 
            width={100} 
            height={100}
            className="h-20 w-20 -mt-10"
          />
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-900">{currentUnifiedSlide.lessonTitle}</h3>
            <p className="text-xs text-gray-900">{currentLesson?.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-900">
          <span className="text-sm font-semibold">14/05/2025</span>
          <span className="text-sm font-semibold">
            {currentSlideIndex + 1}/{unifiedSlides.length}
          </span>
        </div>
      </footer>
    </div>
  )
}
