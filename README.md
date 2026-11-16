# The Cozy Corner

A full-stack café website for **The Cozy Corner**, a café near Indravati hostel, IIT Bhilai. Customers can browse the menu, place pickup orders, reserve a table and send messages to the café. Staff manage everything from a password-protected admin page.

**Live demo:** https://thecozycorner.onrender.com
**Admin page:** https://thecozycorner.onrender.com/admin.html

## Features

### Customer site
- Menu loaded from the database, with category filters (Coffee, Desserts, Indian food, Meals, Snacks, Tea)
- "Today's special" banner, controlled from the admin page
- Order cart with quantity controls and pickup order placement
- Table reservation form with date, time and number of guests
- Contact form ("Send us a note")
- Embedded Google Map, address and opening hours
- Responsive design for phones and laptops

### Admin page (staff only)
- **Password login:** the password is stored on the server, never in the page code
- **Orders:** newest open orders first, with the customer, items, note and total. Staff set the status to new, preparing, ready, completed or cancelled. A badge on the Orders tab and in the browser tab title shows how many new orders are waiting, and the list refreshes every 20 seconds
- **Reservations:** confirm or cancel each booking
- **Messages:** read the notes sent through the contact form
- **Menu:** add items, edit name, category, price and description, mark an item sold out or show it again, and delete items
- **Today's special:** edit or clear the banner text shown on the menu section

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, hosted on Supabase
- **Hosting:** Render

## Project Structure

```
TheCozyCorner/
├── docs/
│   └── schemas.md          # Documentation (data model)
├── public/                 # Frontend files
│   ├── index.html          # Customer site
│   ├── style.css
│   ├── app.js
│   ├── admin.html          # Admin page
│   ├── admin.css
│   ├── admin.js
│   ├── favicon.svg     # Logo
│   └── images/
│       └── cafe.jpg        # Café photo
├── db.js                   # Database connection and queries
├── server.js               # Express server and API routes
├── package.json
└── .env                    # Secret settings (not uploaded to GitHub)
```

## How to Run the Project

### 1. Requirements

- [Node.js](https://nodejs.org/) version 18 or newer (npm comes with it)
- [Git](https://git-scm.com/)
- Access to the project database (see step 4)

### 2. Download the code

```bash
git clone https://github.com/sonalisingh24/TheCozyCorner.git
cd TheCozyCorner
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the `.env` file

Create a file named `.env` in the project root, next to `server.js`, and add:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
ADMIN_TOKEN=choose-a-long-admin-password
PORT=3000
```

- Replace the `DATABASE_URL` value with the real connection string. In the Supabase dashboard, click **Connect** and copy the **Session pooler** string.
- `ADMIN_TOKEN` is the password for the admin page. Choose any long password. If it is missing, nobody can log in to the admin page.

The `.env` file holds private credentials, so it is not included in the repository. Ask the project owners for the values.

### 5. Start the server

```bash
node server.js
```

The terminal should show that the server is running. The database tables and a starter menu are created automatically on first start.

### 6. Open the website

- Customer site: **http://localhost:3000**
- Admin page: **http://localhost:3000/admin.html** (log in with your `ADMIN_TOKEN` password)

## Using the Admin Page

1. Open `/admin.html` and enter the admin password.
2. Use the tabs: **Orders**, **Reservations**, **Messages**, **Menu** and **Today's special**.
3. Changes appear on the customer site straight away. For example, an item marked sold out disappears from the menu.

There is no link to the admin page on the public site. Staff open it by its address.

## API Endpoints

### Public

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/api/menu` | Get all available menu items |
| GET | `/api/special` | Get today's special text |
| POST | `/api/orders` | Place a pickup order |
| POST | `/api/reservations` | Request a table reservation |
| POST | `/api/contact` | Send a contact message |

### Admin

These routes need the header `x-admin-token` with the admin password. Without it they return `401 Unauthorized`.

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/api/admin/check` | Check the password |
| GET | `/api/admin/data` | Get all menu items, orders, reservations and messages |
| POST | `/api/admin/menu` | Add a menu item |
| PATCH | `/api/admin/menu/:id` | Edit a menu item or mark it sold out |
| DELETE | `/api/admin/menu/:id` | Delete a menu item |
| PATCH | `/api/admin/orders/:id` | Change an order's status |
| PATCH | `/api/admin/reservations/:id` | Confirm or cancel a reservation |
| PUT | `/api/admin/special` | Change today's special |

## Troubleshooting

- **"Could not connect to the database":** check that `.env` exists in the project root and its values are correct.
- **`ENETUNREACH` or an address starting with `2406:` on Render:** you used the Supabase *Direct connection* string. Use the **Session pooler** string instead, which works over IPv4.
- **Database errors on a free Supabase project:** free projects pause after a period of inactivity. Open the Supabase dashboard and click **Restore project**, then restart the server.
- **"Address already in use":** another program is using port 3000. Close it, or change `PORT` in `.env`.
- **Menu says "Couldn't load the menu":** the server is not running or the database is not connected.
- **Admin page says "Wrong password":** check that `ADMIN_TOKEN` is set in `.env` (or in Render's Environment settings on the live site), then restart the server.
- **An item can't be deleted:** items that appear in past orders can't be removed. Use **Mark sold out** instead.
- **Live site is slow on first load:** the free Render server sleeps when idle. Wait about a minute and refresh.

## Team

- Sonali Singh ([@sonalisingh24](https://github.com/sonalisingh24))
- Harshita Arimakala ([@HarshitaArimakala](https://github.com/HarshitaArimakala))
- Vaishnavi ([@vaishnavigeggelapally093](https://github.com/vaishnavigeggelapally093))

IIT Bhilai