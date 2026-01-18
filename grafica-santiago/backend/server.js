const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const DatabaseConnection = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reportRoutes = require('./routes/report.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

DatabaseConnection.getInstance().connect();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', cartRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gráfica Santiago API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
