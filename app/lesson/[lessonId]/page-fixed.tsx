// Generated presentation component
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Download, ArrowLeft, Edit3, Save, X } from "lucide-react"
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

// Helper component for editable text
const EditableText = ({ 
  children, 
  field, 
  currentValue, 
  isEditMode, 
  editingField, 
  tempValue, 
  setTempValue, 
  startEditing, 
  saveEdit, 
  cancelEditing, 
  className = "",
  isTextarea = false,
  placeholder = ""
}: {
  children: React.ReactNode
  field: string
  currentValue: string
  isEditMode: boolean
  editingField: string | null
  tempValue: string
  setTempValue: (value: string) => void
  startEditing: (field: string, value: string) => void
  saveEdit: () => void
  cancelEditing: () => void
  className?: string
  isTextarea?: boolean
  placeholder?: string
}) => {
  const isEditing = editingField === field

  if (isEditing) {
    const InputComponent = isTextarea ? Textarea : Input
    return (
      <div className="flex gap-2 items-start">
        <InputComponent
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className={`${className} border-2 border-blue-500 ${isTextarea ? 'min-h-[100px]' : ''} flex-1`}
          placeholder={placeholder}
        />
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {children}
      {isEditMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startEditing(field, currentValue)}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default function LessonPresentation({ params }: { params: { lessonId: string } }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')
  const [slidesData, setSlidesData] = useState<any[]>([])
  const slideRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load lessons data
  const lessonsData: LessonsData = require('@/slides.json')
  const lesson = lessonsData.lessons.find(l => l.id === params.lessonId)

  // Initialize slides data
  useEffect(() => {
    if (lesson) {
      setSlidesData(lesson.slides)
      setIsDownloaded(DownloadTracker.isDownloaded(lesson.id))
    }
  }, [lesson])

  if (!lesson) {
    return (
      <div className="h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lesson Not Found</h1>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  const slides = slidesData.length > 0 ? slidesData : lesson.slides

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const cancelEditing = () => {
    setEditingField(null)
    setTempValue('')
  }

  const saveEdit = async () => {
    if (!editingField || !lesson) return

    try {
      const response = await fetch('/api/update-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          slideId: slides[currentSlide].id,
          field: editingField,
          value: tempValue
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        const updatedSlides = [...slidesData]
        const slideIndex = updatedSlides.findIndex(s => s.id === slides[currentSlide].id)
        
        if (slideIndex !== -1) {
          if (editingField.includes('.')) {
            // Handle nested fields
            const parts = editingField.split('.')
            let target = updatedSlides[slideIndex]
            
            for (let i = 0; i < parts.length - 1; i++) {
              const part = parts[i]
              if (isNaN(Number(part))) {
                target = target[part]
              } else {
                target = target[Number(part)]
              }
            }
            
            const lastPart = parts[parts.length - 1]
            if (isNaN(Number(lastPart))) {
              target[lastPart] = tempValue
            } else {
              target[Number(lastPart)] = tempValue
            }
          } else {
            updatedSlides[slideIndex][editingField] = tempValue
          }
          
          setSlidesData(updatedSlides)
        }
        
        setEditingField(null)
        setTempValue('')
      } else {
        alert('Failed to save changes. Please try again.')
      }
    } catch (error) {
      console.error('Error saving edit:', error)
      alert('Failed to save changes. Please try again.')
    }
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
      
      const originalSlide = currentSlide
      
      // Iterate through all slides
      for (let i = 0; i < slides.length; i++) {
        // Set the current slide
        setCurrentSlide(i)
        
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
      const fileName = `${lesson.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
      
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
            lessonId: lesson.id,
            lessonTitle: lesson.title
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          console.log('File saved to server:', result.filePath)
          // Track the download with file size
          DownloadTracker.addDownload(lesson.id, lesson.title, fileName, result.fileSize)
        } else {
          console.error('Failed to save to server:', result.error)
          // Still track the download even if server save fails
          DownloadTracker.addDownload(lesson.id, lesson.title, fileName)
        }
      } catch (serverError) {
        console.error('Error saving to server:', serverError)
        // Still track the download even if server save fails
        DownloadTracker.addDownload(lesson.id, lesson.title, fileName)
      }
      
      // Update download status
      setIsDownloaded(true)
      
      // Restore the original slide
      setCurrentSlide(originalSlide)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const slide = slides[currentSlide]

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
            onClick={() => setIsEditMode(!isEditMode)}
            className={`shadow-sm ${
              isEditMode 
                ? 'border-blue-300 text-blue-700 hover:bg-blue-50 bg-blue-50' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
            }`}
          >
            <Edit3 className="h-4 w-4" />
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-auto min-h-0">
        <div className="flex-1 px-16 py-6 flex items-center">
          <div className="w-full">
          {slide.type === "title" && (
            <div className="space-y-8">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-6xl md:text-7xl font-bold leading-tight"
              >
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              {typeof slide.content === 'string' && (
                <EditableText
                  field="content"
                  currentValue={slide.content}
                  isEditMode={isEditMode}
                  editingField={editingField}
                  tempValue={tempValue}
                  setTempValue={setTempValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  className="text-2xl leading-relaxed text-gray-700 max-w-5xl"
                  isTextarea={true}
                >
                  <p className="text-2xl leading-relaxed text-gray-700 max-w-5xl">{slide.content}</p>
                </EditableText>
              )}
              
              {Array.isArray(slide.content) && (
                <div className="space-y-4 text-xl">
                  {slide.content.map((item: string, index: number) => (
                    <EditableText
                      key={index}
                      field={`content.${index}`}
                      currentValue={item}
                      isEditMode={isEditMode}
                      editingField={editingField}
                      tempValue={tempValue}
                      setTempValue={setTempValue}
                      startEditing={startEditing}
                      saveEdit={saveEdit}
                      cancelEditing={cancelEditing}
                      className="text-xl"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    </EditableText>
                  ))}
                </div>
              )}
            </div>
          )}

          {slide.type === "feature" && (
            <div className="space-y-6 max-w-2xl">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              {(slide as any).description && (
                <EditableText
                  field="description"
                  currentValue={(slide as any).description}
                  isEditMode={isEditMode}
                  editingField={editingField}
                  tempValue={tempValue}
                  setTempValue={setTempValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  className="text-xl leading-relaxed text-gray-700"
                  isTextarea={true}
                >
                  <p className="text-xl leading-relaxed text-gray-700">{(slide as any).description}</p>
                </EditableText>
              )}
              
              {typeof slide.content === 'string' && (
                <EditableText
                  field="content"
                  currentValue={slide.content}
                  isEditMode={isEditMode}
                  editingField={editingField}
                  tempValue={tempValue}
                  setTempValue={setTempValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  className="text-xl leading-relaxed text-gray-700"
                  isTextarea={true}
                >
                  <p className="text-xl leading-relaxed text-gray-700">{slide.content}</p>
                </EditableText>
              )}
              
              {Array.isArray(slide.content) && (
                <div className="space-y-3 text-lg">
                  {slide.content.map((item: string, index: number) => (
                    <EditableText
                      key={index}
                      field={`content.${index}`}
                      currentValue={item}
                      isEditMode={isEditMode}
                      editingField={editingField}
                      tempValue={tempValue}
                      setTempValue={setTempValue}
                      startEditing={startEditing}
                      saveEdit={saveEdit}
                      cancelEditing={cancelEditing}
                      className="text-lg"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    </EditableText>
                  ))}
                </div>
              )}
            </div>
          )}

          {slide.type === "code" && (
            <div className="space-y-5">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-4xl md:text-5xl font-bold leading-tight"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              <div className="w-full relative group">
                {editingField === 'code' ? (
                  <div className="flex gap-2 items-start">
                    <Textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-gray-900 text-gray-100 p-6 rounded-lg border-2 border-blue-500 font-mono text-sm min-h-[200px] flex-1"
                      placeholder="Enter your code here..."
                    />
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-hidden">
                      <code className="text-sm leading-relaxed font-mono">
                        {(slide as any).code}
                      </code>
                    </pre>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('code', (slide as any).code)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {slide.type === "math" && (
            <div className="space-y-4">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-4xl md:text-5xl font-bold leading-tight"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              {typeof slide.content === 'string' && (
                <EditableText
                  field="content"
                  currentValue={slide.content}
                  isEditMode={isEditMode}
                  editingField={editingField}
                  tempValue={tempValue}
                  setTempValue={setTempValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  className="text-base text-gray-700"
                >
                  <p className="text-base text-gray-700">{slide.content}</p>
                </EditableText>
              )}
              
              <div className="space-y-3">
                {(slide as any).math && Array.isArray((slide as any).math) &&
                  (slide as any).math.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 border-l-4 border-[#1e3a5f] space-y-2">
                      <EditableText
                        field={`math.${index}.label`}
                        currentValue={item.label}
                        isEditMode={isEditMode}
                        editingField={editingField}
                        tempValue={tempValue}
                        setTempValue={setTempValue}
                        startEditing={startEditing}
                        saveEdit={saveEdit}
                        cancelEditing={cancelEditing}
                        className="text-sm font-semibold text-gray-600"
                      >
                        <div className="text-sm font-semibold text-gray-600 mb-1">{item.label}</div>
                      </EditableText>
                      
                      <div className="relative group">
                        {editingField === `math.${index}.formula` ? (
                          <div className="flex gap-2 items-start">
                            <Input
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="text-sm border-2 border-blue-500 flex-1"
                              placeholder="Enter LaTeX formula"
                            />
                            <div className="flex flex-col gap-2">
                              <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditing}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-start text-sm">
                              <BlockMath math={item.formula} />
                            </div>
                            {isEditMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(`math.${index}.formula`, item.formula)}
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {slide.type === "mermaid" && (
            <div className="space-y-5 max-h-full overflow-hidden">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-4xl md:text-5xl font-bold leading-tight"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              <div className="w-full flex items-center justify-center max-h-[calc(100%-6rem)] overflow-hidden relative group">
                {editingField === 'diagram' ? (
                  <div className="flex gap-2 items-start w-full">
                    <Textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-gray-900 text-gray-100 p-6 rounded-lg border-2 border-blue-500 font-mono text-sm min-h-[200px] flex-1"
                      placeholder="Enter Mermaid diagram code"
                    />
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <MermaidDiagram chart={(slide as any).diagram} />
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing('diagram', (slide as any).diagram)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {slide.type === "closing" && (
            <div className="space-y-8">
              <EditableText
                field="title"
                currentValue={slide.title}
                isEditMode={isEditMode}
                editingField={editingField}
                tempValue={tempValue}
                setTempValue={setTempValue}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                className="text-6xl md:text-7xl font-bold leading-tight"
              >
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">{slide.title}</h1>
              </EditableText>
              
              {typeof slide.content === 'string' && (
                <EditableText
                  field="content"
                  currentValue={slide.content}
                  isEditMode={isEditMode}
                  editingField={editingField}
                  tempValue={tempValue}
                  setTempValue={setTempValue}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  className="text-2xl leading-relaxed text-gray-700 max-w-5xl"
                  isTextarea={true}
                >
                  <p className="text-2xl leading-relaxed text-gray-700 max-w-5xl">{slide.content}</p>
                </EditableText>
              )}
              
              {Array.isArray(slide.content) && (
                <div className="space-y-4 text-xl">
                  {slide.content.map((item: string, index: number) => (
                    <EditableText
                      key={index}
                      field={`content.${index}`}
                      currentValue={item}
                      isEditMode={isEditMode}
                      editingField={editingField}
                      tempValue={tempValue}
                      setTempValue={setTempValue}
                      startEditing={startEditing}
                      saveEdit={saveEdit}
                      cancelEditing={cancelEditing}
                      className="text-xl"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    </EditableText>
                  ))}
                </div>
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
            <h3 className="text-sm font-bold text-gray-900">{lesson.title}</h3>
            <p className="text-xs text-gray-900">{lesson.duration}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-900">
          <span className="text-sm font-semibold">14/05/2025</span>
          <span className="text-sm font-semibold">{currentSlide + 1}/{slides.length}</span>
        </div>
      </footer>
    </div>
  )
}
