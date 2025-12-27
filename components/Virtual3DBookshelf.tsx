'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import { Book } from '@/app/page';
import { Suspense, useState, useRef } from 'react';
import * as THREE from 'three';
import { Library, Loader2, MousePointer2, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface Virtual3DBookshelfProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

// 3D Book Component
function Book3D({ book, position, color, onClick }: { book: Book; position: [number, number, number]; color: string; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate dimensions based on pages
  const width = 0.15 + (book.totalPages || 300) / 3000; // 0.15 to 0.5
  const height = 1.2; // Fixed height
  const depth = 0.15;

  // Enhance color for better contrast and depth
  const enhanceColor = (hex: string) => {
    const color = new THREE.Color(hex);
    // Increase saturation slightly
    color.convertLinearToSRGB();
    return '#' + color.getHexString();
  };

  const bookColor = enhanceColor(color);
  const spineColor = new THREE.Color(bookColor).multiplyScalar(0.75).getHexString();

  return (
    <group position={position}>
      {/* Book Cover (front) */}
      <RoundedBox
        args={[depth, height, width]}
        radius={0.01}
        smoothness={4}
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={bookColor}
          roughness={0.4}
          metalness={0.1}
          emissive={hovered ? bookColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          envMapIntensity={0.5}
        />
      </RoundedBox>

      {/* Book Spine */}
      <mesh
        position={[0, height / 2, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={'#' + spineColor}
          roughness={0.5}
          metalness={0.08}
          emissive={hovered ? bookColor : '#000000'}
          emissiveIntensity={hovered ? 0.25 : 0}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Book spine text - larger and more readable */}
      <Text
        position={[0, height / 2, depth / 2 + 0.008]}
        rotation={[0, 0, 0]}
        fontSize={0.085}
        color={isColorDark(bookColor) ? '#ffffff' : '#1a1a1a'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.08}
        letterSpacing={0.025}
        outlineWidth={isColorDark(bookColor) ? 0.004 : 0.003}
        outlineColor={isColorDark(bookColor) ? '#000000' : '#ffffff'}
        fontWeight={700}
      >
        {book.title.toUpperCase().substring(0, 22)}
      </Text>

      {/* Author text - improved visibility */}
      {height > 1 && (
        <Text
          position={[0, height / 2 - 0.5, depth / 2 + 0.008]}
          rotation={[0, 0, 0]}
          fontSize={0.055}
          color={isColorDark(bookColor) ? '#e0e0d0' : '#3a3a3a'}
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.08}
          letterSpacing={0.015}
          outlineWidth={0.002}
          outlineColor={isColorDark(bookColor) ? '#000000' : '#ffffff'}
        >
          {book.author.substring(0, 18)}
        </Text>
      )}

      {/* Book Back Cover */}
      <RoundedBox
        args={[depth, height, width]}
        radius={0.01}
        smoothness={4}
        position={[width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={new THREE.Color(bookColor).multiplyScalar(0.9).getHexString()}
          roughness={0.65}
          metalness={0.03}
        />
      </RoundedBox>

      {/* Book pages (side view) with realistic paper texture */}
      <mesh position={[-width / 2 - 0.003, height / 2, 0]} castShadow>
        <boxGeometry args={[0.006, height - 0.04, depth - 0.04]} />
        <meshStandardMaterial
          color="#f8f6f0"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Top page edge */}
      <mesh position={[0, height + 0.003, 0]} receiveShadow>
        <boxGeometry args={[width, 0.006, depth - 0.04]} />
        <meshStandardMaterial
          color="#e8e6e0"
          roughness={0.9}
        />
      </mesh>

      {/* Decorative spine details */}
      <mesh position={[0, height - 0.1, depth / 2 + 0.003]}>
        <boxGeometry args={[width - 0.02, 0.01, 0.002]} />
        <meshStandardMaterial
          color={new THREE.Color(bookColor).multiplyScalar(0.5).getHexString()}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.1, depth / 2 + 0.003]}>
        <boxGeometry args={[width - 0.02, 0.01, 0.002]} />
        <meshStandardMaterial
          color={new THREE.Color(bookColor).multiplyScalar(0.5).getHexString()}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Hover glow */}
      {hovered && (
        <>
          <pointLight position={[0, height / 2, depth + 0.2]} intensity={0.5} distance={0.8} color={color} />
          <pointLight position={[0, height / 2, -depth - 0.2]} intensity={0.3} distance={0.6} color={color} />
        </>
      )}
    </group>
  );
}

// 3D Shelf Component
function Shelf3D({ books, yPosition, onBookClick }: { books: Book[]; yPosition: number; onBookClick: (book: Book) => void }) {
  const shelfLength = 8;
  const shelfDepth = 0.4;
  const shelfThickness = 0.05;

  // Enhanced color palette with more variety and contrast
  const BOOK_COLORS = [
    '#8b2500', '#c44536', '#2c5f2d', '#1b4332', '#00303f',
    '#1a1f71', '#5f0f40', '#7b2d26', '#9d5c0d', '#6a040f',
    '#8b4513', '#2b6777', '#003049', '#5f4bb6', '#9a031e',
    '#bc4b51', '#0d3b66', '#774936', '#1e4d2b', '#582f0e',
  ];

  const getBookColor = (bookId: string) => {
    const hash = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return BOOK_COLORS[hash % BOOK_COLORS.length];
  };

  // Position books along the shelf - ensure they stay on shelf
  let currentX = -shelfLength / 2 + 0.4;
  const bookPositions = books.map((book) => {
    const width = 0.15 + (book.totalPages || 300) / 3000;
    const position: [number, number, number] = [currentX + width / 2, yPosition + shelfThickness + 0.01, 0];
    currentX += width + 0.06; // Better spacing
    return { book, position, color: getBookColor(book.id) };
  });

  return (
    <group>
      {/* Shelf surface with wood texture */}
      <RoundedBox args={[shelfLength, shelfThickness, shelfDepth]} radius={0.01} smoothness={4} position={[0, yPosition, 0]} receiveShadow>
        <meshStandardMaterial
          color="#8b7355"
          roughness={0.7}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Wood grain detail lines */}
      <mesh position={[0, yPosition + shelfThickness / 2 + 0.001, 0]} receiveShadow>
        <planeGeometry args={[shelfLength - 0.1, shelfDepth - 0.05]} />
        <meshStandardMaterial
          color="#7a6348"
          roughness={0.8}
          metalness={0.02}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Shelf edge (front) */}
      <mesh position={[0, yPosition - shelfThickness / 2, shelfDepth / 2]} receiveShadow>
        <boxGeometry args={[shelfLength, shelfThickness, 0.01]} />
        <meshStandardMaterial
          color="#6b5d4a"
          roughness={0.75}
          metalness={0.03}
        />
      </mesh>

      {/* Shelf support brackets - more detailed */}
      <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.005} smoothness={4} position={[-shelfLength / 2 + 0.15, yPosition - 0.15, 0]} castShadow>
        <meshStandardMaterial color="#4a3f2f" roughness={0.6} metalness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.005} smoothness={4} position={[shelfLength / 2 - 0.15, yPosition - 0.15, 0]} castShadow>
        <meshStandardMaterial color="#4a3f2f" roughness={0.6} metalness={0.4} />
      </RoundedBox>

      {/* Center support bracket */}
      <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.005} smoothness={4} position={[0, yPosition - 0.15, 0]} castShadow>
        <meshStandardMaterial color="#4a3f2f" roughness={0.6} metalness={0.4} />
      </RoundedBox>

      {/* Books on shelf */}
      {bookPositions.map(({ book, position, color }, index) => (
        <Book3D
          key={book.id}
          book={book}
          position={position}
          color={color}
          onClick={() => onBookClick(book)}
        />
      ))}
    </group>
  );
}

// 3D Scene
function Scene({ books, onBookClick }: { books: Book[]; onBookClick: (book: Book) => void }) {
  // Split books into shelves (max 8 books per shelf)
  const booksPerShelf = 8;
  const shelves = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  // Position shelves vertically
  const shelfSpacing = 1.5;
  const startY = (shelves.length - 1) * shelfSpacing / 2;

  return (
    <>
      {/* Camera - better angle and FOV */}
      <PerspectiveCamera makeDefault position={[0, 2.5, 9]} fov={45} />

      {/* Orbit Controls - optimized */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false}
        minDistance={4}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        target={[0, 1.2, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Enhanced Lighting for better depth and contrast */}
      <ambientLight intensity={0.4} />

      {/* Main directional light - stronger for better visibility */}
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.00005}
      />

      {/* Key fill light - front */}
      <directionalLight
        position={[0, 8, 12]}
        intensity={0.8}
        color="#ffffff"
      />

      {/* Warm accent lights for depth */}
      <pointLight position={[-7, 5, 5]} intensity={0.8} color="#ffcba4" distance={18} decay={2} />
      <pointLight position={[7, 5, 5]} intensity={0.7} color="#ffd7a8" distance={18} decay={2} />

      {/* Back rim light for separation */}
      <pointLight position={[0, 3, -6]} intensity={0.5} color="#e8c5a0" distance={15} decay={2} />

      {/* Top spotlight for drama */}
      <spotLight
        position={[0, 12, 2]}
        angle={0.5}
        penumbra={0.6}
        intensity={0.6}
        color="#fff9f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Environment */}
      <Environment preset="apartment" />

      {/* Back wall with texture */}
      <mesh position={[0, 2, -0.5]} receiveShadow>
        <boxGeometry args={[12, 8, 0.1]} />
        <meshStandardMaterial
          color="#3d3530"
          roughness={0.95}
          metalness={0.01}
        />
      </mesh>

      {/* Floor with subtle reflection */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 10]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.15}
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#2a2520"
          metalness={0.02}
        />
      </mesh>

      {/* Enhanced contact shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={4}
        resolution={512}
        color="#1a1510"
      />

      {/* Shelves with books */}
      {shelves.map((shelfBooks, index) => (
        <Shelf3D
          key={index}
          books={shelfBooks}
          yPosition={startY - index * shelfSpacing}
          onBookClick={onBookClick}
        />
      ))}

      {/* Decorative lamp */}
      <group position={[-4.5, 2, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
          <meshStandardMaterial color="#c9a961" roughness={0.2} metalness={0.7} />
        </mesh>
        <pointLight position={[0, 0.3, 0]} intensity={0.8} distance={3} color="#ffeaa7" />
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffeaa7" emissive="#ffeaa7" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Additional decorative plant */}
      <group position={[4.5, 0, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#8b7355" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#4a6741" roughness={0.8} />
        </mesh>
      </group>
    </>
  );
}

// Helper function
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Main Component
export function Virtual3DBookshelf({ books, onBookClick }: Virtual3DBookshelfProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-32 px-6 rounded-2xl animate-fadeIn shadow-elevation-2" style={{
        background: 'var(--gradient-card)',
        border: '3px dashed var(--border-color)'
      }}>
        <Library className="w-24 h-24 mx-auto mb-8" style={{ color: 'var(--warm-brown)' }} strokeWidth={1.5} />
        <h3 className="text-4xl font-black mb-4" style={{
          color: 'var(--text-dark)',
          fontFamily: 'Playfair Display, serif'
        }}>
          Your 3D Bookshelf Awaits
        </h3>
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>
          Add books to see them in stunning 3D
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-elevation-4"
      style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--border-color)',
        height: '700px',
      }}
    >
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene books={books} onBookClick={onBookClick} />
        </Suspense>
      </Canvas>

      {/* Loading indicator */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-10">
        <div
          className="px-4 py-2 rounded-xl backdrop-blur-xl animate-pulse"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-white animate-spin" strokeWidth={2.5} />
            <span className="text-xs font-bold text-white">Rendering 3D Scene</span>
          </div>
        </div>
      </div>
    </div>
  );
}
