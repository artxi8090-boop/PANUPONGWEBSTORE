import { NextResponse } from "next/server";

const projects = [
  {
    id: "1",
    title: "Panupong Shopping",
    slug: "panupong-shopping",
    category: "Web Development",
    description: "E-commerce platform with modern UI, product catalog, and seamless checkout experience",
    url: "https://panupongshopping.vercel.app/",
    techStack: ["Next.js", "Tailwind CSS", "Stripe"],
  },
];

export async function GET() {
  const realProjects = projects.filter((p) => p.url && p.url.startsWith("http"));

  return NextResponse.json({
    total: projects.length,
    realProjects: realProjects.length,
    projects: realProjects,
  });
}
