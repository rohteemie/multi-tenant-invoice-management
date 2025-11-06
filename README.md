# Multi-Tenant Invoice Management - Frontend

A modern, feature-rich React-powered multi-tenant SaaS frontend for Invoice Management, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Multi-Tenant Architecture**: Secure tenant isolation with role-based access control
- **Complete Invoice Management**: Create, view, update, and manage invoices with ease
- **Invoice Email Delivery**: Send invoices directly to customers via email
- **PDF Export**: Download invoices as professional PDF documents
- **Real-time Analytics**: Dashboard with comprehensive metrics and revenue tracking
- **User Management**: Manage users with different roles (Owner, Admin, Manager, Attendant)
- **Export Functionality**: Export invoices in CSV and JSON formats
- **Status Management**: Update invoice status from draft to sent/paid with dropdown options
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type-Safe**: Built with TypeScript for enhanced developer experience
- **State Management**: Zustand for efficient global state management
- **Modern Stack**: React 19, Vite, React Router, Axios

## 📋 Prerequisites

- Node.js 18+ and npm
- Access to the backend API (see [Backend Repository](https://github.com/rohteemie/multi-tenant-saas-backend))

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/rohteemie/multi-tenant-invoice-management.git
cd multi-tenant-invoice-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

For production, use the live backend:

```env
VITE_API_BASE_URL=http://3.86.89.25:8000/api/v1
```

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Loading, etc.)
│   └── layout/         # Layout components (Navbar, ProtectedRoute)
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── InvoiceListPage.tsx
│   ├── InvoiceCreatePage.tsx
│   ├── InvoiceDetailPage.tsx
│   └── UsersPage.tsx
├── services/           # API service layer
│   ├── api.ts          # Axios client configuration
│   ├── authService.ts  # Authentication services
│   ├── invoiceService.ts
│   ├── userService.ts
│   ├── tenantService.ts
│   └── analyticsService.ts
├── store/              # Zustand state management
│   ├── authStore.ts    # Authentication state
│   └── invoiceStore.ts # Invoice state
├── types/              # TypeScript type definitions
│   ├── user.ts
│   ├── tenant.ts
│   ├── invoice.ts
│   ├── analytics.ts
│   └── auth.ts
├── test/               # Test files
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## 📚 Usage Guide

### Getting Started

1. **Register a New Organization**
   - Navigate to `/register`
   - Fill in your organization details and owner account information
   - Submit to create your tenant and owner account

2. **Login**
   - Navigate to `/login`
   - Enter your email and password
   - You'll be redirected to the dashboard

3. **Dashboard**
   - View invoice summary statistics
   - See total revenue, pending amounts, and overdue invoices
   - Quick access to create invoices and manage users

4. **Create an Invoice**
   - Click "Create Invoice" from the dashboard or navigation
   - Fill in customer information
   - Add line items with descriptions, quantities, and prices
   - Submit to create the invoice

5. **Manage Invoices**
   - View all invoices with filtering options
   - Update invoice status (Draft → Sent → Paid)
   - Export invoices in CSV or JSON format
   - View detailed invoice information

6. **User Management**
   - View all users in your organization
   - See user roles and status

## 🎨 Key Features

### Authentication & Authorization

- JWT-based authentication with automatic token refresh
- Secure route protection
- Role-based access control (RBAC)
- Multi-tenant isolation

### Invoice Management

- Create invoices with multiple line items
- Update draft invoices
- Track invoice lifecycle: Draft → Sent → Paid → Overdue
- Add customer details and payment information
- Calculate totals automatically
- **Send invoices to customers via email**
- **Download invoices as PDF**
- **Update invoice status with dropdown selection**
- **Mark invoices as paid with payment method tracking**

### Analytics Dashboard

- Total invoices count
- Revenue tracking by status
- Pending and overdue amounts
- Visual status breakdown

### Export Functionality

- Export invoices to CSV
- Export invoices to JSON
- **Download individual invoices as PDF**
- Filter exports by status

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Deployment

The application can be deployed to any static hosting service:

**Vercel** (Recommended)
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` | Yes |

## 🧪 Testing

The project includes a comprehensive test suite using Vitest and React Testing Library.

### Running Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:coverage
```

## 🎯 API Integration

This frontend integrates with the [Multi-Tenant SaaS Backend](https://github.com/rohteemie/multi-tenant-saas-backend).

### Key Endpoints Used

- **Authentication**: Login, Register, Token Refresh
- **Tenants**: Register, List, Details
- **Invoices**: CRUD operations, Status updates, Export
- **Analytics**: Summary, Revenue by status
- **Users**: List, Details, Current user

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Rotimi Owolabi**

- Twitter: [@rohteemie](https://twitter.com/rohteemie)
- LinkedIn: [Rotimi Owolabi](https://www.linkedin.com/in/rotimijournal/)
- GitHub: [@rohteemie](https://github.com/rohteemie)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Backend by [FastAPI Multi-Tenant SaaS](https://github.com/rohteemie/multi-tenant-saas-backend)

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
