import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-transparent text-comfortable relative z-0 border-t border-gray-400">
      <div className="container-max section-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/careereasy-logo.svg" 
                alt="CareerEasy" 
                className="h-10"
              />
            </div>
            <p className="text-gray-600 max-w-xs">
              AI-powered job board helping professionals find their dream careers with intelligent matching and guidance.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>AI-Powered Job Matching</li>
              <li>Smart Resume Analysis</li>
              <li>Job Recommendations</li>
              <li>Career Path Guidance</li>
            </ul>
          </div>

          {/* Technologies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technologies</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Next.js 15</li>
              <li>Django</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>

          {/* About Me */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Me</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="https://linkedin.com/in/junzezhang7" className="hover:text-brand-navy transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 relative group inline-block">
                  LinkedIn
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="https://junzezhang.com" className="hover:text-brand-navy transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 relative group inline-block">
                  Portfolio
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="https://github.com/Junze-Zhang" className="hover:text-brand-navy transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 relative group inline-block">
                  GitHub
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-400 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © 2025 Developed by Junze Zhang
            </p>
            <div className="flex space-x-6">
              {/* Project GitHub Link */}
              <a href="https://github.com/Junze-Zhang/CareerEasy" className="text-gray-600 hover:text-brand-navy transition-all duration-300 hover:scale-110">
                <span className="sr-only">Project GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 