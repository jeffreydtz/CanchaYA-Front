/**
 * Type declarations for @react-three/fiber to work with React 19
 * Extends JSX.IntrinsicElements with Three.js elements
 */

import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {}
