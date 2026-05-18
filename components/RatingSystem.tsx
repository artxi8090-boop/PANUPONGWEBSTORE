"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface RatingData {
  ratings: number[];
  userRating: number | null;
}

const STORAGE_KEY = "website_ratings";

function loadRatings(): RatingData {
  if (typeof window === "undefined") return { ratings: [], userRating: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ratings: [], userRating: null };
}

function saveRatings(data: RatingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface RatingSystemProps {
  stats: {
    satisfaction: { value: string; label: string };
    ratingLabel: string;
    yourRating: string;
    averageRating: string;
    totalRatings: string;
    thankYou: string;
  };
}

export default function RatingSystem({ stats }: RatingSystemProps) {
  const [ratingData, setRatingData] = useState<RatingData>({ ratings: [], userRating: null });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRatingData(loadRatings());
    setMounted(true);
  }, []);

  const averageRating = ratingData.ratings.length > 0
    ? ratingData.ratings.reduce((sum, r) => sum + r, 0) / ratingData.ratings.length
    : 0;

  const satisfactionPercent = Math.round((averageRating / 5) * 100);

  const handleRate = (rating: number) => {
    if (ratingData.userRating) return;

    const newRatings = [...ratingData.ratings, rating];
    const newData: RatingData = { ratings: newRatings, userRating: rating };
    setRatingData(newData);
    saveRatings(newData);

    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  if (!mounted) return null;

  return (
    <div className="mt-8 p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">{stats.ratingLabel}</h3>

      {/* Satisfaction Display */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            {satisfactionPercent}%
          </div>
          <div className="text-sm text-gray-400 mt-1">{stats.satisfaction.label}</div>
        </div>

        <div className="flex-1">
          <div className="w-full bg-gray-800 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${satisfactionPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-3 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0%</span>
            <span>{ratingData.ratings.length} {stats.totalRatings}</span>
            <span>100%</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">{stats.averageRating}</div>
        </div>
      </div>

      {/* Rating Input */}
      {!ratingData.userRating ? (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-3">{stats.yourRating}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= hoveredStar
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= ratingData.userRating!
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400">
            {stats.yourRating}: {ratingData.userRating}/5
          </p>
        </div>
      )}

      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center text-neon-cyan text-sm"
          >
            {stats.thankYou}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
