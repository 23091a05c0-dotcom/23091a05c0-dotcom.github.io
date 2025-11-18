import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const flexRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
  let translateX: number = 0;

  function setTranslateX() {
    const box = document.getElementsByClassName("work-box");
    const rectLeft = document
      .querySelector(".work-container")!
      .getBoundingClientRect().left;
    const rect = box[0].getBoundingClientRect();
    const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
    let padding: number =
      parseInt(window.getComputedStyle(box[0]).padding) / 2;
    translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
  }

  setTranslateX();

  const isMobile = window.innerWidth <= 1025;
  let timeline: gsap.core.Timeline | null = null;
  if (!isMobile) {
    timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`,
        scrub: 1.2,
        pin: true,
        id: "work",
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setProgress(Math.round(self.progress * 100));
        },
      },
    });
    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });
  } else {
    const el = flexRef.current;
    const onScroll = () => {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const pct = max > 0 ? (el.scrollLeft / max) * 100 : 0;
      setProgress(Math.round(pct));
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const cleanupMobile = () => {
      el?.removeEventListener("scroll", onScroll as EventListener);
    };
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onScroll as EventListener);
      cleanupMobile();
    };
  }

  // Handle window resize
  const handleResize = () => {
    setTranslateX();
    ScrollTrigger.refresh();
  };

  window.addEventListener("resize", handleResize);

  // Clean up
  return () => {
    window.removeEventListener("resize", handleResize);
    timeline?.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <div className="work-progress" aria-hidden="true">
          <div className="work-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex" ref={flexRef}>
          {[...Array(6)].map((_value, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>Project Name</h4>
                    <p>Category</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>Javascript, TypeScript, React, Threejs</p>
              </div>
              <WorkImage image="/images/placeholder.webp" alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
