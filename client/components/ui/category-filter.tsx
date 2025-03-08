"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Cpu, Leaf, PaintbrushIcon as PaintBrush, Heart, LayoutGrid } from "lucide-react"

export type Category = "All" | "Education" | "Community" | "Technology" | "Environment" | "Arts & Culture" | "Wellness"

interface CategoryFilterProps {
  selectedCategory: Category
  onCategoryChange: (category: Category) => void
}

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "All", label: "All", icon: <LayoutGrid className="h-4 w-4 mr-2" /> },
  { id: "Education", label: "Education", icon: <BookOpen className="h-4 w-4 mr-2" /> },
  { id: "Community", label: "Community", icon: <Users className="h-4 w-4 mr-2" /> },
  { id: "Technology", label: "Technology", icon: <Cpu className="h-4 w-4 mr-2" /> },
  { id: "Environment", label: "Environment", icon: <Leaf className="h-4 w-4 mr-2" /> },
  { id: "Arts & Culture", label: "Arts & Culture", icon: <PaintBrush className="h-4 w-4 mr-2" /> },
  { id: "Wellness", label: "Wellness", icon: <Heart className="h-4 w-4 mr-2" /> },
]

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={`flex items-center ${
            selectedCategory === category.id
              ? "bg-gradient-to-r from-[#267871] to-[#136a8a] text-white border-transparent"
              : "bg-[#1A1A25] text-gray-300 border-[#2A2A35] hover:bg-[#2A2A35]"
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.icon}
          {category.label}
        </Button>
      ))}
    </div>
  )
}

export default CategoryFilter