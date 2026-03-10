import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ArrowRight, ArrowLeft, Share2, Linkedin, Twitter, RefreshCw, Loader2, X, Sparkles, Plus } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";

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
    avatar: "https://github.com/hicham-hmidani.png",
    date: "Oct 12, 2023"
  },
  {
    title: "How I Reached PromptBase Rank #1899 with 220+ AI Prompts: My Strategy",
    excerpt: "From my first Leonardo.AI prompt to building a full catalog of 220+ prompts — here's what I learned about engineering prompts that actually sell.",
    category: "AI & Prompt Engineering",
    categoryColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
    readTime: "8 min read",
    author: "Hicham Hmidani",
    avatar: "https://github.com/hicham-hmidani.png",
    date: "Nov 05, 2023"
  },
  {
    title: "Domain Name Investing in 2025: What I Wish I Knew Before I Started",
    excerpt: "Domain flipping is one of the most underrated income streams in tech. Here's my beginner's guide to finding, buying, and selling valuable domains.",
    category: "Domain Name Investing",
    categoryColor: "text-orange-700 bg-orange-50 border-orange-200",
    readTime: "7 min read",
    author: "Hicham Hmidani",
    avatar: "https://github.com/hicham-hmidani.png",
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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [articleContent, setArticleContent] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Full Blog View State
  const [isViewingAll, setIsViewingAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Generate New Article State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newTopic, setNewTopic] = useState("");
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

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
      
      // Save the generated content to the post so we don't regenerate it next time
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
        avatar: "https://github.com/hicham-hmidani.png",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      setPosts(prev => [newPost, ...prev]);
      setIsGenerateModalOpen(false);
      setNewTopic("");
      
      // Open the newly generated post immediately
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
    setSelectedPost(null);
    setArticleContent("");
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const currentProgress = (target.scrollTop / scrollHeight) * 100;
    setScrollProgress(currentProgress);
  };

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

  const filteredPosts = posts.filter(post => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Data Analysis") return post.category.includes("Data Analysis");
    if (activeFilter === "AI & Prompts") return post.category.includes("AI");
    if (activeFilter === "Machine Learning") return post.category.includes("Machine Learning");
    if (activeFilter === "Freelancing") return post.category.includes("Freelancing");
    if (activeFilter === "Domain Investing") return post.category.includes("Domain");
    return true;
  });

  const isAnyModalOpen = selectedPost || isViewingAll || isGenerateModalOpen;

  return (
    <section id="blog" className={`relative py-24 bg-white border-y border-slate-200 ${isAnyModalOpen ? 'z-[100]' : 'z-10'}`}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
          >
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Articles</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-600 max-w-2xl mx-auto"
          >
            Insights and tutorials on data analysis, AI prompt engineering, machine learning, freelancing, and domain investing.
          </motion.p>
        </div>

        {/* Homepage Grid (Shows up to 3 posts) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.slice(0, 3).map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 cursor-pointer"
              onClick={() => handleReadArticle(post)}
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${post.categoryColor}`}>
                    {post.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold font-display text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar} 
                      alt={post.author} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{post.author}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 group-hover:text-teal-700 transition-colors">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => setIsViewingAll(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
          >
            View All Posts
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full Blog Listing Overlay */}
      <AnimatePresence>
        {isViewingAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[80] bg-slate-50 overflow-y-auto"
          >
            <div className="min-h-screen pb-24">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                  <button 
                    onClick={() => setIsViewingAll(false)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Portfolio
                  </button>
                  <h2 className="text-xl font-bold font-display text-slate-900 hidden sm:block">Hicham's Blog</h2>
                  <button 
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-sm transition-colors border border-teal-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate New Article with AI</span>
                    <span className="sm:hidden">Generate</span>
                  </button>
                </div>
              </div>

              <div className="container mx-auto px-6 pt-12">
                <div className="mb-12 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-6">
                    All <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Articles</span>
                  </h1>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
                    {FILTERS.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeFilter === filter 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 cursor-pointer"
                      onClick={() => handleReadArticle(post)}
                    >
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="mb-6">
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${post.categoryColor}`}>
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold font-display text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <img 
                              src={post.avatar} 
                              alt={post.author} 
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{post.author}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredPosts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500">
                      No articles found for this category. Try generating one!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate New Article Modal */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Generate New Article
                </h3>
                <button 
                  onClick={() => !isGeneratingNew && setIsGenerateModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  disabled={isGeneratingNew}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleGenerateNewPost} className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Topic Category
                    </label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={isGeneratingNew}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      What would you like to know about? <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea 
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      disabled={isGeneratingNew}
                      placeholder="e.g., How to use Python for stock market analysis..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none h-24"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    type="submit"
                    disabled={isGeneratingNew}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingNew ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Article...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
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

      {/* Article Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-4xl max-h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-800"
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-yellow-500 transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-40 sticky top-0">
                <button 
                  onClick={handleCloseModal}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-[#0A66C2] hover:bg-slate-800 rounded-lg transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-[#1DA1F2] hover:bg-slate-800 rounded-lg transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div 
                className="overflow-y-auto p-6 sm:p-10 scroll-smooth"
                onScroll={handleScroll}
              >
                <div className="max-w-3xl mx-auto">
                  <div className="mb-10 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border mb-6 ${(selectedPost.categoryColor || "text-slate-700 bg-slate-50 border-slate-200").replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-').replace('border-', 'border-opacity-20 border-')}`}>
                      {selectedPost.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
                      {selectedPost.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedPost.readTime}
                      </span>
                      <span>•</span>
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
                      <p className="text-lg font-medium animate-pulse">✍️ Hicham's AI is writing this article...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-img:rounded-2xl">
                      <Markdown>{articleContent}</Markdown>
                    </div>
                  )}

                  {!isGenerating && articleContent && (
                    <div className="mt-16 pt-10 border-t border-slate-800">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={selectedPost.avatar} 
                            alt={selectedPost.author} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-lg font-bold text-white">{selectedPost.author}</p>
                            <p className="text-sm text-slate-400">Junior Data Analyst & AI Prompt Engineer</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => generateArticle(selectedPost)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all hover:scale-105 active:scale-95"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Generate Another Version
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
