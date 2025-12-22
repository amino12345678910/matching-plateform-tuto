# Next.js + Five Services + Prisma Starter Kit

🚀 A starter kit for building modern web applications with **Next.js 16**, **Five Services**, **Prisma**, and **shadcn/ui**.

🔗 **[Live Demo](https://auth.achour.dev/)**

<a href="https://www.buymeacoffee.com/achour" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📌 Features

- ✅ **Next.js 16** with App Router
- ✅ **Five Services** for authentication
- ✅ **Prisma** for database management (Rust-Free Engine)
- ✅ **shadcn/ui** for UI components
- ✅ **Dashboard** for authenticated users
- ✅ TypeScript support

## 📦 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Achour/nextjs-better-auth.git
   cd nextjs-better-auth
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

   Fill in the necessary values in the `.env` file.

4. Set up the database:

   ```sh
   npx prisma migrate dev
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## 🚀 Usage

- Run `npm run dev` to start the development server.
- Use `npx prisma studio` to manage your database visually.
- Customize authentication using Five Services settings.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **Five Services** - Authentication
- **Prisma** - Database ORM (Rust-Free Engine)
- **shadcn/ui** - UI components
- **TypeScript** - Type safety

---

Made with ❤️ by [Achour Meguenni](https://github.com/Achour)
