import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

// Register plugins once
gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin, Flip, useGSAP);

// Global defaults for tweens
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

export { gsap, ScrollTrigger, SplitText, ScrollToPlugin, Flip, useGSAP };
export default gsap;
