import mongoose, { Schema, model, models, Model } from "mongoose";

export interface ISection {
  type: "text" | "highlight" | "list";
  content: string | string[];
}

export interface IPage {
  title: string;
  sections: ISection[];
}

export interface IBook {
  _id: string;
  name: string;
  description: string;
  author: string;
  duration: string;
  variant: string;
  tags: string[];
  pages: IPage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "highlight", "list"],
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const PageSchema = new Schema<IPage>(
  {
    title: {
      type: String,
      required: true,
    },
    sections: {
      type: [SectionSchema],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

const BookSchema = new Schema<IBook>(
  {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: [true, "Book name is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    author: {
      type: String,
      required: [true, "Author is required"],
    },

    duration: {
      type: String,
      required: true,
    },

    variant: {
      type: String,
      enum: ["thin", "medium", "thick"],
      default: "medium",
    },

    tags: {
      type: [String],
      default: [],
    },

    pages: {
      type: [PageSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

const Book: Model<IBook> =
  models.Book || model<IBook>("Book", BookSchema);

export default Book;