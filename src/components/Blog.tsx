import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ArrowRight, ArrowLeft, Share2, Linkedin, Twitter, RefreshCw, Loader2, X, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { gsap, ScrollTrigger, Flip, useGSAP } from '../lib/gsap';
import { useScrollRefresh } from '../hooks/useScrollRefresh';

type BlogPost = {
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  readTime: string;
  author: string;
  avatar: string;
  date: string;
  content?: string;
};

const initialPosts: BlogPost[] = [
  {
    title: "How I Built a Road Accident Dashboard That Analyzed 417,883 Casualties in Excel",
    excerpt: "A step-by-step breakdown of how I transformed raw accident data into an interactive Excel dashboard with KPIs, trend lines, and filter panels.",
    category: "Data Analysis & Visualization",
    categoryColor: "text-blue-700 bg-blue-50 border-blue-200",
    readTime: "6 min read",
    author: "Hicham Hmidani",
    avatar: "https://avatars.githubusercontent.com/u/112251991?v=4",
    date: "Oct 12, 2023"
  },
  {
    title: "How I Reached PromptBase Rank #1899 with 220+ AI Prompts: My Strategy",
    excerpt: "From my first Leonardo.AI prompt to building a full catalog of 220+ prompts — here's what I learned about engineering prompts that actually sell.",
    category: "AI & Prompt Engineering",
    categoryColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    readTime: "8 min read",
    author: "Hicham Hmidani",
    avatar: "https://avatars.githubusercontent.com/u/112251991?v=4",
    date: "Nov 05, 2023"
  },
  {
    title: "Domain Name Investing in 2025: What I Wish I Knew Before I Started",
    excerpt: "Domain flipping is one of the most underrated income streams in tech. Here's my beginner's guide to finding, buying, and selling valuable domains.",
    category: "Domain Name Investing",
    categoryColor: "text-orange-700 bg-orange-50 border-orange-200",
    readTime: "7 min read",
    author: "Hicham Hmidani",
    avatar: "https://avatars.githubusercontent.com/u/112251991?v=4",
    date: "Dec 18, 2023"
  }
];

const CATEGORIES = [
  "Data Analysis & Visualization",
  "AI & Prompt Engineering",
  "Machine Learning & Deep Learning",
  "Freelancing Tips & Career",
  "Domain Name Investing"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Data Analysis & Visualization": "text-blue-700 bg-blue-50 border-blue-200",
  "AI & Prompt Engineering": "text-yellow-700 bg-yellow-50 border-yellow-200",
  "Machine Learning & Deep Learning": "text-purple-700 bg-purple-50 border-purple-200",
  "Freelancing Tips & Career": "text-green-700 bg-green-50 border-green-200",
  "Domain Name Investing": "text-orange-700 bg-orange-50 border-orange-200"
};

const FILTERS = ["All", "Data Analysis", "AI & Prompts", "Machine Learning", "Freelancing", "Domain Investing"];

export default function Blog({ folio = '07' }: { folio?: string } = {}) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [articleContent, setArticleContent] = useState("");

  // Full Blog View State
  const [isViewingAll, setIsViewingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Generate New Article State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newTopic, setNewTopic] = useState("");
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  // GSAP Refs
  const sectionRef = useRef<HTMLElement>(null);
  const headerHairlineRef = useRef<HTMLDivElement>(null);
  const articleScrollContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const articleScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const viewAllFlipRef = useRef<any>(null);

  useScrollRefresh([posts]);

  // Keep body overflow locked when any modal is open
  useEffect(() => {
    if (selectedPost || isViewingAll || isGenerateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost, isViewingAll, isGenerateModalOpen]);

  // Performance Fix: ScrollTrigger scrub for article modal progress bar (zero React state updates)
  const initArticleScrollTrigger = () => {
    if (articleScrollTriggerRef.current) {
      articleScrollTriggerRef.current.kill();
      articleScrollTriggerRef.current = null;
    }
    const scrollerEl = articleScrollContainerRef.current;
    const barEl = progressBarRef.current;
    if (!scrollerEl || !barEl) return;

    articleScrollTriggerRef.current = ScrollTrigger.create({
      trigger: scrollerEl.firstElementChild as HTMLElement || scrollerEl,
      scroller: scrollerEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1,
      onUpdate: (self) => {
        gsap.set(barEl, { scaleX: self.progress });
      }
    });
  };

  const cleanupArticleScrollTrigger = () => {
    if (articleScrollTriggerRef.current) {
      articleScrollTriggerRef.current.kill();
      articleScrollTriggerRef.current = null;
    }
  };

  useEffect(() => {
    if (selectedPost) {
      const timer = setTimeout(() => {
        initArticleScrollTrigger();
      }, 60);
      return () => {
        clearTimeout(timer);
        cleanupArticleScrollTrigger();
      };
    }
  }, [selectedPost, articleContent]);

  // GSAP Entrance & Batch setup
  const { contextSafe } = useGSAP(() => {
    // If a filter flip state was captured, animate layout change with Flip
    if (viewAllFlipRef.current) {
      Flip.from(viewAllFlipRef.current, {
        duration: 0.4,
        ease: "power2.out",
        fade: true,
        absolute: true,
        nested: true
      });
      viewAllFlipRef.current = null;
    }

    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      if (isReduced) {
        if (headerHairlineRef.current) gsap.set(headerHairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        gsap.set(".blog-card", { autoAlpha: 1, y: 0 });
        return;
      }

      // Hairline draw on section enter
      if (headerHairlineRef.current && sectionRef.current) {
        gsap.fromTo(headerHairlineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              end: "top 40%",
              scrub: true
            }
          }
        );
      }

      // Top-3 post cards: ScrollTrigger.batch reveal
      gsap.set(".blog-card", { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch(".blog-card", {
        interval: 0.1,
        start: "top 85%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.55,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    });
  }, { scope: sectionRef, dependencies: [posts, activeFilter], revertOnUpdate: true });

  // Hover handlers for top-3 cards (fine pointer only)
  const handleCardMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const avatar = e.currentTarget.querySelector<HTMLElement>(".blog-avatar");
    const arrow = e.currentTarget.querySelector<HTMLElement>(".blog-arrow");
    if (avatar) gsap.to(avatar, { scale: 1.08, duration: 0.3, ease: "power2.out" });
    if (arrow) gsap.to(arrow, { x: 4, duration: 0.3, ease: "power2.out" });
  });

  const handleCardMouseLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const avatar = e.currentTarget.querySelector<HTMLElement>(".blog-avatar");
    const arrow = e.currentTarget.querySelector<HTMLElement>(".blog-arrow");
    if (avatar) gsap.to(avatar, { scale: 1, duration: 0.3, ease: "power2.out" });
    if (arrow) gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out" });
  });

  // Filter change in view all modal animated with Flip
  const handleFilterClick = contextSafe((filter: string) => {
    viewAllFlipRef.current = Flip.getState(".view-all-card");
    setActiveFilter(filter);
  });

  // Generate content for an existing post
  const generateArticle = async (post: BlogPost) => {
    setIsGenerating(true);
    setArticleContent("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are Hicham Hmidani, a Junior Data Analyst, AI Prompt Engineer, and Domain Name Investor from Morocco. Write a detailed, insightful blog article titled "${post.title}" in the category "${post.category}". 
      Structure it with: introduction, 3-4 main sections with subheadings, practical tips, and a conclusion. 
      Write in a professional but approachable tone. Use real examples from data analytics, AI tools, or freelancing. 
      Format with clear markdown-style headings and paragraphs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      const text = response.text || "Failed to generate article content.";
      setArticleContent(text);

      setPosts(prev => prev.map(p => p.title === post.title ? { ...p, content: text } : p));
    } catch (error) {
      console.error("Error generating article:", error);
      setArticleContent("Sorry, there was an error generating the article. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a completely new post
  const handleGenerateNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingNew(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are Hicham Hmidani, a Junior Data Analyst, AI Prompt Engineer, and Domain Name Investor from Morocco. 
      Write a detailed, insightful blog article in the category "${newCategory}". 
      ${newTopic ? `The specific topic the user requested is: "${newTopic}".` : `Choose a highly engaging and relevant topic for this category.`}
      Structure it with: introduction, 3-4 main sections with subheadings, practical tips, and a conclusion. 
      Write in a professional but approachable tone. Use real examples from data analytics, AI tools, or freelancing. 
      Format the content with clear markdown-style headings and paragraphs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy, professional title for the blog post" },
              excerpt: { type: Type.STRING, description: "A 2-line summary of the article" },
              content: { type: Type.STRING, description: "The full markdown content of the article" },
              readTime: { type: Type.STRING, description: "e.g., '5 min read'" }
            },
            required: ["title", "excerpt", "content", "readTime"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");

      const newPost: BlogPost = {
        title: data.title || newTopic || "New AI Generated Article",
        excerpt: data.excerpt || "An insightful article generated by AI.",
        content: data.content || "# Error\nFailed to generate content.",
        category: newCategory,
        categoryColor: CATEGORY_COLORS[newCategory] || "text-slate-700 bg-slate-50 border-slate-200",
        readTime: data.readTime || "5 min read",
        author: "Hicham Hmidani",
        avatar: "https://avatars.githubusercontent.com/u/112251991?v=4",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setPosts(prev => [newPost, ...prev]);
      setIsGenerateModalOpen(false);
      setNewTopic("");

      setSelectedPost(newPost);
      setArticleContent(newPost.content!);
    } catch (error) {
      console.error("Error generating new post:", error);
      alert("Failed to generate article. Please try again.");
    } finally {
      setIsGeneratingNew(false);
    }
  };

  const handleReadArticle = (post: BlogPost) => {
    setSelectedPost(post);
    if (post.content) {
      setArticleContent(post.content);
    } else {
      generateArticle(post);
    }
  };

  const handleCloseModal = () => {
    cleanupArticleScrollTrigger();
    setSelectedPost(null);
    setArticleContent("");
  };

  const filteredPosts = posts.filter(post => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Data Analysis") return post.category.includes("Data Analysis");
    if (activeFilter === "AI & Prompts") return post.category.includes("AI");
    if (activeFilter === "Machine Learning") return post.category.includes("Machine Learning");
    if (activeFilter === "Freelancing") return post.category.includes("Freelancing");
    if (activeFilter === "Domain Investing") return post.category.includes("Domain");
    return true;
  });

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]"
    >
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header with Folio 07 */}
        <div className="flex flex-col items-start mb-12 w-full">
          <div className="flex items-baseline justify-between w-full mb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
                {folio} / BLOG
              </span>
              <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
                — ARTICLES & EDITORIALS
              </span>
            </div>
            <div className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-wider hidden sm:block">
              {posts.length} PUBLICATIONS
            </div>
          </div>

          {/* Hairline rule that draws with scrub on entrance */}
          <div
            ref={headerHairlineRef}
            className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
          />

          {/* Left-Aligned Swiss Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
            Latest <span className="text-[#FF4F00]">Articles</span>
          </h2>
          <p className="text-base text-[#0A0A0A]/70 max-w-2xl leading-relaxed">
            Technical breakdowns and practical tutorials on data analytics dashboards, prompt engineering architectures, machine learning models, and domain name investing.
          </p>
        </div>

        {/* Oversized background folio watermark */}
        <div className="absolute top-10 right-6 text-8xl md:text-9xl font-bold tracking-tighter text-[#0A0A0A]/[0.03] select-none pointer-events-none font-sans z-0">
          {folio}
        </div>

        {/* Top-3 Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.slice(0, 3).map((post) => (
            <div
              key={post.title}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => handleReadArticle(post)}
              className="blog-card group flex flex-col bg-[#FFFFFF] border border-[rgba(10,10,10,0.16)] p-6 md:p-8 hover:border-[#0A0A0A]/40 transition-colors cursor-pointer justify-between"
            >
              <div>
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-mono uppercase font-bold tracking-wider bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] text-[#0A0A0A]">
                    {post.category}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold tracking-tight text-[#0A0A0A] mb-3 leading-snug group-hover:text-[#FF4F00] transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-[#0A0A0A]/70 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(10,10,10,0.1)] mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="blog-avatar w-8 h-8 rounded-full object-cover border border-[rgba(10,10,10,0.16)] will-change-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0A0A0A]">{post.author}</p>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#0A0A0A]/50">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#FF4F00]">
                  <span>Read Article</span>
                  <ArrowRight className="blog-arrow w-3.5 h-3.5 will-change-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Posts Button */}
        <div className="mt-12 text-center md:text-left max-w-6xl mx-auto">
          <button
            onClick={() => setIsViewingAll(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0A0A0A] hover:bg-[#FF4F00] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-none"
          >
            <span>View All Posts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Blog Listing Modal (Retaining AnimatePresence) */}
      <AnimatePresence>
        {isViewingAll && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-[#FFFFFF] overflow-y-auto"
          >
            <div className="min-h-screen pb-24">
              {/* Header */}
              <div className="bg-[#FFFFFF] border-b border-[rgba(10,10,10,0.16)] sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                  <button
                    onClick={() => setIsViewingAll(false)}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portfolio
                  </button>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/40 hidden sm:block">
                    {folio} / EDITORIAL ARCHIVE
                  </span>
                  <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F7F8] hover:bg-[#FF4F00] hover:text-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Generate New Article with AI</span>
                    <span className="sm:hidden">Generate</span>
                  </button>
                </div>
              </div>

              <div className="container mx-auto px-6 pt-10">
                <div className="mb-10 text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] mb-4">
                    Editorial <span className="text-[#FF4F00]">Archive</span>
                  </h1>

                  {/* Filter Chips with Flip Animation */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[rgba(10,10,10,0.12)]">
                    {FILTERS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => handleFilterClick(filter)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                          activeFilter === filter
                            ? 'bg-[#FF4F00] text-white border-[#FF4F00]'
                            : 'bg-[#F7F7F8] border-[rgba(10,10,10,0.14)] text-[#0A0A0A]/70 hover:border-[#0A0A0A]'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animated Grid with Stable Keys */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.title}
                      onClick={() => handleReadArticle(post)}
                      className="view-all-card flex flex-col bg-[#FFFFFF] border border-[rgba(10,10,10,0.16)] p-6 hover:border-[#0A0A0A]/40 transition-colors cursor-pointer justify-between"
                    >
                      <div>
                        <div className="mb-3">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] text-[#0A0A0A]">
                            {post.category}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#0A0A0A] mb-2 leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-[#0A0A0A]/70 leading-relaxed mb-6 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[rgba(10,10,10,0.08)] flex items-center justify-between text-[11px] font-mono text-[#0A0A0A]/60">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  ))}

                  {filteredPosts.length === 0 && (
                    <div className="col-span-full py-16 text-center text-xs font-mono text-[#0A0A0A]/50 uppercase">
                      No articles found for category.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate New Article Modal (Retaining AnimatePresence) */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-[#0A0A0A]/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 16 }}
              className="w-full max-w-lg bg-[#FFFFFF] border border-[rgba(10,10,10,0.2)] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[rgba(10,10,10,0.12)] flex items-center justify-between bg-[#F7F7F8]">
                <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4F00]" />
                  Generate New Article with Gemini
                </h3>
                <button
                  onClick={() => !isGeneratingNew && setIsGenerateModalOpen(false)}
                  className="p-1 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors cursor-pointer"
                  disabled={isGeneratingNew}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateNewPost} className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A] mb-2">
                      Topic Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={isGeneratingNew}
                      className="w-full px-4 py-2.5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-xs font-mono text-[#0A0A0A] focus:outline-none focus:border-[#FF4F00] transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A] mb-2">
                      What would you like to know about? <span className="text-[#0A0A0A]/40 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      disabled={isGeneratingNew}
                      placeholder="e.g., How to use Python for stock market analysis..."
                      className="w-full px-4 py-2.5 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] text-xs font-mono text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus:outline-none focus:border-[#FF4F00] transition-colors resize-none h-24"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isGeneratingNew}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-[#FF4F00] text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingNew ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Article with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Reader Modal (Performance Fix: scaleX progress bar driven by ScrollTrigger scrub) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-4xl max-h-[92vh] bg-[#FFFFFF] border border-[rgba(10,10,10,0.2)] shadow-2xl flex flex-col relative overflow-hidden"
            >
              {/* Performance Fix: scaleX bar driven by ScrollTrigger scrub (zero React state updates) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[rgba(10,10,10,0.1)] z-50 overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full w-full bg-[#FF4F00] origin-left scale-x-0 will-change-transform"
                />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[rgba(10,10,10,0.12)] bg-[#FFFFFF] z-40 sticky top-0">
                <button
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Articles
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: selectedPost.title, url: window.location.href }).catch(() => {});
                      }
                    }}
                    className="p-2 text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] transition-colors cursor-pointer"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <a
                    href="https://linkedin.com/in/hicham-hmidani-b55a5521b/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-[#0A0A0A]/60 hover:text-[#0A66C2] hover:bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-[#0A0A0A]/60 hover:text-[#1DA1F2] hover:bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Modal Scroll Container (Attached to ScrollTrigger as scroller) */}
              <div
                ref={articleScrollContainerRef}
                className="overflow-y-auto p-6 sm:p-12"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8 text-left">
                    <span className="inline-block px-2.5 py-1 text-xs font-mono uppercase font-bold tracking-wider bg-[#F7F7F8] border border-[rgba(10,10,10,0.12)] text-[#0A0A0A] mb-4">
                      {selectedPost.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0A0A0A] mb-4 leading-tight">
                      {selectedPost.title}
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-mono text-[#0A0A0A]/50 border-b border-[rgba(10,10,10,0.1)] pb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {selectedPost.readTime}
                      </span>
                      <span>•</span>
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#0A0A0A]/60">
                      <Loader2 className="w-8 h-8 animate-spin text-[#FF4F00] mb-3" />
                      <p className="text-xs font-mono uppercase tracking-wider">Generating article with Gemini AI...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-[#0A0A0A] prose-p:text-[#0A0A0A]/80 prose-a:text-[#FF4F00] prose-li:text-[#0A0A0A]/80">
                      <Markdown>{articleContent}</Markdown>
                    </div>
                  )}

                  {!isGenerating && articleContent && (
                    <div className="mt-12 pt-8 border-t border-[rgba(10,10,10,0.12)]">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={selectedPost.avatar}
                            alt={selectedPost.author}
                            className="w-12 h-12 rounded-full object-cover border border-[rgba(10,10,10,0.16)]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#0A0A0A]">{selectedPost.author}</p>
                            <p className="text-xs font-mono text-[#0A0A0A]/60">Junior Data Analyst & AI Prompt Engineer</p>
                          </div>
                        </div>
                        <button
                          onClick={() => generateArticle(selectedPost)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F7F7F8] hover:bg-[#FF4F00] hover:text-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Generate Alternate Version</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
