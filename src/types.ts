export interface ContentItem {
    title: string;
    link: string;
    date: Date | string;
    description: string;
    image: string | null;
    type: "texto" | "vídeo" | "legislação";
    display?: string;
    iso?: string;
    dateObj?: Date;
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