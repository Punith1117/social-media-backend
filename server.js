require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { passport } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(passport.initialize());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const followRoutes = require('./routes/follow');
app.use('/follow', followRoutes);

const userDetailsRoutes = require('./routes/userDetails');
app.use('/users', userDetailsRoutes);

const postRoutes = require('./routes/postRoutes');
app.use('/posts', postRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

