import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white">ApexShop</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Next-generation microservices-powered e-commerce platform built with React, Spring Boot, Kafka, and Postgres.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-indigo-400 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-400 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-indigo-400 transition">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Microservices Architecture */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>API Gateway (Port 8080)</li>
              <li>User Service (JWT Auth)</li>
              <li>Product Catalog Service</li>
              <li>Order Saga & Payment</li>
              <li>Inventory & Reservation</li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Stay Connected</h4>
            <p className="text-sm">Subscribe to get updates on new products and offers.</p>
            <div className="flex space-x-3 text-gray-400">
              <a href="#" className="p-2.5 bg-gray-800 rounded-xl hover:text-white hover:bg-indigo-600 transition">
                <FiGithub className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 bg-gray-800 rounded-xl hover:text-white hover:bg-indigo-600 transition">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 bg-gray-800 rounded-xl hover:text-white hover:bg-indigo-600 transition">
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ApexShop Microservices. All rights reserved. Connected to API Gateway at localhost:8080.
        </div>
      </div>
    </footer>
  );
};
