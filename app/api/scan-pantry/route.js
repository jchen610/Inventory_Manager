import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(request) {
  try {
    const body = await request.json();
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Descibe this image",
            },
            {
              type: "image_url",
              image_url: {
                url: body["image"],
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    
    return NextResponse.json(
        {
          items: response.choices[0],
        },
        { status: 201 }
      );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse image. Please try again." },
      { status: 500 }
    );
  }
}
