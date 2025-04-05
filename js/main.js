document.addEventListener('DOMContentLoaded', function() {
  // Handle header shadow on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('shadow-md');
    } else {
      header.classList.remove('shadow-md');
    }
  });

  // Tab system
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContent = document.getElementById('tab-content');
  let activeTab = 'about-me';

  // Check if device is mobile
  const isMobile = () => window.innerWidth < 768;

  // Load tab content
  function loadTabContent(tabId) {
    fetch(`./tabs/${tabId}.html`)
      .then(response => response.text())
      .then(html => {
        tabContent.innerHTML = html;
        
        // On mobile, scroll to content area when tab is clicked
        if (isMobile()) {
          tabContent.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .catch(error => {
        console.error('Error loading tab content:', error);
        tabContent.innerHTML = '<div class="card"><div class="p-8"><p>Error loading content. Please try again.</p></div></div>';
      });
  }

  // Initialize with the first tab
  loadTabContent(activeTab);

  // Add click event listeners to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Update active tab
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('bg-[#f0f7ff]');
        btn.classList.remove('text-[#2e5f96]');
        btn.classList.remove('font-medium');
        btn.classList.remove('border-l-4');
        btn.classList.remove('border-[#4a90e2]');
        btn.classList.add('hover:bg-gray-50');
        btn.classList.add('text-gray-700');
        btn.classList.add('hover:text-[#4a90e2]');
        
        // Update icon color
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.remove('text-[#4a90e2]');
          icon.classList.add('text-gray-500');
        }
      });
      
      // Set active tab styles
      this.classList.add('active');
      this.classList.add('bg-[#f0f7ff]');
      this.classList.add('text-[#2e5f96]');
      this.classList.add('font-medium');
      this.classList.add('border-l-4');
      this.classList.add('border-[#4a90e2]');
      
      // Update icon color
      const activeIcon = this.querySelector('i');
      if (activeIcon) {
        activeIcon.classList.remove('text-gray-500');
        activeIcon.classList.add('text-[#4a90e2]');
      }
      
      // Load tab content
      loadTabContent(tabId);
      activeTab = tabId;
    });
  });

  // Handle window resize for responsive behavior
  window.addEventListener('resize', function() {
    // Update mobile detection when window is resized
    const wasMobile = isMobile();
    
    // If transitioning between mobile and desktop view, reload current tab content
    // to apply the appropriate layout and behavior
    if (wasMobile !== isMobile()) {
      loadTabContent(activeTab);
      
      // Update tab button styles based on screen size
      tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === activeTab) {
          // Ensure active tab has correct styling after resize
          button.classList.add('active');
          button.classList.add('bg-[#f0f7ff]');
          button.classList.add('text-[#2e5f96]');
          button.classList.add('font-medium');
          button.classList.add('border-l-4');
          button.classList.add('border-[#4a90e2]');
          
          // Update icon color
          const activeIcon = button.querySelector('i');
          if (activeIcon) {
            activeIcon.classList.remove('text-gray-500');
            activeIcon.classList.add('text-[#4a90e2]');
          }
        }
      });
    }
  });
});