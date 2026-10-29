🌾 Fair Harvest

Fair Harvest is a farmer-to-buyer marketplace designed to help farmers connect directly with buyers. The platform aims to simplify agricultural product listings, improve market accessibility, and make the buying and selling process easier.

📌 Features

- Farmer Dashboard: Provides a dedicated interface for farmers.
- Buyer Dashboard: Allows buyers to access the marketplace.
- Marketplace: Displays agricultural products and listings.
- Product Listings: Supports organizing and managing marketplace listings.
- AI Features: Includes a dedicated module for AI-related functionality.
- Village Pools: Includes a module for village-related pooling functionality.
- Database Integration: Includes Supabase configuration and database-related server modules.
- Role Switching: Supports switching between Farmer and Buyer interfaces.

🛠️ Technologies Used

- HTML5
- JavaScript
- Node.js
- Supabase
- CSS3

📁 Project Structure

Fair-Harvest/
│
├── .vscode/
│   └── settings.json
│
├── js/
│   ├── ai-features.js
│   ├── app.js
│   ├── buyer.js
│   ├── listings.js
│   ├── seed-data.js
│   ├── server.js
│   ├── supabase-config.js
│   └── villagePools.js
│
├── src/
│   ├── lib/
│   ├── routes/
│   ├── server.js
│   └── test-db.js
│
├── buyer-account.html
├── farmer.html
├── home.html
├── index.html
├── marketplace.html
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tatus

🚀 Getting Started

Follow these steps to run the project locally.

1. Clone the Repository

git clone <your-repository-url>

2. Navigate to the Project Directory

cd Fair-Harvest

3. Install Dependencies

Make sure Node.js and npm are installed on your system.

npm install

4. Configure Environment Variables

If your project uses Supabase or other external services, configure the required credentials using environment variables.

Never commit secret keys or sensitive credentials to a public repository.

5. Start the Application

Check the "scripts" section in "package.json" to identify the correct start command.

For example, if the project defines a "start" script, run:

npm start

Otherwise, use the command configured in your project.

6. Open the Application

If the project serves HTML pages directly, open "index.html" or "home.html" in your browser, or access the local URL displayed by your running server.

📄 Main Files

File| Purpose
"index.html"| Main entry page
"home.html"| Home page and role selection
"farmer.html"| Farmer interface
"buyer-account.html"| Buyer account interface
"marketplace.html"| Marketplace interface
"js/app.js"| Main application logic
"js/buyer.js"| Buyer-related functionality
"js/listings.js"| Product listing functionality
"js/ai-features.js"| AI-related functionality
"js/supabase-config.js"| Supabase configuration
"js/villagePools.js"| Village pooling functionality
"src/routes/"| Server route modules
"src/lib/"| Shared server-side utilities
"src/test-db.js"| Database testing module

🎯 Project Objective

The objective of Fair Harvest is to create a convenient digital marketplace that connects farmers and buyers, supports agricultural product discovery, and provides a foundation for technology-driven agricultural services.

🔮 Future Enhancements

- Secure user authentication and role-based access.
- Real-time product availability and price updates.
- Improved farmer and buyer dashboards.
- Secure online payments.
- Order tracking and purchase history.
- Enhanced AI-powered agricultural insights.
- Improved mobile responsiveness.

🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit and push your changes.
5. Open a pull request.

📜 License

A license has not yet been specified. Add an appropriate license file before distributing the project publicly.

---

Fair Harvest — Connecting Farmers and Buyers for a Better Agricultural Marketplace. 🌱
