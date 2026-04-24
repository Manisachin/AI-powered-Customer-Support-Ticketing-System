const Service = require('../models/Service');

// Get user's services
exports.getUserServices = async (req, res) => {
    try {
        const services = await Service.getUserServices(req.user.id);
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

// Get all services (admin)
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.getAllServices();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

// Create new service (user purchase)
exports.buyService = async (req, res) => {
    try {
        const { service_type, service_name, plan, price } = req.body;

        // Calculate renewal date
        const dateObj = service_type === 'domain'
            ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            : new Date(new Date().setMonth(new Date().getMonth() + 1));

        // Format to YYYY-MM-DD for MySQL
        const renewal_date = dateObj.toISOString().split('T')[0];

        const result = await Service.create({
            user_id: req.user.id,
            service_type,
            service_name,
            plan,
            status: 'active',
            price,
            renewal_date
        });

        res.status(201).json({ message: 'Service purchased successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error purchasing service', error: error.message });
    }
};

// Create new service (admin)
exports.createService = async (req, res) => {
    try {
        const result = await Service.create(req.body);
        res.status(201).json({ message: 'Service created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service', error: error.message });
    }
};

// Update service status (admin)
exports.updateServiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Service.updateStatus(req.params.id, status);
        res.json({ message: 'Service status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service status', error: error.message });
    }
};
