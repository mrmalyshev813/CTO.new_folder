"use client";

import React, { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export const SplineScene = ({ scene, className }: SplineSceneProps) => {
  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-black/5">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading 3D Scene...</p>
            </div>
          </div>
        }
      >
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
};
