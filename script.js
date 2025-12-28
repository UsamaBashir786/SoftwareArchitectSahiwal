// ============================================================================
// CRM Dashboard - Interactive JavaScript Functionality
// Created: 2025-12-28
// ============================================================================

// ============================================================================
// 1. DATA MANAGEMENT & LOCAL STORAGE
// ============================================================================

const CRMData = {
  // Initialize data structure
  customers: [],
  leads: [],
  deals: [],
  tasks: [],
  interactions: [],

  // Initialize from localStorage or set defaults
  init() {
    this.customers = this.load('customers') || [];
    this.leads = this.load('leads') || [];
    this.deals = this.load('deals') || [];
    this.tasks = this.load('tasks') || [];
    this.interactions = this.load('interactions') || [];
    console.log('CRM Data initialized:', this);
  },

  // Load data from localStorage
  load(key) {
    try {
      const data = localStorage.getItem(`crm_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  },

  // Save data to localStorage
  save(key, data) {
    try {
      localStorage.setItem(`crm_${key}`, JSON.stringify(data));
      console.log(`${key} saved successfully`);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  },

  // Add new customer
  addCustomer(customer) {
    const newCustomer = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...customer
    };
    this.customers.push(newCustomer);
    this.save('customers', this.customers);
    return newCustomer;
  },

  // Add new lead
  addLead(lead) {
    const newLead = {
      id: Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
      ...lead
    };
    this.leads.push(newLead);
    this.save('leads', this.leads);
    return newLead;
  },

  // Add new deal
  addDeal(deal) {
    const newDeal = {
      id: Date.now(),
      status: 'open',
      probability: 50,
      createdAt: new Date().toISOString(),
      ...deal
    };
    this.deals.push(newDeal);
    this.save('deals', this.deals);
    return newDeal;
  },

  // Add task
  addTask(task) {
    const newTask = {
      id: Date.now(),
      status: 'pending',
      dueDate: new Date().toISOString(),
      ...task
    };
    this.tasks.push(newTask);
    this.save('tasks', this.tasks);
    return newTask;
  },

  // Update data item
  updateItem(type, id, updates) {
    const items = this[type];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.save(type, items);
      return items[index];
    }
    return null;
  },

  // Delete item
  deleteItem(type, id) {
    const items = this[type];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      this.save(type, items);
      return true;
    }
    return false;
  },

  // Get statistics
  getStats() {
    return {
      totalCustomers: this.customers.length,
      totalLeads: this.leads.length,
      openDeals: this.deals.filter(d => d.status === 'open').length,
      totalDealsValue: this.deals.reduce((sum, d) => sum + (d.value || 0), 0),
      pendingTasks: this.tasks.filter(t => t.status === 'pending').length,
      completedTasks: this.tasks.filter(t => t.status === 'completed').length
    };
  }
};

// ============================================================================
// 2. EVENT LISTENERS & DOM MANIPULATION
// ============================================================================

const UIManager = {
  // Initialize all event listeners
  init() {
    this.setupFormListeners();
    this.setupModalListeners();
    this.setupNavListeners();
    this.setupTableListeners();
    this.setupSidebarToggle();
    this.setupSearchFunctionality();
    console.log('UI Manager initialized');
  },

  // Form event listeners
  setupFormListeners() {
    // Customer form
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
      customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCustomerSubmit(customerForm);
      });
    }

    // Lead form
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLeadSubmit(leadForm);
      });
    }

    // Deal form
    const dealForm = document.getElementById('dealForm');
    if (dealForm) {
      dealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleDealSubmit(dealForm);
      });
    }

    // Task form
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTaskSubmit(taskForm);
      });
    }

    // Real-time form validation
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('change', () => this.validateField(field));
    });
  },

  // Modal event listeners
  setupModalListeners() {
    // Open modal buttons
    document.querySelectorAll('[data-modal-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-modal-trigger');
        this.openModal(modalId);
      });
    });

    // Close modal buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal(backdrop.parentElement.id);
        }
      });
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.active');
        if (openModal) {
          this.closeModal(openModal.id);
        }
      }
    });
  },

  // Navigation listeners
  setupNavListeners() {
    document.querySelectorAll('[data-nav-tab]').forEach(navItem => {
      navItem.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = navItem.getAttribute('data-nav-tab');
        this.switchTab(tabName);
      });
    });
  },

  // Table action listeners
  setupTableListeners() {
    // Edit buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-edit')) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        this.handleEdit(type, id);
      }
    });

    // Delete buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        this.handleDelete(type, id);
      }
    });

    // Status change
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select')) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        const newStatus = e.target.value;
        CRMData.updateItem(type, parseInt(id), { status: newStatus });
        this.showNotification('Status updated successfully', 'success');
        this.refreshData(type);
      }
    });
  },

  // Sidebar toggle
  setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
      });

      // Restore sidebar state
      if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
      }
    }
  },

  // Search functionality
  setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.performSearch(query);
      });
    }
  },

  // Handle customer form submission
  handleCustomerSubmit(form) {
    const formData = new FormData(form);
    const customer = {
      name: formData.get('customerName'),
      email: formData.get('customerEmail'),
      phone: formData.get('customerPhone'),
      company: formData.get('customerCompany'),
      status: formData.get('customerStatus')
    };

    if (this.validateCustomerData(customer)) {
      CRMData.addCustomer(customer);
      this.showNotification('Customer added successfully!', 'success');
      form.reset();
      this.closeModal('customerModal');
      this.refreshData('customers');
    }
  },

  // Handle lead form submission
  handleLeadSubmit(form) {
    const formData = new FormData(form);
    const lead = {
      name: formData.get('leadName'),
      email: formData.get('leadEmail'),
      phone: formData.get('leadPhone'),
      source: formData.get('leadSource'),
      budget: formData.get('leadBudget'),
      notes: formData.get('leadNotes')
    };

    if (this.validateLeadData(lead)) {
      CRMData.addLead(lead);
      this.showNotification('Lead added successfully!', 'success');
      form.reset();
      this.closeModal('leadModal');
      this.refreshData('leads');
    }
  },

  // Handle deal form submission
  handleDealSubmit(form) {
    const formData = new FormData(form);
    const deal = {
      name: formData.get('dealName'),
      customer: formData.get('dealCustomer'),
      value: parseFloat(formData.get('dealValue')),
      probability: parseInt(formData.get('dealProbability')),
      expectedCloseDate: formData.get('dealCloseDate'),
      notes: formData.get('dealNotes')
    };

    if (this.validateDealData(deal)) {
      CRMData.addDeal(deal);
      this.showNotification('Deal added successfully!', 'success');
      form.reset();
      this.closeModal('dealModal');
      this.refreshData('deals');
    }
  },

  // Handle task form submission
  handleTaskSubmit(form) {
    const formData = new FormData(form);
    const task = {
      title: formData.get('taskTitle'),
      description: formData.get('taskDescription'),
      assignee: formData.get('taskAssignee'),
      dueDate: formData.get('taskDueDate'),
      priority: formData.get('taskPriority')
    };

    if (this.validateTaskData(task)) {
      CRMData.addTask(task);
      this.showNotification('Task added successfully!', 'success');
      form.reset();
      this.closeModal('taskModal');
      this.refreshData('tasks');
    }
  },

  // Validation functions
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
    }

    // Phone validation
    if (field.name && field.name.includes('phone')) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      isValid = value === '' || phoneRegex.test(value);
    }

    // Required field validation
    if (field.hasAttribute('required')) {
      isValid = isValid && value.length > 0;
    }

    // Visual feedback
    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  },

  validateCustomerData(customer) {
    if (!customer.name || !customer.email || !customer.phone) {
      this.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  },

  validateLeadData(lead) {
    if (!lead.name || !lead.email) {
      this.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  },

  validateDealData(deal) {
    if (!deal.name || !deal.customer || !deal.value) {
      this.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  },

  validateTaskData(task) {
    if (!task.title || !task.dueDate) {
      this.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    return true;
  },

  // Modal functions
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.animateModalEntry(modal);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      this.animateModalExit(modal, () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    }
  },

  // Tab switching
  switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('[data-tab-content]').forEach(tab => {
      tab.classList.remove('active');
    });

    // Deactivate all nav items
    document.querySelectorAll('[data-nav-tab]').forEach(nav => {
      nav.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.querySelector(`[data-tab-content="${tabName}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
      this.animateTabEntry(selectedTab);
    }

    // Activate nav item
    const activeNav = document.querySelector(`[data-nav-tab="${tabName}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    // Refresh data for selected tab
    this.refreshData(tabName);
  },

  // Edit handler
  handleEdit(type, id) {
    const items = CRMData[type];
    const item = items.find(i => i.id === parseInt(id));
    
    if (item) {
      console.log('Editing item:', item);
      this.showNotification(`Editing ${type} item`, 'info');
      // Populate form with item data and open modal
      this.populateEditForm(type, item);
    }
  },

  // Delete handler
  handleDelete(type, id) {
    if (confirm('Are you sure you want to delete this item?')) {
      CRMData.deleteItem(type, parseInt(id));
      this.showNotification('Item deleted successfully', 'success');
      this.refreshData(type);
    }
  },

  // Populate edit form
  populateEditForm(type, item) {
    const modal = document.getElementById(`${type.slice(0, -1)}Modal`);
    if (modal) {
      const form = modal.querySelector('form');
      if (form) {
        // Populate form fields
        Object.keys(item).forEach(key => {
          const field = form.querySelector(`[name="${type.slice(0, -1)}${key.charAt(0).toUpperCase() + key.slice(1)}"]`);
          if (field) {
            field.value = item[key];
          }
        });
        this.openModal(modal.id);
      }
    }
  },

  // Refresh data display
  refreshData(type) {
    const data = CRMData[type];
    const tableId = `${type}Table`;
    const table = document.getElementById(tableId);

    if (table && data) {
      this.renderTable(table, data, type);
    }

    // Update dashboard statistics
    this.updateDashboardStats();
  },

  // Render table
  renderTable(table, data, type) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="100%" class="text-center text-muted">No ${type} found</td></tr>`;
      return;
    }

    data.forEach(item => {
      const row = this.createTableRow(item, type);
      tbody.appendChild(row);
    });

    this.animateTableRows();
  },

  // Create table row
  createTableRow(item, type) {
    const row = document.createElement('tr');
    row.className = 'table-row';

    switch(type) {
      case 'customers':
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.email}</td>
          <td>${item.phone}</td>
          <td>${item.company || '-'}</td>
          <td><span class="badge badge-${item.status}">${item.status}</span></td>
          <td>
            <button class="btn-edit btn-sm btn-primary" data-id="${item.id}" data-type="customers">Edit</button>
            <button class="btn-delete btn-sm btn-danger" data-id="${item.id}" data-type="customers">Delete</button>
          </td>
        `;
        break;
      case 'leads':
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.email}</td>
          <td>${item.source || '-'}</td>
          <td>$${item.budget || '0'}</td>
          <td><span class="badge badge-${item.status}">${item.status}</span></td>
          <td>
            <button class="btn-edit btn-sm btn-primary" data-id="${item.id}" data-type="leads">Edit</button>
            <button class="btn-delete btn-sm btn-danger" data-id="${item.id}" data-type="leads">Delete</button>
          </td>
        `;
        break;
      case 'deals':
        row.innerHTML = `
          <td>${item.name}</td>
          <td>$${item.value}</td>
          <td>${item.probability}%</td>
          <td>
            <select class="status-select form-control form-control-sm" data-id="${item.id}" data-type="deals">
              <option value="open" ${item.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="won" ${item.status === 'won' ? 'selected' : ''}>Won</option>
              <option value="lost" ${item.status === 'lost' ? 'selected' : ''}>Lost</option>
            </select>
          </td>
          <td>
            <button class="btn-edit btn-sm btn-primary" data-id="${item.id}" data-type="deals">Edit</button>
            <button class="btn-delete btn-sm btn-danger" data-id="${item.id}" data-type="deals">Delete</button>
          </td>
        `;
        break;
      case 'tasks':
        row.innerHTML = `
          <td>${item.title}</td>
          <td>${item.priority || 'Normal'}</td>
          <td>${new Date(item.dueDate).toLocaleDateString()}</td>
          <td>
            <select class="status-select form-control form-control-sm" data-id="${item.id}" data-type="tasks">
              <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <button class="btn-edit btn-sm btn-primary" data-id="${item.id}" data-type="tasks">Edit</button>
            <button class="btn-delete btn-sm btn-danger" data-id="${item.id}" data-type="tasks">Delete</button>
          </td>
        `;
        break;
    }

    return row;
  },

  // Update dashboard statistics
  updateDashboardStats() {
    const stats = CRMData.getStats();
    
    const statElements = {
      'stat-customers': stats.totalCustomers,
      'stat-leads': stats.totalLeads,
      'stat-deals': stats.openDeals,
      'stat-deals-value': `$${stats.totalDealsValue.toLocaleString()}`,
      'stat-tasks': stats.pendingTasks
    };

    Object.entries(statElements).forEach(([elementId, value]) => {
      const element = document.getElementById(elementId);
      if (element) {
        this.animateNumberChange(element, value);
      }
    });
  },

  // Search functionality
  performSearch(query) {
    if (!query) {
      this.refreshData('customers');
      return;
    }

    const results = {
      customers: CRMData.customers.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query)
      ),
      leads: CRMData.leads.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query)
      ),
      deals: CRMData.deals.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.customer?.toLowerCase().includes(query)
      )
    };

    console.log('Search results:', results);
    this.displaySearchResults(results);
  },

  displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    let html = '<div class="search-results">';

    if (results.customers.length === 0 && results.leads.length === 0 && results.deals.length === 0) {
      html += '<p class="text-muted">No results found</p>';
    } else {
      if (results.customers.length > 0) {
        html += '<h6>Customers</h6>';
        results.customers.forEach(c => {
          html += `<p><small>${c.name} - ${c.email}</small></p>`;
        });
      }
      if (results.leads.length > 0) {
        html += '<h6>Leads</h6>';
        results.leads.forEach(l => {
          html += `<p><small>${l.name} - ${l.email}</small></p>`;
        });
      }
      if (results.deals.length > 0) {
        html += '<h6>Deals</h6>';
        results.deals.forEach(d => {
          html += `<p><small>${d.name} - $${d.value}</small></p>`;
        });
      }
    }

    html += '</div>';
    searchResults.innerHTML = html;
  },

  // Notification system
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-fadeIn`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `;

    const container = document.getElementById('notificationContainer') || 
                     document.body.insertAdjacentElement('afterbegin', 
                       Object.assign(document.createElement('div'), {
                         id: 'notificationContainer',
                         className: 'notification-container'
                       })
                     );

    container.appendChild(notification);

    // Auto-remove notification
    setTimeout(() => {
      this.animateNotificationExit(notification, () => notification.remove());
    }, 3000);
  }
};

// ============================================================================
// 3. ANIMATION FUNCTIONS
// ============================================================================

const AnimationManager = {
  // Modal animations
  animateModalEntry(modal) {
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');

    if (backdrop) {
      backdrop.style.animation = 'fadeIn 0.3s ease-out forwards';
    }
    if (content) {
      content.style.animation = 'slideInUp 0.3s ease-out forwards';
    }
  },

  animateModalExit(modal, callback) {
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');

    if (content) {
      content.style.animation = 'slideOutDown 0.3s ease-out forwards';
    }
    if (backdrop) {
      backdrop.style.animation = 'fadeOut 0.3s ease-out forwards';
    }

    setTimeout(callback, 300);
  },

  // Tab animations
  animateTabEntry(tab) {
    tab.style.animation = 'fadeIn 0.3s ease-out forwards';
  },

  // Table row animations
  animateTableRows() {
    document.querySelectorAll('.table-row').forEach((row, index) => {
      row.style.animation = `slideInLeft 0.3s ease-out ${index * 0.05}s forwards`;
      row.style.opacity = '0';
    });
  },

  // Number animation for statistics
  animateNumberChange(element, newValue) {
    const oldValue = element.textContent;
    const isNumber = /^\d+(\.\d{2})?$/.test(oldValue.replace(/[$,]/g, ''));

    if (isNumber && typeof newValue === 'number') {
      const start = parseInt(oldValue.replace(/[$,]/g, '')) || 0;
      const end = newValue;
      const duration = 600;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (end - start) * progress);
        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    } else {
      element.textContent = newValue;
    }
  },

  // Notification animations
  animateNotification(notification) {
    notification.style.animation = 'slideInRight 0.4s ease-out forwards';
  },

  animateNotificationExit(notification, callback) {
    notification.style.animation = 'slideOutRight 0.4s ease-out forwards';
    setTimeout(callback, 400);
  }
};

// Assign animation methods to UIManager
Object.assign(UIManager, {
  animateModalEntry: AnimationManager.animateModalEntry,
  animateModalExit: AnimationManager.animateModalExit,
  animateTabEntry: AnimationManager.animateTabEntry,
  animateTableRows: AnimationManager.animateTableRows,
  animateNumberChange: AnimationManager.animateNumberChange,
  animateNotificationExit: AnimationManager.animateNotificationExit
});

// ============================================================================
// 4. UTILITY FUNCTIONS
// ============================================================================

const Utils = {
  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Debounce function
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

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
};

// ============================================================================
// 5. INITIALIZATION
// ============================================================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing CRM Dashboard...');
  
  // Initialize data
  CRMData.init();
  
  // Initialize UI
  UIManager.init();
  
  // Load initial data
  UIManager.refreshData('customers');
  
  // Setup CSS animations (inject if not in stylesheet)
  injectAnimationStyles();
  
  console.log('CRM Dashboard ready!');
});

// Inject animation styles if needed
function injectAnimationStyles() {
  if (document.getElementById('crm-animations')) return;

  const style = document.createElement('style');
  style.id = 'crm-animations';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes slideInUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideOutDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(30px); opacity: 0; }
    }

    @keyframes slideInLeft {
      from { transform: translateX(-30px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInRight {
      from { transform: translateX(30px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(30px); opacity: 0; }
    }

    @keyframes slideOutLeft {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-30px); opacity: 0; }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .is-valid {
      border-color: #28a745 !important;
      background-color: #f0fdf4;
    }

    .is-invalid {
      border-color: #dc3545 !important;
      background-color: #fdf0f1;
    }

    .notification {
      padding: 12px 20px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .notification-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .notification-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .notification-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .notification-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
  `;

  document.head.appendChild(style);
}

// ============================================================================
// Export for use in other modules
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CRMData,
    UIManager,
    AnimationManager,
    Utils
  };
}
