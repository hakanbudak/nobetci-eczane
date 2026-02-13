# Nöbetçi Eczane (Duty Pharmacy) App

A modern, mobile-first web application to find duty pharmacies in Turkey. It detects your location to show the nearest open pharmacies or allows you to search by city and district.

## Purpose

The goal is to provide a fast, user-friendly way for people to find emergency pharmacies during off-hours. It features:
- **Automatic Location Detection**: Finds the nearest city and pharmacies based on your GPS location.
- **Smart Sorting**: Lists pharmacies by distance from your current location.
- **Interactive Map**: Displays pharmacies on a map with street-level zoom.
- **City & District Search**: Allows manual search across all 81 provinces of Turkey.

## Technologies Used

- **Vue 3**: The progressive JavaScript framework.
- **Vite**: Next generation frontend tooling.
- **Tailwind CSS v4**: Utility-first CSS framework for styling.
- **TypeScript**: Typed superset of JavaScript for better code quality.
- **Leaflet**: Open-source JavaScript library for mobile-friendly interactive maps.
- **CollectAPI**: Data source for duty pharmacy information.

## How to Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Create a `.env` file in the root directory and add your CollectAPI key:
    ```env
    VITE_COLLECT_API_KEY=apikey your_api_key_here
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

The application will be available at `http://localhost:5173`.
