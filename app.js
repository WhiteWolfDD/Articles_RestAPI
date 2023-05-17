require('dotenv').config();

const express = require('express');
const errorHandler = require('./exceptions/errorHandler');
const cors = require('cors');
const mongoose = require("./mongoose");
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', require('./routes/root'));
app.use('/test', require('./routes/testRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/articles', require('./routes/commentRoutes'));

// Error handling
app.use(errorHandler);

function tryConnect() {
    mongoose.main().then(() => {
            app.listen(3000, () => {
                console.log(`Server started on port 3000`);
            });
        }
    ).catch(err => {
            console.log(err);
            setTimeout(tryConnect, 5000);
        }
    );
}

tryConnect();