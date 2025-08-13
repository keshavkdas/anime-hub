/**
 * AnimeHub Performance Optimization Script
 * Enhances loading performance, caching, and user experience
 */

// Performance monitoring utilities
const Performance = {
  // Track page load performance
  init() {
    // Monitor performance
    this.trackPerformance();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Setup intersection observer for animations
    this.initIntersectionObserver();
    
    // Optimize images
    this.optimizeImages();
    
    // Setup service worker if supported
    this.initServiceWorker();
    
    // Preload critical resources
    this.preloadCriticalResources();
  },

  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        console.log(`📊 Page Load Time: ${loadTime}ms`);
        
        // Track Core Web Vitals
        this.trackCoreWebVitals();
      });
    }
  },

  trackCoreWebVitals() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`🎨 First Contentful Paint: ${entry.startTime}ms`);
        }
      }
    });
    
    try {
      observer.observe({entryTypes: ['paint']});
    } catch (e) {
      console.log('Performance observer not supported');
    }
  },

  // Lazy loading for images and content
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Add loading skeleton
            img.style.background = 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)';
            img.style.backgroundSize = '200% 100%';
            img.style.animation = 'loading 1.5s infinite';
            
            // Load actual image
            const actualSrc = img.dataset.src || img.src;
            const tempImg = new Image();
            
            tempImg.onload = () => {
              img.src = actualSrc;
              img.style.background = '';
              img.style.animation = '';
              img.classList.add('loaded');
              observer.unobserve(img);
            };
            
            tempImg.onerror = () => {
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
              img.classList.add('error');
              observer.unobserve(img);
            };
            
            tempImg.src = actualSrc;
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images
      document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // Intersection observer for animations
  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, {
        threshold: 0.1
      });

      // Observe elements that need animation
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
      });
    }
  },

  // Optimize images
  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add error handling
      img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
        this.classList.add('error');
      };
      
      // Add loading class
      img.classList.add('loading');
      
      img.onload = function() {
        this.classList.remove('loading');
        this.classList.add('loaded');
      };
    });
  },

  // Initialize service worker for caching
  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('🔧 Service Worker registered:', registration.scope);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  },

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      'https://api.jikan.moe/v4/seasons/now?limit=10',
      'https://fonts.googleapis.com/css2?family=Oswald:wght@500&family=Poppins&display=swap'
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Debounce utility for scroll events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle utility for resize events
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  // Memory cleanup
  cleanup() {
    // Clean up event listeners
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clear any intervals or timeouts
    if (this.intervals) {
      this.intervals.forEach(interval => clearInterval(interval));
    }
    
    if (this.timeouts) {
      this.timeouts.forEach(timeout => clearTimeout(timeout));
    }
  }
};

// Enhanced caching system
const Cache = {
  // Cache with expiration
  set(key, data, expirationMinutes = 10) {
    const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
    const cacheData = {
      data,
      expiration: expirationTime
    };
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  },

  get(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const now = new Date().getTime();
      
      if (now > cacheData.expiration) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return cacheData.data;
    } catch (e) {
      console.warn('Cache retrieval failed:', e);
      return null;
    }
  },

  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get cache size
  getSize() {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        size += localStorage.getItem(key).length;
      }
    });
    return (size / 1024).toFixed(2) + ' KB';
  }
};

// Network status monitoring
const Network = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('Back online! 🌐', 'success');
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('You are offline 📡', 'warning');
    });
  },

  showNetworkStatus(message, type) {
    const toast = document.createElement('div');
    toast.className = `network-toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem 2rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10001;
      background: ${type === 'success' ? '#10b981' : '#f59e0b'};
      animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  syncOfflineData() {
    // Sync any offline data when back online
    console.log('Syncing offline data...');
  }
};

// Initialize performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Performance.init();
  Network.init();
  
  console.log('🚀 Performance optimizations loaded');
  console.log(`📊 Cache size: ${Cache.getSize()}`);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  Performance.cleanup();
});

// Global performance utilities
window.AnimeHubPerformance = {
  Performance,
  Cache,
  Network
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  
  .animate-on-scroll {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  img.loading {
    filter: blur(2px);
    transition: filter 0.3s ease;
  }
  
  img.loaded {
    filter: none;
  }
  
  img.error {
    opacity: 0.6;
    border: 2px dashed #666;
  }
`;
document.head.appendChild(style);
