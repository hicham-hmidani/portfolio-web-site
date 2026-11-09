import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Send, Bot, Briefcase } from 'lucide-react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

declare global {
  interface Window {
    emailjs: any;
  }
}

export default function Contact({ folio = '10' }: { folio?: string } = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);

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

  // Keep Firestore listener intact
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'portfolio_content', 'contact'), (docSnap) => {
      if (docSnap.exists()) setContact(docSnap.data() as any);
    });
    return () => unsub();
  }, []);

  // EmailJS wiring with exact IDs and MutationObserver for status message animation
  useEffect(() => {
    const form = document.getElementById('contact-form') as HTMLFormElement | null;
    const statusEl = document.getElementById('form-status') as HTMLParagraphElement | null;

    if (!form) return;

    const handleSubmit = async function(this: HTMLFormElement, e: Event) {
      e.preventDefault();
      const btn = document.getElementById('submit-btn') as HTMLButtonElement | null;
      const status = document.getElementById('form-status') as HTMLParagraphElement | null;
      
      const formData = new FormData(this);
      const from_name = formData.get('from_name') as string;
      const from_email = formData.get('from_email') as string;
      const message = formData.get('message') as string;

      if (btn && status) {
        btn.innerText = 'Sending...';
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
          if (window.emailjs) {
            await window.emailjs.sendForm('service_2a6qrp3', 'template_6niplid', this);
          }

          btn.innerText = 'Message Sent';
          status.style.color = '#FF4F00';
          status.innerText = 'Thank you. I will reply within 24 hours.';
          this.reset();
        } catch (error: any) {
          btn.innerText = 'Failed — Try Again';
          btn.disabled = false;
          status.style.color = '#dc2626';
          status.innerText = `Something went wrong. Please email directly to ${contact.email}`;
          console.error('Submission error:', error);
        }
      }
    };

    form.addEventListener('submit', handleSubmit as EventListener);

    // MutationObserver to animate the #form-status message whenever text changes
    let observer: MutationObserver | null = null;
    if (statusEl) {
      observer = new MutationObserver(() => {
        if (statusEl.innerText.trim()) {
          gsap.fromTo(statusEl,
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }
          );
        }
      });
      observer.observe(statusEl, { childList: true, characterData: true, subtree: true });
    }

    return () => {
      form.removeEventListener('submit', handleSubmit as EventListener);
      if (observer) observer.disconnect();
    };
  }, [contact.email]);

  // GSAP scroll animations & input focus underline animations
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isReduced: "(prefers-reduced-motion: reduce)",
      isFull: "(prefers-reduced-motion: no-preference)"
    }, (context) => {
      const { isReduced } = context.conditions as { isReduced: boolean };

      if (isReduced) {
        if (hairlineRef.current) gsap.set(hairlineRef.current, { scaleX: 1, autoAlpha: 1 });
        if (infoCardRef.current) gsap.set(infoCardRef.current, { autoAlpha: 1, y: 0 });
        if (formCardRef.current) gsap.set(formCardRef.current, { autoAlpha: 1, y: 0 });
        const infoItems = gsap.utils.toArray<HTMLElement>('.contact-info-item');
        if (infoItems.length) gsap.set(infoItems, { autoAlpha: 1, y: 0 });
        const formFields = gsap.utils.toArray<HTMLElement>('.contact-form-field');
        if (formFields.length) gsap.set(formFields, { autoAlpha: 1, y: 0 });
        return;
      }

      // Self-drawing section hairline rule
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              end: "top 55%",
              scrub: true
            }
          }
        );
      }

      // Staggered reveal for Left column (contact details) and Form column
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
          toggleActions: "play none none none"
        },
        defaults: { ease: "power3.out" }
      });

      // Left column reveal
      if (infoCardRef.current) {
        revealTl.fromTo(infoCardRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6 }
        );
      }

      // Details items stagger inside left column
      const infoItems = gsap.utils.toArray<HTMLElement>('.contact-info-item');
      if (infoItems.length) {
        revealTl.fromTo(infoItems,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.35"
        );
      }

      // Form card reveal
      if (formCardRef.current) {
        revealTl.fromTo(formCardRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
      }

      // Form fields stagger inside form card
      const formFields = gsap.utils.toArray<HTMLElement>('.contact-form-field');
      if (formFields.length) {
        revealTl.fromTo(formFields,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.35"
        );
      }

      // Interactive input underline growth (scaleX 0 to 1) on focus
      const fieldWrappers = gsap.utils.toArray<HTMLElement>('.input-underline-wrapper');
      const cleanups: (() => void)[] = [];

      fieldWrappers.forEach((wrapper) => {
        const input = wrapper.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
        const underline = wrapper.querySelector<HTMLElement>('.input-accent-line');

        if (input && underline) {
          gsap.set(underline, { scaleX: 0, transformOrigin: "left center" });

          const onFocus = () => {
            gsap.to(underline, { scaleX: 1, duration: 0.35, ease: "power2.out" });
          };
          const onBlur = () => {
            gsap.to(underline, { scaleX: 0, duration: 0.25, ease: "power2.in" });
          };

          input.addEventListener('focus', onFocus);
          input.addEventListener('blur', onBlur);

          cleanups.push(() => {
            input.removeEventListener('focus', onFocus);
            input.removeEventListener('blur', onBlur);
          });
        }
      });

      return () => {
        cleanups.forEach(fn => fn());
      };
    });
  }, { scope: rootRef });

  return (
    <section id="contact" ref={rootRef} className="relative z-10 py-24 bg-[#FFFFFF] border-t border-[rgba(10,10,10,0.16)]">
      <div className="container mx-auto px-6">
        {/* Section Header with Folio 09 */}
        <div className="flex items-baseline justify-between w-full mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#FF4F00] tracking-widest uppercase">
              {folio} / INQUIRIES
            </span>
            <span className="text-xs font-mono text-[#0A0A0A]/40 uppercase tracking-widest">
              — GET IN TOUCH
            </span>
          </div>
          <div className="text-xs font-mono text-[#0A0A0A]/50 tracking-wider">
            RESPONSE TIME &lt; 24H
          </div>
        </div>

        {/* Self-drawing hairline rule */}
        <div
          ref={hairlineRef}
          className="w-full h-px bg-[rgba(10,10,10,0.16)] mb-8 will-change-transform"
        />

        <div className="mb-14 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-4">
            Initiate a Conversation
          </h2>
          <p className="text-sm md:text-base text-[#0A0A0A]/70 leading-relaxed font-sans">
            Currently open to remote part-time contracts, consulting engagements, and data pipeline collaborations. Submit the form below or connect via direct channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
          {/* Contact Information Column */}
          <div 
            ref={infoCardRef}
            className="p-8 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#0A0A0A] uppercase tracking-wide font-mono text-xs">
                  Direct Coordinates
                </h3>
                <span className="font-mono text-[10px] text-[#0A0A0A]/40 uppercase">
                  VERIFIED
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="contact-info-item flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-[rgba(10,10,10,0.16)] text-[#FF4F00] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/50 mb-1">Electronic Mail</p>
                    <a href={`mailto:${contact.email}`} className="text-sm font-medium text-[#0A0A0A] hover:text-[#FF4F00] transition-colors break-all">
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="contact-info-item flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-[rgba(10,10,10,0.16)] text-[#FF4F00] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/50 mb-1">Telephone</p>
                    <a href={`tel:${contact.phone}`} className="text-sm font-medium text-[#0A0A0A] hover:text-[#FF4F00] transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="contact-info-item flex items-start gap-4">
                  <div className="p-2.5 bg-white border border-[rgba(10,10,10,0.16)] text-[#FF4F00] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/50 mb-1">Location & Timezone</p>
                    <p className="text-sm font-medium text-[#0A0A0A]">
                      {contact.location} (UTC+1)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-info-item mt-12 pt-6 border-t border-[rgba(10,10,10,0.12)]">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/50 mb-3">Professional Profiles</p>
              <div className="flex flex-wrap gap-2">
                <a 
                  href={contact.socials.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white text-[#0A0A0A] border border-[rgba(10,10,10,0.16)] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors font-mono text-xs flex items-center gap-2"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
                <a 
                  href={contact.socials.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white text-[#0A0A0A] border border-[rgba(10,10,10,0.16)] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors font-mono text-xs flex items-center gap-2"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a 
                  href={contact.socials.promptbase} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white text-[#0A0A0A] border border-[rgba(10,10,10,0.16)] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors font-mono text-xs flex items-center gap-2"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>PromptBase</span>
                </a>
                <a 
                  href={contact.socials.upwork} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white text-[#0A0A0A] border border-[rgba(10,10,10,0.16)] hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors font-mono text-xs flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Upwork</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Column - Strict preservation of EmailJS IDs */}
          <div ref={formCardRef}>
            <form 
              id="contact-form"
              className="p-8 bg-[#F7F7F8] border border-[rgba(10,10,10,0.16)] flex flex-col gap-5"
            >
              <div className="contact-form-field flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wide text-[#0A0A0A] font-bold">
                  Send Message
                </span>
                <span className="font-mono text-[10px] text-[#0A0A0A]/40 uppercase">
                  DIRECT TRANSMISSION
                </span>
              </div>

              {/* Field 1: Name with accent underline */}
              <div className="contact-form-field flex flex-col gap-1.5 input-underline-wrapper relative">
                <label htmlFor="from_name" className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/60">Your Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="from_name" 
                    id="from_name"
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 bg-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] placeholder:text-[#0A0A0A]/30 text-sm focus:outline-none transition-colors"
                    required
                  />
                  <div className="input-accent-line absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4F00] pointer-events-none will-change-transform" />
                </div>
              </div>

              {/* Field 2: Email with accent underline */}
              <div className="contact-form-field flex flex-col gap-1.5 input-underline-wrapper relative">
                <label htmlFor="from_email" className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/60">Your Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    name="from_email" 
                    id="from_email"
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] placeholder:text-[#0A0A0A]/30 text-sm focus:outline-none transition-colors"
                    required
                  />
                  <div className="input-accent-line absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4F00] pointer-events-none will-change-transform" />
                </div>
              </div>

              {/* Field 3: Message with accent underline */}
              <div className="contact-form-field flex flex-col gap-1.5 input-underline-wrapper relative">
                <label htmlFor="message" className="text-[10px] font-mono uppercase tracking-widest text-[#0A0A0A]/60">Your Message</label>
                <div className="relative">
                  <textarea 
                    name="message" 
                    id="message"
                    placeholder="Outline your scope, timeline, or inquiry..." 
                    rows={5} 
                    className="w-full px-4 py-3 bg-white border border-[rgba(10,10,10,0.16)] text-[#0A0A0A] placeholder:text-[#0A0A0A]/30 text-sm focus:outline-none transition-colors resize-none"
                    required
                  />
                  <div className="input-accent-line absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4F00] pointer-events-none will-change-transform" />
                </div>
              </div>

              <div className="contact-form-field">
                <button 
                  type="submit" 
                  id="submit-btn"
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-[#FF4F00] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors duration-150"
                >
                  Send Message
                  <Send className="w-3.5 h-3.5" />
                </button>
                <p id="form-status" className="font-mono text-xs tracking-wide min-h-[1.25rem] mt-2"></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
