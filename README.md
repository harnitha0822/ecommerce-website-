# E-Commerce CRUD Application

A simple, beginner-friendly **E-Commerce CRUD Administration Dashboard** built using **Node.js, Express.js, MongoDB, and Mongoose**. This project is designed specifically as a college laboratory assessment or mini-project. It covers basic database relationships (Referencing) and provides full Create, Read, Update, and Delete operations for Users, Products, and Orders.

---

## Features

- **Users Management**: Create, view, edit, and delete user accounts.
- **Products Inventory**: Manage product names, prices, and stock counts.
- **Orders Flow**: Place orders linking users and products with quantity validation.
- **Stock Validation & Deduction**:
  - Automatically checks if requested items have sufficient stock before placing an order.
  - Automatically deducts inventory when an order is created.
  - replenishment: Automatically refunds items back to product stock if an order is cancelled/deleted.
- **SPA Frontend**: Single Page Application built in native vanilla JS with Fetch APIs (no page reloads).

---

## Folder Structure

```text
Ecommerce/
│
├── server.js            # Main entry point (express server & DB link)
├── package.json         # Node metadata and dependencies
├── .env                 # Port & Database credentials
│
├── config/
│   └── db.js            # Mongoose DB connection logic
│
├── models/
│   ├── User.js          # User schema (name, email)
│   ├── Product.js       # Product schema (name, price, stock)
│   └── Order.js         # Order schema (userId, productId, quantity)
│
├── routes/
│   ├── userRoutes.js    # User CRUD routes & controllers
│   ├── productRoutes.js # Product CRUD routes & controllers
│   └── orderRoutes.js   # Order CRUD routes & controllers
│
├── public/              # Static Frontend Web UI files
│   ├── index.html       # Dashboard layout
│   ├── style.css        # Clean CSS card dashboard styling
│   └── script.js        # Dynamic Fetch API integrations
│
└── README.md            # Project documentation & Lab notes
```

---

## Technologies Used

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Local instance)
- **Object Data Modeling (ODM)**: Mongoose
- **Environment Variables Manager**: dotenv
- **Cross-Origin Requests**: cors

---

## Installation & Setup

### 1. Prerequisites
- **Node.js** (v14+) installed.
- **MongoDB Community Server** running locally on your computer.

### 2. Connect Your Local Database
By default, the application is configured to connect to your local MongoDB server at:
`mongodb://127.0.0.1:27017/ecommerce`

Ensure MongoDB service is running on your machine.
- On Windows: Start it through **Services.msc** (look for `MongoDB Server`) or run `mongod` in Command Prompt.
- On Mac: Run `brew services start mongodb-community`.

### 3. Install Dependencies
Open your terminal in the `Ecommerce/` directory and install the packages listed in `package.json`:
```bash
npm install
```

---

## How to Run

1. Start the application server:
   ```bash
   node server.js
   ```
2. Open your web browser and navigate to:
   [http://localhost:5000](http://localhost:5000)

---

## CRUD API Reference

All requests and responses use **JSON** format.

### Users Endpoints (`/users`)
- `GET /users` - Retrieve all users. (Status: `200 OK`)
- `GET /users/:id` - Retrieve a user by ID. (Status: `200 OK` or `404 Not Found`)
- `POST /users` - Create a new user. (Status: `201 Created` or `400 Bad Request`)
  - *Payload*: `{ "name": "John Doe", "email": "john@example.com" }`
- `PUT /users/:id` - Update user details. (Status: `200 OK` or `404 Not Found`)
- `DELETE /users/:id` - Delete user by ID. (Status: `200 OK` or `404 Not Found`)

### Products Endpoints (`/products`)
- `GET /products` - Retrieve inventory list.
- `POST /products` - Add new product.
  - *Payload*: `{ "name": "Mechanical Keyboard", "price": 89.99, "stock": 50 }`
- `PUT /products/:id` - Update price or stock quantity.
- `DELETE /products/:id` - Delete product.

### Orders Endpoints (`/orders`)
- `GET /orders` - Fetch all orders (automatically populates User & Product info).
- `POST /orders` - Place order (performs stock deduction).
  - *Payload*: `{ "userId": "user_id_here", "productId": "product_id_here", "quantity": 2 }`
- `PUT /orders/:id` - Update quantity or product (adjusts stock levels).
- `DELETE /orders/:id` - Cancel order (refunds stock quantity back to inventory).

---

## College Viva Assessment Study Guide

Here are standard questions examiners ask during practical evaluations (vivas) and how to explain them:

1. **What is Mongoose?**
   - *Answer*: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and database documents.
2. **What does Mongoose's `.populate()` do in the Orders route?**
   - *Answer*: In MongoDB, data is stored in separate collections. The Order document only stores the `_id` of the User and Product. `.populate('userId')` acts like a SQL JOIN, fetching the actual User and Product records and embedding them dynamically inside the output JSON.
3. **What is the purpose of `dotenv` and the `.env` file?**
   - *Answer*: It separates configuration data (like secrets, ports, and database credentials) from source code. This is a security best practice, preventing API keys or local db paths from being uploaded to repositories.
4. **How does the stock deduction workflow function?**
   - *Answer*: In `orderRoutes.js` under `POST /orders`, we query the product by `productId`. We check if `product.stock >= quantity`. If it is, we subtract the quantity from `product.stock`, call `product.save()`, and then write the order document to the database. If there is not enough stock, we return a `400 Bad Request` block.
5. **What is CORS?**
   - *Answer*: Cross-Origin Resource Sharing. It is a security feature that controls how web browsers allow script-based network requests (like fetch) to call API servers hosted on different domains/ports.
