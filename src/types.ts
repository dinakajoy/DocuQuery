export type DataSource = {
  type: "text" | "file" | "image";
  value: string | File | null;
};