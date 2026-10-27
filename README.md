# SRMS Frontend: Smart Restaurant Management System

SODV2201 Web Programming, Assignment 1 (also the frontend half of the Final Project).

A React web app for a restaurant ("Dunbi & Temi"). Customers can browse the menu, order for pickup or delivery, book tables, request special events and chat with a simulated AI assistant. An admin dashboard lets staff manage the menu, orders, reservations and events. The data comes from the **srms-backend** API.

- **Live site:** https://srms-frontend-six.vercel.app
- **Backend repo:** https://github.com/quadrikuku20-cpu/srms-backend
- **Live API:** https://srms-backend-ampl.onrender.com

> The backend runs on a free Render instance that sleeps after about 15 minutes without traffic. If the menu looks empty or login seems stuck, open https://srms-backend-ampl.onrender.com/api/health, wait for `{"status":"ok"}` (up to a minute), then reload the site.

## Tech stack

- React (created with Vite) using function components and hooks
- React Router for page navigation
- Axios for API calls
- React Context for login and shopping cart state
- Plain CSS with design variables (no CSS framework)

## Run it locally

The backend must be running first, because every page that shows data calls it. Follow the setup in the **srms-backend** README, then:

```bash
git clone https://github.com/quadrikuku20-cpu/srms-frontend.git
cd srms-frontend
npm install
```

Create a file named `.env` in this folder (see `.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

Then start the app:

```bash
npm run dev
```

Open http://localhost:5173. If you change `.env`, restart the dev server. Other scripts: `npm run build` creates a production build and `npm run preview` serves it.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@srms.local | admin123 |
| Customer | customer@srms.local | customer123 |

You can also create a new customer account on the Register page.

## Features and pages

| Page | Route | Who can open it |
|---|---|---|
| Home | `/` | Anyone |
| Menu (category tabs, search, dietary filter, add to cart) | `/menu` | Anyone |
| Log in / Register | `/login`, `/register` | Anyone |
| Cart and checkout (pickup or delivery, simulated payment) | `/checkout` | Anyone to build a cart, login required to place the order |
| My Orders (history and status) | `/orders` | Logged-in users |
| Reservations (book, view, cancel) | `/reservations` | Logged-in users |
| Special events (birthday, corporate and more) | `/events` | Logged-in users |
| Admin dashboard: menu add, edit and delete; order status; reservation and event approval | `/admin` | Admin only |

The **AI assistant** is the round button at the bottom right of every page. It sends the question to the backend, which matches it against a keyword dataset and replies. It answers questions about specials, dietary options, recommendations, opening hours and reservations, and it can recall a logged-in customer's last order.

## React concepts used

- **Components and props:** for example `MenuItemCard` receives a dish as a prop.
- **State and effects:** `useState` for forms, filters and lists; `useEffect` to load data when a page opens or a filter changes.
- **Conditional rendering:** the nav bar, admin tabs, error messages and order confirmation change with login state and data.
- **List rendering:** `.map()` with keys for menu items, cart lines, orders, reservations and tables.
- **Forms:** controlled inputs with submit handling and error and loading states.
- **Routing:** React Router routes, plus a `ProtectedRoute` component that redirects visitors who are not logged in (or not admins).
- **Context:** `AuthContext` keeps the logged-in user and token; `CartContext` keeps the cart.
- **API layer:** a single Axios instance (`src/api/api.js`) that adds the login token to every request.

## Project structure

```
src/
  api/api.js               Axios instance with the token interceptor
  context/                 AuthContext.jsx, CartContext.jsx
  components/              NavBar, MenuItemCard, Chatbot, ProtectedRoute
  pages/                   Home, Menu, Login, Register, Checkout, OrderHistory,
                           Reservations, Events
  pages/admin/             AdminDashboard, AdminMenu, AdminOrders, AdminReservations
  App.jsx                  routes
  main.jsx                 app entry (router and providers)
  index.css                design variables and all styles
vercel.json                makes page refreshes work on the live site
.env.example               template for VITE_API_URL
```

## Deployment

The site is deployed on Vercel from this repo. `VITE_API_URL` is set in Vercel's environment variables to the live backend address (ending in `/api`) and is built into the app at deploy time. `vercel.json` rewrites all paths to `index.html` so that refreshing a page such as `/admin` does not show a 404. The backend's `CLIENT_ORIGIN` setting must match this site's address.

## References

This assignment was completed with the use of class resources, online resources, YouTube videos, and AI assistance.

Anthropic. (2026, September 22). *Assignment 1* [Generative AI chat]. Claude Sonnet 5. https://claude.ai/share/882e157b-528c-4b3e-9d49-9fa5c5e2e4a4
