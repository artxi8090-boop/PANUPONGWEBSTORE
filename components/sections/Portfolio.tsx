"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Portfolio3DCard from "@/components/Portfolio3DCard";

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  thumbnail: string;
  url?: string;
  techStack?: string[];
  color: string;
}

export default function Portfolio() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(t.portfolio.categories.all);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleProjects, setVisibleProjects] = useState(6);

  const projects: Project[] = useMemo(() => [
    {
      id: "1",
      title: "Panupong Shopping",
      slug: "panupong-shopping",
      category: t.portfolio.categories.web,
      description: "E-commerce platform with modern UI, product catalog, and seamless checkout experience",
      thumbnail: "/images/panupong-shopping-screenshot.png",
      url: "https://panupongshopping.vercel.app/",
      techStack: ["Next.js", "Tailwind CSS", "Stripe"],
      color: "#00f7ff",
    },
  ], [t]);

  const categories = [
    t.portfolio.categories.all,
    t.portfolio.categories.web,
    t.portfolio.categories.mobile,
    t.portfolio.categories.design,
    t.portfolio.categories.seo,
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === t.portfolio.categories.all || project.category === activeCategory;
      const matchesSearch = project.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, projects, t.portfolio.categories.all]);

  const loadMore = () => {
    setVisibleProjects((prev) => prev + 3);
  };

  return (
    <section className="py-24 bg-black/80 relative overflow-hidden" id="portfolio">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-neon-pink/10 text-neon-pink rounded-full border border-neon-pink/20 mb-4">
            Our Work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.portfolio.heading}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.portfolio.subtitle}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleProjects(6);
                }}
                className={`px-4 py-2 rounded-full transition-all text-sm ${
                  activeCategory === category
                    ? "bg-neon-cyan text-black font-semibold"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t.portfolio.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleProjects(6);
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan text-sm"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.length > 0 ? (
              filteredProjects.slice(0, visibleProjects).map((project, index) => (
                <Portfolio3DCard
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-gray-400 text-lg">{t.portfolio.noProjects}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Load More */}
        {visibleProjects < filteredProjects.length && (
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all hover:border-neon-cyan border border-transparent"
            >
              {t.portfolio.loadMore}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
