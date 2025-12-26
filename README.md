# 📚 CozyReads

> Your personal sanctuary for managing and cherishing your book collection

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.2.1-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

---

## ✨ Overview

**CozyReads** is a beautifully crafted personal library management application that brings warmth and organization to your reading journey. Built with modern web technologies, it combines elegant design with powerful features to help you track, organize, and celebrate your book collection.

Whether you're a casual reader or a bibliophile with hundreds of books, CozyReads provides an intuitive and delightful experience for managing your literary adventures.

---

## 🌟 Features

### 📖 **Core Library Management**
- **Add Books Manually** - Enter book details by hand with a beautiful, intuitive form
- **Google Books Integration** - Search and auto-fill book information from Google Books API
- **Rich Book Details** - Track title, author, ISBN, genre, description, cover images, and more
- **Reading Status** - Organize books into "Want to Read", "Currently Reading", and "Finished"
- **Star Ratings** - Rate your books from 1 to 5 stars with an elegant rating interface
- **Personal Reviews** - Write and save your thoughts about each book

### 📚 **Collections & Organization**
- **Custom Collections** - Create personalized shelves to organize your books
- **Collection Icons & Colors** - Choose from 15 emoji icons and 10 beautiful colors
- **Multi-Collection Support** - Add books to multiple collections simultaneously
- **Collection Badges** - Visual badges on book cards showing which collections they belong to
- **Filter by Collection** - Quickly find all books in a specific collection

### 📊 **Reading Progress & Analytics**
- **Progress Tracking** - Track current page and total pages for books you're reading
- **Visual Progress Rings** - Beautiful circular progress indicators on book cards
- **Reading Goals** - Set and track annual reading goals
- **Statistics Dashboard** - View comprehensive stats about your reading habits
- **Analytics Charts** - Beautiful visualizations of books by status, genre, and rating
- **Reading Timeline** - Track when you added and finished books

### 🔍 **Advanced Search & Filtering**
- **Fuzzy Search** - Typo-tolerant search powered by Fuse.js
- **Multi-Field Search** - Search across title, author, genre, description, and reviews
- **Advanced Filters**:
  - Rating range slider
  - Page count range
  - Date added range
  - Date finished range
  - Reading status
  - Genre filter
  - Collection filter
- **Multiple Sort Options** - Sort by date added, title, author, rating, or date finished

### 🎨 **Beautiful User Experience**
- **Cozy Aesthetic** - Warm color palette with brown, amber, and cream tones
- **Dark/Light Mode** - Toggle between themes with smooth transitions
- **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- **Smooth Animations** - Delightful hover effects, transitions, and micro-interactions
- **Book Card Grid** - Equal-height cards with rich visual information
- **Quick Actions Menu** - Right-click any book for instant status/rating updates
- **Modal Interfaces** - Elegant modals for viewing and editing books

### ⚡ **Power User Features**
- **Right-Click Menu** - Quick access to edit, delete, and update book status
- **Keyboard Shortcuts** - Fast navigation and actions
- **Bulk Operations** - Manage multiple books efficiently
- **Data Persistence** - All data stored locally with SQLite via Prisma
- **Fast Performance** - Optimized with Next.js 16 and Turbopack

---

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 16.1.1](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19.2.3](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search library
- **[Recharts](https://recharts.org/)** - Beautiful analytics charts

### **Backend & Database**
- **[Prisma 6.2.1](https://www.prisma.io/)** - Next-generation ORM
- **SQLite** - Lightweight, serverless database
- **Next.js API Routes** - RESTful API endpoints

### **External APIs**
- **Google Books API** - Fetch book information and cover images

---

## 📦 Installation

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn package manager

### **Setup Steps**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd virtual-library-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   GOOGLE_BOOKS_API_KEY="your_google_books_api_key_here"
   ```

   > Get a free Google Books API key from [Google Cloud Console](https://console.cloud.google.com/)

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🚀 Usage

### **Adding Your First Book**

1. Click the **"📚 Add New Book"** button in the navigation bar
2. Either:
   - **Search Google Books** - Type a book title/ISBN and select from results
   - **Fill manually** - Enter book details yourself
3. Set reading status, rating, and add to collections
4. Click **"Save Book"**

### **Creating Collections**

1. Scroll to the **"📚 My Collections"** section
2. Click **"+ New Collection"**
3. Choose a name, icon, color, and optional description
4. Use collections to organize your books into custom shelves

### **Tracking Reading Progress**

1. When adding/editing a "Currently Reading" book
2. Enter your **current page** and **total pages**
3. See beautiful progress indicators on the book card

### **Advanced Search**

1. Click the **"🔍 Advanced Search"** section to expand
2. Use text search with typo tolerance
3. Apply multiple filters simultaneously
4. Sort results by your preferred criteria

### **Quick Actions**

- **Right-click any book card** for quick status/rating updates
- **Click a book card** to view full details
- **Use keyboard shortcuts** for faster navigation

---

## 📁 Project Structure

```
virtual-library-next/
├── app/
│   ├── api/
│   │   ├── books/           # Book CRUD endpoints
│   │   ├── collections/     # Collection CRUD endpoints
│   │   └── search-books/    # Google Books API integration
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout with theme provider
├── components/
│   ├── AddBookModal.tsx     # Book creation/editing modal
│   ├── AdvancedSearch.tsx   # Search and filter interface
│   ├── Analytics.tsx        # Reading analytics dashboard
│   ├── BookCard.tsx         # Individual book card component
│   ├── BookGrid.tsx         # Grid layout for books
│   ├── CollectionsManager.tsx  # Collection management
│   ├── QuickEditMenu.tsx    # Right-click context menu
│   ├── ReadingGoal.tsx      # Annual reading goal tracker
│   ├── StatsCards.tsx       # Statistics overview cards
│   └── ViewBookModal.tsx    # Book details modal
├── contexts/
│   └── ThemeContext.tsx     # Dark/Light mode context
├── lib/
│   └── prisma.ts            # Prisma client instance
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── dev.db              # SQLite database (generated)
├── public/                  # Static assets
├── styles/
│   └── globals.css          # Global styles and CSS variables
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎨 Design Philosophy

CozyReads embraces a **warm, inviting aesthetic** inspired by cozy reading nooks and traditional libraries:

- **Color Palette**: Warm browns (#8b6f47), soft ambers (#d4a574), and creamy backgrounds (#fdf8f3)
- **Typography**: Playfair Display for elegant headings, system fonts for readability
- **Shadows & Depth**: Layered shadows create tactile, paper-like depth
- **Smooth Animations**: Gentle transitions make interactions feel natural
- **Visual Hierarchy**: Clear information architecture guides the eye

The design balances **modern UI patterns** with **timeless book aesthetics** to create an experience that feels both contemporary and comforting.

---

## 🗃️ Database Schema

### **Book**
```prisma
model Book {
  id             String   @id @default(uuid())
  title          String
  author         String
  isbn           String?
  genre          String?
  description    String?
  coverUrl       String?
  readingStatus  String   @default("Want to Read")
  rating         Int      @default(0)
  review         String?
  currentPage    Int?
  totalPages     Int?
  dateAdded      DateTime @default(now())
  dateFinished   DateTime?
  collections    BookCollection[]
}
```

### **Collection**
```prisma
model Collection {
  id          String   @id @default(uuid())
  name        String
  description String?
  color       String   @default("#8b6f47")
  icon        String   @default("📚")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  books       BookCollection[]
}
```

### **BookCollection** (Many-to-Many Junction)
```prisma
model BookCollection {
  id           String     @id @default(uuid())
  bookId       String
  collectionId String
  addedAt      DateTime   @default(now())
  book         Book       @relation(fields: [bookId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
}
```

---

## 🔮 Future Enhancements

- **📱 Mobile App** - Native iOS/Android apps
- **☁️ Cloud Sync** - Sync library across devices
- **👥 Social Features** - Share recommendations with friends
- **📈 Enhanced Analytics** - More reading insights and trends
- **🎯 Smart Recommendations** - AI-powered book suggestions
- **📖 Reading Challenges** - Community reading challenges
- **🔗 Goodreads Integration** - Import from Goodreads
- **🎧 Audiobook Support** - Track audiobook progress
- **📝 Quotes Collection** - Save favorite quotes from books
- **🏷️ Custom Tags** - Additional organizational flexibility

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? Please [open an issue](../../issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License** - feel free to use it for personal or commercial projects.

---

## 🙏 Acknowledgments

- **Google Books API** for providing book information
- **Playfair Display** and system fonts for beautiful typography
- **Next.js team** for an amazing framework
- **Prisma team** for excellent database tooling
- **Vercel** for deployment platform
- All the amazing open-source libraries that made this possible

---

## 💝 Support

If you find CozyReads helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with fellow book lovers

---

<div align="center">

**Made with ❤️ and ☕ for book lovers everywhere**

*Happy Reading! 📚*

</div>
