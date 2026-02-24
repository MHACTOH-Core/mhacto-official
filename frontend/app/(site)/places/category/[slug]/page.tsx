import type { Metadata } from "next"
import { getAllCategories, categoryData, getCategoryPlaces, type CategoryType } from "@/lib/data/category-data"
import CategoryPageClient from "./category-page-client"

export function generateStaticParams() {
  return getAllCategories().map((category) => ({
    slug: category,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = categoryData[slug as CategoryType]

  if (!category) {
    return { title: "Category Not Found" }
  }

  return {
    title: `${category.title} | MHACTO Bocaue`,
    description: category.description,
    openGraph: {
      title: `${category.title} | MHACTO Bocaue`,
      description: category.description,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = slug as CategoryType
  const categoryInfo = categoryData[category]
  const places = getCategoryPlaces(category)

  if (!categoryInfo) {
    return <div className="text-center py-20">Category not found</div>
  }

  return <CategoryPageClient category={category} categoryInfo={categoryInfo} places={places} heroImage={categoryInfo.heroImage} />
}