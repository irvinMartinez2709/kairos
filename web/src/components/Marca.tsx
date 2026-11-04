import { useId } from "react";

/**
 * Icono de Kairós: reloj de arena (color heredado) con una planta que lo atraviesa.
 * `currentColor` permite que el marco se adapte al tema claro/oscuro.
 */
export function MarcaLogo({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const hoja = `hoja-${uid}`;
  const tallo = `tallo-${uid}`;

  return (
    <svg viewBox="0 0 240 240" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={hoja} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18B77A" />
          <stop offset="100%" stopColor="#0E9B62" />
        </linearGradient>
        <linearGradient id={tallo} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0E9B62" />
          <stop offset="100%" stopColor="#18B77A" />
        </linearGradient>
      </defs>

      <g
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 28H200" />
        <path d="M40 208H200" />
        <path d="M46 34 L110 122" />
        <path d="M194 34 L130 122" />
        <path d="M46 202 L110 130" />
        <path d="M194 202 L130 130" />
      </g>

      <path
        d="M68 200 C 82 186 102 180 120 166 C 138 180 158 186 172 200 Z"
        fill={`url(#${tallo})`}
      />
      <path
        d="M120 172 C 115 158 125 146 120 134 C 115 122 122 112 120 96"
        stroke="#0E9B62"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M120 18 C 152 42 154 74 120 100 C 86 74 88 42 120 18 Z"
        fill={`url(#${hoja})`}
      />
      <g stroke="#F2FBF6" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <path d="M120 26 L120 94" />
        <path d="M120 46 C 130 44 138 38 143 30" />
        <path d="M120 46 C 110 44 102 38 97 30" />
        <path d="M120 64 C 131 61 140 54 146 45" />
        <path d="M120 64 C 109 61 100 54 94 45" />
        <path d="M120 82 C 129 79 136 73 141 65" />
        <path d="M120 82 C 111 79 104 73 99 65" />
      </g>
    </svg>
  );
}
