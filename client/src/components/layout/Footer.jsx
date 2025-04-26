import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin, Facebook, Twitter, Instagram, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">AluNet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Building bridges between students and alumni for mentorship, 
              networking, and career development.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/alumni-directory" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Alumni Directory</Link></li>
              <li><Link to="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Job Board</Link></li>
              <li><Link to="/mentorships" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Mentorship Programs</Link></li>
              <li><Link to="/events" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Events & Workshops</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join our newsletter for updates on new features, events, and opportunities.
            </p>
            <div className="mt-3 flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-white px-3 py-2 rounded-r-md hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} AluNet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;