export type DataSource = {
  type: "text" | "file" | "image";
  value: string | File | null;
};

export type DocsDataResult = {
  id: string;
  type: string;
  name: string;
  content: string;
};
