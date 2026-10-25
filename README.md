# Turfly---A-turf-booking-platform

**Find your ground. Own your game.**

VIDEO SAMPLE -> [Video Sample](https://drive.google.com/drive/folders/1iTd5ahr444WVg54gasZKbYQvkiIVB9vs)

Turfly is a web-based turf booking platform that helps users discover sports turfs, explore available grounds, and book their next game with ease. It provides user authentication, turf discovery, booking management, and online payment integration through Razorpay.

## ✨ Features

- 🔐 **User Authentication** — Register, log in, and securely access your account.
- 🏟️ **Explore Turfs** — Browse available turfs with details such as location, sport, and hourly pricing.
- 🔎 **Search & Filter** — Search turfs by location and filter them by sport.
- 📋 **Turf Details** — View individual turf information before booking.
- 📅 **Booking Management** — Create bookings and view them in the My Bookings section.
- 💳 **Online Payments** — Razorpay integration for booking payments.
- ❌ **Booking Cancellation** — Cancel eligible bookings through the platform.
- 👤 **User Dashboard** — Access your account and navigate the platform from one place.
- 📱 **Responsive UI** — Designed to provide a clean and user-friendly experience.

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Authentication middleware
- Razorpay payment integration

## 📁 Project Structure

```text
Turf_Book_Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── context/        # Authentication context
│   │   ├── pages/          # Application pages
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── server.js
│   └── package.json
│
└── README.md
```

_The folder structure above is representative; adjust it if your actual project differs._

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas database
- Razorpay test credentials for testing payments

### 1. Clone the Repository

```bash
git clone https://github.com/Priyansh2025/Turfly---A-turf-booking-platform.git
cd Turfly---A-turf-booking-platform
```

### 2. Install Dependencies

Open two terminals from the project root.

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory. Add the environment variables required by your backend.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use the exact variable names expected by your code. Never commit real credentials or secret keys to GitHub.

### 4. Start the Backend

From the `server/` directory:

```bash
npm run dev
```

If your `package.json` doesn't define a `dev` script, use the start command configured for your backend, such as:

```bash
npm start
```

The backend is expected to run at:

```text
http://localhost:5000
```

### 5. Start the Frontend

From the `client/` directory in a second terminal:

```bash
npm run dev
```

Vite will display the local frontend URL, typically:

```text
http://localhost:5173
```

## 🔌 API Routes

The backend mounts the following API route groups:

| Route           | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `/api/auth`     | Authentication                                    |
| `/api/turfs`    | Turf discovery and related operations             |
| `/api/bookings` | Booking management and payment-related operations |
| `/api/health`   | Backend health check                              |

Individual endpoints depend on the route implementations in the project.

## 💳 Payments

Turfly integrates Razorpay to support online booking payments.

For development and testing:

1. Configure Razorpay **test-mode** credentials.
2. Complete payments using Razorpay's supported test flow.
3. Never use live payment credentials in local testing.
4. Verify payment and refund behavior before enabling real payments.

## 🔒 Security Notes

- Keep `.env` files out of version control.
- Never expose JWT secrets or Razorpay secret keys in frontend code.
- Validate booking ownership and payment status on the backend.
- Use HTTPS and appropriate production security settings when deploying.

## 🚀 Future Improvements

Potential improvements include:

- Production deployment and domain configuration.
- Enhanced search and filtering.
- Improved booking availability and expiry handling.
- Comprehensive payment and refund safeguards.
- Automated tests and better error handling.
- Improved mobile responsiveness and accessibility.

## 👨‍💻 Author

**Priyansh Khanna**

GitHub: [Priyansh2025](https://github.com/Priyansh2025)

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to publish the project under an open-source license.

---

_Turfly — Your next game starts here._ ⚽
