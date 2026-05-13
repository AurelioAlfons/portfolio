"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import type { Transition, MotionValue } from "motion/react";
import "../css/Carousel.css";

type CarouselItemType = {
  id: number;
  title: string;
  description: string;
  link: string;
  image: string;
};

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 20;

const SPRING_OPTIONS: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

function CarouselItem({
  item,
  index,
  itemWidth,
  trackItemOffset,
  x,
  transition,
}: {
  item: CarouselItemType;
  index: number;
  itemWidth: number;
  trackItemOffset: number;
  x: MotionValue<number>;
  transition: Transition;
}) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];

  const rotateY = useTransform(x, range, [12, 0, -12], { clamp: false });
  const scale = useTransform(x, range, [0.92, 1, 0.92], { clamp: false });
  const opacity = useTransform(x, range, [0.45, 1, 0.45], { clamp: false });

  return (
    <motion.div
      className="carousel-item"
      style={{
        width: itemWidth,
        rotateY,
        scale,
        opacity,
      }}
      transition={transition}
    >
      <div className="carousel-preview">
        <a href={item.link} target="_blank" rel="noreferrer">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full cursor-pointer object-cover"
          />
        </a>
      </div>

      <div className="carousel-item-content">
        <h3 className="carousel-item-title">{item.title}</h3>

        <p className="carousel-item-description">{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function Carousel({
  items,
  baseWidth = 1000,
  autoplay = true,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
}: {
  items: CarouselItemType[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
}) {
  const itemWidth = baseWidth;
  const trackItemOffset = itemWidth + GAP;

  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(-(loop ? 1 : 0) * trackItemOffset);

  const transition: Transition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  useEffect(() => {
    const start = loop ? 1 : 0;
    setPosition(start);
    x.set(-start * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  useEffect(() => {
    if (!pauseOnHover || !containerRef.current) return;

    const el = containerRef.current;

    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    pauseOnHover,
    itemsForRender.length,
  ]);

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }

    const lastCloneIndex = itemsForRender.length - 1;

    if (position === lastCloneIndex) {
      setIsJumping(true);
      setPosition(1);
      x.set(-1 * trackItemOffset);

      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });

      return;
    }

    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);

      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });

      return;
    }

    setIsAnimating(false);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;

    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
        ? -1
        : 0;

    if (direction === 0) return;

    setPosition((prev) => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const goLeft = () => {
    setPosition((prev) => Math.max(0, prev - 1));
  };

  const goRight = () => {
    setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1));
  };

  const activeIndex =
    items.length === 0
      ? 0
      : loop
      ? (position - 1 + items.length) % items.length
      : Math.min(position, items.length - 1);

  return (
    <div ref={containerRef} className="carousel-container">
      <button className="carousel-arrow left" onClick={goLeft}>
        ←
      </button>

      <button className="carousel-arrow right" onClick={goRight}>
        →
      </button>

      <div className="carousel-viewport">
        <motion.div
          className="carousel-track"
          drag={isAnimating ? false : "x"}
          style={{
            width: itemWidth,
            gap: `${GAP}px`,
            perspective: 2000,
            perspectiveOrigin: `${
              position * trackItemOffset + itemWidth / 2
            }px 50%`,
            x,
          }}
          animate={{ x: -(position * trackItemOffset) }}
          transition={transition}
          onDragEnd={handleDragEnd}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={handleAnimationComplete}
        >
          {itemsForRender.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              itemWidth={itemWidth}
              trackItemOffset={trackItemOffset}
              x={x}
              transition={transition}
            />
          ))}
        </motion.div>
      </div>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setPosition(loop ? index + 1 : index)}
            className={`carousel-indicator ${
              activeIndex === index ? "active" : "inactive"
            }`}
          />
        ))}
      </div>
    </div>
  );
}