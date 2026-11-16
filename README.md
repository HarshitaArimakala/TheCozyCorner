# The Cozy Corner

A full-stack café website for **The Cozy Corner**, a café near Indravati hostel, IIT Bhilai. Customers can browse the menu, place pickup orders, reserve a table and send messages to the café.

**Live demo:** https://hearth-and-bean.onrender.com

> The repository is named `Hearth-and-Bean`, which was the project's original name. The website is branded as **The Cozy Corner**.

## Features

- Menu loaded from the database, with category filters (Coffee, Desserts, Indian food, Meals, Snacks, Tea)
- "Today's special" banner
- Order cart with quantity controls and pickup order placement
- Table reservation form with date, time and number of guests
- Contact form ("Send us a note")
- Embedded Google Map, address and opening hours
- Responsive design for phones and laptops

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, hosted on Supabase
- **Hosting:** Render

## Project Structure

```
Hearth-and-Bean/
├── docs/
│   └── schemas.md          # Documentation (data model)
├── public/                 # Frontend files
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── favicon/
│   │   └── favicon.svg     # Logo
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
git clone https://github.com/sonalisingh24/Hearth-and-Bean.git
cd Hearth-and-Bean
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the `.env` file

Create a file named `.env` in the project root, next to `server.js`, and add:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
PORT=3000
```

Replace the `DATABASE_URL` value with the real connection string. In the Supabase dashboard, find it under **Project Settings → Database → Connection string**.

The `.env` file holds private credentials, so it is not included in the repository. Ask the project owners for the values.

### 5. Start the server

```bash
node server.js
```

The terminal should show that the database connected and the server is running. The database tables are created automatically when the server starts.

### 6. Open the website

Go to **http://localhost:3000** in your browser.

## API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/api/menu` | Get all menu items |
| POST | `/api/orders` | Place a pickup order |
| POST | `/api/reservations` | Request a table reservation |
| POST | `/api/contact` | Send a contact message |

## Troubleshooting

- **"Could not connect to the database":** check that `.env` exists in the project root and its values are correct.
- **Database errors on a free Supabase project:** free projects pause after a period of inactivity. Open the Supabase dashboard and click **Restore project**, then restart the server.
- **"Address already in use":** another program is using port 3000. Close it, or change `PORT` in `.env`.
- **Menu says "Couldn't load the menu":** the server is not running or the database is not connected.
- **Live site is slow on first load:** the free Render server sleeps when idle. Wait about a minute and refresh.

## Team

- Sonali Singh ([@sonalisingh24](https://github.com/sonalisingh24))
- Harshita Arimakala ([@HarshitaArimakala](https://github.com/HarshitaArimakala))
- Vaishnavi ([@vaishnavigeggelapally093](https://github.com/vaishnavigeggelapally093))

IIT Bhilai