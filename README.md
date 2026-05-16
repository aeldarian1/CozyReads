# 📚 CozyReads

> Your personal sanctuary for managing and cherishing your book collection.

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Site-4CAF50?style=for-the-badge)](https://cozyreads.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-View_Code-181717?style=for-the-badge&logo=github)](https://github.com/aeldarian1/CozyReads)

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.2.1-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)

</div>

---

## ✨ Overview

**CozyReads** is a beautifully crafted personal library management application that brings warmth and organization to your reading journey. Built with modern web technologies, it combines elegant design with powerful features to help you track, organize, and celebrate your book collection.

Whether you're a casual reader or a bibliophile with hundreds of books, CozyReads provides an intuitive and delightful experience for managing your literary adventures.

---

## 🌟 Key Features

### 📖 Core Library Management
- **Smart Book Enrichment**: Automatically fetch high-quality metadata and covers from Hardcover, Google Books, OpenLibrary, and WorldCat.
- **Goodreads Import**: Seamlessly import your entire library from a Goodreads CSV export.
- **Reading Status & Tracking**: Organize books into "Want to Read", "Currently Reading", and "Finished".
- **Ratings & Reviews**: Rate your books (1-5 stars) and write personal reviews.

### 📚 Organization & Analytics
- **Custom Collections**: Create personalized, color-coded shelves with custom emoji icons.
- **Visual Progress Tracking**: Track your reading progress with beautiful circular indicators.
- **Reading Analytics**: View comprehensive statistics, including reading goals, timeline history, and genre distribution.

### 🎨 Beautiful & Accessible UI
- **Cozy Aesthetic**: A warm, meticulously designed UI with a dark/light mode toggle.
- **Power User Features**: Robust keyboard shortcuts (`Ctrl+Z` to undo, `/` to search) and quick-action right-click menus.
- **WCAG 2.1 AA Compliant**: Fully accessible with screen reader support and keyboard navigation.

### 🔐 Secure Authentication
- **Clerk Integration**: Enterprise-grade, secure, and seamless user authentication.

---

## 🛠️ Tech Stack

**Frontend**
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript (100% Strict Mode)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query
- **Animations**: Framer Motion

**Backend & Database**
- **Database**: PostgreSQL (Optimized for Neon)
- **ORM**: Prisma 6
- **Authentication**: Clerk

---

## 🚀 Getting Started

Follow these instructions to set up CozyReads locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Neon](https://neon.tech/) PostgreSQL Database
- A [Clerk](https://clerk.com/) Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aeldarian1/CozyReads.git
   cd CozyReads
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   # Database Connection (Neon)
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."

   # Optional: Google Books API (For enhanced search)
   GOOGLE_BOOKS_API_KEY="your_google_books_api_key"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌍 Deployment

CozyReads is optimized for deployment on **Vercel**. 

1. Push your code to a GitHub repository.
2. Import the project into your Vercel Dashboard.
3. Navigate to **Settings > Environment Variables** and add your `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`.
4. Deploy! Vercel will automatically run `prisma generate && next build`.

---

## 🤝 Contributing

Contributions are always welcome! If you'd like to improve CozyReads, please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use it for personal or commercial projects.

---

<div align="center">
<b>Made with ❤️ and ☕ for book lovers everywhere.</b>
<br />
<i>Happy Reading! 📚</i>
</div>
