export interface FeaturedItemRecord {
  id: string;
  title: string;
  imageKey: string;
}

// Temporary mock seed data until MongoDB is wired in.
export const FEATURED_ITEM_CATALOG: FeaturedItemRecord[] = [
  { id: "1", title: "Wooden Chair", imageKey: "ChairPlaceholder.jpg" },
  { id: "2", title: "Wall Mirror", imageKey: "MirrorPlaceholder.jpg" },
  { id: "3", title: "Dinner Plates Set", imageKey: "PlatesPlaceholder.jpg" },
  { id: "4", title: "Bookshelf", imageKey: "ShelfPlaceholder.webp" },
  { id: "5", title: "Study Table", imageKey: "TablePlaceholder.webp" },
  { id: "6", title: "Textbook Bundle", imageKey: "TextbookPlaceholder.jpg" },
  { id: "7", title: "Desk Lamp", imageKey: "ChairPlaceholder.jpg" },
];
