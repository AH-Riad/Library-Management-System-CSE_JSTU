import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.log("GET BOOK ERROR:", error);

    return NextResponse.json({ success: false, books: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // 📦 Use FormData for file upload
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const category = formData.get("category") as string;
    const availableCopies = formData.get("availableCopies");
    const image = formData.get("image") as File | null;

    // ❌ VALIDATION
    if (!title?.trim() || !author?.trim() || !category?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, author, and category are required",
        },
        { status: 400 },
      );
    }

    let imageUrl = "";

    // 📸 CLOUDINARY UPLOAD
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "library-books" },
            (err: any, result: any) => {
              if (err) return reject(err);
              resolve(result);
            },
          )
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // 🔢 SAFE NUMBER
    const copies = Number(availableCopies);

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      availableCopies: Number.isFinite(copies) && copies > 0 ? copies : 1,

      image: imageUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Book added successfully",
      book,
    });
  } catch (error: any) {
    console.log("BOOK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error while creating book",
      },
      { status: 500 },
    );
  }
}
