import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

/**
 * SVG filter that creates the hand-drawn "rough" effect
 * used by .sketch-box, .sketch-dot, .sketch-underline, .sketch-avatar
 */
function SketchFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="rough">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
            seed="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function App() {
  return (
    <>
      <SketchFilter />
      <RouterProvider router={router} />
    </>
  );
}
