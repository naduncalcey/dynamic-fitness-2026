"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Review {
  name: string;
  photo: string;
  rating: number;
  text: string;
  time: string;
}

const reviews: Review[] = [
  {
    name: "Imasha Sashini",
    photo: "https://lh3.googleusercontent.com/a/ACg8ocK17GUmhJvH_pMQyFD7WGe2Fx9pFYHEBW1wc6iChYhCBJ-HKA=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    text: "Dynamic Fitness is a great place to workout. The trainers are experienced, supportive, and really focus on proper technique and motivation. The training sessions are well-structured and effective. Plus, the membership charges are very reasonable for the quality of service provided.",
    time: "7 months ago",
  },
  {
    name: "Rajitha Abeysinghe",
    photo: "https://lh3.googleusercontent.com/a/ACg8ocJnaZaZeLRAlsK0HeGvQfkWxof5PmLxQiBpGupJzCQ0DyvQUw=s128-c0x00000000-cc-rp-mo",
    rating: 5,
    text: "Best gym around Nawinna. Modern equipments, clean facility + friendly and knowledgeable trainers. Highly recommended if you are looking for a gym around Nawinna area.",
    time: "a year ago",
  },
  {
    name: "Sasindu Mendis",
    photo: "https://lh3.googleusercontent.com/a-/ALV-UjXq-dAGCepkvDUd6O3VMlRLdLD8Nl92UMTS2nQ32YGSBx__EywfEQ=s128-c0x00000000-cc-rp-mo-ba4",
    rating: 5,
    text: "Easily accessible location right by the high-level road, friendly, welcoming and supportive people regardless you're a pro or beginner, good range of equipment, loves the place and vibe!",
    time: "a year ago",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 mb-6">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-red-500" : "text-white/15"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const wordVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.03, duration: 0.4, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.25 } },
};

const SingleTestimonial = () => {
  const [index, setIndex] = useState(0);
  const current = reviews[index];

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % reviews.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  const words = current.text.split(" ");

  return (
    <section className="w-full border-t border-white/20">
      <div className="container lg:border-x lg:border-white/20 py-[60px] md:py-[80px] lg:py-[120px]">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto min-h-[280px] sm:min-h-[260px] md:min-h-[300px] lg:min-h-[320px] justify-center">
          <StarRating rating={current.rating} />

          {/* Staggered word animation */}
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              className="text-white text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-normal leading-relaxed tracking-tight line-clamp-4"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.span variants={wordVariants}>&ldquo;</motion.span>
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordVariants}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span custom={words.length} variants={wordVariants}>
                &rdquo;
              </motion.span>
            </motion.blockquote>
          </AnimatePresence>

          {/* Author */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="flex items-center gap-3 mt-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4 } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            >
              <Image
                src={current.photo}
                alt={current.name}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
                unoptimized
              />
              <div className="text-left">
                <p className="text-sm font-medium text-white">{current.name}</p>
                <p className="text-xs text-white/40">{current.time}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SingleTestimonial;
