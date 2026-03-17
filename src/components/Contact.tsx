import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Linkedin, Github, Send, Bot, Briefcase } from 'lucide-react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

declare global {
  interface Window {
    emailjs: any;
  }
}

export default function Contact() {
  const [contact, setContact] = useState({
    email: 'hmidanihicham8@gmail.com',
    phone: '+212 631649374',
    location: 'Ouarzazate, Morocco',
    socials: {
      linkedin: 'https://linkedin.com/in/hicham-hmidani-b55a5521b/',
      github: 'https://github.com/hicham-hmidani',
      promptbase: 'https://promptbase.com/profile/camih8',
      upwork: 'https://www.upwork.com/'
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio_content', 'contact'), (doc) => {
      if (doc.exists()) setContact(doc.data() as any);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('submit-btn') as HTMLButtonElement;
        const status = document.getElementById('form-status') as HTMLParagraphElement;
        
        const formData = new FormData(this as HTMLFormElement);
        const from_name = formData.get('from_name') as string;
        const from_email = formData.get('from_email') as string;
        const message = formData.get('message') as string;

        if (btn && status) {
          btn.innerText = '⏳ Sending...';
          btn.disabled = true;

          try {
            // Save to Firestore
            await addDoc(collection(db, "contact_messages"), {
              from_name,
              from_email,
              message,
              read: false,
              receivedAt: serverTimestamp()
            });

            // Send via EmailJS
            await window.emailjs.sendForm('service_2a6qrp3', 'template_6niplid', this);

            btn.innerText = '✅ Message Sent!';
            status.style.color = '#00d4d4';
            status.innerText = 'Thank you! I will reply within 24 hours.';
            (this as HTMLFormElement).reset();
          } catch (error: any) {
            btn.innerText = '❌ Failed — Try Again';
            btn.disabled = false;
            status.style.color = 'red';
            status.innerText = `Something went wrong. Please email me directly at ${contact.email}`;
            console.error('Submission error:', error);
          }
        }
      });
    }
  }, [contact.email]);

  return (
    <section id="contact" className="relative z-10 container mx-auto px-6 py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="mb-16 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4"
        >
          Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-yellow-500">Touch</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-slate-600 max-w-2xl mx-auto"
        >
          I'm currently looking for remote part-time opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto relative z-10">
        
        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="p-8 rounded-3xl bg-white border border-slate-200 backdrop-blur-sm shadow-sm">
            <h3 className="text-2xl font-bold font-display text-slate-900 mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-100 text-teal-600 border border-teal-200 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-slate-900 hover:text-teal-600 transition-colors break-all">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 border border-yellow-200 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Phone</p>
                  <a href={`tel:${contact.phone}`} className="text-slate-900 hover:text-yellow-600 transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-100 text-teal-600 border border-teal-200 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                  <p className="text-slate-900">
                    {contact.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-4">Connect with me</p>
              <div className="flex gap-4">
                <a 
                  href={contact.socials.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href={contact.socials.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                >
                  <span className="sr-only">GitHub</span>
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href={contact.socials.promptbase} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
                >
                  <span className="sr-only">PromptBase</span>
                  <Bot className="w-5 h-5" />
                </a>
                <a 
                  href={contact.socials.upwork} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"
                >
                  <span className="sr-only">Upwork</span>
                  <Briefcase className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <form 
            id="contact-form"
            className="p-8 rounded-3xl bg-white border border-slate-200 backdrop-blur-sm flex flex-col gap-6 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="from_name" className="text-sm font-medium text-slate-700">Your Name</label>
              <input 
                type="text" 
                name="from_name" 
                id="from_name"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="from_email" className="text-sm font-medium text-slate-700">Your Email</label>
              <input 
                type="email" 
                name="from_email" 
                id="from_email"
                placeholder="Your Email"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium text-slate-700">Your Message</label>
              <textarea 
                name="message" 
                id="message"
                placeholder="Your Message" 
                rows={6} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              id="submit-btn"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-teal-600/20"
            >
              Send Message
              <Send className="w-5 h-5" />
            </button>
            <p id="form-status" style={{ marginTop: '10px' }}></p>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
