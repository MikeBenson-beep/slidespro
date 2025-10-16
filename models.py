from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal
from enum import Enum


class SlideType(str, Enum):
    """Enum for all possible slide types"""
    TITLE = "title"
    FEATURE = "feature"
    CODE = "code"
    MATH = "math"
    MERMAID = "mermaid"
    CLOSING = "closing"


class CodeLanguage(str, Enum):
    """Enum for supported programming languages in code slides"""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    C = "c"
    CPP = "cpp"
    CSHARP = "csharp"
    RUBY = "ruby"
    GO = "go"
    RUST = "rust"
    PHP = "php"
    SWIFT = "swift"
    KOTLIN = "kotlin"
    SCALA = "scala"
    HASKELL = "haskell"
    LUA = "lua"
    PERL = "perl"
    R = "r"
    MATLAB = "matlab"
    BASH = "bash"
    POWERSHELL = "powershell"
    SQL = "sql"
    HTML = "html"
    CSS = "css"
    JSON = "json"
    YAML = "yaml"
    XML = "xml"
    MARKDOWN = "markdown"
    TEXT = "text"


class MermaidDiagramType(str, Enum):
    """Enum for supported Mermaid diagram types"""
    FLOWCHART = "flowchart"
    SEQUENCE = "sequence"
    CLASS = "classDiagram"
    STATE = "stateDiagram"
    ER = "erDiagram"
    USER_JOURNEY = "journey"
    GANTT = "gantt"
    PIE = "pie"
    GITGRAPH = "gitgraph"
    QUADRANT = "quadrantChart"
    REQUIREMENT = "requirement"
    TIMELINE = "timeline"


class MathItem(BaseModel):
    """Mathematical formula item"""
    label: str = Field(..., description="Label for the mathematical formula")
    formula: str = Field(..., description="LaTeX mathematical formula")


class BaseSlide(BaseModel):
    """Base slide model with common fields"""
    id: int = Field(..., description="Unique slide identifier")
    title: str = Field(..., description="Slide title")
    subtitle: Optional[str] = Field(None, description="Optional slide subtitle")
    type: SlideType = Field(..., description="Type of slide")


class TitleSlide(BaseSlide):
    """Title slide model"""
    type: Literal[SlideType.TITLE] = SlideType.TITLE
    content: Union[str, List[str]] = Field(..., description="Content as string or list of strings")


class FeatureSlide(BaseSlide):
    """Feature slide model"""
    type: Literal[SlideType.FEATURE] = SlideType.FEATURE
    description: Optional[str] = Field(None, description="Optional slide description")
    content: Union[str, List[str]] = Field(..., description="Content as string or list of strings")


class CodeSlide(BaseSlide):
    """Code slide model"""
    type: Literal[SlideType.CODE] = SlideType.CODE
    code: str = Field(..., description="Code content")
    language: Optional[CodeLanguage] = Field(None, description="Programming language")


class MathSlide(BaseSlide):
    """Math slide model"""
    type: Literal[SlideType.MATH] = SlideType.MATH
    content: Optional[str] = Field(None, description="Optional content description")
    math: List[MathItem] = Field(..., description="List of mathematical formulas")


class MermaidSlide(BaseSlide):
    """Mermaid diagram slide model"""
    type: Literal[SlideType.MERMAID] = SlideType.MERMAID
    diagram: str = Field(..., description="Mermaid diagram definition")
    diagram_type: Optional[MermaidDiagramType] = Field(None, description="Type of Mermaid diagram")


class ClosingSlide(BaseSlide):
    """Closing slide model"""
    type: Literal[SlideType.CLOSING] = SlideType.CLOSING
    content: Union[str, List[str]] = Field(..., description="Content as string or list of strings")


# Union type for all possible slide types
Slide = Union[
    TitleSlide,
    FeatureSlide,
    CodeSlide,
    MathSlide,
    MermaidSlide,
    ClosingSlide
]


class Lesson(BaseModel):
    """Lesson model"""
    id: str = Field(..., description="Unique lesson identifier")
    title: str = Field(..., description="Lesson title")
    description: str = Field(..., description="Lesson description")
    duration: str = Field(..., description="Lesson duration (e.g., '45 minutes')")
    slides: List[Slide] = Field(..., description="List of slides in the lesson")


class LessonsData(BaseModel):
    """Root model for the entire JSON structure"""
    lessons: List[Lesson] = Field(..., description="List of lessons")


# Example usage and validation functions
def validate_lessons_data(data: dict) -> LessonsData:
    """Validate and parse lessons data from dictionary"""
    return LessonsData(**data)


def validate_slide_data(slide_data: dict) -> Slide:
    """Validate and parse individual slide data from dictionary"""
    slide_type = slide_data.get("type")
    
    if slide_type == SlideType.TITLE:
        return TitleSlide(**slide_data)
    elif slide_type == SlideType.FEATURE:
        return FeatureSlide(**slide_data)
    elif slide_type == SlideType.CODE:
        return CodeSlide(**slide_data)
    elif slide_type == SlideType.MATH:
        return MathSlide(**slide_data)
    elif slide_type == SlideType.MERMAID:
        return MermaidSlide(**slide_data)
    elif slide_type == SlideType.CLOSING:
        return ClosingSlide(**slide_data)
    else:
        raise ValueError(f"Unknown slide type: {slide_type}")


# Additional utility models for enhanced functionality
class SlideMetadata(BaseModel):
    """Additional metadata for slides"""
    author: Optional[str] = Field(None, description="Slide author")
    created_date: Optional[str] = Field(None, description="Creation date")
    last_modified: Optional[str] = Field(None, description="Last modification date")
    tags: Optional[List[str]] = Field(None, description="Slide tags")
    difficulty: Optional[str] = Field(None, description="Difficulty level")


class LessonMetadata(BaseModel):
    """Additional metadata for lessons"""
    author: Optional[str] = Field(None, description="Lesson author")
    created_date: Optional[str] = Field(None, description="Creation date")
    last_modified: Optional[str] = Field(None, description="Last modification date")
    tags: Optional[List[str]] = Field(None, description="Lesson tags")
    difficulty: Optional[str] = Field(None, description="Difficulty level")
    prerequisites: Optional[List[str]] = Field(None, description="Required prerequisites")
    learning_objectives: Optional[List[str]] = Field(None, description="Learning objectives")
    estimated_time: Optional[int] = Field(None, description="Estimated time in minutes")


# Enhanced models with metadata
class EnhancedSlide(BaseModel):
    """Enhanced slide model with metadata"""
    slide: Slide = Field(..., description="The slide content")
    metadata: Optional[SlideMetadata] = Field(None, description="Slide metadata")


class EnhancedLesson(BaseModel):
    """Enhanced lesson model with metadata"""
    lesson: Lesson = Field(..., description="The lesson content")
    metadata: Optional[LessonMetadata] = Field(None, description="Lesson metadata")


class EnhancedLessonsData(BaseModel):
    """Enhanced root model with metadata"""
    lessons: List[EnhancedLesson] = Field(..., description="List of enhanced lessons")
    version: Optional[str] = Field("1.0", description="Data format version")
    created_by: Optional[str] = Field(None, description="Creator information")
    last_updated: Optional[str] = Field(None, description="Last update timestamp")
