import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, books });
  } catch (error) {
    console.log("GET BOOK ERROR:", error);
    return NextResponse.json({ success: false, books: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const availableCopies = Number(formData.get("availableCopies") || 1);
    const image = formData.get("image") as File | null;

    if (!title || !author || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    let imageUrl = "";

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      imageUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "library-books" },
          (err: any, result: any) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          },
        );

        stream.end(buffer);
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      availableCopies: isNaN(availableCopies) ? 1 : availableCopies,
      image: imageUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
