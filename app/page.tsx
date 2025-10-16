// Generated presentation component
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import slides from "@/slides.json"
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import MermaidDiagram from '@/components/MermaidDiagram'
import Image from 'next/image'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'

export default function PythonPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isBlindGeneratingPDF, setIsBlindGeneratingPDF] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
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
      
      // Save the PDF
      pdf.save('presentation.pdf')
      
      // Restore the original slide
      setCurrentSlide(originalSlide)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generatePDFBlind = async () => {
    if (!slideRef.current) return
    
    setIsBlindGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 675]
      })
      
      const originalSlide = currentSlide
      
      // Create a hidden container for all slides
      const hiddenContainer = document.createElement('div')
      hiddenContainer.style.position = 'absolute'
      hiddenContainer.style.left = '-9999px'
      hiddenContainer.style.top = '0'
      hiddenContainer.style.width = slideRef.current.offsetWidth + 'px'
      hiddenContainer.style.height = slideRef.current.offsetHeight + 'px'
      hiddenContainer.style.overflow = 'hidden'
      hiddenContainer.style.backgroundColor = '#ffffff' // Match original background
      document.body.appendChild(hiddenContainer)
      
      // Clone all slides into the hidden container
      const slideElements = []
      for (let i = 0; i < slides.length; i++) {
        setCurrentSlide(i)
        await new Promise(resolve => requestAnimationFrame(resolve))
        
        const clone = slideRef.current.cloneNode(true) as HTMLElement
        clone.style.position = 'absolute'
        clone.style.top = '0'
        clone.style.left = '0'
        clone.style.width = slideRef.current.offsetWidth + 'px'
        clone.style.height = slideRef.current.offsetHeight + 'px'
        clone.style.transform = 'none' // Ensure no transforms affect the dimensions
        hiddenContainer.appendChild(clone)
        slideElements.push(clone)
      }
      
      // Wait for all slides to render
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Capture each slide from the hidden container
      for (let i = 0; i < slideElements.length; i++) {
        const dataUrl = await toJpeg(slideElements[i], {
          cacheBust: true,
          pixelRatio: 2.0,
          quality: 1.0,
          width: slideRef.current.offsetWidth, // Use original dimensions
          height: slideRef.current.offsetHeight, // Use original dimensions
          style: {
            width: slideRef.current.offsetWidth + 'px',
            height: slideRef.current.offsetHeight + 'px'
          }
        })
        
        if (i > 0) {
          pdf.addPage([1200, 675], 'landscape')
        }
        
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1200, 675)
      }
      
      // Cleanup
      document.body.removeChild(hiddenContainer)
      setCurrentSlide(originalSlide)
      pdf.save('presentation-blind.pdf')
      
    } catch (error) {
      console.error('Error generating blind PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsBlindGeneratingPDF(false)
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
      {!isGeneratingPDF && !isBlindGeneratingPDF && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-10 flex gap-2">
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
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDFBlind}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white shadow-sm"
          >
            👁️‍🗨️
          </Button>
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
                  {slide.content.map((item, index) => (
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
                  {slide.content.map((item, index) => (
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
                  {slide.content.map((item, index) => (
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
            <h3 className="text-sm font-bold text-gray-900">Titolo del Corso: lingua e traduzione inglese</h3>
            <p className="text-xs text-gray-900">SSID: L-LIN/12 CFU: 9</p>
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
