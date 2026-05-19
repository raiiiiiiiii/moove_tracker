import React from 'react'

export default function MooveLogo({ size = 24, color = 'currentColor', ...props }) {
  // SVG representation of the official Moove "mv" logo
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill={color}>
        {/* Slanted left stem of 'm' */}
        <path d="M15 80 L 25 35 L 39 35 L 29 80 Z" />

        {/* First Arch */}
        <path d="M25 35 C 32 30, 42 30, 47 38 L 47 41 L 38 80 L 52 80 L 61 41 C 63 32, 73 30, 78 38 L 78 41 L 69 80 L 83 80 L 92 41 C 94 32, 102 32, 105 38" />

        {/* Slanted connector & arches (solid body) */}
        <path d="M 25 35 C 29 23, 44 23, 50 35 C 54 23, 69 23, 75 35 C 80 35, 84 42, 82 50 L 75 80 L 61 80 L 67 52 C 68 47, 65 44, 61 44 C 57 44, 54 47, 53 52 L 47 80 L 33 80 L 39 52 C 40 47, 37 44, 33 44 C 29 44, 26 47, 25 52 L 19 80 L 15 80" />

        {/* The 'v' shape right arm */}
        <path d="M 75 80 L 95 38 L 84 38 L 68 70 Z" />

        {/* Circle ring at the top right tip of 'v' */}
        <path fillRule="evenodd" clipRule="evenodd" d="M 97 32 C 101.97 32, 106 27.97, 106 23 C 106 18.03, 101.97 14, 97 14 C 92.03 14, 88 18.03, 88 23 C 88 27.97, 92.03 32, 97 32 Z M 97 27 C 99.21 27, 101 25.21, 101 23 C 101 20.79, 99.21 19, 97 19 C 94.79 19, 93 20.79, 93 23 C 93 25.21, 94.79 27, 97 27 Z" />
      </g>
    </svg>
  )
}
