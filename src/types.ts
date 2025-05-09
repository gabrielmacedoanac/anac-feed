export interface ContentItem {
    title: string;
    link: string;
    date: Date | string;
    description: string;
    image: string | null;
    type: "notícia" | "vídeo" | "legislação";
    display?: string;
    iso?: string;
    dateObj?: Date;
    metadata?: {
        publishedDate: string;
        modifiedDate: string;
    };
}
  
  export interface DateInfo {
    display: string;
    iso: string;
    obj: Date;
  }
  
  export interface FeedData {
    items: ContentItem[];
    generated: string;
  }