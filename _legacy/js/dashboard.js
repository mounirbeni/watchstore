/* LuxWatch enterprise dashboard prototype */
(function () {
    'use strict';

    const state = {
        csrf: sessionStorage.getItem('lwCsrf') || createToken(),
        audit: JSON.parse(localStorage.getItem('lwAuditLog') || '[]'),
        tablePages: {},
        sessionSeconds: 15 * 60
    };

    const clientOrders = [
        { id: 'LW-982341', watch: 'Royal Chronograph Gold', status: 'Processing', payment: 'Paid', delivery: 'Casablanca - 24h', total: '3 499 MAD' },
        { id: 'LW-982355', watch: 'Heritage Automatic', status: 'In delivery', payment: 'Cash on delivery', delivery: 'Rabat - tomorrow', total: '2 899 MAD' },
        { id: 'LW-772189', watch: 'Elegance Silver Moon', status: 'Delivered', payment: 'Paid', delivery: 'Delivered 16 Apr', total: '1 899 MAD' },
        { id: 'LW-552901', watch: 'Diver Steel 200M', status: 'Delivered', payment: 'Paid', delivery: 'Delivered 02 Mar', total: '2 299 MAD' }
    ];

    const clientReservations = [
        { name: 'Royal Chronograph Gold', status: 'Active', expires: '03 Jun 2026, 18:00', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80' },
        { name: 'Patek Classic Dress', status: 'Awaiting deposit', expires: '04 Jun 2026, 12:00', image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&q=80' },
        { name: 'Aston Black Edition', status: 'Expired', expires: '18 May 2026', image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&q=80' }
    ];

    const adminOrders = [
        { id: 'LW-982341', customer: 'Youssef Benali', status: 'Processing', payment: 'Paid', delivery: 'Preparing', total: '3 499 MAD' },
        { id: 'LW-982355', customer: 'Sara Amrani', status: 'Pending approval', payment: 'COD', delivery: 'Not assigned', total: '2 899 MAD' },
        { id: 'LW-982388', customer: 'Mehdi Alaoui', status: 'Pending approval', payment: 'Bank transfer', delivery: 'On hold', total: '8 200 MAD' },
        { id: 'LW-982410', customer: 'Nadia Rami', status: 'Delivered', payment: 'Paid', delivery: 'Delivered', total: '1 899 MAD' },
        { id: 'LW-982440', customer: 'Omar Fassi', status: 'Processing', payment: 'Paid', delivery: 'Courier assigned', total: '4 750 MAD' },
        { id: 'LW-982472', customer: 'Imane Berrada', status: 'Processing', payment: 'COD', delivery: 'Preparing', total: '2 250 MAD' }
    ];

    const adminCustomers = [
        { name: 'Youssef Benali', email: 'youssef@example.com', status: 'Active', orders: 8, value: '22 480 MAD', reservation: 'Active' },
        { name: 'Sara Amrani', email: 'sara@example.com', status: 'Active', orders: 3, value: '7 299 MAD', reservation: 'Pending' },
        { name: 'Mehdi Alaoui', email: 'mehdi@example.com', status: 'Review', orders: 1, value: '8 200 MAD', reservation: 'Awaiting payment' },
        { name: 'Nadia Rami', email: 'nadia@example.com', status: 'Active', orders: 5, value: '14 840 MAD', reservation: 'None' },
        { name: 'Omar Fassi', email: 'omar@example.com', status: 'Active', orders: 2, value: '6 640 MAD', reservation: 'Active' }
    ];

    const seedAudit = [
        { time: '01 Jun 2026 20:42', actor: 'Admin Manager', action: 'Order status changed', target: 'LW-982341', risk: 'Medium' },
        { time: '01 Jun 2026 19:18', actor: 'System', action: 'Reservation reminder sent', target: '11 customers', risk: 'Low' },
        { time: '01 Jun 2026 18:02', actor: 'Admin Manager', action: 'Product inventory updated', target: 'Royal Chronograph Gold', risk: 'Medium' },
        { time: '31 May 2026 22:16', actor: 'Security', action: 'Failed login threshold reached', target: 'admin console', risk: 'High' }
    ];

    document.addEventListener('DOMContentLoaded', initDashboard);

    function initDashboard() {
        const type = document.body.dataset.dashboard;
        if (!type) return;

        sessionStorage.setItem('lwCsrf', state.csrf);
        document.querySelectorAll('[name="csrf"]').forEach(input => { input.value = state.csrf; });
        document.querySelectorAll('[data-csrf-status]').forEach(el => { el.textContent = 'Active'; });

        if (!authorize(type)) return;
        setupTabs();
        setupSecureForms();
        setupActions();
        setupLogout();

        if (type === 'client') renderClient();
        if (type === 'admin') renderAdmin();

        setupTableControls();
        renderPaginatedTables();
        setupAdminTimer(type);
    }

    function authorize(type) {
        const role = localStorage.getItem('lwRole') || (localStorage.getItem('adminLoggedIn') ? 'admin' : 'client');
        const loggedIn = localStorage.getItem('userLoggedIn') === 'true';
        if (!loggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        if (type === 'admin' && role !== 'admin') {
            showDashboardToast('Admin access denied. Role based access control blocked this session.');
            setTimeout(() => { window.location.href = 'account.html'; }, 900);
            return false;
        }
        localStorage.setItem('lwRole', role);
        return true;
    }

    function setupTabs() {
        document.querySelectorAll('[data-dashboard-tab]').forEach(button => {
            button.addEventListener('click', () => openTab(button.dataset.dashboardTab));
        });
        document.querySelectorAll('[data-tab-open]').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openTab(button.dataset.tabOpen);
            });
        });
    }

    function openTab(id) {
        document.querySelectorAll('[data-dashboard-tab]').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.dashboardTab === id);
        });
        document.querySelectorAll('[data-dashboard-panel]').forEach(panel => {
            panel.classList.toggle('is-active', panel.id === id);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function setupSecureForms() {
        document.querySelectorAll('[data-secure-form]').forEach(form => {
            form.addEventListener('submit', event => {
                event.preventDefault();
                const formName = form.dataset.secureForm;
                if (!validateCsrf(form)) {
                    showDashboardToast('Security validation failed. Refresh and try again.');
                    return;
                }
                if (!validateForm(form)) {
                    showDashboardToast('Please complete the required fields correctly.');
                    return;
                }
                if (!rateLimit(formName, 4, 60000)) {
                    showDashboardToast('Too many attempts. Please wait before trying again.');
                    return;
                }
                if (['password', 'product', 'announcement'].includes(formName) && !window.confirm('Confirm this sensitive action? It will be audit logged.')) {
                    return;
                }
                addAudit('Admin Manager', secureActionLabel(formName), formName, formName === 'password' ? 'High' : 'Medium');
                showDashboardToast('Saved and audit logged.');
                if (formName !== 'profile') form.reset();
                document.querySelectorAll('[name="csrf"]').forEach(input => { input.value = state.csrf; });
                renderAdminAudit();
            });
        });
    }

    function setupActions() {
        document.addEventListener('click', event => {
            const actionEl = event.target.closest('[data-dashboard-action]');
            if (!actionEl) return;
            const action = actionEl.dataset.dashboardAction;
            if (['refund', 'suspend-customer', 'delete-product', 'approve-reservation'].includes(action)) {
                if (!window.confirm('Confirm sensitive admin action? This will be audit logged.')) return;
            }
            handleAction(action, actionEl);
        });

        document.addEventListener('change', event => {
            const select = event.target.closest('[data-order-status]');
            if (!select) return;
            addAudit('Admin Manager', 'Order status changed', select.dataset.orderStatus, 'Medium');
            showDashboardToast(`Order ${select.dataset.orderStatus} updated to ${select.value}.`);
            renderAdminAudit();
        });
    }

    function handleAction(action, el) {
        const target = el.dataset.target || action;
        const messages = {
            'download-receipt': 'Receipt download prepared.',
            'edit-address': 'Address editor ready.',
            'add-address': 'Address form ready.',
            'mark-read': 'Notifications marked as read.',
            'export-report': 'Operational report export queued.',
            'export-audit': 'Audit log export queued.',
            'refund': 'Refund workflow opened.',
            'approve-reservation': 'Reservation approved.',
            'delete-product': 'Product delete request logged.',
            'suspend-customer': 'Customer suspension request logged.',
            'move-to-reservation': 'Watch moved to reservation.',
            'remove-wishlist': 'Watch removed from wishlist.'
        };
        if (['refund', 'approve-reservation', 'delete-product', 'suspend-customer', 'export-audit'].includes(action)) {
            addAudit('Admin Manager', action.replaceAll('-', ' '), target, action === 'suspend-customer' ? 'High' : 'Medium');
            renderAdminAudit();
        }
        showDashboardToast(messages[action] || 'Action completed.');
    }

    function setupLogout() {
        document.querySelectorAll('[data-logout]').forEach(button => {
            button.addEventListener('click', () => {
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('lwRole');
                window.location.href = 'login.html';
            });
        });
    }

    function renderClient() {
        renderStatusList('clientCurrentOrders', clientOrders.slice(0, 2).map(order => ({
            title: `${order.id} - ${order.watch}`,
            meta: `${order.payment} / ${order.delivery}`,
            status: order.status
        })));

        renderTimeline('clientActivity', [
            ['fa-receipt', 'Receipt downloaded', 'LW-772189 receipt generated on 01 Jun 2026'],
            ['fa-truck', 'Delivery update', 'LW-982355 assigned to Casablanca courier'],
            ['fa-lock', 'Security check', 'New login from iPhone Safari approved'],
            ['fa-clock', 'Reservation reminder', 'Royal Chronograph expires in 48 hours']
        ]);

        renderNotifications('clientNotificationPreview', clientNotifications().slice(0, 3));
        renderNotifications('clientNotifications', clientNotifications());
        renderReservations('clientReservations', clientReservations);
        renderClientWishlist();
        renderClientOrders();
        renderClientSecurity();
    }

    function renderClientOrders() {
        const body = document.getElementById('clientOrdersBody');
        if (!body) return;
        body.innerHTML = clientOrders.map(order => `
            <tr data-search="${safe(`${order.id} ${order.watch} ${order.status} ${order.payment}`)}" data-filter="${safe(order.status)}">
                <td><strong>${safe(order.id)}</strong><small>${safe(order.watch)}</small></td>
                <td>${statusPill(order.status)}</td>
                <td>${safe(order.payment)}<small>History available</small></td>
                <td>${safe(order.delivery)}</td>
                <td><strong>${safe(order.total)}</strong></td>
                <td>
                    <div class="table-actions">
                        <a class="btn btn-ghost btn-sm" href="order-tracking.html?ref=${encodeURIComponent(order.id)}">Track</a>
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="download-receipt" data-target="${safe(order.id)}">Receipt</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderReservations(targetId, rows) {
        const target = document.getElementById(targetId);
        if (!target) return;
        target.innerHTML = rows.map(item => `
            <article class="reservation-card">
                <img src="${safe(item.image)}" alt="${safe(item.name)}">
                <div>
                    <h3>${safe(item.name)}</h3>
                    <p>${safe(item.status)} / Expires: ${safe(item.expires)}</p>
                </div>
                <div class="reservation-card__actions">
                    ${statusPill(item.status)}
                    <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="download-receipt">Details</button>
                </div>
            </article>
        `).join('');
    }

    function renderClientWishlist() {
        const target = document.getElementById('clientWishlist');
        if (!target) return;
        const savedIds = typeof getWishlist === 'function' ? getWishlist() : [];
        const catalogue = getProducts();
        const fallback = catalogue.slice(0, 3).map(product => product.id);
        const ids = savedIds.length ? savedIds : fallback;
        const products = ids.map(id => catalogue.find(product => product.id === id)).filter(Boolean).slice(0, 6);
        target.innerHTML = products.length ? products.map(product => `
            <article class="reservation-card">
                <img src="${safe(product.image)}" alt="${safe(product.name)}">
                <div>
                    <h3>${safe(product.name)}</h3>
                    <p>${safe(product.brand)} / ${formatPrice(product.price)}</p>
                </div>
                <div class="reservation-card__actions">
                    <button class="btn btn-primary btn-sm" type="button" data-dashboard-action="move-to-reservation" data-target="${safe(product.name)}">Reserve</button>
                    <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="remove-wishlist" data-target="${safe(product.name)}">Remove</button>
                </div>
            </article>
        `).join('') : '<div class="empty-state"><h3>No saved watches</h3><p>Save watches from the boutique to build your shortlist.</p></div>';
    }

    function renderClientSecurity() {
        renderStatusList('clientSessions', [
            { title: 'iPhone 15 Pro / Safari', meta: 'Current session - Casablanca', status: 'Active' },
            { title: 'MacBook Pro / Chrome', meta: 'Last active 31 May 2026', status: 'Trusted' }
        ]);
        const history = document.getElementById('clientLoginHistory');
        if (history) {
            history.innerHTML = [
                ['01 Jun 2026 21:04', 'iPhone Safari', 'Casablanca, MA', 'Success'],
                ['31 May 2026 18:22', 'Chrome macOS', 'Rabat, MA', 'Success'],
                ['29 May 2026 09:12', 'Unknown browser', 'Marrakech, MA', 'Blocked']
            ].map(row => `<tr>${row.map(cell => `<td>${safe(cell)}</td>`).join('')}</tr>`).join('');
        }
    }

    function renderAdmin() {
        if (!state.audit.length) {
            state.audit = seedAudit;
            persistAudit();
        }
        renderAdminOrders();
        renderAdminProducts();
        renderAdminCustomers();
        renderAdminAudit();
        renderRevenueBars();
        renderStatusList('adminQueue', [
            { title: '24 orders need operator review', meta: 'Includes 8 delivery exceptions', status: 'High priority' },
            { title: '11 reservations expire in 48h', meta: 'Reminder campaign recommended', status: 'Action' },
            { title: '6 products below stock threshold', meta: 'Inventory update required', status: 'Inventory' }
        ]);
        renderStatusList('adminInventory', [
            { title: 'Royal Chronograph Gold', meta: '2 units remaining', status: 'Low stock' },
            { title: 'Heritage Automatic', meta: '7 units remaining', status: 'Healthy' },
            { title: 'Diver Steel 200M', meta: '0 units remaining', status: 'Out of stock' }
        ]);
        renderStatusList('adminSessions', [
            { title: 'Admin Manager / Chrome', meta: 'Current session - expires after inactivity', status: 'Active' },
            { title: 'Operations iPad', meta: 'Last active 01 Jun 2026 14:10', status: 'Trusted' }
        ]);
        renderNotifications('adminNotificationLog', [
            ['fa-bell', 'Reservation reminders', 'Sent to 11 customers / 01 Jun 2026'],
            ['fa-truck', 'Delivery updates', 'Sent to 18 customers / 01 Jun 2026'],
            ['fa-bullhorn', 'New collection announcement', 'Draft saved / 31 May 2026']
        ]);
    }

    function renderAdminOrders() {
        const body = document.getElementById('adminOrdersBody');
        if (!body) return;
        body.innerHTML = adminOrders.map(order => `
            <tr data-search="${safe(`${order.id} ${order.customer} ${order.status}`)}" data-filter="${safe(order.status)}">
                <td><strong>${safe(order.id)}</strong></td>
                <td>${safe(order.customer)}<small>Profile and purchase history</small></td>
                <td>
                    <select class="dashboard-select" data-order-status="${safe(order.id)}">
                        ${['Pending approval', 'Processing', 'In delivery', 'Delivered', 'Refunded'].map(status => `<option ${status === order.status ? 'selected' : ''}>${status}</option>`).join('')}
                    </select>
                </td>
                <td>${safe(order.payment)}</td>
                <td>${safe(order.delivery)}</td>
                <td><strong>${safe(order.total)}</strong></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="approve-reservation" data-target="${safe(order.id)}">Approve</button>
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="refund" data-target="${safe(order.id)}">Refund</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderAdminProducts() {
        const body = document.getElementById('adminProductsBody');
        if (!body) return;
        const products = getProducts().slice(0, 12);
        body.innerHTML = products.map((product, index) => `
            <tr data-search="${safe(`${product.name} ${product.category} ${product.brand}`)}">
                <td><strong>${safe(product.name)}</strong><small>${safe(product.brand)}</small></td>
                <td>${safe(product.category)}</td>
                <td>${index % 4 === 0 ? 'Low stock' : `${8 + index} units`}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.featured || product.isNew ? statusPill('Featured') : statusPill('Standard', 'muted')}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="edit-product" data-target="${safe(product.name)}">Edit</button>
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="delete-product" data-target="${safe(product.name)}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderAdminCustomers() {
        const body = document.getElementById('adminCustomersBody');
        if (!body) return;
        body.innerHTML = adminCustomers.map(customer => `
            <tr data-search="${safe(`${customer.name} ${customer.email} ${customer.status}`)}">
                <td><strong>${safe(customer.name)}</strong><small>${safe(customer.email)}</small></td>
                <td>${statusPill(customer.status, customer.status === 'Review' ? 'dark' : '')}</td>
                <td>${customer.orders}</td>
                <td><strong>${safe(customer.value)}</strong></td>
                <td>${safe(customer.reservation)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="contact-customer" data-target="${safe(customer.name)}">Contact</button>
                        <button class="btn btn-ghost btn-sm" type="button" data-dashboard-action="suspend-customer" data-target="${safe(customer.name)}">Suspend</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderAdminAudit() {
        const body = document.getElementById('adminAuditBody');
        if (!body) return;
        body.innerHTML = state.audit.map(log => `
            <tr data-search="${safe(`${log.time} ${log.actor} ${log.action} ${log.target} ${log.risk}`)}">
                <td>${safe(log.time)}</td>
                <td>${safe(log.actor)}</td>
                <td>${safe(log.action)}</td>
                <td>${safe(log.target)}</td>
                <td>${riskPill(log.risk)}</td>
            </tr>
        `).join('');
        renderPaginatedTables();
    }

    function renderRevenueBars() {
        const target = document.getElementById('adminRevenueBars');
        if (!target) return;
        [
            ['Paid orders', '284k MAD', 82],
            ['Reserved pipeline', '96k MAD', 58],
            ['Pending payment', '48k MAD', 34],
            ['Refund exposure', '11k MAD', 8]
        ].forEach(row => {
            target.insertAdjacentHTML('beforeend', `
                <div class="bar-row">
                    <div class="bar-row__meta"><span>${safe(row[0])}</span><strong>${safe(row[1])}</strong></div>
                    <div class="bar-track"><span style="width:${row[2]}%"></span></div>
                </div>
            `);
        });
    }

    function setupTableControls() {
        document.querySelectorAll('[data-table-search]').forEach(input => {
            input.addEventListener('input', () => {
                state.tablePages[input.dataset.tableSearch] = 1;
                renderPaginatedTables();
            });
        });
        document.querySelectorAll('[data-table-filter]').forEach(select => {
            select.addEventListener('change', () => {
                state.tablePages[select.dataset.tableFilter] = 1;
                renderPaginatedTables();
            });
        });
    }

    function renderPaginatedTables() {
        document.querySelectorAll('.dashboard-table[id]').forEach(table => {
            const id = table.id;
            const rows = Array.from(table.tBodies[0]?.rows || []);
            const search = document.querySelector(`[data-table-search="${id}"]`)?.value.trim().toLowerCase() || '';
            const filter = document.querySelector(`[data-table-filter="${id}"]`)?.value || '';
            const pageSize = 5;
            const matching = rows.filter(row => {
                const searchMatch = !search || (row.dataset.search || row.textContent).toLowerCase().includes(search);
                const filterMatch = !filter || row.dataset.filter === filter;
                return searchMatch && filterMatch;
            });
            const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
            const page = Math.min(state.tablePages[id] || 1, totalPages);
            state.tablePages[id] = page;

            rows.forEach(row => { row.style.display = 'none'; });
            matching.slice((page - 1) * pageSize, page * pageSize).forEach(row => { row.style.display = ''; });
            renderPager(id, page, totalPages, matching.length);
        });
    }

    function renderPager(id, page, totalPages, totalRows) {
        const pager = document.querySelector(`[data-pagination-for="${id}"]`);
        if (!pager) return;
        pager.innerHTML = `
            <span>${totalRows} records / page ${page} of ${totalPages}</span>
            <span>
                <button type="button" ${page <= 1 ? 'disabled' : ''} data-page-prev="${id}">Previous</button>
                <button type="button" ${page >= totalPages ? 'disabled' : ''} data-page-next="${id}">Next</button>
            </span>
        `;
        pager.querySelector('[data-page-prev]')?.addEventListener('click', () => {
            state.tablePages[id] = Math.max(1, page - 1);
            renderPaginatedTables();
        });
        pager.querySelector('[data-page-next]')?.addEventListener('click', () => {
            state.tablePages[id] = Math.min(totalPages, page + 1);
            renderPaginatedTables();
        });
    }

    function setupAdminTimer(type) {
        if (type !== 'admin') return;
        const target = document.getElementById('adminTimeout');
        const reset = () => { state.sessionSeconds = 15 * 60; };
        ['click', 'keydown', 'mousemove', 'touchstart'].forEach(event => document.addEventListener(event, reset, { passive: true }));
        setInterval(() => {
            state.sessionSeconds = Math.max(0, state.sessionSeconds - 1);
            if (target) {
                const min = String(Math.floor(state.sessionSeconds / 60)).padStart(2, '0');
                const sec = String(state.sessionSeconds % 60).padStart(2, '0');
                target.textContent = `${min}:${sec}`;
            }
            if (state.sessionSeconds === 0) {
                localStorage.removeItem('adminLoggedIn');
                localStorage.setItem('lwRole', 'client');
                showDashboardToast('Admin session expired.');
                window.location.href = 'login.html';
            }
        }, 1000);
    }

    function renderStatusList(id, rows) {
        const target = document.getElementById(id);
        if (!target) return;
        target.innerHTML = rows.map(row => `
            <div class="status-row">
                <div><strong>${safe(row.title)}</strong><span>${safe(row.meta)}</span></div>
                ${statusPill(row.status)}
            </div>
        `).join('');
    }

    function renderTimeline(id, rows) {
        const target = document.getElementById(id);
        if (!target) return;
        target.innerHTML = rows.map(row => `
            <div class="timeline-row">
                <i class="fas ${safe(row[0])}"></i>
                <div><strong>${safe(row[1])}</strong><span>${safe(row[2])}</span></div>
            </div>
        `).join('');
    }

    function renderNotifications(id, rows) {
        const target = document.getElementById(id);
        if (!target) return;
        target.innerHTML = rows.map((row, index) => {
            const icon = Array.isArray(row) ? row[0] : row.icon;
            const title = Array.isArray(row) ? row[1] : row.title;
            const body = Array.isArray(row) ? row[2] : row.body;
            return `
                <div class="notification-row" data-unread="${index < 2}">
                    <i class="fas ${safe(icon)}"></i>
                    <div><strong>${safe(title)}</strong><span>${safe(body)}</span></div>
                    ${index < 2 ? statusPill('New') : ''}
                </div>
            `;
        }).join('');
    }

    function clientNotifications() {
        return [
            { icon: 'fa-box', title: 'Order update', body: 'LW-982341 moved to preparation.' },
            { icon: 'fa-credit-card', title: 'Payment confirmed', body: 'Receipt available for Elegance Silver Moon.' },
            { icon: 'fa-clock', title: 'Reservation reminder', body: 'Royal Chronograph expires in 48 hours.' },
            { icon: 'fa-shield', title: 'Security message', body: 'New trusted device added after successful login.' }
        ];
    }

    function validateCsrf(form) {
        const token = form.querySelector('[name="csrf"]')?.value;
        return token && token === state.csrf;
    }

    function validateForm(form) {
        let valid = true;
        form.querySelectorAll('[required]').forEach(input => {
            const empty = !String(input.value || '').trim();
            const invalidEmail = input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
            const invalid = empty || invalidEmail || (input.minLength > 0 && input.value.length < input.minLength);
            input.toggleAttribute('aria-invalid', invalid);
            if (invalid) valid = false;
        });
        const password = form.querySelector('[data-password-strength]');
        if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}/.test(password.value)) {
            password.setAttribute('aria-invalid', 'true');
            valid = false;
        }
        return valid;
    }

    function rateLimit(name, max, windowMs) {
        const key = `lwRate:${name}`;
        const now = Date.now();
        const hits = JSON.parse(localStorage.getItem(key) || '[]').filter(time => now - time < windowMs);
        hits.push(now);
        localStorage.setItem(key, JSON.stringify(hits));
        return hits.length <= max;
    }

    function addAudit(actor, action, target, risk) {
        state.audit.unshift({
            time: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            actor,
            action,
            target,
            risk
        });
        state.audit = state.audit.slice(0, 80);
        persistAudit();
    }

    function persistAudit() {
        localStorage.setItem('lwAuditLog', JSON.stringify(state.audit));
    }

    function secureActionLabel(name) {
        return {
            profile: 'Client profile updated',
            password: 'Password changed',
            product: 'Product saved',
            announcement: 'Notification sent'
        }[name] || 'Secure form submitted';
    }

    function statusPill(label, variant = '') {
        const cls = variant === 'dark' ? ' status-pill--dark' : variant === 'muted' ? ' status-pill--muted' : '';
        return `<span class="status-pill${cls}">${safe(label)}</span>`;
    }

    function riskPill(label) {
        const variant = label === 'High' ? ' status-pill--dark' : label === 'Low' ? ' status-pill--muted' : '';
        return `<span class="risk-pill${variant}">${safe(label)}</span>`;
    }

    function createToken() {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('lwCsrf', token);
        return token;
    }

    function safe(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function formatPrice(value) {
        if (typeof window.formatPrice === 'function') return window.formatPrice(value);
        return `${Number(value || 0).toLocaleString('fr-MA')} MAD`;
    }

    function getProducts() {
        try {
            if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) return PRODUCTS;
        } catch (error) {
            return [];
        }
        return [];
    }

    function showDashboardToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message);
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'toast dashboard-toast show';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2600);
    }
})();
