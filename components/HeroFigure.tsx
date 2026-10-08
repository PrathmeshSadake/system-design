"use client";

import { Cabinet } from "@lucasmarkes/hairline/react";

/** The home page's drawing: a rack of server blades from @lucasmarkes/hairline. */
export function HeroFigure() {
  return (
    <figure className="figure">
      <div className="figure-plate">
        <Cabinet
          intensity={0.55}
          label="A rack of twelve server blades. Moving the pointer up and down pulls the nearest blades out on their rails."
        />
      </div>
      <figcaption className="figure-caption mx-auto text-center">
        A rack of server blades. Move your pointer up and down it.
      </figcaption>
    </figure>
  );
}
