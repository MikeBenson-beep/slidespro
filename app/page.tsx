// Generated presentation component
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import slides from "@/slides.json"
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import MermaidDiagram from '@/components/MermaidDiagram'

export default function PythonPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          className="border-black text-black hover:bg-black hover:text-white bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          className="border-black text-black hover:bg-black hover:text-white bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-4 left-4 z-10 text-sm font-mono">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center h-screen overflow-hidden p-8">
        <div className="w-full max-w-5xl h-full flex items-center justify-center py-12">
          {slide.type === "title" && (
            <div className="text-center space-y-6 w-full">
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-28 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-xl md:text-2xl font-light tracking-wider text-gray-700">{slide.subtitle}</h2>
              </div>
              {typeof slide.content === 'string' && (
                <p className="text-base md:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed font-light">{slide.content}</p>
              )}
            </div>
          )}

          {slide.type === "feature" && (
            <div className="space-y-6 w-full">
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-20 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-lg md:text-xl font-light tracking-wider text-gray-600">{slide.subtitle}</h2>
              </div>

              <div className={`max-w-4xl mx-auto ${(slide as any).highlight ? "bg-gray-50 p-6 border-l-4 border-black" : ""}`}>
                <div className="grid gap-2.5">
                  {Array.isArray(slide.content) &&
                    slide.content.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="text-base md:text-lg font-mono text-gray-400 min-w-[2rem]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <span className="text-sm md:text-base leading-relaxed font-light">{item}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {slide.type === "code" && (
            <div className="space-y-4 w-full">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-20 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-base md:text-lg font-light tracking-wider text-gray-600">{slide.subtitle}</h2>
              </div>

              <div className="max-w-5xl mx-auto">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs md:text-sm leading-relaxed font-mono">
                    {(slide as any).code}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {slide.type === "math" && (
            <div className="space-y-4 w-full">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-20 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-base md:text-lg font-light tracking-wider text-gray-600">{slide.subtitle}</h2>
              </div>

              {typeof slide.content === 'string' && (
                <p className="text-sm md:text-base text-center text-gray-600 font-light">{slide.content}</p>
              )}

              <div className="max-w-4xl mx-auto space-y-3">
                {(slide as any).math && Array.isArray((slide as any).math) &&
                  (slide as any).math.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 border-l-4 border-black">
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        {item.label}
                      </div>
                      <div className="flex justify-center text-base md:text-lg">
                        <BlockMath math={item.formula} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {slide.type === "mermaid" && (
            <div className="space-y-4 w-full">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-20 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-base md:text-lg font-light tracking-wider text-gray-600">{slide.subtitle}</h2>
              </div>

              <div className="max-w-4xl mx-auto flex items-center justify-center">
                <MermaidDiagram chart={(slide as any).diagram} />
              </div>
            </div>
          )}

          {slide.type === "closing" && (
            <div className="text-center space-y-6 w-full">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">{slide.title}</h1>
                <div className="w-20 h-0.5 bg-black mx-auto"></div>
                <h2 className="text-lg md:text-xl font-light tracking-wider text-gray-600">{slide.subtitle}</h2>
              </div>

              <div className="max-w-4xl mx-auto bg-black text-white p-6 md:p-8">
                <div className="grid gap-3">
                  {Array.isArray(slide.content) &&
                    slide.content.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 md:gap-4">
                        <div className="text-lg md:text-xl font-mono text-gray-400 min-w-[2rem] md:min-w-[2.5rem]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <span className="text-base md:text-lg leading-relaxed font-light">{item}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
