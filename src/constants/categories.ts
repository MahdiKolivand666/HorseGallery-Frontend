// Categories and their subcategories configuration
export const CATEGORIES = {
  women: {
    id: "women",
    title: "زنانه",
    slug: "women",
    heroImage: "/images/headerwallp/RTS.webp",
    subcategories: [
      { id: "necklace", name: "گردنبند", slug: "necklace" },
      { id: "bracelet", name: "دستبند", slug: "bracelet" },
      {
        id: "leather-gold-bracelet",
        name: "دستبند چرم و طلا",
        slug: "leather-gold-bracelet",
      },
      { id: "earring", name: "گوشواره", slug: "earring" },
      { id: "ring", name: "انگشتر", slug: "ring" },
      { id: "pendant", name: "آویز گردنبند", slug: "pendant" },
      { id: "piercing", name: "پیرسینگ", slug: "piercing" },
      { id: "anklet", name: "پابند", slug: "anklet" },
    ],
  },
  men: {
    id: "men",
    title: "مردانه",
    slug: "men",
    heroImage: "/images/headerwallp/RTS.webp",
    subcategories: [
      { id: "necklace", name: "گردنبند مردانه", slug: "necklace" },
      {
        id: "leather-gold-bracelet",
        name: "دستبند چرم و طلا",
        slug: "leather-gold-bracelet",
      },
      { id: "bracelet", name: "دستبند مردانه", slug: "bracelet" },
    ],
  },
  kids: {
    id: "kids",
    title: "کودکانه",
    slug: "kids",
    heroImage: "/images/headerwallp/RTS.webp",
    subcategories: [
      { id: "earring", name: "گوشواره", slug: "earring" },
      { id: "bracelet", name: "دستبند", slug: "bracelet" },
      { id: "pendant", name: "آویز گردنبند", slug: "pendant" },
      {
        id: "leather-gold-bracelet",
        name: "دستبند چرم و طلا",
        slug: "leather-gold-bracelet",
      },
    ],
  },
} as const;

export type CategoryId = keyof typeof CATEGORIES;

// Helper functions
export function getCategoryData(categorySlug: string) {
  return Object.values(CATEGORIES).find((cat) => cat.slug === categorySlug);
}

export function getSubcategoryData(
  categorySlug: string,
  subcategorySlug: string
) {
  const category = getCategoryData(categorySlug);
  if (!category) return null;

  return category.subcategories.find((sub) => sub.slug === subcategorySlug);
}

export function getAllCategoryPaths() {
  const paths: Array<{ category: string; subcategory?: string }> = [];

  Object.values(CATEGORIES).forEach((category) => {
    // Add main category path
    paths.push({ category: category.slug });

    // Add subcategory paths
    category.subcategories.forEach((sub) => {
      paths.push({ category: category.slug, subcategory: sub.slug });
    });
  });

  return paths;
}
