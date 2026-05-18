import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function sendEmail(data: { name: string; email: string; message: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>",
        to: [process.env.CONTACT_EMAIL || "admin@panupongwebstore.com"],
        subject: `New Contact Form Message from ${escapeHtml(data.name)}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
        `,
        reply_to: data.email,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to send email via Resend");
    }

    return { success: true, provider: "resend" };
  }

  console.log("[Contact Form - Mock Email]", {
    name: data.name,
    email: data.email,
    message: data.message,
    timestamp: new Date().toISOString(),
  });

  return { success: true, provider: "mock" };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    const { name, email, message } = validationResult.data;

    const emailResult = await sendEmail({ name, email, message });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        provider: emailResult.provider,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Contact Form API Error]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
