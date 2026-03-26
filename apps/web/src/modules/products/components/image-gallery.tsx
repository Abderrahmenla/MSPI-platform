'use client';

import { useState } from 'react';
import type { ProductImage } from '../types/product.types';

interface ImageGalleryProps {
  images: ProductImage[];
  alt: string;
  isOos?: boolean;
}

function PlaceholderImage({ isOos }: { isOos?: boolean }) {
  return (
    <div
      className={[
        'flex h-full w-full items-center justify-center bg-gray-100',
        isOos ? 'grayscale-[50%]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-20 w-20 text-gray-300"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="8"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="22" cy="22" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 44l14-14 10 10 8-8 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function ImageGallery({ images, alt, isOos }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIdx, setActiveIdx] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl">
        <PlaceholderImage isOos={isOos} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sorted[activeIdx].url}
          alt={alt}
          className={[
            'h-full w-full object-cover',
            isOos ? 'grayscale-[50%]' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {/* Mobile dot indicators */}
        {sorted.length > 1 && (
          <div className="absolute start-0 end-0 bottom-3 flex justify-center gap-1.5 md:hidden">
            {sorted.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`Image ${i + 1}`}
                className={[
                  'h-2 rounded-full transition-all',
                  i === activeIdx
                    ? 'w-5 bg-white'
                    : 'w-2 bg-white/60 hover:bg-white/80',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop thumbnail strip */}
      {sorted.length > 1 && (
        <div className="hidden gap-2 md:flex">
          {sorted.slice(0, 4).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={[
                'aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === activeIdx
                  ? 'border-brand-500'
                  : 'border-transparent opacity-60 hover:opacity-100',
              ].join(' ')}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${alt} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
